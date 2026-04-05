import { Shield, Lock, Ban, Zap } from 'lucide-react';
import { ResponseAction, ResponseActionType } from '../types';

interface ResponseEngineProps {
  actions: ResponseAction[];
  autoMode: boolean;
}

export function ResponseEngine({ actions, autoMode }: ResponseEngineProps) {
  const actionIcons: Record<ResponseActionType, JSX.Element> = {
    IP_BLOCKED: <Ban size={16}/>,
    ACCOUNT_LOCKED: <Lock size={16}/>,
    SESSION_TERMINATED: <Zap size={16}/>,
    FIREWALL_RULE_ADDED: <Shield size={16}/>
  };

  const actionLabels: Record<ResponseActionType, string> = {
    IP_BLOCKED: 'IP BLOCKED',
    ACCOUNT_LOCKED: 'ACCOUNT LOCKED',
    SESSION_TERMINATED: 'SESSION TERMINATED',
    FIREWALL_RULE_ADDED: 'FIREWALL RULE ADDED'
  };

  const statusStyles = {
    EXECUTED: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--status-safe)', border: 'var(--status-safe)' },
    PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--status-warning)', border: 'var(--status-warning)' },
    FAILED: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--status-critical)', border: 'var(--status-critical)' }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="glass-panel h-full flex flex-col relative overflow-hidden">
      <div className="noise-overlay"/>

      <div className="p-4 border-b border-[var(--border)] relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[var(--accent-ai)]"/>
            <h2 className="label-caps text-[var(--text-primary)]">Autonomous Response</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
               style={{
                 background: autoMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 179, 237, 0.1)',
                 border: `1px solid ${autoMode ? 'var(--status-safe)' : 'var(--accent-ai)'}40`
               }}>
            <div className={`w-2 h-2 rounded-full ${autoMode ? 'bg-[var(--status-safe)]' : 'bg-[var(--accent-ai)]'}`}/>
            <span className="label-caps text-[10px]" style={{ color: autoMode ? 'var(--status-safe)' : 'var(--accent-ai)' }}>
              AUTO MODE: {autoMode ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
        {actions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Shield size={48} className="text-[var(--text-muted)] mx-auto mb-4 opacity-30"/>
              <p className="text-[var(--text-muted)] text-sm">No active responses</p>
            </div>
          </div>
        ) : (
          actions.map((action, index) => {
            const style = statusStyles[action.status];
            return (
              <div
                key={action.id}
                className="p-3 rounded-lg border slide-in-right"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderColor: style.border + '40',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded" style={{ background: style.bg, color: style.text }}>
                    {actionIcons[action.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="label-caps text-xs font-bold text-[var(--text-primary)]">
                        {actionLabels[action.type]}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] label-caps font-semibold"
                            style={{
                              background: style.bg,
                              color: style.text,
                              border: `1px solid ${style.border}40`
                            }}>
                        {action.status}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[var(--text-secondary)] truncate">
                      {action.target}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {getTimeAgo(action.timestamp)} • {action.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-[var(--border)] space-y-3 relative z-10">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="label-caps text-[10px] text-[var(--text-muted)]">Actions Today</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-1">34</p>
          </div>
          <div>
            <p className="label-caps text-[10px] text-[var(--text-muted)]">Blocked IPs</p>
            <p className="text-lg font-bold text-[var(--accent-ai)] mt-1">12</p>
          </div>
        </div>

        {actions.some(a => a.status === 'PENDING') && (
          <div className="p-2 rounded bg-[var(--bg-elevated)]">
            <p className="text-xs text-[var(--text-secondary)]">
              {actions.filter(a => a.status === 'PENDING').length} actions pending execution...
            </p>
            <div className="h-1 bg-[var(--bg-base)] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[var(--status-warning)] rounded-full animate-pulse" style={{ width: '60%' }}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
