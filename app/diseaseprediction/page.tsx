"use client";

import React, { useMemo, useState } from "react";

export default function DiseasePredictor() {
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

  const isHealthy = useMemo(() => {
    const prediction = String(result?.prediction || "").toLowerCase();
    const severity = String(result?.severity || "").toLowerCase();

    return (
      prediction.includes("healthy") ||
      severity === "none" ||
      prediction.includes("no disease")
    );
  }, [result]);

  const diseaseStatus = result
    ? isHealthy
      ? "Healthy"
      : result.prediction?.includes("Invalid")
      ? "Invalid Image"
      : "Disease Detected"
    : "Waiting for image";

  const diseaseType = result
    ? result.prediction || "Unknown"
    : "No image analyzed yet";

  const confidence = result?.confidence || "-";

  return (
    <div className="min-h-screen bg-[#F7FAF6]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-4xl font-bold text-gray-800">
          Cinnamon Disease Detection
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upload Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              Upload Image
            </h2>

            <label className="flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-700 bg-[#FAFCF8] p-8 text-center transition hover:bg-green-50">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />

              {preview ? (
                <img
                  src={preview}
                  alt="Uploaded Cinnamon Image"
                  className="h-48 w-48 rounded-2xl object-cover shadow"
                />
              ) : (
                <>
                  <div className="mb-4 text-5xl text-green-800">⇧</div>
                  <p className="text-lg font-semibold text-gray-800">
                    Upload leaf, bark or root image
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop or click to browse
                  </p>
                </>
              )}
            </label>

            <button
              onClick={predictDisease}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-green-800 py-4 font-bold text-white transition hover:bg-green-900 disabled:opacity-60"
            >
              {loading ? "Analyzing Image..." : "▷ Analyze Image"}
            </button>
          </div>

          {/* Result Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              Detection Result
            </h2>

            <div className="space-y-4">
              <div className="rounded-3xl bg-green-50 p-5">
                <p className="text-sm font-semibold text-gray-500">
                  Disease Status
                </p>
                <h3
                  className={[
                    "mt-2 text-2xl font-bold",
                    result?.prediction?.includes("Invalid")
                      ? "text-orange-700"
                      : isHealthy
                      ? "text-green-800"
                      : "text-red-700",
                  ].join(" ")}
                >
                  {isHealthy ? "✓ " : result ? "⚠ " : ""}
                  {diseaseStatus}
                </h3>
              </div>

              <div className="rounded-3xl bg-green-50 p-5">
                <p className="text-sm font-semibold text-gray-500">
                  Disease Type
                </p>
                <h3 className="mt-2 text-xl font-bold text-green-800">
                  {diseaseType}
                </h3>
              </div>

              <div className="rounded-3xl bg-green-50 p-5">
                <p className="text-sm font-semibold text-gray-500">
                  Confidence Score
                </p>
                <h3 className="mt-2 text-4xl font-bold text-green-800">
                  {confidence}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            Detection Preview
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-500">
                Original Image
              </p>

              <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-[#F8FAF6]">
                {preview ? (
                  <img
                    src={preview}
                    alt="Original"
                    className="max-h-[280px] rounded-2xl object-contain"
                  />
                ) : (
                  <p className="text-gray-500">🖼 Original Leaf/Bark Image</p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-gray-500">
                Analyzed Image
              </p>

              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl bg-[#F8FAF6] p-6 text-center">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Analyzed"
                      className="max-h-[220px] rounded-2xl border-4 border-green-500 object-contain"
                    />
                    <p className="mt-4 text-sm font-medium text-green-800">
                      AI analyzed uploaded image
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">🖼 Detected Areas Highlighted</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            Recommendations
          </h2>

          {result ? (
            <div className="space-y-4">
              {result.solutions?.map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-3xl bg-green-50 p-5"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-800 text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-bold text-gray-800">{item}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Recommended action based on AI disease analysis.
                    </p>
                  </div>
                </div>
              ))}

              {result.prevention?.map((item: string, index: number) => (
                <div
                  key={`p-${index}`}
                  className="flex items-start gap-4 rounded-3xl bg-blue-50 p-5"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-bold text-gray-800">{item}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Prevention guidance for future plant health.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-green-50 p-5">
              <p className="font-bold text-gray-800">Monitor humidity levels</p>
              <p className="mt-1 text-sm text-gray-500">
                Keep humidity between 60–80% for optimal health.
              </p>
            </div>
          )}
        </div>

        {/* Extra Details */}
        {result && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Diagnosis</p>
              <p className="mt-2 font-semibold text-gray-800">
                {result.diagnosis || "-"}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Symptoms</p>
              <p className="mt-2 font-semibold text-gray-800">
                {result.symptoms || "-"}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">Severity</p>
              <p className="mt-2 font-semibold text-gray-800">
                {result.severity || "-"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}