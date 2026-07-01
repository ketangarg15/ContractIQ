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

export async function updateContractClause(
  contractId: string | number,
  clauseId: string,
  payload: { status?: string; riskLevel?: string; username?: string }
) {
  const res = await fetch(`${BASE_URL}/api/contracts/${contractId}/clauses/${clauseId}`, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      status: payload.status,
      risk_level: payload.riskLevel,
      username: payload.username
    }),
  });
  if (!res.ok) throw new Error("Failed to update clause");
  return res.json();
}

export async function fetchClauseLibrary(search?: string, type?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE_URL}/api/clauses/library${query}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch clause library");
  return res.json();
}

export async function saveClauseToLibrary(payload: {
  clause_type: string;
  clause_text: string;
  source_contract?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/clauses/library`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save clause to library");
  return res.json();
}

export async function deleteClauseFromLibrary(clauseId: number) {
  const res = await fetch(`${BASE_URL}/api/clauses/library/${clauseId}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to delete clause from library");
  return res.json();
}

export async function fetchChatHistory(contractId: string | number) {
  const res = await fetch(`${BASE_URL}/api/contracts/${contractId}/chat/history`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch chat history");
  return res.json();
}

export async function clearChatHistory(contractId: string | number) {
  const res = await fetch(`${BASE_URL}/api/contracts/${contractId}/chat/history`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to clear chat history");
  return res.json();
}

export async function updateContractNotes(contractId: string | number, notes: string) {
  const res = await fetch(`${BASE_URL}/api/contracts/${contractId}/notes`, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ notes })
  });
  if (!res.ok) throw new Error("Failed to update notes");
  return res.json();
}
