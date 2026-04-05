import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { SystemStatus } from '../types';

interface TopBarProps {
  status: SystemStatus;
  riskScore: number;
}

export function TopBar({ status, riskScore }: TopBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    SECURE: { color: 'var(--status-safe)', label: 'SECURE' },
    MONITORING: { color: 'var(--status-warning)', label: 'MONITORING' },
    UNDER_ATTACK: { color: 'var(--status-critical)', label: 'UNDER ATTACK' }
  };

  const riskColor = riskScore <= 40 ? 'var(--status-safe)' :
                    riskScore <= 70 ? 'var(--status-warning)' :
                    'var(--status-critical)';

  const currentStatus = statusConfig[status];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[var(--border)] backdrop-blur-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 2L35 12V28L20 38L5 28V12L20 2Z" stroke="var(--accent-ai)" strokeWidth="2" fill="var(--accent-ai-dim)"/>
              <path d="M20 12L28 17V27L20 32L12 27V17L20 12Z" fill="var(--accent-ai)"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
              ATHENA-X
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] label-caps">
              Autonomous Threat Intelligence Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg"
               style={{
                 background: 'rgba(0,0,0,0.3)',
                 border: `1px solid ${currentStatus.color}40`
               }}>
            <div className="w-3 h-3 rounded-full pulse-dot"
                 style={{ background: currentStatus.color }}/>
            <span className="label-caps font-semibold" style={{ color: currentStatus.color }}>
              {currentStatus.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90" width="64" height="64">
                <circle cx="32" cy="32" r="28" stroke="var(--bg-elevated)" strokeWidth="4" fill="none"/>
                <circle cx="32" cy="32" r="28"
                        stroke={riskColor}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(riskScore / 100) * 175.93} 175.93`}
                        style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: riskColor }}>
                  {riskScore}
                </span>
              </div>
            </div>
            <div>
              <p className="label-caps text-[var(--text-muted)] text-[10px]">THREAT SCORE</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                UPTIME 99.98% — 47d 3h 22m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--bg-elevated)]">
            <Clock size={14} className="text-[var(--accent-ai)]"/>
            <span className="font-mono text-sm">
              {time.toUTCString().slice(17, 25)} UTC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
