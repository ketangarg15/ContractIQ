"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { useContract } from "@/context/ContractContext";

interface HeaderProps {
  activeRole: "Counsel" | "Admin";
  toggleMobileMenu?: () => void;
}

// Map notification title keywords to app routes
const resolveNotifRoute = (title: string, message: string): string => {
  const t = title.toLowerCase();
  const m = message.toLowerCase();
  if (t.includes("compliance") || m.includes("compliance")) return "/compliance";
  if (t.includes("risk") || t.includes("warning") || m.includes("risk")) return "/clause-analysis";
  if (t.includes("upload") || m.includes("upload")) return "/upload";
  if (t.includes("summary") || m.includes("summary")) return "/summary";
  if (t.includes("status") || m.includes("status")) return "/clause-analysis";
  if (t.includes("comparison") || m.includes("comparison")) return "/comparison";
  if (t.includes("search") || m.includes("search")) return "/search";
  return "/dashboard";
};

export default function Header({ activeRole, toggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, markAllNotificationsAsRead, removeNotification } = useContract();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleDropdown = () => {
    if (!isDropdownOpen) markAllNotificationsAsRead();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNotifClick = (id: string, title: string, message: string) => {
    removeNotification(id);
    setIsDropdownOpen(false);
    router.push(resolveNotifRoute(title, message));
  };

  const getBreadcrumbLabel = () => {
    switch (pathname) {
      case "/dashboard": case "/": return "Dashboard";
      case "/upload":             return "Upload Contract";
      case "/clause-analysis":    return "Clause Analysis";
      case "/template-comparison":return "Template Comparison";
      case "/summary":            return "AI Summary";
      case "/search":             return "Clause Search";
      case "/knowledge":          return "Knowledge Assistant";
      case "/comparison":         return "Contract Comparison";
      case "/compliance":         return "Compliance Monitor";
      default:                    return "Dashboard";
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 flex items-center justify-between select-none relative z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="p-1.5 -ml-1.5 md:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="hidden sm:inline">ContractIQ</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">{getBreadcrumbLabel()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Notification bell */}
        <button
          onClick={handleToggleDropdown}
          className={`relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer ${isDropdownOpen ? "bg-slate-100 text-slate-700" : ""}`}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Notifications Dropdown */}
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute right-12 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Workspace Alerts</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length} Total
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 text-xs">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className="p-3.5 hover:bg-indigo-50/40 transition-colors flex gap-3 items-start cursor-pointer group"
                      onClick={() => handleNotifClick(notif.id, notif.title, notif.message)}
                      title="Click to go to related page"
                    >
                      {notif.title.toLowerCase().includes("risk") || notif.title.toLowerCase().includes("warning") ? (
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{notif.message}</p>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1">{notif.time} · click to view</span>
                      </div>
                      {/* Dismiss button */}
                      <button
                        onClick={e => { e.stopPropagation(); removeNotification(notif.id); }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-300 hover:text-slate-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Role badge */}
        <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] sm:text-xs font-bold text-blue-600 whitespace-nowrap">
          {activeRole === "Counsel" ? "Legal Counsel" : "Administrator"}
        </div>
      </div>
    </header>
  );
}
