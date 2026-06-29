"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  iconName: keyof typeof LucideIcons;
  iconColor: string; // Tailwind class e.g. "text-blue-500"
}

export default function MetricCard({
  title,
  value,
  subtext,
  iconName,
  iconColor,
}: MetricCardProps) {
  const Icon = LucideIcons[iconName] as React.ComponentType<{ size: number; className?: string }>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between">
      <div className="space-y-2 select-none">
        <span className="text-sm font-semibold text-slate-700">
          {title}
        </span>
        <div className="text-3xl font-extrabold text-slate-900 leading-none">
          {value}
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {subtext}
        </p>
      </div>

      {/* Metric Icon */}
      <div className={`${iconColor} shrink-0`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
}
