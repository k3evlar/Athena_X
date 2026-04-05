import {
  RiskResponse,
  LogResponse,
  AIAnalysisResponse,
  ActionHistoryEntry,
  TimelineResponse,
} from './types';

const BASE_URL = 'http://localhost:8000';

export async function fetchLogs(): Promise<LogResponse[]> {
  const response = await fetch(`${BASE_URL}/logs`);
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
}

export async function fetchRisk(): Promise<RiskResponse> {
  const response = await fetch(`${BASE_URL}/risk`);
  if (!response.ok) throw new Error('Failed to fetch risk status');
  return response.json();
}

export async function fetchAIAnalysis(): Promise<AIAnalysisResponse> {
  const response = await fetch(`${BASE_URL}/ai`);
  if (!response.ok) throw new Error('Failed to fetch AI analysis');
  return response.json();
}

export async function fetchActions(): Promise<{ actions_history: ActionHistoryEntry[]; blocked_ips: string[]; locked_users: string[] }> {
  const response = await fetch(`${BASE_URL}/actions`);
  if (!response.ok) throw new Error('Failed to fetch actions');
  return response.json();
}

export async function fetchTimeline(): Promise<TimelineResponse[]> {
  const response = await fetch(`${BASE_URL}/timeline`);
  if (!response.ok) throw new Error('Failed to fetch timeline');
  return response.json();
}

export async function triggerAttack(): Promise<{ status: string }> {
  const response = await fetch(`${BASE_URL}/simulate_attack`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to trigger attack');
  return response.json();
}

export async function resetSystem(): Promise<{ status: string }> {
  const response = await fetch(`${BASE_URL}/reset`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to reset system');
  return response.json();
}
