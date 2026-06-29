"use client";

import React, { useState } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { 
  mockSearchResults, 
  mockSearchResultsAutoRenewal, 
  mockSearchResultsDataTransfer, 
  mockSearchResultsIndemnification 
} from "@/data/mockData";
import RiskBadge from "@/components/ui/RiskBadge";
import { RiskLevel } from "@/types";
import RiskDetailView from "@/components/clause-analysis/RiskDetailView";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const suggestions = [
    "90-day auto-renewal clauses",
    "data transfer restrictions absent"
  ];

  const [results, setResults] = useState<typeof mockSearchResults>([]);
  const [selectedResult, setSelectedResult] = useState<typeof mockSearchResults[0] | null>(null);

  const handleSearch = (searchQuery: string) => {
    setSelectedResult(null);
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate network delay for AI search
    setTimeout(() => {
      let filtered: typeof mockSearchResults = [];
      const lowerQ = searchQuery.toLowerCase();
      
      if (lowerQ.includes("liability") || lowerQ.includes("50,000")) {
        filtered = mockSearchResults;
      } else if (lowerQ.includes("renewal") || lowerQ.includes("90-day")) {
        filtered = mockSearchResultsAutoRenewal;
      } else if (lowerQ.includes("data transfer") || lowerQ.includes("restriction") || lowerQ.includes("absent")) {
        filtered = mockSearchResultsDataTransfer;
      } else if (lowerQ.includes("indemnification") || lowerQ.includes("missing")) {
        filtered = mockSearchResultsIndemnification;
      }
      
      setResults(filtered);
      setIsSearching(false);
    }, 800);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Clause Search</h1>
        <p className="text-slate-500 text-sm">Search in natural language across all contracts and clauses.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Ask anything about your contracts..."
            />
            {query && (
              <button 
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => handleSearch(query)}
            disabled={isSearching}
            className="bg-[#2563eb] hover:bg-blue-600/90 disabled:bg-blue-400 text-white px-8 py-3.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {suggestions.map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-1.5 bg-white border border-zinc-200 text-zinc-600 rounded-full text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {isSearching && (
        <div className="space-y-4 animate-in fade-in duration-300 pt-8">
          <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[#2563eb]" />
            Searching across contract intelligence database...
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                    <span className="text-slate-300">·</span>
                    <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-4/5 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 bg-slate-200 rounded w-20 animate-pulse"></div>
                  <div className="h-5 bg-slate-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isSearching && !selectedResult && (
        <div className="space-y-4 animate-in fade-in duration-300 pt-4">
          <p className="text-sm font-medium text-slate-600">
            {results.length} results for <span className="text-slate-900">&quot;{query}&quot;</span>
          </p>
          
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <div 
                  key={result.id} 
                  onClick={() => setSelectedResult(result)}
                  className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-[#2563eb] transition-colors">{result.contractName}</span>
                      <span className="text-slate-400 font-bold">·</span>
                      <span className="text-slate-500 font-medium text-sm group-hover:text-[#2563eb] transition-colors">{result.clauseName}</span>
                    </div>
                    <RiskBadge level={result.riskLevel as RiskLevel} />
                  </div>
                  
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    {result.snippet}
                  </p>
                  
                  <div className="flex gap-2">
                    {result.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded text-xs font-bold font-mono tracking-tight">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-semibold mb-2">No clauses found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                We couldn&apos;t find any exact matches for &quot;{query}&quot;. Try adjusting your search terms or using broader keywords.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedResult && !isSearching && (
        <div className="animate-in fade-in zoom-in-95 duration-200 pt-4">
          <RiskDetailView 
            contractName={selectedResult.contractName}
            clause={{
              id: selectedResult.id,
              name: selectedResult.clauseName,
              text: selectedResult.snippet,
              riskLevel: selectedResult.riskLevel as RiskLevel,
              confidenceLevel: "High",
              status: "Needs Review",
              score: selectedResult.riskLevel === "Critical" ? 92 : selectedResult.riskLevel === "High" ? 85 : 50,
              explanation: `This is a mocked explanation for the ${selectedResult.clauseName} clause found during the semantic search.`,
              reviewHistory: [
                { id: "h1", user: "ContractIQ AI", action: "Flagged in Search", date: new Date().toLocaleString() }
              ]
            }} 
            onBack={() => setSelectedResult(null)} 
          />
        </div>
      )}
    </div>
  );
}

