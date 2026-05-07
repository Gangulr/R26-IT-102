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
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8001/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => console.log("Metrics error"));
  }, []);

  const validateField = (name: string, value: number) => {
    if (Number.isNaN(value)) return "Please enter a valid number.";
    if (value < 0) return "Negative values are not allowed.";

    if (name === "temperature" && value > 60) {
      return "Temperature must be below 60°C.";
    }

    if ((name === "humidity" || name === "moisture") && value > 100) {
      return "Humidity and Soil Moisture must be below 100%.";
    }

    return "";
  };

  const validateAllFields = () => {
    return (
      validateField("temperature", form.temperature) ||
      validateField("humidity", form.humidity) ||
      validateField("moisture", form.moisture)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);

    const validationError = validateField(name, numValue);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setForm({
      ...form,
      [name]: numValue,
    });
  };

  const getSensorData = async () => {
    try {
      setSensorLoading(true);
      setError("");

      const res = await fetch("http://localhost:8001/latest-sensor-data");
      const data = await res.json();

      setForm({
        temperature: Number(data.temperature),
        humidity: Number(data.humidity),
        moisture: Number(data.moisture),
      });

      setSensorTime(data.timestamp || "");
    } catch (err) {
      setError("Sensor data load failed. Please check the backend.");
    } finally {
      setSensorLoading(false);
    }
  };

  const handlePredict = async () => {
    const validationError = validateAllFields();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:8001/growth-predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await res.json();
      console.log("Growth Result:", data);
      setResult(data);
    } catch (err) {
      setError("Prediction failed. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold text-green-800">
          🌿 Cinnamon Growth Prediction
        </h1>

        <p className="mb-6 text-gray-600">
          Predict growth, bark thickness, harvest status, alerts and
          recommendations using IoT sensor data.
        </p>

        {metrics && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-purple-100 p-4">
              <p className="text-sm text-gray-600">Model</p>
              <h2 className="font-bold text-purple-800">
                {metrics.model_name ?? "Random Forest Regressor"}
              </h2>
            </div>

            <div className="rounded-2xl bg-green-100 p-4">
              <p className="text-sm text-gray-600">Accuracy</p>
              <h2 className="text-2xl font-bold text-green-800">
                {metrics.accuracy_percentage ?? "-"}%
              </h2>
            </div>

            <div className="rounded-2xl bg-blue-100 p-4">
              <p className="text-sm text-gray-600">Samples</p>
              <h2 className="text-2xl font-bold text-blue-800">
                {metrics.training_samples ?? "-"}
              </h2>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-5">
          <h2 className="mb-2 text-lg font-bold text-green-800">
            IoT Sensor Input
          </h2>
          <p className="text-sm text-gray-600">
            Use live/simulated sensor data or enter values manually.
          </p>

          {sensorTime && (
            <p className="mt-2 text-sm font-medium text-green-700">
              Last Sensor Update: {sensorTime}
            </p>
          )}
        </div>

        <button
          onClick={getSensorData}
          disabled={sensorLoading}
          className="mb-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {sensorLoading ? "Loading Sensor Data..." : "Get Live IoT Data"}
        </button>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Temperature (°C)
            </label>
            <input
              name="temperature"
              type="number"
              min="0"
              max="60"
              value={form.temperature}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter temperature"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Humidity (%)
            </label>
            <input
              name="humidity"
              type="number"
              min="0"
              max="100"
              value={form.humidity}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter humidity"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Soil Moisture (%)
            </label>
            <input
              name="moisture"
              type="number"
              min="0"
              max="100"
              value={form.moisture}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter moisture"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={loading || !!error}
          className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Predict Growth"}
        </button>

        {result && (
          <div className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-green-100 p-5">
                <p className="text-sm text-gray-600">Growth Value</p>
                <h2 className="text-3xl font-bold text-green-900">
                  {result.growth_value ?? "-"}%
                </h2>
              </div>

              <div className="rounded-2xl bg-yellow-100 p-5">
                <p className="text-sm text-gray-600">Bark Thickness</p>
                <h2 className="text-3xl font-bold text-yellow-900">
                  {result.bark_thickness_mm ?? result.bark_thickness ?? "-"} mm
                </h2>
              </div>

              <div className="rounded-2xl bg-blue-100 p-5">
                <p className="text-sm text-gray-600">Status</p>
                <h2 className="text-xl font-bold text-blue-900">
                  {result.harvest_status ?? result.status ?? "-"}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-100 p-5">
                <p className="text-sm text-gray-600">Recommendation</p>
                <h2 className="mt-1 font-semibold text-gray-800">
                  {result.recommendation ?? "-"}
                </h2>
              </div>

              <div className="rounded-2xl bg-red-100 p-5">
                <p className="text-sm text-gray-600">Alert</p>
                <h2 className="mt-1 font-semibold text-red-800">
                  {result.alert ?? "-"}
                </h2>
              </div>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-sm text-gray-600">Firebase Status</p>
              <h2 className="mt-1 font-semibold text-green-800">
                {result.database_saved ? "Saved Successfully" : "Not Saved"}
              </h2>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Model Performance Graph
              </h2>

              <img
                src="/prediction_plot.png"
                alt="Model Performance Graph"
                className="w-full rounded-2xl border shadow"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}