#!/bin/bash

# Start the YOLO FastAPI server
echo "Starting YOLO FastAPI server on Raspberry Pi..."

cd "$(dirname "$0")"

# Check if yolo.py exists
if [ ! -f "yolo.py" ]; then
    echo "Error: yolo.py not found!"
    exit 1
fi

# Start the server
echo "Starting server on http://0.0.0.0:8000"
echo "WebSocket endpoint: ws://$(hostname -I | awk '{print $1}'):8000/ws"
echo "Press Ctrl+C to stop"

uvicorn yolo:app --host 0.0.0.0 --port 8000 --reload
