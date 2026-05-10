"use client";

import { useEffect, useState } from "react";

export default function IoTMonitoringPage() {
  const [iotData, setIotData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchIoTData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:8001/latest-iot-data/");
      const data = await res.json();

      console.log("🔥 IOT DATA:", data);

      if (data.error) {
        setError(data.error);
        setIotData(null);
        return;
      }

      setIotData(data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch IoT data");
      setIotData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIoTData();

    const interval = setInterval(() => {
      fetchIoTData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🌱 IoT Monitoring Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Real-time environmental monitoring using Firebase Realtime Database
            and IoT sensors.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-100 p-4 text-red-700 shadow">
            {error}
          </div>
        )}

        <div className="mb-8">
          <button
            onClick={fetchIoTData}
            disabled={loading}
            className="rounded-2xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh IoT Data"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Temperature</p>
            <h2 className="mt-3 text-4xl font-bold text-red-600">
              {iotData?.temperature ?? "-"}°C
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-red-100">
              <div
                className="h-2 rounded-full bg-red-500"
                style={{
                  width: `${Math.min(((iotData?.temperature || 0) / 50) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Humidity</p>
            <h2 className="mt-3 text-4xl font-bold text-blue-600">
              {iotData?.humidity ?? "-"}%
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(iotData?.humidity || 0, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Soil Moisture</p>
            <h2 className="mt-3 text-4xl font-bold text-green-600">
              {iotData?.moisture ?? "-"}%
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-green-100">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${Math.min(iotData?.moisture || 0, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Battery</p>
            <h2 className="mt-3 text-4xl font-bold text-yellow-600">
              {iotData?.battery ?? "-"}%
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-yellow-100">
              <div
                className="h-2 rounded-full bg-yellow-500"
                style={{ width: `${Math.min(iotData?.battery || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              Latest Sensor Information
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-gray-500">Last Updated</p>
                <h3 className="mt-1 text-lg font-semibold text-green-700">
                  {iotData?.timestamp ?? "-"}
                </h3>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">Data Source</p>
                <h3 className="mt-1 text-lg font-semibold text-blue-700">
                  {iotData?.source ?? "Firebase RTDB"}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              System Status
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-green-100 p-4">
                <p className="text-sm text-gray-500">Monitoring Status</p>
                <h3 className="mt-1 text-lg font-bold text-green-700">
                  Active
                </h3>
              </div>

              <div className="rounded-2xl bg-yellow-100 p-4">
                <p className="text-sm text-gray-500">Connection</p>
                <h3 className="mt-1 text-lg font-bold text-yellow-700">
                  Firebase Connected
                </h3>
              </div>

              <div className="rounded-2xl bg-blue-100 p-4">
                <p className="text-sm text-gray-500">Auto Refresh</p>
                <h3 className="mt-1 text-lg font-bold text-blue-700">
                  Every 5 Seconds
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Raw IoT JSON Data
          </h2>

          <pre className="overflow-auto rounded-2xl bg-gray-900 p-5 text-sm text-green-300">
            {JSON.stringify(iotData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}