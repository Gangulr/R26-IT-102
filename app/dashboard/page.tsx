"use client";

import { useEffect, useState } from "react";
import DiseaseChart from "../components/DiseaseChart";

export default function Dashboard() {
  const [sensor, setSensor] = useState({
    temperature: 28,
    humidity: 75,
    moisture: 55,
  });

  const [growthData, setGrowthData] = useState<any[]>([]);
  const [diseaseData, setDiseaseData] = useState<any[]>([]);

  // ================= SENSOR SIM =================
  useEffect(() => {
    const interval = setInterval(() => {
      setSensor({
        temperature: Math.floor(Math.random() * 10) + 25,
        humidity: Math.floor(Math.random() * 20) + 60,
        moisture: Math.floor(Math.random() * 30) + 40,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ================= FETCH FIREBASE DATA =================
  useEffect(() => {
    fetch("http://localhost:8001/growth-history")
      .then((res) => res.json())
      .then((data) => setGrowthData(data));

    fetch("http://localhost:8001/disease-history")
      .then((res) => res.json())
      .then((data) => setDiseaseData(data));
  }, []);

  // ================= CALCULATIONS =================
  const totalGrowth = growthData.length;
  const totalDisease = diseaseData.length;

  const lastGrowth = growthData[growthData.length - 1];
  const lastAlert = lastGrowth?.alert || "No alerts yet";
  const lastStatus = lastGrowth?.harvest_status || "No data";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Research Analytics Overview
      </h1>

      <p className="text-gray-600 mb-8">
        Live sensor simulation, disease analytics and cinnamon growth insights.
      </p>

      {/* ================= SENSOR CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow border">
          <p className="text-sm text-gray-500">Temperature</p>
          <h2 className="text-3xl font-bold text-red-600">
            {sensor.temperature}°C
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow border">
          <p className="text-sm text-gray-500">Humidity</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {sensor.humidity}%
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow border">
          <p className="text-sm text-gray-500">Soil Moisture</p>
          <h2 className="text-3xl font-bold text-green-600">
            {sensor.moisture}%
          </h2>
        </div>
      </div>

      {/* ================= NEW STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-green-100 p-6 rounded-2xl">
          <p className="text-sm text-gray-600">Total Growth Predictions</p>
          <h2 className="text-3xl font-bold text-green-800">
            {totalGrowth}
          </h2>
        </div>

        <div className="bg-red-100 p-6 rounded-2xl">
          <p className="text-sm text-gray-600">Total Disease Scans</p>
          <h2 className="text-3xl font-bold text-red-800">
            {totalDisease}
          </h2>
        </div>

        <div className="bg-blue-100 p-6 rounded-2xl">
          <p className="text-sm text-gray-600">Last Prediction Status</p>
          <h2 className="text-lg font-bold text-blue-800">
            {lastStatus}
          </h2>
        </div>

        <div className="bg-yellow-100 p-6 rounded-2xl">
          <p className="text-sm text-gray-600">Latest Alert</p>
          <h2 className="text-lg font-bold text-yellow-800">
            {lastAlert}
          </h2>
        </div>

      </div>

      {/* ================= CHART + INSIGHTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DiseaseChart />

        <div className="bg-white p-6 rounded-3xl shadow border">
          <h3 className="text-xl font-semibold mb-4">
            Quick Insights
          </h3>

          <p className="text-gray-600">
            Based on collected data, monitor soil moisture regularly and
            maintain proper environmental conditions.
          </p>

          <div className="mt-6 bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-500">System Status</p>
            <h4 className="text-lg font-bold text-green-700">
              Monitoring Active
            </h4>
          </div>

          <div className="mt-4 bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-500">Research Alert</p>
            <h4 className="text-lg font-bold text-yellow-700">
              Continue collecting more data
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}