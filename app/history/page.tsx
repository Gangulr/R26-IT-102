"use client";

import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

function getStatus(growth: any) {
  const value = Number(growth);
  if (value >= 80) return "Ready to Harvest";
  if (value >= 50) return "Growing";
  return "Initial Stage";
}

function getAlert(growth: any) {
  const value = Number(growth);
  if (value >= 80) return "🚨 Harvest Recommended";
  if (value >= 50) return "✅ Normal Growth";
  return "⚠️ Low Growth";
}

export default function HistoryPage() {
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [diseaseData, setDiseaseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [growthSearch, setGrowthSearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");

  const [growthStatusFilter, setGrowthStatusFilter] = useState("All");
  const [diseaseSeverityFilter, setDiseaseSeverityFilter] = useState("All");

  const [growthPage, setGrowthPage] = useState(1);
  const [diseasePage, setDiseasePage] = useState(1);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const growthRes = await fetch("http://localhost:8001/growth-history/");
        const growthJson = await growthRes.json();

        const diseaseRes = await fetch("http://localhost:8001/disease-history/");
        const diseaseJson = await diseaseRes.json();

        setGrowthData(Array.isArray(growthJson) ? growthJson : []);
        setDiseaseData(Array.isArray(diseaseJson) ? diseaseJson : []);
      } catch (error) {
        console.error("History fetch error:", error);
        setGrowthData([]);
        setDiseaseData([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredGrowthData = useMemo(() => {
    return growthData.filter((item) => {
      const status =
        item.harvest_status || item.status || getStatus(item.growth_value);
      const alert = item.alert || getAlert(item.growth_value);

      const matchesSearch =
        String(item.temperature ?? "").includes(growthSearch) ||
        String(item.humidity ?? "").includes(growthSearch) ||
        String(item.moisture ?? "").includes(growthSearch) ||
        String(item.growth_value ?? "").includes(growthSearch) ||
        String(status).toLowerCase().includes(growthSearch.toLowerCase()) ||
        String(alert).toLowerCase().includes(growthSearch.toLowerCase());

      const matchesStatus =
        growthStatusFilter === "All" || status === growthStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [growthData, growthSearch, growthStatusFilter]);

  const filteredDiseaseData = useMemo(() => {
    return diseaseData.filter((item) => {
      const matchesSearch =
        String(item.prediction ?? "")
          .toLowerCase()
          .includes(diseaseSearch.toLowerCase()) ||
        String(item.confidence ?? "")
          .toLowerCase()
          .includes(diseaseSearch.toLowerCase()) ||
        String(item.severity ?? "")
          .toLowerCase()
          .includes(diseaseSearch.toLowerCase());

      const matchesSeverity =
        diseaseSeverityFilter === "All" ||
        item.severity === diseaseSeverityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [diseaseData, diseaseSearch, diseaseSeverityFilter]);

  const growthTotalPages = Math.ceil(filteredGrowthData.length / ITEMS_PER_PAGE);
  const diseaseTotalPages = Math.ceil(
    filteredDiseaseData.length / ITEMS_PER_PAGE
  );

  const paginatedGrowth = filteredGrowthData.slice(
    (growthPage - 1) * ITEMS_PER_PAGE,
    growthPage * ITEMS_PER_PAGE
  );

  const paginatedDisease = filteredDiseaseData.slice(
    (diseasePage - 1) * ITEMS_PER_PAGE,
    diseasePage * ITEMS_PER_PAGE
  );

  const downloadPDF = (type: "growth" | "disease") => {
    const data = type === "growth" ? filteredGrowthData : filteredDiseaseData;
    const title =
      type === "growth" ? "Growth Prediction History" : "Disease Prediction History";

    const rows =
      type === "growth"
        ? data
            .map((item) => {
              const status =
                item.harvest_status ||
                item.status ||
                getStatus(item.growth_value);
              const alert = item.alert || getAlert(item.growth_value);

              return `
                <tr>
                  <td>${item.temperature ?? "-"}</td>
                  <td>${item.humidity ?? "-"}</td>
                  <td>${item.moisture ?? "-"}</td>
                  <td>${item.growth_value ?? "-"}</td>
                  <td>${status}</td>
                  <td>${alert}</td>
                  <td>${item.prediction_time ?? item.timestamp ?? "-"}</td>
                </tr>
              `;
            })
            .join("")
        : data
            .map(
              (item) => `
                <tr>
                  <td>${item.prediction ?? "-"}</td>
                  <td>${item.confidence ?? "-"}</td>
                  <td>${item.severity ?? "-"}</td>
                  <td>${item.prediction_time ?? item.timestamp ?? "-"}</td>
                </tr>
              `
            )
            .join("");

    const headers =
      type === "growth"
        ? `
          <tr>
            <th>Temp</th>
            <th>Humidity</th>
            <th>Moisture</th>
            <th>Growth</th>
            <th>Status</th>
            <th>Alert</th>
            <th>Time</th>
          </tr>
        `
        : `
          <tr>
            <th>Prediction</th>
            <th>Confidence</th>
            <th>Severity</th>
            <th>Time</th>
          </tr>
        `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
            }
            h1 {
              color: #15803d;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
              font-size: 12px;
            }
            th {
              background: #bbf7d0;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>${headers}</thead>
            <tbody>${rows}</tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-3xl font-bold text-green-700">
        📊 Prediction History
      </h1>

      {loading && <p className="mb-6 text-gray-600">Loading history...</p>}

      {/* ================= GROWTH TABLE ================= */}
      <div className="mb-10 rounded bg-white p-5 shadow">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">🌿 Growth Predictions</h2>

          <button
            onClick={() => downloadPDF("growth")}
            className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
          >
            Download Growth PDF
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search growth records..."
            value={growthSearch}
            onChange={(e) => {
              setGrowthSearch(e.target.value);
              setGrowthPage(1);
            }}
            className="rounded border p-3"
          />

          <select
            value={growthStatusFilter}
            onChange={(e) => {
              setGrowthStatusFilter(e.target.value);
              setGrowthPage(1);
            }}
            className="rounded border p-3"
          >
            <option value="All">All Status</option>
            <option value="Ready to Harvest">Ready to Harvest</option>
            <option value="Growing">Growing</option>
            <option value="Initial Stage">Initial Stage</option>
          </select>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
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
              {paginatedGrowth.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No growth prediction history available.
                  </td>
                </tr>
              ) : (
                paginatedGrowth.map((item, i) => {
                  const status =
                    item.harvest_status ||
                    item.status ||
                    getStatus(item.growth_value);

                  const alert = item.alert || getAlert(item.growth_value);

                  return (
                    <tr key={item.id || i} className="border-b text-center">
                      <td className="p-2">{item.temperature ?? "-"}</td>
                      <td>{item.humidity ?? "-"}</td>
                      <td>{item.moisture ?? "-"}</td>
                      <td>{item.growth_value ?? "-"}</td>
                      <td>{status}</td>
                      <td>{alert}</td>
                      <td>{item.prediction_time ?? item.timestamp ?? "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={growthPage === 1}
            onClick={() => setGrowthPage((p) => p - 1)}
            className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {growthPage} of {growthTotalPages || 1}
          </span>

          <button
            disabled={growthPage >= growthTotalPages}
            onClick={() => setGrowthPage((p) => p + 1)}
            className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= DISEASE TABLE ================= */}
      <div className="rounded bg-white p-5 shadow">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">🦠 Disease Predictions</h2>

          <button
            onClick={() => downloadPDF("disease")}
            className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
          >
            Download Disease PDF
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search disease records..."
            value={diseaseSearch}
            onChange={(e) => {
              setDiseaseSearch(e.target.value);
              setDiseasePage(1);
            }}
            className="rounded border p-3"
          />

          <select
            value={diseaseSeverityFilter}
            onChange={(e) => {
              setDiseaseSeverityFilter(e.target.value);
              setDiseasePage(1);
            }}
            className="rounded border p-3"
          >
            <option value="All">All Severity</option>
            <option value="None">None</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-red-200">
              <tr>
                <th className="p-3">Prediction</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {paginatedDisease.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No disease prediction history available.
                  </td>
                </tr>
              ) : (
                paginatedDisease.map((item, i) => (
                  <tr key={item.id || i} className="border-b text-center">
                    <td className="p-2">{item.prediction ?? "-"}</td>
                    <td>{item.confidence ?? "-"}</td>
                    <td>{item.severity ?? "-"}</td>
                    <td>{item.prediction_time ?? item.timestamp ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={diseasePage === 1}
            onClick={() => setDiseasePage((p) => p - 1)}
            className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {diseasePage} of {diseaseTotalPages || 1}
          </span>

          <button
            disabled={diseasePage >= diseaseTotalPages}
            onClick={() => setDiseasePage((p) => p + 1)}
            className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}