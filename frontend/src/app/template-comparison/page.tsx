"use client";

import React, { useState } from "react";
import { AlertOctagon, Loader2, FileText } from "lucide-react";
import { useContract } from "@/context/ContractContext";

export default function TemplateComparisonPage() {
  const { selectedContract: contract, loading } = useContract();
  const [mobileView, setMobileView] = useState<"template" | "contract">("contract");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
        <p className="text-sm font-medium">Loading template comparison...</p>
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
        <p className="text-slate-500 text-sm">Please upload a contract or select one to view template deviations.</p>
      </div>
    );
  }

  const comparisons = contract.comparisons || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Template Comparison</h1>
        <p className="text-slate-500 text-sm">Compare contract clauses against approved templates</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-amber-800 text-sm">
          <strong>{comparisons.length} deviations found</strong> against the standard <em>SaaS Vendor Agreement Template</em>. Highlighted differences indicate non-standard language.
        </p>
      </div>

      {/* Mobile Toggle Control */}
      <div className="md:hidden flex p-1 bg-slate-100 rounded-xl mb-4">
        <button
          onClick={() => setMobileView("contract")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mobileView === "contract"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          User Report
        </button>
        <button
          onClick={() => setMobileView("template")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mobileView === "template"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Approved Template
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200 bg-slate-50/50">
          <div className={`p-4 border-b md:border-b-0 md:border-r border-slate-200 ${mobileView === "template" ? "block" : "hidden md:block"}`}>
            <h3 className="font-semibold text-emerald-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Approved Template
            </h3>
          </div>
          <div className={`p-4 ${mobileView === "contract" ? "block" : "hidden md:block"}`}>
            <h3 className="font-semibold text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Current Contract: {contract.name.replace(".pdf", "")}
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {comparisons.map((comp) => {
            const isMajor = comp.deviationType === "Major Deviation";
            const isMinor = comp.deviationType === "Minor Deviation";
            const badgeColors = isMajor 
              ? "bg-rose-50 text-rose-700 border-rose-100" 
              : isMinor 
                ? "bg-amber-50 text-amber-700 border-amber-100" 
                : "bg-slate-50 text-slate-600 border-slate-200";
            
            const bgColors = isMajor 
              ? "bg-rose-50/50 border-rose-100 text-slate-800" 
              : isMinor 
                ? "bg-amber-50/50 border-amber-100 text-slate-800" 
                : "bg-transparent border-transparent text-slate-600 px-0 py-0";

            return (
              <div key={comp.id} className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Column (Template) */}
                <div className={`p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-200 space-y-3 ${mobileView === "template" ? "block" : "hidden md:block"}`}>
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-slate-700">{comp.clauseName}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {comp.approvedText}
                  </p>
                </div>
                
                {/* Right Column (Contract) */}
                <div className={`p-4 sm:p-6 space-y-3 ${mobileView === "contract" ? "block" : "hidden md:block"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium text-slate-900">{comp.clauseName}</h4>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${badgeColors}`}>
                      {comp.deviationType}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed p-3 rounded-lg border ${bgColors}`}>
                    {comp.contractText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
