"use client";

import { useEffect, useState } from "react";

export default function GrowthPredictionPage() {
  const [form, setForm] = useState({
    temperature: 28,
    humidity: 75,
    moisture: 55,
  });

  const [result, setResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [sensorTime, setSensorTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [sensorLoading, setSensorLoading] = useState(false);

  // ================= LOAD MODEL METRICS =================
  useEffect(() => {
    fetch("http://localhost:8001/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => console.log("Metrics load failed"));
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value),
    });
  };

  // ================= GET LIVE SENSOR =================
  const fetchLiveSensorData = async () => {
    try {
      setSensorLoading(true);

      const res = await fetch("http://localhost:8001/latest-sensor-data");
      const data = await res.json();

      setForm({
        temperature: data.temperature,
        humidity: data.humidity,
        moisture: data.moisture,
      });

      setSensorTime(data.timestamp);
    } catch (error) {
      alert("Sensor data load failed");
    } finally {
      setSensorLoading(false);
    }
  };

  // ================= PREDICT =================
  const handlePredict = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:8001/growth-predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log("Growth API:", data);

      setResult(data);
    } catch (error) {
      alert("Prediction error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-green-800 mb-2">
          🌿 Cinnamon Growth Prediction
        </h1>

        <p className="text-gray-600 mb-6">
          Predict growth, bark thickness, and harvest readiness using IoT data.
        </p>

        {/* ================= METRICS ================= */}
        {metrics && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-100 p-4 rounded">
              <p>Model</p>
              <h2 className="font-bold">{metrics.model_name}</h2>
            </div>

            <div className="bg-green-100 p-4 rounded">
              <p>Accuracy</p>
              <h2 className="text-2xl font-bold">
                {metrics.accuracy_percentage}%
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded">
              <p>Samples</p>
              <h2 className="text-2xl font-bold">
                {metrics.training_samples}
              </h2>
            </div>
          </div>
        )}

        {/* ================= SENSOR ================= */}
        <button
          onClick={fetchLiveSensorData}
          className="bg-blue-600 text-white px-6 py-2 rounded mb-4"
        >
          {sensorLoading ? "Loading..." : "Get Live IoT Data"}
        </button>

        {sensorTime && (
          <p className="text-sm text-green-700 mb-4">
            Last update: {sensorTime}
          </p>
        )}

        {/* ================= INPUT ================= */}
        <div className="grid md:grid-cols-3 gap-4">
          <input
            name="temperature"
            value={form.temperature}
            onChange={handleChange}
            placeholder="Temperature"
            className="border p-3 rounded"
          />

          <input
            name="humidity"
            value={form.humidity}
            onChange={handleChange}
            placeholder="Humidity"
            className="border p-3 rounded"
          />

          <input
            name="moisture"
            value={form.moisture}
            onChange={handleChange}
            placeholder="Soil Moisture"
            className="border p-3 rounded"
          />
        </div>

        <button
          onClick={handlePredict}
          className="bg-green-700 text-white px-6 py-3 rounded mt-6 w-full"
        >
          {loading ? "Predicting..." : "Predict Growth"}
        </button>

        {/* ================= RESULT ================= */}
        {result && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-green-100 p-4 rounded">
                Growth: {result.growth_value}
              </div>

              <div className="bg-yellow-100 p-4 rounded">
                Bark: {result.bark_thickness_mm}
              </div>

              <div className="bg-blue-100 p-4 rounded">
                Status: {result.harvest_status}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-100 p-4 rounded">
                {result.recommendation}
              </div>

              <div className="bg-red-100 p-4 rounded">
                {result.alert}
              </div>
            </div>

            <div className="mt-4 bg-green-50 p-4 rounded">
              Firebase:{" "}
              {result.database_saved ? "Saved Successfully" : "Not Saved"}
            </div>

            {/* GRAPH */}
            <div className="mt-8">
              <img
                src="/prediction_plot.png"
                className="rounded shadow"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}