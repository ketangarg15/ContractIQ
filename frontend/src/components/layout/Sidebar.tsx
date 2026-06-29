"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Columns, 
  Sparkles, 
  Search, 
  MessageSquare, 
  GitCompare, 
  ShieldCheck, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X
} from "lucide-react";
import { useContract } from "@/context/ContractContext";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeRole: "Counsel" | "Admin";
  setActiveRole: (role: "Counsel" | "Admin") => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  onSettingsClick?: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  activeRole, 
  setActiveRole,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onSettingsClick
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userProfile } = useContract();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Upload Contract", href: "/upload", icon: Upload },
    { label: "Clause Analysis", href: "/clause-analysis", icon: FileText },
    { label: "Template Comparison", href: "/template-comparison", icon: Columns },
    { label: "AI Summary", href: "/summary", icon: Sparkles },
    { label: "Clause Search", href: "/search", icon: Search },
    { label: "Knowledge Assistant", href: "/knowledge", icon: MessageSquare },
    { label: "Contract Comparison", href: "/comparison", icon: GitCompare },
    { label: "Compliance Monitor", href: "/compliance", icon: ShieldCheck },
  ];

  return (
    <aside 
      className={`bg-[#0f172a] border-r border-slate-800/50 text-slate-100 flex flex-col justify-between transition-transform duration-300 z-50 h-screen fixed inset-y-0 left-0 md:relative md:translate-x-0 ${
        isCollapsed ? "w-20" : "w-64"
      } ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Top Brand Logo Section */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-[#2563eb] rounded-lg text-white shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col select-none">
              <span className="font-bold text-base tracking-tight text-white">ContractIQ</span>
              <span className="text-[10px] text-slate-400 font-medium">Legal Intelligence</span>
            </div>
          )}
        </div>
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden md:block text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile Close Button */}
        {setIsMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => {
                if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                isActive 
                  ? "bg-[#2563eb] text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon size={18} className={`shrink-0 transition-transform ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/50 flex items-center justify-between gap-3 overflow-hidden select-none bg-black/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center font-bold text-sm text-white shrink-0">
            {userProfile.initials}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate leading-none">{userProfile.name}</span>
              <span className="text-[10px] text-slate-400 font-medium truncate mt-1">
                {activeRole === "Counsel" ? "Legal Counsel" : "Administrator"}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={onSettingsClick}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="User Settings"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
