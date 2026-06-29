"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, login, userProfile, updateUserProfile } = useContract();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication Guard
  useEffect(() => {
    if (!mounted) return;
    const savedRole = localStorage.getItem("user_role");
    if (pathname !== "/login" && !savedRole) {
      router.push("/login");
    }
  }, [pathname, role, router, mounted]);

  // If on login page, render only the login container
  if (pathname === "/login") {
    return <div className="w-full min-h-screen bg-[#090d16]">{children}</div>;
  }

  // Show a loading screen while auth role checks mount or before hydration is complete
  if (!mounted || (pathname !== "/login" && !role)) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeRole = role || "Counsel";
  const setActiveRole = () => {};

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Right Content Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header activeRole={activeRole} toggleMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <UserSettingsModal 
          profile={userProfile}
          onSave={(updated) => {
            updateUserProfile(updated);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

interface UserSettingsModalProps {
  profile: { name: string; initials: string; email: string };
  onSave: (updated: { name: string; initials: string; email: string }) => void;
  onClose: () => void;
}

function UserSettingsModal({ profile, onSave, onClose }: UserSettingsModalProps) {
  const [name, setName] = useState(profile.name);
  const [initials, setInitials] = useState(profile.initials);
  const [email, setEmail] = useState(profile.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, initials, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">User Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                const parts = e.target.value.trim().split(" ");
                const ini = parts.map(p => p[0] || "").join("").toUpperCase().slice(0, 3);
                setInitials(ini);
              }}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Initials</label>
            <input
              type="text"
              required
              maxLength={3}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
