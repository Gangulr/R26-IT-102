"use client";

import {
  Search,
  Bell,
  Send,
  Leaf,
} from "lucide-react";

export default function HarvestReadinessPage() {
  const qualityMetrics = [
    { title: "Bark Quality", value: "92%", width: "92%" },
    { title: "Maturity Level", value: "87%", width: "87%" },
    { title: "Health Status", value: "95%", width: "95%" },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-800">
      {/* Top Navbar */}
      

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <h2 className="mb-9 text-4xl font-extrabold tracking-tight text-slate-800">
          Harvest Readiness Prediction
        </h2>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_378px]">
          {/* Left Side */}
          <div className="space-y-8">
            {/* Plant Details */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 text-xl font-bold text-slate-800">
                Plant Details
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard title="Plant ID" value="P-001" />
                <InfoCard title="Age" value="18 months" />
                <InfoCard title="Growth Rate" value="82%" green />
                <InfoCard title="Bark Thickness" value="4.2 mm" />

                <div className="rounded-2xl bg-[#fafbf9] p-4 md:col-span-2">
                  <p className="mb-2 text-sm font-semibold text-slate-500">
                    Disease Status
                  </p>
                  <p className="text-xl font-bold text-green-800">
                    • Healthy
                  </p>
                </div>
              </div>
            </section>

            {/* Readiness Assessment */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 text-xl font-bold text-slate-800">
                Readiness Assessment
              </h3>

              <div className="rounded-3xl bg-green-50 p-6">
                <div className="flex items-start gap-4">
                  <span className="mt-2 h-3 w-3 rounded-full bg-green-800" />

                  <div>
                    <h4 className="mb-4 text-2xl font-extrabold text-slate-800">
                      Ready for Harvest
                    </h4>

                    <p className="max-w-3xl text-[15px] font-medium leading-7 text-slate-500">
                      Plant has reached optimal maturity with sufficient bark
                      thickness 4.2mm and healthy growth status. Recommended to
                      proceed with automated robotic harvesting system.
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-5 flex w-full items-center justify-center gap-3 rounded-3xl bg-green-800 px-6 py-4 text-base font-bold text-white transition hover:bg-green-900">
                <Send size={20} />
                Send to Robotic Harvesting
              </button>
            </section>
          </div>

          {/* Right Side */}
          <div className="space-y-8">
            {/* Readiness Circle */}
            <section className="flex min-h-[380px] items-center justify-center rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex h-[165px] w-[165px] flex-col items-center justify-center rounded-full border-[8px] border-green-800 bg-green-50">
                <p className="text-5xl font-extrabold text-green-800">87%</p>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  Readiness
                </p>
              </div>
            </section>

            {/* Quality Metrics */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 text-xl font-bold text-slate-800">
                Quality Metrics
              </h3>

              <div className="space-y-4">
                {qualityMetrics.map((metric) => (
                  <MetricCard
                    key={metric.title}
                    title={metric.title}
                    value={metric.value}
                    width={metric.width}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  title,
  value,
  green = false,
}: {
  title: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[#fafbf9] p-4">
      <p className="mb-2 text-sm font-semibold text-slate-500">{title}</p>
      <p
        className={`text-xl font-bold ${
          green ? "text-green-800" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  width,
}: {
  title: string;
  value: string;
  width: string;
}) {
  return (
    <div className="rounded-2xl bg-[#fafbf9] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-green-100">
          <div
            className="h-full rounded-full bg-green-800"
            style={{ width }}
          />
        </div>

        <p className="text-sm font-extrabold text-green-800">{value}</p>
      </div>
    </div>
  );
}