"use client";

import React, { useState } from "react";
import { useContract } from "@/context/ContractContext";
import { FileText, AlertTriangle, CheckCircle, Scale, Shield, Calendar, DollarSign, ListChecks } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";

export default function ComparisonPage() {
  const { contracts, loading } = useContract();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading comparison matrix...</p>
      </div>
    );
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const selectedContracts = contracts.filter(c => selectedIds.includes(c.id));

  // Extract key clause values for visual side-by-side comparisons
  const getClauseText = (contract: any, clauseNameKeywords: string[]) => {
    if (!contract.clauses) return "Not specified";
    const found = contract.clauses.find((c: any) => 
      clauseNameKeywords.some(kw => c.name.toLowerCase().includes(kw))
    );
    return found ? found.text : "Not specified";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Side-by-Side Comparison</h1>
        <p className="text-slate-500 text-sm">Select multiple contracts to compare key attributes and risk exposures side-by-side.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Selector list */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm h-fit space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-slate-400" /> Choose Contracts
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {contracts.map(c => {
              const isChecked = selectedIds.includes(c.id);
              return (
                <label 
                  key={c.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isChecked 
                      ? "border-blue-500 bg-blue-50/20" 
                      : "border-slate-100 bg-slate-50/30 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(c.id)}
                    className="mt-1 accent-blue-600 rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{c.name.replace(".pdf", "")}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{c.type}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Right Side: Matrix display */}
        <div className="lg:col-span-3">
          {selectedContracts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border border-slate-100">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">No contracts selected</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Please select two or more contracts from the selector on the left to compare their terms side-by-side.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[150px]">Attribute</th>
                    {selectedContracts.map(c => (
                      <th key={c.id} className="p-4 text-left min-w-[240px] border-l border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[240px]" title={c.name}>{c.name.replace(".pdf", "")}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide mt-1 inline-block">
                          {c.type}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1: Counterparty */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <Scale className="w-3.5 h-3.5 text-slate-400" /> Counterparty
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 text-sm font-semibold text-slate-700 border-l border-slate-100">
                        {c.counterparty}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Contract Value */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Contract Value
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 text-sm font-bold text-slate-800 border-l border-slate-100">
                        {c.value || "$0"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Effective Date */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Effective Date
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 text-sm font-semibold text-slate-700 border-l border-slate-100">
                        {c.effectiveDate || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Overall Risk Score */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400" /> Overall Risk
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 border-l border-slate-100">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={c.overallRisk} />
                          <span className="text-sm font-bold text-slate-800">({c.score}/100)</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Liability Cap Clause */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Liability Cap
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 text-sm leading-relaxed text-slate-600 border-l border-slate-100 max-w-[260px]">
                        {getClauseText(c, ["liability", "limitation"])}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Governing Law */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Governing Law
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 text-sm leading-relaxed text-slate-600 border-l border-slate-100 max-w-[260px]">
                        {getClauseText(c, ["governing", "jurisdiction", "law"])}
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Confidentiality */}
                  <tr className="align-top hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Confidentiality
                    </td>
                    {selectedContracts.map(c => (
                      <td key={c.id} className="p-4 text-sm leading-relaxed text-slate-600 border-l border-slate-100 max-w-[260px]">
                        {getClauseText(c, ["confidentiality", "disclosure", "non-disclosure"])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
