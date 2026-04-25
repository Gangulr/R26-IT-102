"use client";
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DiseaseChart = () => {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Backend එකෙන් History එක ලබා ගැනීම
        fetch("http://localhost:8001/history")
            .then(res => res.json())
            .then(data => {
                // දත්ත වර්ගීකරණය කිරීම (Counting disease occurrences)
                const counts: { [key: string]: number } = {};
                data.forEach((item: any) => {
                    const name = item.prediction.split('/')[0].trim(); // ඉංග්‍රීසි නම පමණක් ලබා ගැනීම
                    counts[name] = (counts[name] || 0) + 1;
                });

                // Recharts වලට අවශ්‍ය Format එකට සැකසීම
                const formattedData = Object.keys(counts).map(key => ({
                    name: key,
                    value: counts[key]
                }));
                setChartData(formattedData);
            })
            .catch(err => console.error("Error fetching history:", err));
    }, []);

    const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

    return (
        <div className="w-full h-[450px] bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Distribution of Detected Diseases</h3>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    No data available in history
                </div>
            )}
        </div>
    );
};

export default DiseaseChart;