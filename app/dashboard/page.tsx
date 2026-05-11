"use client";

import { useEffect, useState } from "react";

type DiseaseData = {
  name: string;
  value: number;
};

export default function Dashboard() {
  const [sensor, setSensor] = useState({
    temperature: 0,
    humidity: 0,
    moisture: 0,
  });

  const [totalGrowth, setTotalGrowth] = useState(0);
  const [totalDisease, setTotalDisease] = useState(0);
  const [lastStatus, setLastStatus] = useState("No data");
  const [latestAlert, setLatestAlert] = useState("No alerts yet");

  const [recentGrowth, setRecentGrowth] = useState<any[]>([]);
  const [recentDisease, setRecentDisease] = useState<any[]>([]);
  const [diseaseChartData, setDiseaseChartData] = useState<DiseaseData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const colors = [
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
  ];

  // ================= LIVE IOT SENSOR DATA =================
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch("http://localhost:8001/latest-iot-data/");
        const data = await res.json();

        if (!data.error) {
          setSensor({
            temperature: Number(data.temperature || 0),
            humidity: Number(data.humidity || 0),
            moisture: Number(data.moisture || 0),
          });
        }
      } catch (error) {
        console.log("IoT fetch error:", error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================= DASHBOARD DATA =================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setChartLoading(true);

        const growthRes = await fetch("http://localhost:8001/growth-history/");
        const growthJson = await growthRes.json();

        const diseaseRes = await fetch("http://localhost:8001/disease-history/");
        const diseaseJson = await diseaseRes.json();

        const growthData = Array.isArray(growthJson) ? growthJson : [];
        const diseaseData = Array.isArray(diseaseJson) ? diseaseJson : [];

        setTotalGrowth(growthData.length);
        setTotalDisease(diseaseData.length);

        const sortedGrowth = [...growthData].sort((a, b) => {
          const timeA = new Date(a.prediction_time || a.timestamp || 0).getTime();
          const timeB = new Date(b.prediction_time || b.timestamp || 0).getTime();
          return timeB - timeA;
        });

        const sortedDisease = [...diseaseData].sort((a, b) => {
          const timeA = new Date(a.prediction_time || a.timestamp || 0).getTime();
          const timeB = new Date(b.prediction_time || b.timestamp || 0).getTime();
          return timeB - timeA;
        });

        const latestGrowth = sortedGrowth[0];

        if (latestGrowth) {
          setLastStatus(
            latestGrowth.harvest_status || latestGrowth.status || "No data"
          );
          setLatestAlert(latestGrowth.alert || "No alerts yet");
        }

        setRecentGrowth(sortedGrowth.slice(0, 5));
        setRecentDisease(sortedDisease.slice(0, 5));

        const counts: Record<string, number> = {};

        diseaseData.forEach((item: any) => {
          const key = item.prediction || "Unknown";
          counts[key] = (counts[key] || 0) + 1;
        });

        const chartData = Object.keys(counts).map((key) => ({
          name: key,
          value: counts[key],
        }));

        setDiseaseChartData(chartData);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setChartLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalDiseaseChart = diseaseChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  let cumulativePercent = 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">
        Research Analytics Overview
      </h1>

      <p className="mb-8 text-gray-600">
        Live IoT sensor data, disease analytics and cinnamon growth insights.
      </p>

      {/* ================= LIVE SENSOR CARDS ================= */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Temperature</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {sensor.temperature}°C
          </h2>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Humidity</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {sensor.humidity}%
          </h2>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Soil Moisture</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {sensor.moisture}%
          </h2>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-green-100 p-6">
          <p className="text-sm text-gray-600">Total Growth Predictions</p>
          <h2 className="text-3xl font-bold text-green-800">{totalGrowth}</h2>
        </div>

        <div className="rounded-2xl bg-red-100 p-6">
          <p className="text-sm text-gray-600">Total Disease Scans</p>
          <h2 className="text-3xl font-bold text-red-800">{totalDisease}</h2>
        </div>

        <div className="rounded-2xl bg-blue-100 p-6">
          <p className="text-sm text-gray-600">Last Prediction Status</p>
          <h2 className="text-lg font-bold text-blue-800">{lastStatus}</h2>
        </div>

        <div className="rounded-2xl bg-yellow-100 p-6">
          <p className="text-sm text-gray-600">Latest Alert</p>
          <h2 className="text-lg font-bold text-yellow-800">{latestAlert}</h2>
        </div>
      </div>

      {/* ================= RECENT TABLES ================= */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            Recent Growth Predictions
          </h3>

          {recentGrowth.length === 0 ? (
            <p className="text-gray-500">No growth prediction records.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-100">
                  <tr>
                    <th className="p-3 text-left">Growth</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Alert</th>
                    <th className="p-3 text-left">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {recentGrowth.map((item, i) => (
                    <tr key={item.id || i} className="border-b">
                      <td className="p-3">{item.growth_value ?? "-"}</td>
                      <td className="p-3">
                        {item.harvest_status || item.status || "-"}
                      </td>
                      <td className="p-3">{item.alert || "-"}</td>
                      <td className="p-3">
                        {item.prediction_time || item.timestamp || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            Recent Disease Predictions
          </h3>

          {recentDisease.length === 0 ? (
            <p className="text-gray-500">No disease prediction records.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-red-100">
                  <tr>
                    <th className="p-3 text-left">Prediction</th>
                    <th className="p-3 text-left">Confidence</th>
                    <th className="p-3 text-left">Severity</th>
                    <th className="p-3 text-left">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {recentDisease.map((item, i) => (
                    <tr key={item.id || i} className="border-b">
                      <td className="p-3">{item.prediction || "-"}</td>
                      <td className="p-3">{item.confidence || "-"}</td>
                      <td className="p-3">{item.severity || "-"}</td>
                      <td className="p-3">
                        {item.prediction_time || item.timestamp || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= PIE CHART + INSIGHTS ================= */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Distribution of Detected Diseases
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Disease prediction analytics overview
            </p>
          </div>

          {chartLoading ? (
            <div className="flex h-[320px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
            </div>
          ) : diseaseChartData.length === 0 ? (
            <div className="flex h-[320px] flex-col items-center justify-center">
              <p className="text-lg font-medium text-gray-500">
                No disease data available
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Run disease predictions to generate analytics
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-10 xl:flex-row xl:items-start">
              <div className="relative h-[300px] w-[300px]">
                <svg
                  viewBox="0 0 36 36"
                  className="h-full w-full rotate-[-90deg]"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#f3f4f6"
                    strokeWidth="4"
                  />

                  {diseaseChartData.map((item, index) => {
                    const percent = (item.value / totalDiseaseChart) * 100;
                    const dashArray = `${percent} ${100 - percent}`;
                    const dashOffset = -cumulativePercent;

                    cumulativePercent += percent;

                    return (
                      <circle
                        key={index}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="transparent"
                        stroke={colors[index % colors.length]}
                        strokeWidth="4"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-5xl font-bold text-gray-800">
                    {totalDiseaseChart}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">Total Scans</p>
                  <div className="mt-4 rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                    AI Monitoring Active
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[360px] space-y-4">
                {diseaseChartData.map((item, index) => {
                  const percent = ((item.value / totalDiseaseChart) * 100).toFixed(1);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />

                        <div>
                          <p
                            title={item.name}
                            className="max-w-[180px] truncate text-sm font-semibold text-gray-700"
                          >
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {percent}% of total predictions
                          </p>
                        </div>
                      </div>

                      <div className="rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-800 shadow-sm">
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            Quick Insights
          </h3>

          <p className="text-gray-600">
            Based on collected data, monitor soil moisture regularly and
            maintain proper environmental conditions.
          </p>

          <div className="mt-6 rounded-2xl bg-green-50 p-4">
            <p className="text-sm text-gray-500">System Status</p>
            <h4 className="text-lg font-bold text-green-700">
              Monitoring Active
            </h4>
          </div>

          <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
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