import { ChevronDown, ChevronUp } from 'lucide-react';
import { TimelineEvent } from '../types';
import { useState } from 'react';

interface ThreatTimelineProps {
  events: TimelineEvent[];
}

export function ThreatTimeline({ events }: ThreatTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const severityColors = {
    info: 'var(--text-secondary)',
    warning: 'var(--status-warning)',
    error: 'var(--status-critical)',
    success: 'var(--status-safe)',
    ai: 'var(--accent-ai)'
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-3 glass-panel border-t border-[var(--border)] flex items-center justify-center gap-2 hover:bg-[var(--bg-surface)] transition-colors"
        >
          <ChevronUp size={16} className="text-[var(--accent-ai)]"/>
          <span className="label-caps text-xs text-[var(--text-secondary)]">Show Threat Timeline</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-[var(--border)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h3 className="label-caps text-[var(--text-primary)]">Threat Timeline — Current Incident</h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-[var(--bg-elevated)] rounded transition-colors"
          >
            <ChevronDown size={16} className="text-[var(--text-muted)]"/>
          </button>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-4 min-w-max">
            {events.map((event, index) => (
              <div key={event.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${event.active ? 'pulse-dot' : ''}`}
                      style={{
                        background: event.active ? severityColors[event.severity] : 'transparent',
                        borderColor: severityColors[event.severity]
                      }}
                    />
                    {event.active && (
                      <div className="absolute inset-0 rounded-full animate-ping"
                           style={{ background: severityColors[event.severity], opacity: 0.5 }}/>
                    )}
                  </div>
                  <div className="mt-3 text-center max-w-[180px]">
                    <p className="text-[10px] font-mono text-[var(--text-muted)] mb-1">
                      {event.time}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-tight">
                      {event.label}
                    </p>
                  </div>
                </div>
                {index < events.length - 1 && (
                  <div className="w-24 h-0.5 mb-16" style={{ background: 'var(--border)' }}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
