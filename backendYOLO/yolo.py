import io
import asyncio
from picamera2 import Picamera2
from picamera2.encoders import MJPEGEncoder, Quality
from picamera2.outputs import FileOutput
from fastapi import FastAPI, WebSocket
from threading import Condition
from contextlib import asynccontextmanager
from ultralytics import YOLO
import numpy as np
import cv2


class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        super().__init__()
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

    async def read(self):
        with self.condition:
            self.condition.wait()
            return self.frame


class JpegStream:
    def __init__(self):
        self.active = False
        self.connections = set()
        self.picam2 = None
        self.task = None
        self.model = YOLO("yolo11n_ncnn_model")  # Load the YOLOv11 model

    async def stream_jpeg(self):
        self.picam2 = Picamera2()
        video_config = self.picam2.create_video_configuration(
            main={"size": (640, 640)}
        )
        self.picam2.configure(video_config)
        output = StreamingOutput()
        self.picam2.start_recording(MJPEGEncoder(), FileOutput(output), Quality.MEDIUM)

        try:
            while self.active:
                jpeg_data = await output.read()

                # Convert JPEG data to OpenCV format
                np_arr = np.frombuffer(jpeg_data, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                # # Perform object detection
                results = self.model(img)
                annotated_frame = results[0].plot()
                
                # Encode image back to JPEG
                _, annotated_frame_jpeg = cv2.imencode('.jpg', annotated_frame)

                # Send the annotated frame to all connected clients
                tasks = [
                    websocket.send_bytes(annotated_frame_jpeg.tobytes())
                    for websocket in self.connections.copy()
                ]
                await asyncio.gather(*tasks, return_exceptions=True)
        finally:
            self.picam2.stop_recording()
            self.picam2.close()
            self.picam2 = None

    async def start(self):
        if not self.active:
            self.active = True
            self.task = asyncio.create_task(self.stream_jpeg())

    async def stop(self):
        if self.active:
            self.active = False
            if self.task:
                await self.task
                self.task = None


jpeg_stream = JpegStream()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("done")
    await jpeg_stream.stop()


app = FastAPI(lifespan=lifespan)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    jpeg_stream.connections.add(websocket)
    
    # Automatically start streaming when first client connects
    if len(jpeg_stream.connections) == 1:
        await jpeg_stream.start()
    
    try:
        while True:
            # Keep connection alive - just wait for messages
            message = await websocket.receive_text()
            # You can add ping/pong handling here if needed
    except Exception:
        pass
    finally:
        jpeg_stream.connections.remove(websocket)
        if not jpeg_stream.connections:
            await jpeg_stream.stop()


@app.post("/start")
async def start_stream():
    await jpeg_stream.start()
    return {"message": "Stream started"}


@app.post("/stop")
async def stop_stream():
    await jpeg_stream.stop()
    return {"message": "Stream stopped"}
