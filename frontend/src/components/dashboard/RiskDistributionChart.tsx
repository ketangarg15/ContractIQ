"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RiskData {
  name: string;
  value: number;
  color: string;
}

interface RiskDistributionChartProps {
  data: RiskData[];
}

export default function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[320px] justify-between">
      <div className="select-none">
        <h3 className="text-sm font-bold text-slate-800">Risk Distribution</h3>
      </div>

      {/* Chart container */}
      <div className="h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value}%`, 'Percentage']}
            />
          </PieChart>
        </ResponsiveContainer>
        
      </div>

      {/* Legend Block */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 select-none">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-xs">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="font-bold text-slate-800">{item.value}%</span>
            <span className="text-slate-500 font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
