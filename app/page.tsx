import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      
      {/* Logo */}
      <div className="text-xl font-bold text-green-600">
        🌿 Cinnamon AI
      </div>

      {/* Links */}
      <div className="flex space-x-6 text-gray-700 font-medium">
        <Link href="/" className="hover:text-green-600 transition">
          Home
        </Link>

        <Link href="/dashboard" className="hover:text-green-600 transition">
          Dashboard
        </Link>

        <Link href="/diseaseprediction" className="hover:text-green-600 transition">
          Prediction
        </Link>

        <Link href="/vision" className="hover:text-green-600 transition">
          Vision
        </Link>
      </div>
    </nav>
  );
}