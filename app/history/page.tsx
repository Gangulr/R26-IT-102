"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [diseaseData, setDiseaseData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8001/growth-history")
      .then((res) => res.json())
      .then((data) => setGrowthData(data));

    fetch("http://localhost:8001/disease-history")
      .then((res) => res.json())
      .then((data) => setDiseaseData(data));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-green-700">
        📊 Prediction History
      </h1>

      {/* ================= GROWTH TABLE ================= */}
      <h2 className="text-xl font-semibold mb-3">🌿 Growth Predictions</h2>

      <div className="overflow-auto mb-10">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-green-200">
            <tr>
              <th className="p-3">Temp</th>
              <th>Humidity</th>
              <th>Moisture</th>
              <th>Growth</th>
              <th>Status</th>
              <th>Alert</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {growthData.map((item, i) => (
              <tr key={i} className="text-center border-b">
                <td className="p-2">{item.temperature}</td>
                <td>{item.humidity}</td>
                <td>{item.moisture}</td>
                <td>{item.growth_value}</td>
                <td>{item.harvest_status}</td>
                <td>{item.alert}</td>
                <td>{item.prediction_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DISEASE TABLE ================= */}
      <h2 className="text-xl font-semibold mb-3">🦠 Disease Predictions</h2>

      <div className="overflow-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-red-200">
            <tr>
              <th className="p-3">Prediction</th>
              <th>Confidence</th>
              <th>Severity</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {diseaseData.map((item, i) => (
              <tr key={i} className="text-center border-b">
                <td className="p-2">{item.prediction}</td>
                <td>{item.confidence}</td>
                <td>{item.severity}</td>
                <td>{item.prediction_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}