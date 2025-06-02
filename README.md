# 🍓 Raspberry Pi YOLOv11 Real-time Object Detection

A complete solution for running YOLOv11 object detection on Raspberry Pi 4 with live video streaming to a React web application via WebSockets.

## 🚀 NEW: Ultra-Lightweight Version Available!

We now offer an **ultra-lightweight version** optimized for maximum performance on Raspberry Pi 4:

### Performance Improvements

- **3x Faster Inference**: NCNN format (81ms vs 168ms ONNX)
- **Minimal Dependencies**: Only 3 packages (ultralytics, websockets, Pillow)
- **Native Integration**: Uses pre-installed picamera2
- **System Optimizations**: GPU memory split, CPU governor tuning
- **Optimized Settings**: 320px inference, efficient WebSocket protocol

### Quick Setup (Ultra-Lightweight)

```bash
cd backend
chmod +x setup_ultra_light.sh
./setup_ultra_light.sh
python3 yolo_server_ultra_light.py
```

### Performance Comparison

| Version         | Dependencies   | Inference Time | Memory Usage | Setup Time |
| --------------- | -------------- | -------------- | ------------ | ---------- |
| Standard        | 15+ packages   | ~168ms         | ~2.5GB       | 10 mins    |
| **Ultra-Light** | **3 packages** | **~81ms**      | **~1.8GB**   | **5 mins** |

> **Recommendation**: Use the ultra-lightweight version for production deployments on Raspberry Pi 4.

## 🎯 Features

- **YOLOv11 Nano Model** - Optimized for Raspberry Pi 4 performance
- **Real-time Detection** - Live object detection on camera feed
- **WebSocket Streaming** - Low-latency video streaming to web browser
- **React Dashboard** - Modern web interface for viewing detections
- **Performance Optimized** - Configured for best FPS on RPi4
- **Auto-reconnection** - Robust connection handling

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌──────────────────┐
│   Raspberry Pi  │ ◄──────────────► │   React App      │
│                 │                  │                  │
│ ┌─────────────┐ │                  │ ┌──────────────┐ │
│ │   Camera    │ │                  │ │ Video Stream │ │
│ └─────────────┘ │                  │ └──────────────┘ │
│ ┌─────────────┐ │                  │ ┌──────────────┐ │
│ │  YOLOv11    │ │                  │ │  Detections  │ │
│ └─────────────┘ │                  │ └──────────────┘ │
│ ┌─────────────┐ │                  └──────────────────┘
│ │ WebSocket   │ │
│ │   Server    │ │
│ └─────────────┘ │
└─────────────────┘
```

## 🏃‍♂️ Quick Start - Ultra-Lightweight Version (Recommended)

For maximum performance on Raspberry Pi 4, use the ultra-lightweight version:

### 1. Setup Raspberry Pi (Ultra-Light)

```bash
cd backend
chmod +x setup_ultra_light.sh
./setup_ultra_light.sh
sudo reboot  # Reboot to apply system optimizations
```

### 2. Start Ultra-Light YOLO Server

```bash
cd backend
python3 yolo_server_ultra_light.py
```

The ultra-light server will:

- Auto-download and convert YOLOv11n to NCNN format
- Start optimized WebSocket server on port 8765
- Apply performance optimizations automatically

### 3. Start React Application

```bash
npm install
npm run dev
```

Connect to: `ws://YOUR_PI_IP:8765`

---

## 🚀 Quick Start - Standard Version

For the full-featured version with all dependencies:

### Step 1: Setup Raspberry Pi

1. **Clone this repository on your Raspberry Pi:**

```bash
git clone <your-repo-url>
cd rpiyolo
```

2. **Run the automated setup script:**

```bash
cd backend
chmod +x setup_rpi.sh
./setup_rpi.sh
```

3. **Reboot your Raspberry Pi:**

```bash
sudo reboot
```

### Step 2: Test Camera

After reboot, test your camera:

```bash
libcamera-hello --preview
```

### Step 3: Start YOLO Server

```bash
cd /path/to/rpiyolo/backend
source venv/bin/activate
python yolo_server.py
```

The server will:

- Download YOLOv11 nano model (first run only)
- Convert to ONNX format for better performance
- Start WebSocket server on port 5000

