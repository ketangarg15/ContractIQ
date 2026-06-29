"use client";

import React from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface QueueItem {
  id: string;
  clauseName: string;
  contractName: string;
  confidence: string;
  risk: string;
  status: string;
  score: number;
}

interface NeedsReviewQueueProps {
  queue: QueueItem[];
}

export default function NeedsReviewQueue({ queue }: NeedsReviewQueueProps) {
  const router = useRouter();
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
            <AlertCircle size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Needs Review</h3>
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-bold rounded-full">
            {queue.length}
          </span>
        </div>
        <div className="text-[10px] sm:text-xs font-medium text-slate-400">
          Sorted by risk
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {queue.map((item) => (
          <div 
            key={item.id} 
            onClick={() => router.push('/clause-analysis')}
            className="p-4 sm:px-6 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 group cursor-pointer"
          >
            
            {/* Left side: Clause & Contract */}
            <div className="space-y-1 md:pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.clauseName}</span>
                {item.clauseName.includes("Missing") && (
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase tracking-wider">
                    Missing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium break-words leading-relaxed">{item.contractName}</p>
            </div>

            {/* Right side: Badges & Score */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap md:flex-nowrap justify-between md:justify-end">
              
              {/* Badges Container */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 border border-zinc-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                  {item.confidence} conf.
                </span>
                
                {item.risk === "High" || item.risk === "Critical" ? (
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 border border-orange-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    {item.risk}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 border border-amber-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {item.risk}
                  </span>
                )}

                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 border border-amber-200/60 hidden sm:flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item.status}
                </span>
              </div>

              {/* Score and Chevron */}
              <div className="flex items-center gap-2 sm:gap-3 w-auto md:w-16 justify-end shrink-0">
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                  {item.score}
                </span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors hidden md:block" />
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
