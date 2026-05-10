"use client";

import { useEffect, useState } from "react";

export default function GrowthPredictionPage() {
  const [form, setForm] = useState({
    temperature: 0,
    humidity: 0,
    moisture: 0,
  });

  const [result, setResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sensorLoading, setSensorLoading] = useState(false);
  const [error, setError] = useState("");
  const [sensorTime, setSensorTime] = useState("");

  useEffect(() => {
    fetch("http://localhost:8001/metrics/")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => console.log("Metrics load failed"));
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
      validateField("temperature", Number(form.temperature)) ||
      validateField("humidity", Number(form.humidity)) ||
      validateField("moisture", Number(form.moisture))
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

      const response = await fetch("http://localhost:8001/latest-iot-data/");
      const data = await response.json();

      console.log("🔥 FRONTEND IOT DATA:", data);

      if (data.error) {
        setError(data.error);
        return;
      }

      setForm({
        temperature: Number(data.temperature || 0),
        humidity: Number(data.humidity || 0),
        moisture: Number(data.moisture || 0),
      });

      setSensorTime(data.timestamp || "");
    } catch (err) {
      console.log(err);
      setError("Failed to fetch IoT data");
    } finally {
      setSensorLoading(false);
    }
  };

  useEffect(() => {
    getSensorData();

    const interval = setInterval(() => {
      getSensorData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const predictGrowth = async () => {
    const validationError = validateAllFields();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (form.temperature <= 0 || form.humidity <= 0 || form.moisture <= 0) {
      setError("Please enter valid sensor values.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8001/growth-predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature: Number(form.temperature),
          humidity: Number(form.humidity),
          moisture: Number(form.moisture),
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      console.log("PREDICTION:", data);

      setResult(data);
    } catch (err) {
      console.log(err);
      setError("Prediction failed. Please check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          🌿 Cinnamon Growth Prediction
        </h1>

        <p className="mb-8 text-gray-600">
          AI-powered cinnamon growth prediction using Firebase IoT sensor
          values.
        </p>

        {metrics && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Model</p>
              <h2 className="mt-2 text-xl font-bold text-purple-700">
                {metrics.model_name ?? "Random Forest Regressor"}
              </h2>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Accuracy</p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {metrics.accuracy_percentage ?? "-"}%
              </h2>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Training Samples</p>
              <h2 className="mt-2 text-3xl font-bold text-blue-600">
                {metrics.training_samples ?? "-"}
              </h2>
            </div>
          </div>
        )}

        {/* ================= SENSOR CARDS ================= */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Temperature</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {form.temperature}°C
            </h2>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Humidity</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {form.humidity}%
            </h2>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Soil Moisture</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {form.moisture}%
            </h2>
          </div>
        </div>

        {/* ================= INPUT FORM ================= */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Sensor Inputs
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Temperature (°C)
              </label>

              <input
                type="number"
                name="temperature"
                min="0"
                max="60"
                value={form.temperature}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 outline-none focus:border-green-500"
                placeholder="Enter temperature"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Humidity (%)
              </label>

              <input
                type="number"
                name="humidity"
                min="0"
                max="100"
                value={form.humidity}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 outline-none focus:border-green-500"
                placeholder="Enter humidity"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Soil Moisture (%)
              </label>

              <input
                type="number"
                name="moisture"
                min="0"
                max="100"
                value={form.moisture}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 outline-none focus:border-green-500"
                placeholder="Enter soil moisture"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={getSensorData}
              disabled={sensorLoading}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {sensorLoading ? "Loading IoT Data..." : "Get Live IoT Data"}
            </button>

            <button
              onClick={predictGrowth}
              disabled={loading}
              className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Predicting..." : "Predict Growth"}
            </button>
          </div>

          {sensorTime && (
            <div className="mt-4 rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
              Latest IoT Update: {sensorTime}
            </div>
          )}
        </div>

        {/* ================= RESULTS ================= */}
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