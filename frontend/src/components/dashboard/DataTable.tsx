"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Contract } from "../../types";

interface DataTableProps {
  contracts: Contract[];
}

export default function DataTable({ contracts }: DataTableProps) {
  const router = useRouter();

  // Helper to resolve badge styles based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Clean":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          dot: "bg-emerald-500",
        };
      case "Warning":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-100",
          dot: "bg-amber-500",
        };
      case "Action Required":
      case "Critical":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-100",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-100",
          dot: "bg-slate-500",
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between select-none">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Audit Analytics</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Real-time breakdown of audited clauses, risk categories, and document integrity scores.
          </p>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 select-none">
              <th className="px-6 py-3.5">Document Name</th>
              <th className="px-6 py-3.5">Contract Type</th>
              <th className="px-6 py-3.5">Risk Status</th>
              <th className="px-6 py-3.5">IQ Safety Score</th>
              <th className="px-6 py-3.5">Clauses</th>
              <th className="px-6 py-3.5 text-right">Processed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((contract) => {
              const badge = getStatusBadge(contract.status);
              return (
                <tr 
                  key={contract.id}
                  onClick={() => router.push(`/clause-analysis?id=${contract.id}`)}
                  className="hover:bg-slate-50/60 cursor-pointer transition-colors duration-150 group"
                >
                  {/* File Name */}
                  <td className="px-6 py-4.5 flex items-center gap-3 font-semibold text-slate-800">
                    <div className="p-2 bg-slate-100 text-slate-400 group-hover:bg-slate-200/60 group-hover:text-slate-500 rounded-lg transition-colors shrink-0">
                      <FileText size={16} />
                    </div>
                    <span className="truncate group-hover:text-blue-600 transition-colors">
                      {contract.name}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4.5 text-slate-500 font-medium">
                    {contract.type}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {contract.status}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4.5 font-bold">
                    <span className={getScoreColor(contract.score)}>
                      {contract.score}/100
                    </span>
                  </td>

                  {/* Clauses */}
                  <td className="px-6 py-4.5 text-slate-500 font-medium">
                    {contract.clausesCount} audited
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4.5 text-right text-slate-400 font-medium text-xs font-mono">
                    {contract.effectiveDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
