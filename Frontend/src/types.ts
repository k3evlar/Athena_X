export type SystemStatus = 'SECURE' | 'MONITORING' | 'UNDER_ATTACK';

export type LogStatus = 'SUCCESS' | 'SUSPICIOUS' | 'FAILED' | 'BLOCKED';

export interface LogEntry {
  id: string;
  timestamp: Date;
  user: string;
  ip: string;
  action: string;
  status: LogStatus;
}

export type AttackSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AttackInfo {
  detected: boolean;
  type: string;
  severity: AttackSeverity;
  sourceIp: string;
  targetSystem: string;
  confidence: number;
  analysis: string;
}

export type ResponseActionType = 'IP_BLOCKED' | 'ACCOUNT_LOCKED' | 'SESSION_TERMINATED' | 'FIREWALL_RULE_ADDED';

export type ResponseStatus = 'EXECUTED' | 'PENDING' | 'FAILED';

export interface ResponseAction {
  id: string;
  type: ResponseActionType;
  target: string;
  timestamp: Date;
  status: ResponseStatus;
}

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  severity: 'info' | 'warning' | 'error' | 'success' | 'ai';
  active?: boolean;
}

export interface RiskResponse {
  risk_score: number;
  risk_level: string;
  mode: string;
}

export interface LogResponse {
  timestamp: string;
  user: string;
  ip: string;
  action: string;
  status: string;
}

export interface AIAnalysisResponse {
  latest_output: {
    attack?: string;
    attack_type?: string;
    severity?: string;
    explanation?: string;
    action?: string;
  };
  is_analyzing: boolean;
}

export interface ActionHistoryEntry {
  timestamp: string;
  target_ip: string;
  target_user: string;
  actions: string[];
  severity: string;
}

export interface TimelineResponse {
  id: string;
  timestamp: string;
  event_type: string;
  message: string;
  severity: string;
}

export type SimulationState = 'IDLE' | 'MONITORING' | 'DETECTING' | 'ANALYZING' | 'RESPONDING' | 'SECURED';
