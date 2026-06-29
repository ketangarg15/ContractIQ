"use client";

import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface MonthlyRate {
  month: string;
  rate: number;
}

interface AgreementRateChartProps {
  data: MonthlyRate[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-lg">
        <p className="text-slate-300 text-[10px] font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          {payload[0].value}% Agreement
        </p>
      </div>
    );
  }
  return null;
};

export default function AgreementRateChart({ data }: AgreementRateChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[320px] justify-between">
      {/* Header with green badge */}
      <div className="flex items-center justify-between select-none">
        <h3 className="text-sm font-bold text-slate-800">AI Agreement Rate</h3>
        <div className="px-2 py-0.5 bg-teal-50 text-teal-600 border border-teal-200/60 rounded-md text-[10px] font-bold flex items-center gap-1">
          <span>↑ 16%</span>
          <span className="text-[8px] font-medium text-teal-500 uppercase tracking-wider">6mo</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }} 
            />
            <YAxis 
              domain={[60, 100]} 
              ticks={[60, 70, 80, 90, 100]}
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }} 
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subtext description */}
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed select-none border-t border-slate-100 pt-3">
        % of AI verdicts confirmed by reviewers without override
      </p>
    </div>
  );
}
