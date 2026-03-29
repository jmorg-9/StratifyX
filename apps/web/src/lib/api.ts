import type { DashboardResponse, SimulationResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await fetch(`${API_URL}/api/dashboard`);

  if (!response.ok) {
    throw new Error("Failed to load dashboard");
  }

  return response.json();
}

export async function runSimulation(payload: {
  entry: number;
  stop: number;
  target: number;
  riskAmount: number;
}): Promise<SimulationResponse> {
  const response = await fetch(`${API_URL}/api/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to run simulation");
  }

  return response.json();
}
