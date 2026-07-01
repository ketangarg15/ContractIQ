"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UploadCloud, FileText, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import RiskDistributionChart from "@/components/dashboard/RiskDistributionChart";
import AgreementRateChart from "@/components/dashboard/AgreementRateChart";
import TopRiskCategories from "@/components/dashboard/TopRiskCategories";
import NeedsReviewQueue from "@/components/dashboard/NeedsReviewQueue";
import { useContract } from "@/context/ContractContext";

export default function Dashboard() {
  const router = useRouter();
  const { contracts, loading, isUsingMockData, deleteContractById, setSelectedContractId } = useContract();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading portfolio dashboard...</p>
      </div>
    );
  }

  const hasContracts = contracts.length > 0;

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalContracts = hasContracts ? contracts.length : 0;
  const avgRiskScore = hasContracts
    ? Math.round(contracts.reduce((acc, c) => acc + c.score, 0) / totalContracts)
    : 0;

  // Critical/High Flags
  let criticalFlagsCount = 0;
  let criticalContractsCount = 0;
  const queueItems: any[] = [];

  if (hasContracts) {
    contracts.forEach((c) => {
      let hasCriticalOrHigh = false;
      if (c.clauses) {
        c.clauses.forEach((cl) => {
          if (cl.riskLevel === "Critical" || cl.riskLevel === "High") {
            criticalFlagsCount += 1;
            hasCriticalOrHigh = true;
            if (cl.status === "Needs Review") {
              queueItems.push({
                id: `${c.id}-${cl.id}`,
                clauseName: cl.name,
                contractName: c.name,
                confidence: cl.confidenceLevel,
                risk: cl.riskLevel,
                status: cl.status,
                score: cl.score,
              });
            }
          }
        });
      }
      if (hasCriticalOrHigh || c.overallRisk === "Critical" || c.overallRisk === "High") {
        criticalContractsCount += 1;
      }
    });
    queueItems.sort((a, b) => b.score - a.score);
  }

  // ── Charts ──────────────────────────────────────────────────────────────────
  const riskCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  if (hasContracts) {
    contracts.forEach((c) => {
      riskCounts[c.overallRisk] = (riskCounts[c.overallRisk] || 0) + 1;
    });
  }

  const riskDistributionData = hasContracts
    ? [
        { name: "Critical", value: Math.round((riskCounts.Critical / totalContracts) * 100), color: "#8b5cf6" },
        { name: "High",     value: Math.round((riskCounts.High     / totalContracts) * 100), color: "#f97316" },
        { name: "Medium",   value: Math.round((riskCounts.Medium   / totalContracts) * 100), color: "#f59e0b" },
        { name: "Low",      value: Math.round((riskCounts.Low      / totalContracts) * 100), color: "#14b8a6" },
      ]
    : [
        { name: "Critical", value: 0, color: "#8b5cf6" },
        { name: "High",     value: 0, color: "#f97316" },
        { name: "Medium",   value: 0, color: "#f59e0b" },
        { name: "Low",      value: 0, color: "#14b8a6" },
      ];

  const categoryCounts: Record<string, number> = {};
  if (hasContracts) {
    contracts.forEach((c) => {
      if (c.clauses) {
        c.clauses.forEach((cl) => {
          if (cl.riskLevel === "Critical" || cl.riskLevel === "High") {
            categoryCounts[cl.name] = (categoryCounts[cl.name] || 0) + 1;
          }
        });
      }
    });
  }

  const topRiskCategories = Object.keys(categoryCounts).length > 0
    ? Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count, total: totalContracts }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];

  const currentRate = hasContracts && totalContracts > 0
    ? Math.round(((totalContracts - criticalContractsCount) / totalContracts) * 100)
    : 95;

  const agreementRateData = [
    { month: "Jan", rate: 88 },
    { month: "Feb", rate: 89 },
    { month: "Mar", rate: 91 },
    { month: "Apr", rate: 90 },
    { month: "May", rate: 92 },
    { month: "Jun", rate: currentRate },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title Section */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Portfolio overview — Real-time AI Analysis
          </p>
        </div>

        <button
          onClick={() => router.push("/upload")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600/90 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer"
        >
          <Plus size={16} />
          New Contract
        </button>
      </div>

      {/* Empty State Banner */}
      {!hasContracts && (
        <div className="flex flex-col items-center justify-center gap-4 py-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
          <UploadCloud size={40} className="text-slate-300" />
          <div>
            <p className="text-slate-700 font-semibold text-base">No contracts yet</p>
            <p className="text-slate-400 text-sm mt-1">Upload your first contract to start seeing analytics here.</p>
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-blue-600/90 text-white rounded-xl text-sm font-bold shadow-sm transition-all duration-150"
          >
            <UploadCloud size={15} />
            Upload a Contract
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Contracts Reviewed"
          value={totalContracts}
          subtext="Total processed"
          iconName="FileText"
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Avg. Risk Score"
          value={avgRiskScore}
          subtext="Aggregate score"
          iconName="Activity"
          iconColor="text-amber-500"
        />
        <MetricCard
          title="Critical / High Flags"
          value={criticalFlagsCount}
          subtext={`Across ${criticalContractsCount} contracts`}
          iconName="AlertTriangle"
          iconColor="text-violet-500"
        />
        <MetricCard
          title="Est. Time Saved"
          value={totalContracts > 0 ? `${totalContracts * 4}h` : "0h"}
          subtext="vs. manual review"
          iconName="Clock"
          iconColor="text-teal-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RiskDistributionChart data={riskDistributionData} />
        <AgreementRateChart data={agreementRateData} />
        <TopRiskCategories categories={topRiskCategories} />
      </div>

      {/* Needs Review Queue */}
      <NeedsReviewQueue queue={queueItems.slice(0, 5)} />

      {/* My Contracts Table */}
      {hasContracts && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Contracts</h2>
              <p className="text-xs text-slate-400 mt-0.5">{contracts.length} document{contracts.length !== 1 ? "s" : ""} uploaded</p>
            </div>
            <button
              onClick={() => router.push("/upload")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold border border-blue-200/60 transition-colors"
            >
              <Plus size={13} /> Add
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {contracts.map((contract) => {
              const riskColors: Record<string, string> = {
                Critical: "bg-purple-100 text-purple-700 border-purple-200",
                High:     "bg-orange-100 text-orange-700 border-orange-200",
                Medium:   "bg-amber-100  text-amber-700  border-amber-200",
                Low:      "bg-teal-100   text-teal-700   border-teal-200",
              };
              const riskDot: Record<string, string> = {
                Critical: "bg-purple-500",
                High:     "bg-orange-500",
                Medium:   "bg-amber-500",
                Low:      "bg-teal-500",
              };

              return (
                <div key={contract.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors group">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-blue-500" />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{contract.name.replace(".pdf", "")}</p>
                    <p className="text-xs text-slate-400 truncate">{contract.counterparty} · {contract.type}</p>
                  </div>

                  {/* Risk badge */}
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${riskColors[contract.overallRisk] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskDot[contract.overallRisk] || "bg-slate-400"}`} />
                    {contract.overallRisk}
                  </span>

                  {/* Score */}
                  <span className="hidden md:block text-sm font-bold text-slate-700 w-8 text-right">{contract.score}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedContractId(contract.id);
                        router.push("/clause-analysis");
                      }}
                      title="Open in Clause Analysis"
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(contract.id)}
                      title="Delete contract"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Contract?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {contracts.find(c => c.id === confirmDeleteId)?.name.replace(".pdf", "")}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This will permanently remove the contract and all its analysis data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deletingId === confirmDeleteId}
                onClick={async () => {
                  setDeletingId(confirmDeleteId);
                  await deleteContractById(confirmDeleteId);
                  setDeletingId(null);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDeleteId ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting…</>
                ) : (
                  <><Trash2 size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
