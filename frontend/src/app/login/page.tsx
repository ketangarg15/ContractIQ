"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import { Shield, Briefcase, Lock, User, Sparkles, Mail, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useContract();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"Counsel" | "Admin">("Counsel");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      toast.success("Welcome to ContractIQ!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    const parts = name.trim().split(" ");
    const initials = parts.map(p => p[0] || "").join("").toUpperCase().slice(0, 3);

    try {
      await signup({
        username: username.trim(),
        password: password.trim(),
        role,
        name: name.trim(),
        initials,
        email: email.trim(),
      });
      toast.success("Account created successfully! Please sign in.");
      setIsSignUp(false);
      setPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] relative overflow-hidden px-4 py-8">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-[#111827]/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 select-none">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ContractIQ</h1>
            <p className="text-slate-400 text-xs mt-1 font-medium flex items-center justify-center gap-1">
              <Sparkles size={12} className="text-blue-400" /> Legal Contract Intelligence Platform
            </p>
          </div>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="bg-slate-900/60 p-1 rounded-xl border border-slate-800 flex">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setPassword(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              !isSignUp
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn size={14} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setPassword(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isSignUp
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus size={14} />
            Create Account
          </button>
        </div>

        {/* Dynamic Forms */}
        {!isSignUp ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sarah.mitchell"
                  className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-slate-100 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Password</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-slate-100 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all duration-150 shadow flex items-center justify-center gap-2 disabled:bg-blue-600/50 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Full Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-slate-100 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Email Address</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-slate-100 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 pl-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john.doe"
                  className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-slate-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 pl-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-slate-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 pl-1">Choose Role</label>
              <div className="bg-slate-900/40 p-1.5 rounded-xl border border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("Counsel")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    role === "Counsel"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Briefcase size={12} />
                  Legal Counsel
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Admin")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    role === "Admin"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Shield size={12} />
                  Administrator
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all duration-150 shadow flex items-center justify-center gap-2 disabled:bg-blue-600/50 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        <div className="text-center">
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            Secured Legal Workspace
          </span>
        </div>
      </div>
    </div>
  );
}
