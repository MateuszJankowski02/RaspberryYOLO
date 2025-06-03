from ultralytics import YOLO

# Load a YOLOv11n PyTorch model
model = YOLO("yolo11n.pt")

# Export the model to NCNN format
model.export(format="ncnn")  # creates 'yolov11n_ncnn_model'
