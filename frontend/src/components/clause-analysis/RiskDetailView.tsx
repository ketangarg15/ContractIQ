"use client";

import React, { useState } from "react";
import { ArrowLeft, User, Check, AlertCircle, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Clause, RiskLevel } from "@/types";
import RiskBadge from "@/components/ui/RiskBadge";
import { useContract } from "@/context/ContractContext";
import { saveClauseToLibrary } from "@/lib/api";
import { toast } from "sonner";

interface RiskDetailViewProps {
  clause: Clause;
  contractName: string;
  onBack: () => void;
}

export default function RiskDetailView({ clause, contractName, onBack }: RiskDetailViewProps) {
  const { selectedContractId, updateContractClauseById } = useContract();
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isConfirmed = clause.status === "Confirmed";

  const handleConfirm = async () => {
    if (!selectedContractId || isConfirmed || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateContractClauseById(selectedContractId, clause.id, { status: "Confirmed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOverride = async (level: RiskLevel) => {
    if (!selectedContractId || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateContractClauseById(selectedContractId, clause.id, { riskLevel: level });
      setShowOverrideMenu(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (isSaved || isSaving || !clause.text) return;
    setIsSaving(true);
    try {
      await saveClauseToLibrary({
        clause_type: clause.name,
        clause_text: clause.text,
        source_contract: contractName,
      });
      setIsSaved(true);
      toast.success(`"${clause.name}" saved to clause library`);
    } catch (err) {
      toast.error("Failed to save clause to library");
    } finally {
      setIsSaving(false);
    }
  };

  const riskOptions: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col p-8 space-y-6">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium w-fit"
      >
        <ArrowLeft size={16} />
        Back to Clause Analysis
      </button>

      {/* Header */}
      <div className="space-y-1.5 pb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{clause.name}</h1>
          <div className="flex items-center gap-2">
            <RiskBadge level={clause.riskLevel} />
            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold flex items-center gap-1.5 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              {clause.confidenceLevel} conf.
            </span>
            <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 border ${
              isConfirmed 
                ? "bg-teal-50 text-teal-700 border-teal-200/60" 
                : "bg-amber-50 text-amber-700 border-amber-200/60"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? "bg-teal-500" : "bg-amber-500"}`}></span>
              {isConfirmed ? "Confirmed" : "Needs Review"}
            </span>
          </div>
        </div>
        <p className="text-slate-500 text-sm">
          {contractName} • AI Risk Score: <span className="font-bold text-slate-800">{clause.score}</span>
        </p>
      </div>

      {/* Side-by-side Clause Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Current Clause */}
        <div className="bg-rose-50/30 border border-rose-200/60 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Clause</h3>
          </div>
          <div className="bg-white border border-rose-100 rounded-lg p-5 text-slate-700 text-sm leading-relaxed shadow-sm">
            {clause.text}
          </div>
        </div>

        {/* Suggested Standard Wording */}
        <div className="bg-teal-50/30 border border-teal-200/60 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Standard Wording</h3>
          </div>
          <div className="bg-white border border-teal-100 rounded-lg p-5 text-slate-700 text-sm leading-relaxed shadow-sm">
            {clause.suggestedWording || "No standard wording available."}
          </div>
        </div>

      </div>

      {/* Explanation and Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Why this deviates */}
        <div className="md:col-span-2 border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Why this deviates</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {clause.explanation}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plain-English Explanation</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              A {clause.score > 90 ? "$5,000" : "low"} liability cap on an $85,000/year contract means you have almost no legal recourse if the vendor causes significant damage. This is a major financial exposure.
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Breakdown</h3>
            <div>
              <div className="text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">{clause.score}</div>
              <RiskBadge level={clause.riskLevel} />
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-700 block">Why this score</span>
              Cap is less than 6% of annual contract value — extreme deviation from market standard.
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm mt-6 pt-4 border-t border-slate-100">
            <span className="text-slate-500">Confidence</span>
            <span className="font-semibold text-slate-800">{clause.confidenceLevel}</span>
          </div>
        </div>

      </div>

      {/* Review Actions */}
      <div className="border border-slate-200 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Review Actions</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleConfirm}
            disabled={isConfirmed || isUpdating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 ${
              isConfirmed 
                ? "bg-teal-50 border border-teal-200 text-teal-700 cursor-default" 
                : "bg-[#2563eb] hover:bg-blue-600/90 text-white active:scale-95"
            }`}
          >
            {isConfirmed ? (
              <>
                <Check size={16} />
                Verdict Confirmed
              </>
            ) : (
              "Confirm AI Verdict"
            )}
          </button>
          
          {showOverrideMenu ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-150 py-1">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <AlertCircle size={14} className="text-[#2563eb]" /> Select New Level:
              </span>
              {riskOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => handleOverride(level)}
                  disabled={isUpdating}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors shadow-sm bg-white text-slate-700"
                >
                  {level}
                </button>
              ))}
              <button
                onClick={() => setShowOverrideMenu(false)}
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowOverrideMenu(true)}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 duration-200"
            >
              Override Risk Level
            </button>
          )}

          {/* Save to Library */}
          <button
            onClick={handleSaveToLibrary}
            disabled={isSaved || isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 border ${
              isSaved
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 cursor-default"
                : "bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-600 active:scale-95"
            }`}
          >
            {isSaved ? (
              <><BookmarkCheck size={16} /> Saved to Library</>
            ) : isSaving ? (
              <><span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" /> Saving...</>
            ) : (
              <><BookmarkPlus size={16} /> Save to Library</>
            )}
          </button>
        </div>
      </div>

      {/* Review History */}
      <div className="border border-slate-200 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Review History</h3>
        
        {clause.reviewHistory && clause.reviewHistory.length > 0 ? (
          <div className="space-y-3">
            {clause.reviewHistory.map((history) => (
              <div key={history.id} className="bg-slate-50/50 rounded-lg p-3 flex items-center gap-4 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{history.user}</span>
                    <span className="text-xs text-slate-400 font-medium">{history.date}</span>
                    {history.action.includes("Confirmed") || history.action.includes("Review") ? (
                      <span className="px-2 py-0.5 bg-teal-100/60 text-teal-700 rounded text-[10px] font-bold uppercase ml-2">Confirmed</span>
                    ) : null}
                  </div>
                  {history.action.includes("Original") ? (
                    <div className="text-xs text-slate-500 mt-1">
                      {history.action}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-1">
                      {history.action}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No review history available.</p>
        )}
      </div>

    </div>
  );
}
