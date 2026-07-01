"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { useContract } from "@/context/ContractContext";
import { chatWithContract, fetchChatHistory } from "@/lib/api";
import { ChatMessage } from "@/types";
import { toast } from "sonner";

// ── Inline renderer: bold + [Source N] chips ────────────────────────────────
const parseInline = (text: string, key: string | number, citations: string[] = []): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.*?)\*\*|\[Source\s*(\d+)\])/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2] !== undefined) {
      parts.push(
        <strong key={`b-${key}-${match.index}`} className="font-bold text-slate-900">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      const srcIdx = parseInt(match[3], 10) - 1;
      const citationText = citations[srcIdx] || "";
      // Clean up tooltip text to remove prefix if present
      const cleanedTooltip = citationText.replace(/^\[Source\s*\d+\]\s*/i, "").trim();
      parts.push(
        <span
          key={`src-${key}-${match.index}`}
          title={cleanedTooltip || `Source ${match[3]}`}
          className="inline-flex items-center mx-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700 border border-indigo-200 align-middle cursor-pointer"
        >
          Source {match[3]}
        </span>
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
};

// ── Full message formatter ───────────────────────────────────────────────────
const renderFormattedContent = (content: string, citations: string[] = []) => {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      nodes.push(<div key={`gap-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Markdown headings
    const hMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2].replace(/\*\*/g, "");
      const cls =
        level <= 2
          ? "text-base font-bold text-slate-900 mt-4 mb-1 pl-3 border-l-2 border-indigo-400"
          : "text-sm font-bold text-slate-800 mt-3 mb-1";
      nodes.push(<p key={`h-${i}`} className={cls}>{text}</p>);
      i++;
      continue;
    }

    // "Sources Used" block — collect following bullets and render as chips
    if (/^\*\*Sources Used:?\*\*$/i.test(trimmed) || /^Sources Used:?$/i.test(trimmed)) {
      const sources: string[] = [];
      i++;
      while (i < lines.length) {
        const nt = lines[i].trim();
        if (nt === "") { i++; break; }
        const bm = nt.match(/^[-*+]\s+(.*)/);
        if (bm) {
          // Strip any leading "[Source N]" prefix from the bullet text to avoid duplication
          const cleaned = bm[1].replace(/^\[Source\s*\d+\]\s*/i, "").trim();
          sources.push(cleaned);
          i++;
        } else break;
      }
      if (sources.length > 0) {
        nodes.push(
          <div key={`sources-${i}`} className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Sources Used
            </p>
            <div className="flex flex-col gap-1.5">
              {sources.map((src, si) => {
                const citationText = citations[si] || "";
                const cleanedExcerpt = citationText.replace(/^\[Source\s*\d+\]\s*/i, "").trim();
                return (
                  <span
                    key={si}
                    title={cleanedExcerpt}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 cursor-pointer"
                  >
                    <span className="bg-indigo-200 text-indigo-700 rounded px-1 font-bold text-[10px] shrink-0">
                      Source {si + 1}
                    </span>
                    <span className="truncate flex-1 text-slate-600 font-normal">
                      {cleanedExcerpt || src.replace(/^\s*:\s*/, "")}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      }
      continue;
    }

    // Bullet
    const bm = trimmed.match(/^[-*+]\s+(.*)/);
    if (bm) {
      nodes.push(
        <div key={`li-${i}`} className="flex items-start gap-2 mt-1">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
          <p className="text-sm text-slate-700 leading-relaxed">{parseInline(bm[1], i, citations)}</p>
        </div>
      );
      i++;
      continue;
    }

    // Numbered
    const nm = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (nm) {
      nodes.push(
        <div key={`num-${i}`} className="flex items-start gap-2 mt-1">
          <span className="mt-0.5 min-w-[20px] text-xs font-bold text-indigo-500">{nm[1]}.</span>
          <p className="text-sm text-slate-700 leading-relaxed">{parseInline(nm[2], i, citations)}</p>
        </div>
      );
      i++;
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={`p-${i}`} className="text-sm text-slate-800 leading-relaxed mt-2.5">
        {parseInline(trimmed, i, citations)}
      </p>
    );
    i++;
  }

  return nodes;
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KnowledgePage() {
  const { selectedContract: contract, isUsingMockData } = useContract();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history per contract from DB
  useEffect(() => {
    if (!contract) return;
    
    let isMounted = true;
    const loadHistory = async () => {
      if (isUsingMockData) {
        // Fallback welcome message in mock mode
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `Hello! [MOCK MODE] I've loaded **${contract.name.replace(".pdf", "")}**. I can answer questions about its clauses.`,
          },
        ]);
        return;
      }
      
      try {
        const history = await fetchChatHistory(contract.id);
        if (!isMounted) return;
        
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `Hello! I've loaded **${contract.name.replace(".pdf", "")}**. I can answer questions about its clauses, obligations, renewal terms, or find specific references. What would you like to know?`,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        // Welcome fallback on error
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `Hello! I've loaded **${contract.name.replace(".pdf", "")}**. I can answer questions about its clauses, obligations, renewal terms, or find specific references. What would you like to know?`,
          },
        ]);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [contract?.id, isUsingMockData]);

  const suggestedPrompts = [
    "What are the termination notice requirements?",
    "Summarize the data processing limits",
    "What is the liability cap under this agreement?",
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    if (contract && !isUsingMockData) {
      try {
        const res = await chatWithContract(contract.id, text);
        const newBotMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.answer,
          // Citations: strip [Source N] prefix since it's shown as a label already
          citations: res.sources
            ? res.sources.map((src: any, idx: number) => {
                const excerpt = src.text.slice(0, 60).trim();
                return `[Source ${idx + 1}] ${excerpt}...`;
              })
            : [],
        };
        setMessages(prev => [...prev, newBotMsg]);
      } catch (err) {
        toast.error("Failed to fetch response from assistant");
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Sorry, I had trouble processing that request. Please verify the backend is running.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    } else {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Based on the contracts in your workspace, I've analysed your query. While this is a simulated response, in a production environment I would connect to the backend AI to retrieve specific clauses and answer accurately based on the verified documents.",
            citations: [
              "[Source 1] Section 4.1 Data Processing - Describes data limits and encryption requirements.",
              "[Source 2] Exhibit B SLA - Outlines service availability and uptime commitments."
            ]
          },
        ]);
        setIsTyping(false);
      }, 1200);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-6">
      <div className="flex flex-col gap-1 mb-6 shrink-0">
        <h1 className="text-2xl font-semibold text-slate-900">Legal Knowledge Assistant</h1>
        {contract && (
          <p className="text-slate-500 text-sm">
            Chatting with:{" "}
            <span className="font-semibold text-indigo-600">
              {contract.name.replace(".pdf", "")}
            </span>
          </p>
        )}
      </div>

      <div className="flex-1 bg-white rounded-t-xl border-x border-t border-slate-200 shadow-sm overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-6 border border-indigo-100">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            <div className="space-y-1 flex-1">
              {/* Metadata label */}
              <p className={`text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 ${msg.role === 'user' ? 'text-right pr-2' : 'pl-2'}`}>
                {msg.role === 'user' ? 'You' : 'ContractIQ AI'}
              </p>
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm"
                    : "bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm"
                } text-sm leading-relaxed`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-line text-white font-medium">{msg.content}</p>
                ) : (
                  <div className="space-y-2">{renderFormattedContent(msg.content, msg.citations)}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
              <Bot className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3.5 text-slate-700 text-sm shadow-sm flex items-center gap-1.5 h-12">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-slate-50 border-x border-b border-slate-200 rounded-b-xl p-4 shadow-sm">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend(input)}
            placeholder="Ask about your contracts..."
            className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-all"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
