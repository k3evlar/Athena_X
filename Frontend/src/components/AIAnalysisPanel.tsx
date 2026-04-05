import { Brain, Zap } from 'lucide-react';
import { AttackInfo } from '../types';
import { useState, useEffect } from 'react';

interface AIAnalysisPanelProps {
  attackInfo: AttackInfo;
  isAnalyzing: boolean;
}

export function AIAnalysisPanel({ attackInfo, isAnalyzing }: AIAnalysisPanelProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (attackInfo.analysis && attackInfo.detected) {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;
      const text = attackInfo.analysis;

      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    } else {
      setDisplayedText('');
    }
  }, [attackInfo.analysis, attackInfo.detected]);

  const severityStyles = {
    LOW: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--status-safe)', border: 'var(--status-safe)' },
    MEDIUM: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--status-warning)', border: 'var(--status-warning)' },
    HIGH: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ff6b6b', border: '#ff6b6b' },
    CRITICAL: { bg: 'rgba(239, 68, 68, 0.3)', text: 'var(--status-critical)', border: 'var(--status-critical)' }
  };

  const currentSeverity = severityStyles[attackInfo.severity];

  return (
    <div className="glass-panel glow-ai h-full flex flex-col relative overflow-hidden border-2 border-[var(--accent-ai)]">
      <div className="noise-overlay"/>
      <div className="absolute inset-0 grid-background opacity-30"/>

      <div className="p-4 border-b border-[var(--accent-ai)] relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-[var(--accent-ai)]"/>
            <h2 className="label-caps text-[var(--accent-ai)] font-bold">ATHENA-X AI Engine</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--status-safe)] pulse-dot"/>
            <span className="label-caps text-[10px] text-[var(--status-safe)]">Online</span>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1 label-caps">
          Neural Threat Analysis v4.2
        </p>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto relative z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label-caps text-[var(--text-secondary)] text-xs">Attack Detected:</span>
            <span className={`label-caps font-bold text-sm ${attackInfo.detected ? 'text-[var(--status-critical)]' : 'text-[var(--status-safe)]'}`}>
              {attackInfo.detected ? 'YES' : 'NO'}
            </span>
          </div>
        </div>

        {(attackInfo.detected || isAnalyzing) && (
          <>
            <div className="p-4 rounded-lg border"
                 style={{
                   background: currentSeverity.bg,
                   borderColor: currentSeverity.border
                 }}>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: currentSeverity.text }}>
                    {attackInfo.type}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded label-caps text-xs font-bold ${attackInfo.severity === 'CRITICAL' ? 'shake' : ''}`}
                          style={{
                            background: currentSeverity.border,
                            color: '#ffffff'
                          }}>
                      {attackInfo.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="label-caps text-[var(--text-muted)] text-[10px]">Source IP</p>
                    <p className="font-mono text-[var(--text-primary)] mt-1">{attackInfo.sourceIp}</p>
                  </div>
                  <div>
                    <p className="label-caps text-[var(--text-muted)] text-[10px]">Target System</p>
                    <p className="font-mono text-[var(--text-primary)] mt-1">{attackInfo.targetSystem}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-[var(--accent-ai)]"/>
                <span className="label-caps text-xs text-[var(--accent-ai)]">AI Analysis Output</span>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-base)] border border-[var(--accent-ai)] font-mono text-sm leading-relaxed">
                {isAnalyzing && !displayedText ? (
                  <div className="flex items-center gap-2 text-[var(--accent-ai)]">
                    <Brain size={16} className="pulse-dot"/>
                    <span>Analyzing threat vectors...</span>
                  </div>
                ) : (
                  <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                    {displayedText}
                    {isTyping && <span className="inline-block w-2 h-4 bg-[var(--accent-ai)] ml-1 animate-pulse"/>}
                  </p>
                )}
              </div>
            </div>

            {!isAnalyzing && attackInfo.confidence > 0 && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-caps text-xs text-[var(--text-secondary)]">AI Confidence</span>
                    <span className="font-bold text-[var(--accent-ai)]">{attackInfo.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-ai)] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${attackInfo.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--bg-elevated)]">
                  <div>
                    <p className="label-caps text-[10px] text-[var(--text-muted)]">Threats Today</p>
                    <p className="text-xl font-bold text-[var(--text-primary)] mt-1">1,247</p>
                  </div>
                  <div>
                    <p className="label-caps text-[10px] text-[var(--text-muted)]">Avg Response</p>
                    <p className="text-xl font-bold text-[var(--accent-ai)] mt-1">0.3s</p>
                  </div>
                  <div>
                    <p className="label-caps text-[10px] text-[var(--text-muted)]">Model</p>
                    <p className="text-xs font-mono text-[var(--text-primary)] mt-1">ATHENA-NLP v4.2</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {!attackInfo.detected && !isAnalyzing && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Brain size={48} className="text-[var(--accent-ai)] mx-auto mb-4 opacity-30"/>
              <p className="text-[var(--text-muted)] text-sm">All systems nominal</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Neural network standing by</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
