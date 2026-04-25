"use client";

import React, { useState } from "react";

const DiseasePredictor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const predict = async () => {
    if (!file) return alert("Upload image first");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8001/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("API RESPONSE:", data);

      setResult(data);
    } catch (err) {
      console.log(err);
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold text-green-700 text-center mb-4">
          🌿 Cinnamon Disease Detection AI
        </h1>

        {/* Upload */}
        <input type="file" onChange={onFileChange} className="mb-4 w-full" />

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            className="w-40 h-40 mx-auto mb-4 rounded border"
          />
        )}

        {/* Button */}
        <button
          onClick={predict}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded"
        >
          {loading ? "Analyzing..." : "Predict Disease"}
        </button>

        {/* RESULT */}
        {result && (
          <div className="mt-6 space-y-4">

            {/* 🔥 MAIN AI OUTPUT */}
            <div className="p-5 bg-black text-green-400 rounded-xl whitespace-pre-wrap">
              {result.formatted_output}
            </div>

            {/* GRID CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="p-4 bg-green-100 rounded">
                <h2 className="font-bold text-lg">🌿 {result.prediction}</h2>
                <p>Confidence: {result.confidence}</p>
              </div>

              <div className="p-4 bg-blue-100 rounded">
                <p className="font-bold">🔍 Diagnosis</p>
                <p>{result.diagnosis}</p>
              </div>

              <div className="p-4 bg-yellow-100 rounded">
                <p className="font-bold">⚠️ Symptoms</p>
                <p>{result.symptoms}</p>
              </div>

              <div className="p-4 bg-red-100 rounded">
                <p className="font-bold">💡 Solutions</p>
                <ul className="list-disc ml-5">
                  {result.solutions?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-purple-100 rounded">
                <p className="font-bold">🛡 Prevention</p>
                <ul className="list-disc ml-5">
                  {result.prevention?.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-200 rounded">
                <p className="font-bold">📊 Severity</p>
                <p>{result.severity}</p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default DiseasePredictor;