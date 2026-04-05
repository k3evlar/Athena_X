import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { ResponseEngine } from './components/ResponseEngine';
import { ThreatTimeline } from './components/ThreatTimeline';
import { FloatingControlPanel } from './components/FloatingControlPanel';
import * as api from './api';
import {
  SystemStatus,
  LogEntry,
  LogStatus,
  AttackSeverity,
  AttackInfo,
  ResponseAction,
  ResponseActionType,
  TimelineEvent,
  LogResponse,
  ActionHistoryEntry,
  TimelineResponse,
} from './types';

function App() {
  const [status, setStatus] = useState<SystemStatus>('SECURE');
  const [riskScore, setRiskScore] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [attackInfo, setAttackInfo] = useState<AttackInfo>({
    detected: false,
    type: '',
    severity: 'LOW',
    sourceIp: '',
    targetSystem: 'AUTH-SERVER-01',
    confidence: 0,
    analysis: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [responseActions, setResponseActions] = useState<ResponseAction[]>([]);
  const [autoMode, setAutoMode] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // --- REAL-TIME POLLING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Risk & Status
        const riskData = await api.fetchRisk();
        setRiskScore(riskData.risk_score);
        
        // Map backend level to frontend status
        const level = riskData.risk_level;
        if (level === 'HIGH' || riskData.mode === 'attack') {
          setStatus('UNDER_ATTACK');
        } else if (level === 'MEDIUM') {
          setStatus('MONITORING');
        } else {
          setStatus('SECURE');
        }

        // 2. Fetch Logs
        const rawLogs = await api.fetchLogs();
        const mappedLogs: LogEntry[] = rawLogs.map((l: LogResponse, i: number) => ({
          id: `log-${i}-${l.timestamp}`,
          timestamp: new Date(l.timestamp),
          user: l.user,
          ip: l.ip,
          action: l.action.toUpperCase(),
          status: l.status.toUpperCase() as LogStatus,
        }));
        setLogs(mappedLogs.reverse()); // Latest first

        // 3. Fetch AI Analysis
        const aiData = await api.fetchAIAnalysis();
        const output = aiData.latest_output;
        setIsAnalyzing(aiData.is_analyzing);
        
        if (output && output.attack) {
          setAttackInfo({
            detected: output.attack === 'Yes',
            type: output.attack_type || 'Unknown Threat',
            severity: (output.severity || 'LOW').toUpperCase() as AttackSeverity,
            sourceIp: output.explanation?.split('IP ')[1]?.split(' ')[0] || 'Unknown',
            targetSystem: 'AUTH-SERVER-01',
            confidence: output.attack === 'Yes' ? 98.5 : 0,
            analysis: output.explanation || '',
          });
        }

        // 4. Fetch Actions
        const actionData = await api.fetchActions();
        const mappedActions: ResponseAction[] = [];
        
        if (actionData.actions_history) {
          actionData.actions_history.forEach((historyEntry: ActionHistoryEntry, entryIdx: number) => {
            historyEntry.actions.forEach((actionStr: string, actionIdx: number) => {
              let type: ResponseActionType = 'SESSION_TERMINATED';
              if (actionStr.toLowerCase().includes('block')) type = 'IP_BLOCKED';
              if (actionStr.toLowerCase().includes('lock')) type = 'ACCOUNT_LOCKED';
              
              mappedActions.push({
                id: `act-${entryIdx}-${actionIdx}`,
                type: type,
                target: historyEntry.target_ip || historyEntry.target_user || 'System',
                timestamp: new Date(historyEntry.timestamp),
                status: 'EXECUTED',
              });
            });
          });
        }
        setResponseActions(mappedActions.reverse());

        // 5. Fetch Timeline
        const rawTimeline = await api.fetchTimeline();
        const mappedTimeline: TimelineEvent[] = rawTimeline.map((ev: TimelineResponse, idx: number) => {
          let severity: 'info' | 'warning' | 'error' | 'success' | 'ai' = 'info';
          const sev = ev.severity.toLowerCase();
          const type = ev.event_type.toLowerCase();

          if (type === 'ai_analysis') severity = 'ai';
          else if (sev === 'critical' || sev === 'high' || sev === 'error') severity = 'error';
          else if (sev === 'medium' || sev === 'warning') severity = 'warning';
          else if (sev === 'success') severity = 'success';

          return {
            id: ev.id,
            time: new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: ev.message,
            severity: severity,
            active: idx === rawTimeline.length - 1,
          };
        });
        setTimelineEvents(mappedTimeline.reverse());

      } catch (error) {
        console.error('Error fetching system state:', error);
      }
    };

    const interval = setInterval(fetchData, 1500); // Poll every 1.5s
    fetchData(); // Initial call
    return () => clearInterval(interval);
  }, []);

  const simulateAttack = useCallback(async () => {
    try {
      await api.triggerAttack();
    } catch (err) {
      console.error('Failed to trigger attack:', err);
    }
  }, []);

  const resetSystem = useCallback(async () => {
    try {
      await api.resetSystem();
      setAttackInfo({
        detected: false,
        type: '',
        severity: 'LOW',
        sourceIp: '',
        targetSystem: 'AUTH-SERVER-01',
        confidence: 0,
        analysis: '',
      });
      setResponseActions([]);
    } catch (err) {
      console.error('Failed to reset system:', err);
    }
  }, []);

  const toggleAutoMode = useCallback(() => {
    setAutoMode((prev: boolean) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="scanline-overlay"/>
      <div className={`attack-overlay ${status === 'UNDER_ATTACK' || riskScore > 70 ? 'active' : ''}`}/>

      <TopBar status={status} riskScore={riskScore} />

      <main className="pt-24 pb-48 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
          <div className="h-full">
            <LiveActivityFeed logs={logs} />
          </div>

          <div className="h-full">
            <AIAnalysisPanel attackInfo={attackInfo} isAnalyzing={isAnalyzing} />
          </div>

          <div className="h-full">
            <ResponseEngine actions={responseActions} autoMode={autoMode} />
          </div>
        </div>
      </main>

      {timelineEvents.length > 0 && <ThreatTimeline events={timelineEvents} />}

      <FloatingControlPanel
        onSimulateAttack={simulateAttack}
        onReset={resetSystem}
        autoMode={autoMode}
        onToggleAutoMode={toggleAutoMode}
        isSimulating={status === 'UNDER_ATTACK' || riskScore > 50}
      />
    </div>
  );
}

export default App;