### Step 4: Start React Application

On your development machine (or the same Pi):

```bash
cd rpiyolo
npm install
npm run dev
```

Access the web interface at `http://localhost:5173`

## 🔧 Configuration

### Performance Settings

The system is optimized for Raspberry Pi 4:

| Setting    | Value    | Reason                 |
| ---------- | -------- | ---------------------- |
| Model      | YOLOv11n | Fastest inference      |
| Resolution | 640x480  | Balance quality/speed  |
| FPS Target | 10       | Smooth on RPi4         |
| Format     | ONNX     | Better ARM performance |
| Confidence | 0.5      | Reduce false positives |

### Raspberry Pi Optimizations

The setup script applies these optimizations:

- GPU memory split: 128MB
- CPU governor: performance mode
- Camera interface enabled
- Required system libraries installed

### Network Configuration

**Local Network Usage:**

1. Find your Pi's IP: `hostname -I`
2. Update React app server URL: `http://YOUR_PI_IP:5000`

**Same Device Usage:**

- Use `http://localhost:5000` (default)

## 📊 Performance Expectations

On Raspberry Pi 4 (4GB):

- **FPS:** 8-12 FPS typical
- **Latency:** <200ms end-to-end
- **CPU Usage:** 60-80%
- **Memory:** ~2GB RAM usage

## 🛠️ Advanced Configuration

### Custom YOLO Models

To use different models, edit `backend/yolo_server.py`:

```python
# For better accuracy (slower):
self.model = YOLO('yolo11s.pt')  # Small model

# For faster inference (less accurate):
self.model = YOLO('yolo11n.pt')  # Nano model (default)
```

### Resolution Adjustment

In `yolo_server.py`, modify camera configuration:

```python
camera_config = self.picam2.create_preview_configuration(
    main={"size": (1280, 720), "format": "RGB888"}  # Higher resolution
)
```

### FPS Tuning

Adjust performance parameters:

```python
self.target_fps = 15    # Increase FPS target
self.frame_skip = 1     # Process every frame
```

## 🔄 Auto-Start Service

To run YOLO server automatically on boot:

```bash
sudo systemctl enable yolo-camera.service
sudo systemctl start yolo-camera.service
```

Check status:

```bash
sudo systemctl status yolo-camera.service
```

## 🐛 Troubleshooting

### Camera Issues

```bash
# Test camera
libcamera-hello --preview

# Check camera detection
vcgencmd get_camera

# Enable camera interface
sudo raspi-config
```

### Performance Issues

```bash
# Check CPU temperature
vcgencmd measure_temp

# Monitor system resources
htop

# Check GPU memory
vcgencmd get_mem gpu
```

### Connection Issues

```bash
# Check server logs
cd backend && source venv/bin/activate && python yolo_server.py

# Test WebSocket connection
curl -v http://YOUR_PI_IP:5000/socket.io/

# Check firewall
sudo ufw status
```

### Common Errors

**"No module named 'picamera2'"**

```bash
sudo apt install python3-picamera2
```

**"ONNX export failed"**

- This is normal, PyTorch model will be used instead
- For ONNX support: `pip install onnx onnxruntime`

**"Camera not detected"**

```bash
sudo raspi-config nonint do_camera 0
sudo reboot
```

## 📈 Monitoring

The React app displays:

- **Connection Status** - Server connectivity
- **FPS Counter** - Real-time performance
- **Detection Count** - Objects found
- **Server Info** - Connected clients, streaming status

## 🔒 Security

For production use:

- Change default port (5000)
- Add authentication to WebSocket
- Use HTTPS/WSS in production
- Restrict network access

## 📝 API Reference

### WebSocket Events

**Client → Server:**

- `get_status` - Request server status

**Server → Client:**

- `video_frame` - Video frame with detections
- `status_response` - Server status information

### Video Frame Format

```json
{
  "frame": "base64_encoded_jpeg",
  "detections": [
    {
      "class": 0,
      "confidence": 0.85,
      "bbox": [x1, y1, x2, y2],
      "name": "person"
    }
  ],
  "timestamp": 1234567890.123
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test on Raspberry Pi 4
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Ultralytics for YOLOv11
- Raspberry Pi Foundation
- React and Vite teams
