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

  const predictDisease = async () => {
    if (!file) return alert("Upload image first");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8001/disease-predict/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("DISEASE API RESPONSE:", data);

      setResult(data);
    } catch (err) {
      console.log(err);
      alert("Disease backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-center text-2xl font-bold text-green-700">
          🌿 Cinnamon Disease Detection AI
        </h1>

        <input type="file" onChange={onFileChange} className="mb-4 w-full" />

        {preview && (
          <img
            src={preview}
            alt="Uploaded Cinnamon Leaf"
            className="mx-auto mb-4 h-40 w-40 rounded border object-cover"
          />
        )}

        <button
          onClick={predictDisease}
          disabled={loading}
          className="w-full rounded bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Predict Disease"}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            {result.formatted_output && (
              <div className="whitespace-pre-wrap rounded-xl bg-black p-5 text-green-400">
                {result.formatted_output}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded bg-green-100 p-4">
                <h2 className="text-lg font-bold">🌿 {result.prediction}</h2>
                <p>Confidence: {result.confidence}</p>
              </div>

              <div className="rounded bg-blue-100 p-4">
                <p className="font-bold">🔍 Diagnosis</p>
                <p>{result.diagnosis}</p>
              </div>

              <div className="rounded bg-yellow-100 p-4">
                <p className="font-bold">⚠️ Symptoms</p>
                <p>{result.symptoms}</p>
              </div>

              <div className="rounded bg-red-100 p-4">
                <p className="font-bold">💡 Solutions</p>
                <ul className="ml-5 list-disc">
                  {result.solutions?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded bg-purple-100 p-4">
                <p className="font-bold">🛡 Prevention</p>
                <ul className="ml-5 list-disc">
                  {result.prevention?.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded bg-gray-200 p-4">
                <p className="font-bold">📊 Severity</p>
                <p>{result.severity}</p>
              </div>

              <div className="rounded bg-emerald-100 p-4 md:col-span-2">
                <p className="font-bold">🔥 Firebase Status</p>
                <p>
                  {result.database_saved
                    ? "Saved to Firebase successfully"
                    : "Not saved to Firebase"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseasePredictor;