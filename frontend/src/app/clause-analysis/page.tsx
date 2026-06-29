"use client";

import React, { useState } from "react";
import { useContract } from "@/context/ContractContext";
import { FileText, Sparkles, SplitSquareHorizontal, Filter, ChevronRight, Loader2 } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";
import RiskDetailView from "@/components/clause-analysis/RiskDetailView";
import { useRouter } from "next/navigation";

export default function ClauseAnalysisPage() {
  const router = useRouter();
  const { selectedContract: contract, loading: contextLoading, updateContractStatus } = useContract();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);

  if (contextLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
        <p className="text-sm font-medium">Loading clause analysis...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">No contract selected</h2>
        <p className="text-slate-500 text-sm">Please upload a contract or select one from the dashboard to begin analysis.</p>
        <button
          onClick={() => router.push("/upload")}
          className="px-4 py-2 bg-[#2563eb] text-white font-semibold rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-sm"
        >
          Upload Contract
        </button>
      </div>
    );
  }

  const statusSteps = ["Draft", "Under Review", "Approved", "Executed"];
  const currentStatusIndex = statusSteps.indexOf(contract.status) !== -1 
    ? statusSteps.indexOf(contract.status) 
    : 1;

  const riskCounts = {
    All: contract.clausesCount,
    Critical: contract.clauses?.filter(c => c.riskLevel === "Critical").length || 0,
    High: contract.clauses?.filter(c => c.riskLevel === "High").length || 0,
    Medium: contract.clauses?.filter(c => c.riskLevel === "Medium").length || 0,
    Low: contract.clauses?.filter(c => c.riskLevel === "Low").length || 0,
  };

  const filters = ["All", "Critical", "High", "Medium", "Low"];
  
  const filteredClauses = activeFilter === "All" 
    ? contract.clauses || []
    : (contract.clauses || []).filter(c => c.riskLevel === activeFilter);

  const selectedClause = contract.clauses?.find(c => c.id === selectedClauseId);

  // If a clause is selected, show the detail view
  if (selectedClauseId && selectedClause) {
    return (
      <div className="max-w-5xl mx-auto pb-12 animate-in fade-in zoom-in-95 duration-200">
        <RiskDetailView 
          clause={selectedClause} 
          contractName={contract.name.replace(".pdf", "")}
          onBack={() => setSelectedClauseId(null)} 
        />
      </div>
    );
  }

  // Otherwise, show the main list view
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="w-12 h-12 bg-blue-50/50 text-[#2563eb] rounded-xl flex items-center justify-center shrink-0 border border-blue-200/60 sm:mt-1">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-2">{contract.name.replace(".pdf", "")}</h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm">
              <div>
                <span className="text-slate-400 block mb-0.5">Counterparty:</span>
                <span className="text-slate-700 font-medium">{contract.counterparty}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Type:</span>
                <span className="text-slate-700 font-medium">{contract.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Effective:</span>
                <span className="text-slate-700 font-medium">{contract.effectiveDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Value:</span>
                <span className="text-slate-700 font-medium">{contract.value}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
          <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Overall Risk</span>
            <div className="flex items-center gap-2">
              <RiskBadge level={contract.overallRisk} />
              <span className="text-2xl font-bold text-slate-900">{contract.score}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:border-l sm:border-zinc-200 sm:pl-6">
            <button 
              onClick={() => router.push("/summary")}
              className="inline-flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-violet-200/60 shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 shrink-0" /> AI Summary
            </button>
            <button 
              onClick={() => router.push("/template-comparison")}
              className="inline-flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-violet-200/60 shadow-sm whitespace-nowrap"
            >
              <SplitSquareHorizontal className="w-4 h-4 shrink-0" /> Compare Template
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Status Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase">Workflow Review Status</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 hidden sm:block z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 hidden sm:block z-0 transition-all duration-300"
            style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
          />
          
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isActive = idx === currentStatusIndex;
            
            return (
              <button
                key={step}
                onClick={() => updateContractStatus(contract.id, step)}
                className="relative z-10 flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all ${
                  isActive 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                    : isCompleted
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300"
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-xs font-bold transition-all ${
                  isActive 
                    ? "text-blue-600" 
                    : isCompleted 
                      ? "text-slate-700" 
                      : "text-slate-400 group-hover:text-slate-500"
                }`}>
                  {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 border ${
                activeFilter === f 
                  ? 'bg-zinc-800 border-zinc-800 text-white shadow-sm' 
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {f}
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                activeFilter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {riskCounts[f as keyof typeof riskCounts]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium w-full sm:w-auto">
          <Filter className="w-4 h-4" />
          <span>{contract.clausesCount} clauses</span>
        </div>
      </div>

      <div className="space-y-4 animate-in fade-in duration-500">
        {filteredClauses.map((clause) => (
          <div 
            key={clause.id} 
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden cursor-pointer group p-4 sm:p-6"
            onClick={() => setSelectedClauseId(clause.id)}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 w-full sm:w-auto mb-1 sm:mb-0">{clause.name}</h3>
                <RiskBadge level={clause.riskLevel} />
                <span className="px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[10px] sm:text-xs font-semibold">
                  {clause.confidenceLevel} conf.
                </span>
                {clause.status === "Confirmed" ? (
                  <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200/60 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5">
                    ✓ Confirmed
                  </span>
                ) : clause.status === "Needs Review" ? (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5">
                    ● Needs Review
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1.5">
                    ✧ AI-Suggested
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-slate-400">{clause.score}</span>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-4 pr-12 line-clamp-2">
              {clause.text}
            </p>
            
            <div className="flex items-center justify-between text-sm text-slate-400 font-medium group-hover:text-[#2563eb] transition-colors">
              <span>Click to view full analysis</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
        {filteredClauses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 font-medium">No clauses match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}


