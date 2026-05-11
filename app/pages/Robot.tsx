import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function AIGuidedRoboticMachine() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState("none");
  const [detected, setDetected] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [step, setStep] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");

  const coordinates = useMemo(
    () => ({
      startX: 245,
      startY: 180,
      endX: 245,
      endY: 420,
      confidence: 88,
      direction: "Downward",
      region: "Central Cinnamon Bark Area",
      bladeDepth: "12 mm",
      startPoint: "Top",
      endPoint: "Bottom",
    }),
    []
  );

  const movementSteps = [
    { name: "Image Capture", icon: "📷" },
    { name: "Bark Detection", icon: "🔍" },
    { name: "Coordinate Generation", icon: "📍" },
    { name: "Blade Alignment", icon: "⚙️" },
    { name: "Peeling", icon: "✂️" },
    { name: "Peel Outlet", icon: "📦" },
  ];

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };

    getAvailableCameras();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
        audio: false,
      });

      setCameraStream(stream);
      setInputMode("camera");
      setPreviewImage(null);
      setDetected(false);
      setConfirmed(false);
      setEmergencyStop(false);
      setStep(0);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      alert("Camera access failed. Please allow camera permission or use image upload.");
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    setCameraStream(null);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setPreviewImage(imageData);
    setSelectedFile(null);
    setInputMode("captured");
    setDetected(false);
    setConfirmed(false);
    setEmergencyStop(false);
    setStep(0);
  };

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setSelectedFile(file);
    setInputMode("upload");
    setDetected(false);
    setConfirmed(false);
    setEmergencyStop(false);
    setStep(0);
  };

  const detectBoundary = async () => {
    if (!previewImage) return;

    try {
      setIsDetecting(true);
      setDetected(false);
      setConfirmed(false);
      setEmergencyStop(false);
      setStep(0);

      let imageFile = selectedFile;
      if (!imageFile) {
        const blob = await fetch(previewImage).then((res) => res.blob());
        imageFile = new File([blob], "captured-image.png", { type: blob.type || "image/png" });
      }

      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("http://127.0.0.1:8000/api/robotic-harvesting/analyze", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setDetected(true);
      } else {
        setDetected(false);
        alert(result.message || "Detection failed. Only cinnamon images are allowed.");
      }
    } catch (error) {
      setDetected(false);
      alert("Cannot connect to backend. Make sure FastAPI server is running on port 8000.");
      console.error("Detection error:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const startHarvest = () => {
    if (!detected || emergencyStop) return;
    setConfirmed(true);
    setStep(1);
  };

  const stopHarvest = () => {
    setConfirmed(false);
    setStep(0);
  };

  const emergencyStopAction = () => {
    setEmergencyStop(true);
    setConfirmed(false);
    setStep(0);
  };

  const resetAll = () => {
    stopCamera();
    setPreviewImage(null);
    setSelectedFile(null);
    setInputMode("none");
    setDetected(false);
    setConfirmed(false);
    setEmergencyStop(false);
    setStep(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <canvas ref={canvasRef} className="hidden" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI-Guided Robotic Machine for Automated Cinnamon Bark Harvesting
          </h1>
          <p className="text-gray-600">Advanced prototype for precision harvesting</p>
        </motion.div>

        {/* Top Section: Status Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Robotic Machine Status */}
          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Robotic Machine Status</h2>
            <div className="flex items-center justify-center min-h-72 bg-gray-800 rounded-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-gray-400">Robotic Machine Camera Feed / Preview</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-900">System Status</h2>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-gray-600">Bark Boundary</p>
              <p className="text-lg font-bold text-green-700">{detected ? "Detected" : "Detecting..."}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-gray-600">Machine Status</p>
              <p className="text-lg font-bold text-green-700">{confirmed ? "Active" : "Ready"}</p>
            </div>

            <div className={`rounded-xl p-4 border ${emergencyStop ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <p className="text-sm text-gray-600">Safety Status</p>
              <p className={`text-lg font-bold ${emergencyStop ? "text-red-700" : "text-green-700"}`}>
                {emergencyStop ? "Emergency Stop" : "Active"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Control Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8 flex-wrap"
        >
          <button
            onClick={startHarvest}
            disabled={!detected || emergencyStop || confirmed}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span>▶</span> Start Harvest
          </button>

          <button
            onClick={stopHarvest}
            disabled={!confirmed || emergencyStop}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span>⬛</span> Stop
          </button>

          <button
            onClick={emergencyStopAction}
            disabled={emergencyStop}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span>⚠️</span> Emergency Stop
          </button>
        </motion.div>

        {/* Camera Input Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-md mb-8"
        >
          <div className="mb-4 flex gap-3 flex-wrap">
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              disabled={cameraStream !== null}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
            >
              <option value="" disabled>Select Camera</option>
              {availableCameras.length > 0 ? (
                availableCameras.map((camera, index) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </option>
                ))
              ) : (
                <option disabled>No cameras found</option>
              )}
            </select>

            <button
              onClick={startCamera}
              disabled={cameraStream !== null}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition"
            >
              Start Camera
            </button>

            <button
              onClick={captureFrame}
              disabled={!cameraStream}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition"
            >
              Capture Frame
            </button>

            <button
              onClick={stopCamera}
              disabled={!cameraStream}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition"
            >
              Stop Camera
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Upload Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={uploadImage}
              className="hidden"
            />
          </div>

          {/* Image Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 rounded-2xl p-4 min-h-80 flex items-center justify-center bg-gray-50">
              {inputMode === "camera" && cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-contain rounded-lg"
                />
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-full w-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-lg">📷 Original Cinnamon Bark Image</p>
                  <p className="text-sm mt-2">Start camera or upload image</p>
                </div>
              )}
            </div>

            <div className="border-4 border-green-500 rounded-2xl p-4 min-h-80 flex items-center justify-center bg-green-50">
              {detected && previewImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Detected"
                    className="h-full w-full object-contain rounded-lg opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-green-500 rounded-xl w-3/4 h-2/3"></div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-lg">📊 Detected Bark Boundary</p>
                  <p className="text-sm mt-2 text-green-600">
                    {detected ? "✅ AI Detected" : "Waiting for detection"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={detectBoundary}
            disabled={!previewImage || isDetecting}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition"
          >
            {isDetecting ? "Detecting..." : "Detect Bark Boundary"}
          </button>
        </motion.div>

        {/* Generated Coordinates & Parameters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-md mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Coordinates & Parameters</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-xs text-gray-600 mb-2">X Coordinate</p>
              <p className="text-3xl font-bold text-green-700">{detected ? coordinates.startX : "-"}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-xs text-gray-600 mb-2">Y Coordinate</p>
              <p className="text-3xl font-bold text-green-700">{detected ? coordinates.startY : "-"}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-xs text-gray-600 mb-2">Start Point</p>
              <p className="text-2xl font-bold text-green-700">{detected ? coordinates.startPoint : "-"}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-xs text-gray-600 mb-2">End Point</p>
              <p className="text-2xl font-bold text-green-700">{detected ? coordinates.endPoint : "-"}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-xs text-gray-600 mb-2">Peel Direction</p>
              <p className="text-2xl font-bold text-green-700">{detected ? coordinates.direction : "-"}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <p className="text-xs text-gray-600 mb-2">Blade Depth</p>
              <p className="text-2xl font-bold text-green-700">{detected ? coordinates.bladeDepth : "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Robotic Machine Movement Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-md mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Robotic Machine Movement Flow</h2>
          
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {movementSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="text-center flex-shrink-0">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-2 border-2 border-green-300">
                    {step.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{step.name}</p>
                </div>
                {index < movementSteps.length - 1 && (
                  <div className="flex-1 h-1 bg-green-300 mx-2 hidden md:block"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Prototype Performance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Prototype Performance</h2>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              Test Run Completed
            </span>
          </div>

          <p className="text-gray-600 mb-6">Evaluation results of AI bark detection and robotic peeling process</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👁️</span>
                <p className="text-gray-600">AI Vision</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">Detection Accuracy</p>
              <p className="text-3xl font-bold text-green-700 mb-3">88%</p>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "88%" }}></div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✅</span>
                <p className="text-gray-600">Robotic Peeling</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">Peeling Success Rate</p>
              <p className="text-3xl font-bold text-green-700 mb-3">82%</p>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "82%" }}></div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⏱️</span>
                <p className="text-gray-600">Processing Speed</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">Processing Time</p>
              <p className="text-3xl font-bold text-green-700 mb-3">2.4s</p>
              <p className="text-xs text-gray-500">Average time for image analysis, coordinate generation, and action preparation.</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Manual Override & Advanced Controls</h3>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={resetAll}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition"
              >
                Manual Override
              </button>
              <button
                onClick={() => alert("Adjust Parameters - Feature Coming Soon")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
              >
                Adjust Parameters
              </button>
              <button
                onClick={() => alert("Test Run - Starting automated test sequence")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition"
              >
                Test Run
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
