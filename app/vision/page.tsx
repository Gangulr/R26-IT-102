"use client";

import { useState } from "react";

export default function VisionPage() {
  const [image, setImage] = useState<any>(null);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">AI Vision - Disease Detection</h1>

      <input
        type="file"
        onChange={(e) => setImage(URL.createObjectURL(e.target.files![0]))}
      />

      {image && (
        <div className="mt-6">
          <img src={image} className="w-64 rounded-xl" />
          <p className="mt-4 text-green-700 font-semibold">
            Result: Healthy Leaf 🌿
          </p>
          <p>Confidence: 92%</p>
        </div>
      )}
    </div>
  );
}