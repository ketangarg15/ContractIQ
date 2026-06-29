"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Contract } from "@/types";
import { fetchContracts, deleteContract as apiDeleteContract } from "@/lib/api";
import { mockContracts } from "@/data/mockData";
import { toast } from "sonner";

interface ContractContextType {
  contracts: Contract[];
  selectedContract: Contract | null;
  selectedContractId: string | null;
  setSelectedContractId: (id: string | null) => void;
  loading: boolean;
  refreshContracts: () => Promise<void>;
  deleteContractById: (id: string) => Promise<void>;
  isUsingMockData: boolean;
  role: "Counsel" | "Admin" | null;
  login: (usernameValue: string, passwordValue: string) => Promise<any>;
  signup: (payload: any) => Promise<any>;
  logout: () => void;
  updateContractStatus: (id: string, status: string) => Promise<void>;
  userProfile: { name: string; initials: string; email: string };
  updateUserProfile: (profile: { name: string; initials: string; email: string }) => void;
  notifications: NotificationItem[];
  markAllNotificationsAsRead: () => void;
  addNotification: (title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [role, setRole] = useState<"Counsel" | "Admin" | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; initials: string; email: string }>({
    name: "Sarah Mitchell",
    initials: "SM",
    email: "sarah.mitchell@contractiq.ai"
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Contract Analyzed",
      message: "Mutual Non-Disclosure Agreement.pdf has been processed successfully.",
      read: false,
      time: "10 mins ago"
    },
    {
      id: "2",
      title: "High Risk Warning",
      message: "Meridian SaaS Agreement includes an unlimited liability clause that requires attention.",
      read: false,
      time: "1 hour ago"
    }
  ]);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (title: string, message: string) => {
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      read: false,
      time: "Just now"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Load auth and profile state from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    if (savedRole === "Counsel" || savedRole === "Admin") {
      setRole(savedRole);
    }
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.warn("Failed to parse user profile from localStorage", e);
      }
    }
  }, []);

  const login = async (usernameValue: string, passwordValue: string) => {
    const { loginUser } = await import("@/lib/api");
    try {
      const profile = await loginUser({ username: usernameValue, password: passwordValue });
      setRole(profile.role);
      setUserProfile({
        name: profile.name,
        initials: profile.initials,
        email: profile.email
      });
      localStorage.setItem("user_role", profile.role);
      localStorage.setItem("user_username", profile.username);
      localStorage.setItem("user_profile", JSON.stringify({
        name: profile.name,
        initials: profile.initials,
        email: profile.email
      }));
      // Reset selected contract to load fresh list
      setSelectedContractId(null);
      return profile;
    } catch (err: any) {
      throw err;
    }
  };

  const signup = async (payload: any) => {
    const { registerUser } = await import("@/lib/api");
    try {
      return await registerUser(payload);
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_username");
    localStorage.removeItem("user_profile");
    setContracts([]);
    setSelectedContractId(null);
  };

  const updateUserProfile = (newProfile: { name: string; initials: string; email: string }) => {
    setUserProfile(newProfile);
    localStorage.setItem("user_profile", JSON.stringify(newProfile));
  };

  const refreshContracts = async () => {
    const { fetchContracts: apiFetchContracts } = await import("@/lib/api");
    try {
      setLoading(true);
      const data = await apiFetchContracts();

      if (data && data.length > 0) {
        setContracts(data);
        setIsUsingMockData(false);
        if (!selectedContractId || !data.some((c: Contract) => c.id === selectedContractId)) {
          setSelectedContractId(data[0].id);
        }
      } else {
        // No contracts in database — show clean empty state for all users
        setContracts([]);
        setIsUsingMockData(false);
        setSelectedContractId(null);
      }
    } catch (error) {
      console.warn("Failed to connect to backend:", error);
      // Even on connection failure, show empty state rather than mock data
      setContracts([]);
      setIsUsingMockData(false);
      setSelectedContractId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContracts();
  }, []);

  const deleteContractById = async (id: string) => {
    if (isUsingMockData) {
      const updated = contracts.filter(c => c.id !== id);
      setContracts(updated);
      toast.success("Contract deleted (mock mode)");
      if (selectedContractId === id) {
        setSelectedContractId(updated.length > 0 ? updated[0].id : null);
      }
      return;
    }

    try {
      await apiDeleteContract(id);
      toast.success("Contract deleted successfully");
      await refreshContracts();
    } catch (err) {
      toast.error("Failed to delete contract");
    }
  };

  const updateContractStatus = async (id: string, status: string) => {
    // If in mock mode, update local state
    if (isUsingMockData) {
      setContracts(prev =>
        prev.map(c => (c.id === id ? { ...c, status: status as any } : c))
      );
      toast.success(`Status updated to "${status}" (mock mode)`);
      addNotification("Status Transition", `Contract status updated to "${status}" (Mock Mode).`);
      return;
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${BASE_URL}/api/contracts/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Status updated to "${status}"`);
      addNotification("Status Transition", `Contract status successfully updated to "${status}".`);
      await refreshContracts();
    } catch (err) {
      toast.error("Failed to update contract status");
    }
  };

  const selectedContract = contracts.find(c => c.id === selectedContractId) || null;

  return (
    <ContractContext.Provider
      value={{
        contracts,
        selectedContract,
        selectedContractId,
        setSelectedContractId,
        loading,
        refreshContracts,
        deleteContractById,
        isUsingMockData,
        role,
        login,
        signup,
        logout,
        updateContractStatus,
        userProfile,
        updateUserProfile,
        notifications,
        markAllNotificationsAsRead,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
}
