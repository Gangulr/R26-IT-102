import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm md:p-12">
        <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            🌿 AI Cinnamon Monitoring System
          </h1>

          <p className="mt-4 text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
            AI + IoT powered smart agriculture system for predicting growth,
            detecting diseases, and optimizing harvest time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              View Dashboard
            </Link>

            <Link
              href="/diseaseprediction"
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              AI Prediction
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}