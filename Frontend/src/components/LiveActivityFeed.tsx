import { useEffect, useRef } from 'react';
import { LogEntry, LogStatus } from '../types';

interface LiveActivityFeedProps {
  logs: LogEntry[];
}

export function LiveActivityFeed({ logs }: LiveActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const statusStyles: Record<LogStatus, { bg: string; text: string; border: string }> = {
    SUCCESS: {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: 'var(--status-safe)',
      border: 'var(--status-safe)'
    },
    SUSPICIOUS: {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: 'var(--status-warning)',
      border: 'var(--status-warning)'
    },
    FAILED: {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: 'var(--status-critical)',
      border: 'var(--status-critical)'
    },
    BLOCKED: {
      bg: 'var(--status-critical)',
      text: '#ffffff',
      border: 'var(--status-critical)'
    }
  };

  return (
    <div className="glass-panel h-full flex flex-col relative overflow-hidden">
      <div className="noise-overlay"/>
      <div className="p-4 border-b border-[var(--border)] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--status-critical)] pulse-dot"/>
          <h2 className="label-caps text-[var(--text-primary)]">Live Activity Feed</h2>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 relative z-10">
        {logs.map((log, index) => {
          const style = statusStyles[log.status];
          const shouldHighlight = log.status === 'SUSPICIOUS' || log.status === 'FAILED' || log.status === 'BLOCKED';

          return (
            <div
              key={log.id}
              className={`p-2 rounded text-xs font-mono slide-in-top ${shouldHighlight ? 'border-l-2' : ''}`}
              style={{
                background: index % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
                borderLeftColor: shouldHighlight ? style.border : 'transparent',
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-[var(--text-muted)]">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className="text-[var(--text-secondary)]">{log.user}</span>
                  <span className="text-[var(--accent-ai)]">{log.ip}</span>
                  <span className="text-[var(--text-primary)]">{log.action}</span>
                </div>
                <div
                  className="px-2 py-1 rounded text-[10px] font-semibold label-caps"
                  style={{
                    background: style.bg,
                    color: style.text,
                    border: log.status === 'BLOCKED' ? 'none' : `1px solid ${style.border}40`
                  }}
                >
                  {log.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-elevated)] relative z-10">
        <p className="text-xs text-[var(--text-muted)]">
          <span className="text-[var(--accent-ai)] font-semibold">{logs.length}</span> events in last 60s
        </p>
      </div>
    </div>
  );
}
