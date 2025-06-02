import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const App: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string>("");
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string>("");
  const [serverUrl, setServerUrl] = useState("ws://192.168.1.115:8000/ws");

  const wsRef = useRef<WebSocket | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  const connectToRPi = useCallback(() => {
    try {
      setError("");
      const ws = new WebSocket(serverUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError("");
        console.log("Connected to Raspberry Pi YOLO server");
      };

      ws.onmessage = (event) => {
        try {
          // Handle binary JPEG data from FastAPI backend
          if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setCurrentFrame(reader.result as string);

                // Calculate FPS
                frameCountRef.current++;
                const now = Date.now();
                if (now - lastTimeRef.current >= 1000) {
                  setFps(frameCountRef.current);
                  frameCountRef.current = 0;
                  lastTimeRef.current = now;
                }
              }
            };
            reader.readAsDataURL(event.data);
          } else if (typeof event.data === "string") {
            // Handle text messages (status, errors, etc.)
            try {
              const message = JSON.parse(event.data);
              if (message.error) {
                setError(message.error);
              }
            } catch {
              // Not JSON, treat as status message
              console.log("Server message:", event.data);
            }
          }
        } catch (err) {
          console.error("Error handling WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("Disconnected from Raspberry Pi");
      };

      ws.onerror = (error) => {
        setError(
          "Failed to connect to Raspberry Pi. Make sure the server is running."
        );
        console.error("WebSocket error:", error);
      };
    } catch (err) {
      setError("Failed to connect to YOLO server");
      console.error("Connection error:", err);
    }
  }, [serverUrl]);

  const disconnectFromRPi = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const startStream = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${serverUrl.replace("ws://", "").replace("/ws", "")}/start`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to start stream");
      }
      console.log("Stream started");
    } catch (err) {
      setError("Failed to start stream");
      console.error("Start stream error:", err);
    }
  }, [serverUrl]);

  const stopStream = useCallback(async () => {
    try {
      const response = await fetch(
        `http://${serverUrl.replace("ws://", "").replace("/ws", "")}/stop`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to stop stream");
      }
      console.log("Stream stopped");
    } catch (err) {
      setError("Failed to stop stream");
      console.error("Stop stream error:", err);
    }
  }, [serverUrl]);

  useEffect(() => {
    return () => {
      disconnectFromRPi();
    };
  }, [disconnectFromRPi]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Raspberry Pi YOLO Detection</h1>
        <div className="status-bar">
          <div className={`status ${connected ? "connected" : "disconnected"}`}>
            {connected ? "Connected" : "Disconnected"}
          </div>
          <div className="fps">FPS: {fps}</div>
        </div>
      </header>

      <main className="main-content">
        <div className="server-config">
          <label htmlFor="server-url">Server URL:</label>
          <input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="ws://192.168.1.115:8000/ws"
            disabled={connected}
          />
        </div>

        <div className="controls">
          {!connected ? (
            <button onClick={connectToRPi} className="connect-btn">
              Connect to RPi
            </button>
          ) : (
            <>
              <button onClick={disconnectFromRPi} className="disconnect-btn">
                Disconnect
              </button>
              <button onClick={startStream} className="start-btn">
                Start Stream
              </button>
              <button onClick={stopStream} className="stop-btn">
                Stop Stream
              </button>
            </>
          )}
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="video-container">
          {currentFrame ? (
            <div className="video-wrapper">
              <img
                ref={imgRef}
                src={currentFrame}
                alt="YOLO Detection Feed"
                className="video-feed"
              />
            </div>
          ) : (
            <div className="no-feed">
              {connected
                ? '📹 Connected! Click "Start Stream" to begin detection'
                : "🔌 Enter RPi IP and connect to start detection"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
