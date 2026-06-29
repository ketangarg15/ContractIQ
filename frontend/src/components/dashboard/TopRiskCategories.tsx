"use client";

import React from "react";

interface RiskCategory {
  name: string;
  count: number;
  total: number;
}

interface TopRiskCategoriesProps {
  categories: RiskCategory[];
}

export default function TopRiskCategories({ categories }: TopRiskCategoriesProps) {
  // Find maximum count to scale progress bars relative to it
  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[320px] justify-between">
      <div className="select-none">
        <h3 className="text-sm font-bold text-slate-800">Top Risk Categories</h3>
      </div>

      {/* Progress Bars Container */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {categories.map((category, index) => {
          const percentage = (category.count / maxCount) * 100;
          return (
            <div key={index} className="space-y-1.5 select-none">
              {/* Labels Row */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">{category.name}</span>
                <span className="text-slate-400 font-medium">{category.count} clauses</span>
              </div>
              
              {/* Progress bar line */}
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2563eb]/80 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
