// components/DiseasePredictor.tsx
"use client";

import React, { useState } from "react";

const DiseasePredictor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePrediction = async () => {
    if (!selectedFile) {
      alert("කරුණාකර පින්තූරයක් තෝරන්න!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8001/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setPrediction(data.prediction);
      setConfidence(data.confidence);
    } catch (error) {
      console.error(error);
      alert("Backend connect wenne na!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl">
      <h2 className="text-xl font-bold mb-4 text-green-700">
        🌿 Cinnamon Disease Predictor
      </h2>

      <input
        type="file"
        onChange={onFileChange}
        accept="image/*"
        className="mb-4"
      />

      <button
        onClick={handlePrediction}
        disabled={loading}
        className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600"
      >
        {loading ? "Checking..." : "Predict Now"}
      </button>

      {prediction && (
        <div className="mt-6 p-4 bg-green-100 rounded-xl">
          <h3 className="text-lg font-bold text-green-700">
            Result: {prediction}
          </h3>
          <p className="text-gray-700">
            Confidence: {confidence}
          </p>
        </div>
      )}
    </div>
  );
};

export default DiseasePredictor;