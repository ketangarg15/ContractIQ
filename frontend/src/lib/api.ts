const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getHeaders = (extra: Record<string, string> = {}) => {
  const username = typeof window !== "undefined" ? localStorage.getItem("user_username") : null;
  const headers: Record<string, string> = { ...extra };
  if (username) {
    headers["x-username"] = username;
  }
  return headers;
};

export async function registerUser(payload: any) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function loginUser(payload: any) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function fetchContracts() {
  const res = await fetch(`${BASE_URL}/api/contracts`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch contracts");
  return res.json();
}

export async function fetchContract(id: string | number) {
  const res = await fetch(`${BASE_URL}/api/contracts/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch contract ${id}`);
  return res.json();
}

export async function uploadContract(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const username = typeof window !== "undefined" ? localStorage.getItem("user_username") : null;
  const headers = getHeaders();

  const res = await fetch(`${BASE_URL}/api/contracts/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload contract");
  return res.json();
}

export async function deleteContract(id: string | number) {
  const res = await fetch(`${BASE_URL}/api/contracts/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to delete contract ${id}`);
  return res.json();
}

export async function chatWithContract(id: string | number, question: string) {
  const res = await fetch(`${BASE_URL}/api/contracts/${id}/chat`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Failed to chat with contract");
  return res.json();
}

export async function searchContract(id: string | number, query: string) {
  const res = await fetch(`${BASE_URL}/api/contracts/${id}/search`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to search contract");
  return res.json();
}

export async function compareContracts(contractIdA: string | number, contractIdB: string | number) {
  const res = await fetch(`${BASE_URL}/api/contracts/compare`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      contract_id_a: Number(contractIdA),
      contract_id_b: Number(contractIdB),
    }),
  });
  if (!res.ok) throw new Error("Failed to compare contracts");
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export function getAnalyzeUrl(id: string | number) {
  return `${BASE_URL}/api/contracts/${id}/analyze`;
}
