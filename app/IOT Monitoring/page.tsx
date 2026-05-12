import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import dayjs from "dayjs";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";

export default function App() {
  const tempRef = useRef(null);
  const humRef = useRef(null);
  const moistRef = useRef(null);

  const tempChart = useRef(null);
  const humChart = useRef(null);
  const moistChart = useRef(null);

  const [avg, setAvg] = useState({
    t: "—",
    h: "—",
    m: "—",
  });

  const [nodes, setNodes] = useState(0);
  const [table, setTable] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  const battColor = (v) => {
    if (v > 60) return "bg-green-400";
    if (v > 30) return "bg-yellow-400";
    return "bg-red-500";
  };

  const createChart = (ctx, color) =>
    new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets: [{ data: [], borderColor: color, tension: 0.4 }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#aaa" } },
          y: { ticks: { color: "#aaa" } },
        },
      },
    });

  const updateChart = (chart, labels, data) => {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  };

  useEffect(() => {
    firebase.initializeApp({
      apiKey: "AIzaSyAKBC4Wjr56KF4405q1qoHpsWlkQfDT9Fg",
      authDomain: "smart-environment-cd7ca.firebaseapp.com",
      databaseURL:
        "https://smart-environment-cd7ca-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "smart-environment-cd7ca",
    });

    firebase
      .auth()
      .signInAnonymously()
      .then(() => setStatus("Connected"))
      .catch(() => setStatus("Auth Failed"));

    const db = firebase.database();

    tempChart.current = createChart(tempRef.current, "#ff8c5a");
    humChart.current = createChart(humRef.current, "#5ab4ff");
    moistChart.current = createChart(moistRef.current, "#5dde7a");

    // LIVE DATA
    db.ref("esp32/sensor_data").on("value", (snap) => {
      const data = snap.val() || {};
      const entries = Object.values(data);

      if (!entries.length) return;

      let t = 0,
        h = 0,
        m = 0;

      entries.forEach((v) => {
        t += v.temperature;
        h += v.humidity;
        m += v.moisture;
      });

      setAvg({
        t: (t / entries.length).toFixed(1),
        h: (h / entries.length).toFixed(1),
        m: (m / entries.length).toFixed(1),
      });

      setNodes(entries.length);

      setTable(entries.slice(0, 10));
    });

    // HISTORY
    db.ref("esp32/historical_data").on("value", (snap) => {
      const data = snap.val() || {};

      const arr = Object.values(data)
        .filter((v) => v?.timestamp)
        .map((v) => ({ ...v, ts: dayjs(v.timestamp) }))
        .sort((a, b) => a.ts - b.ts);

      const labels = arr.map((v) => v.ts.format("HH:mm"));

      updateChart(
        tempChart.current,
        labels,
        arr.map((v) => v.temperature)
      );

      updateChart(
        humChart.current,
        labels,
        arr.map((v) => v.humidity)
      );

      updateChart(
        moistChart.current,
        labels,
        arr.map((v) => v.moisture)
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0e1a12] text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Smart Agriculture Dashboard</h1>
          <p className="text-green-400 text-xs">Sensors Network</p>
        </div>

        <div className="px-3 py-1 border rounded-full text-sm">
          {status}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Temperature" value={avg.t} unit="°C" />
        <Card title="Humidity" value={avg.h} unit="%" />
        <Card title="Moisture" value={avg.m} unit="%" />
        <Card title="Nodes" value={nodes} unit="" />
      </div>

      {/* TABLE */}
      <div className="bg-[#152018] p-4 rounded-lg mb-6 overflow-x-auto">
        <h2 className="mb-3 text-sm text-gray-400">Live Data</h2>

        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th>Temp</th>
              <th>Hum</th>
              <th>Moist</th>
              <th>Battery</th>
            </tr>
          </thead>

          <tbody>
            {table.map((v, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td>{v.temperature}°C</td>
                <td>{v.humidity}%</td>
                <td>{v.moisture}%</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-700 rounded">
                      <div
                        className={`h-2 ${battColor(v.battery)} rounded`}
                        style={{ width: `${v.battery || 0}%` }}
                      />
                    </div>
                    {v.battery}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-3 gap-4">
        <ChartBox title="Temperature">
          <canvas ref={tempRef} />
        </ChartBox>

        <ChartBox title="Humidity">
          <canvas ref={humRef} />
        </ChartBox>

        <ChartBox title="Moisture">
          <canvas ref={moistRef} />
        </ChartBox>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Card({ title, value, unit }) {
  return (
    <div className="bg-[#152018] p-4 rounded-lg">
      <p className="text-gray-400 text-xs">{title}</p>
      <h2 className="text-2xl font-bold text-green-400">
        {value} {unit}
      </h2>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-[#152018] p-4 rounded-lg">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      {children}
    </div>
  );
}