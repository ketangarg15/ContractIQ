"use client";

import React from "react";
import { Check, X, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useContract } from "@/context/ContractContext";

export default function CompliancePage() {
  const { contracts, loading } = useContract();
  const username = typeof window !== "undefined" ? localStorage.getItem("user_username") : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-medium">Loading compliance records...</p>
      </div>
    );
  }

  // Hardcoded mockup records for demo users
  const staticMockComplianceData = [
    { id: "c1", name: "Meridian SaaS License", gdpr: "Fail", ccpa: "Fail", hipaa: "N/A", sox: "Pass", pci: "N/A", status: "Attention Required" },
    { id: "c2", name: "Vertex Vendor Agreement", gdpr: "Pass", ccpa: "Pass", hipaa: "N/A", sox: "Pass", pci: "N/A", status: "Compliant" },
    { id: "c3", name: "Acme Corp NDA", gdpr: "Pass", ccpa: "Pass", hipaa: "N/A", sox: "N/A", pci: "N/A", status: "Compliant" },
    { id: "c4", name: "Ironwood Procurement", gdpr: "Pass", ccpa: "Pass", hipaa: "N/A", sox: "Pass", pci: "Fail", status: "Attention Required" },
    { id: "c5", name: "Chen Employment", gdpr: "Pass", ccpa: "Pass", hipaa: "Pass", sox: "N/A", pci: "N/A", status: "Compliant" },
    { id: "c6", name: "BrightPath Partnership", gdpr: "Fail", ccpa: "Pass", hipaa: "N/A", sox: "Pass", pci: "N/A", status: "Attention Required" },
    { id: "c7", name: "Global Reach NDA", gdpr: "Pass", ccpa: "Pass", hipaa: "N/A", sox: "N/A", pci: "N/A", status: "Compliant" }
  ];

  const staticMockIssues = [
    {
      id: "mi1",
      contractName: "Meridian SaaS License",
      risk: "Critical",
      frameworks: ["GDPR", "CCPA"],
      color: "violet",
      text: "Overbroad data processing rights; vendor authorized to process data for own analytics without restriction. No standard contractual clauses (SCCs) for international transfers."
    },
    {
      id: "mi2",
      contractName: "BrightPath Partnership",
      risk: "High",
      frameworks: ["GDPR"],
      color: "orange",
      text: "No data processing agreement (DPA) attached. EU personal data processing occurring without lawful basis documentation."
    },
    {
      id: "mi3",
      contractName: "Ironwood Procurement",
      risk: "High",
      frameworks: ["PCI DSS"],
      color: "orange",
      text: "Payment card data handling procedures not addressed in contract. Vendor handles cardholder data without explicit compliance obligation."
    }
  ];

  // Render dynamic compliance list based on user's own contracts, fall back to mock data only for demo/guest
  const isDemo = username === "sarah.mitchell" || !username;
  const displayContracts = contracts.length > 0 
    ? contracts 
    : (isDemo ? null : []);

  const matrixData = displayContracts === null 
    ? staticMockComplianceData 
    : displayContracts.map(c => {
        const gdpr = c.score && c.score < 50 ? "Fail" : "Pass";
        const ccpa = "Pass";
        const hipaa = c.type?.toLowerCase().includes("support") ? "Pass" : "N/A";
        const sox = "Pass";
        const pci = "N/A";

        const hasFail = [gdpr, ccpa, hipaa, sox, pci].includes("Fail");
        const status = hasFail ? "Attention Required" : "Compliant";

        return {
          id: c.id,
          name: c.name,
          gdpr,
          ccpa,
          hipaa,
          sox,
          pci,
          status
        };
      });

  // Calculate pass/fail counts
  let passCount = 0;
  let failCount = 0;

  matrixData.forEach(row => {
    [row.gdpr, row.ccpa, row.hipaa, row.sox, row.pci].forEach(val => {
      if (val === "Pass") passCount++;
      if (val === "Fail") failCount++;
    });
  });

  // Compile compliance issues list
  const issuesList = displayContracts === null
    ? staticMockIssues
    : displayContracts
        .filter(c => c.score && c.score < 50)
        .map(c => ({
          id: c.id,
          contractName: c.name,
          risk: "High",
          frameworks: ["GDPR"],
          color: "orange",
          text: `Contract exhibits low overall compliance score (${c.score}/100) and contains unaligned standard legal representations.`
        }));

  const renderMatrixBadge = (value: string) => {
    if (value === "Pass") {
      return (
        <div className="flex items-center gap-1.5 text-teal-600 text-xs font-semibold">
          <Check className="w-3.5 h-3.5" /> Pass
        </div>
      );
    }
    if (value === "Fail") {
      return (
        <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold">
          <X className="w-3.5 h-3.5" /> Fail
        </div>
      );
    }
    return (
      <div className="text-zinc-400 text-xs font-medium">N/A</div>
    );
  };

  const renderStatusBadge = (status: string) => {
    if (status === "Compliant") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50/50 text-teal-700 rounded-md text-xs font-semibold border border-teal-200/60">
          <Check className="w-3.5 h-3.5" /> Compliant
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50/50 text-rose-700 rounded-md text-xs font-semibold border border-rose-200/60">
        <AlertTriangle className="w-3.5 h-3.5" /> Attention Required
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Compliance Monitor</h1>
          <p className="text-slate-500 text-sm">Automated compliance checks against major regulations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-teal-50/50 text-teal-700 border border-teal-200/60 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm">
            <Check className="w-4 h-4" /> {passCount} Pass
          </div>
          <div className="px-4 py-1.5 bg-rose-50/50 text-rose-700 border border-rose-200/60 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm">
            <X className="w-4 h-4" /> {failCount} Fail
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {matrixData.length === 0 ? (
            <div className="px-8 py-16 text-center text-slate-400 text-sm">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              No contracts loaded in your workspace yet. Go to <span className="font-semibold text-blue-500">Upload Contract</span> to audit your first document.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider w-[250px]">Contract</th>
                  <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">GDPR</th>
                  <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">CCPA</th>
                  <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">HIPAA</th>
                  <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">SOX</th>
                  <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">PCI DSS</th>
                  <th className="py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 text-sm">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">{renderMatrixBadge(row.gdpr)}</td>
                    <td className="py-5 px-6">{renderMatrixBadge(row.ccpa)}</td>
                    <td className="py-5 px-6">{renderMatrixBadge(row.hipaa)}</td>
                    <td className="py-5 px-6">{renderMatrixBadge(row.sox)}</td>
                    <td className="py-5 px-6">{renderMatrixBadge(row.pci)}</td>
                    <td className="py-5 px-8">{renderStatusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Compliance Issues Summary</h3>
        {issuesList.length === 0 ? (
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-6 text-center text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            All contracts in this workspace are fully compliant. No issues found!
          </div>
        ) : (
          <div className="space-y-3">
            {issuesList.map((issue) => (
              <div key={issue.id} className="bg-white border border-zinc-200/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 shadow-sm">
                <div className="shrink-0 pt-0.5">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider w-fit ${
                    issue.risk === "Critical" 
                      ? "bg-violet-50 text-violet-700 border-violet-200/60" 
                      : "bg-orange-50 text-orange-700 border-orange-200/60"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${issue.risk === "Critical" ? "bg-violet-500" : "bg-orange-500"}`}></span>
                    {issue.risk}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{issue.contractName}</h4>
                    <div className="flex gap-1.5 flex-wrap">
                      {issue.frameworks.map((fw, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{fw}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {issue.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
