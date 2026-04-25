import DiseaseChart from '../components/DiseaseChart';

export default function Dashboard() {
  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Research Analytics Overview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. ප්‍රස්ථාරය මෙතැන දිස්වේ */}
        <DiseaseChart />

        {/* 2. ඔබට වෙනත් කාඩ්පත් (Stats) මෙතැනට දැමිය හැක */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4">Quick Insights</h3>
          <p className="text-gray-600">Based on your recent scans, focus on leaf moisture control.</p>
        </div>
      </div>
    </div>
  );
}