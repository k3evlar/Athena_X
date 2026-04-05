import { Rocket, RotateCcw, Settings } from 'lucide-react';

interface FloatingControlPanelProps {
  onSimulateAttack: () => void;
  onReset: () => void;
  autoMode: boolean;
  onToggleAutoMode: () => void;
  isSimulating: boolean;
}

export function FloatingControlPanel({
  onSimulateAttack,
  onReset,
  autoMode,
  onToggleAutoMode,
  isSimulating
}: FloatingControlPanelProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 glass-panel p-4 space-y-3 w-72">
      <div className="noise-overlay"/>

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <Settings size={16} className="text-[var(--accent-ai)]"/>
        <h3 className="label-caps text-xs text-[var(--text-primary)]">Control Panel</h3>
      </div>

      <button
        onClick={onSimulateAttack}
        disabled={isSimulating}
        className="w-full p-3 rounded-lg font-bold label-caps text-sm transition-all relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isSimulating
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8))',
          color: '#ffffff',
          border: '1px solid var(--status-critical)',
          boxShadow: isSimulating ? 'none' : '0 4px 20px rgba(239, 68, 68, 0.3)'
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <Rocket size={16}/>
          <span>{isSimulating ? 'SIMULATING...' : 'SIMULATE ATTACK'}</span>
        </div>
      </button>

      <button
        onClick={onReset}
        className="w-full p-3 rounded-lg font-bold label-caps text-sm transition-all hover:bg-[var(--bg-elevated)] relative z-10"
        style={{
          background: 'rgba(99, 179, 237, 0.1)',
          color: 'var(--accent-ai)',
          border: '1px solid var(--accent-ai)'
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <RotateCcw size={16}/>
          <span>RESET SYSTEM</span>
        </div>
      </button>

      <div className="relative z-10">
        <button
          onClick={onToggleAutoMode}
          className="w-full p-3 rounded-lg font-bold label-caps text-sm transition-all"
          style={{
            background: autoMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 179, 237, 0.1)',
            color: autoMode ? 'var(--status-safe)' : 'var(--text-secondary)',
            border: `1px solid ${autoMode ? 'var(--status-safe)' : 'var(--border)'}60`
          }}
        >
          <div className="flex items-center justify-between">
            <span>AUTO MODE</span>
            <div
              className="relative w-12 h-6 rounded-full transition-all"
              style={{
                background: autoMode ? 'var(--status-safe)' : 'var(--bg-elevated)'
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                style={{
                  left: autoMode ? '28px' : '4px'
                }}
              />
            </div>
          </div>
        </button>
      </div>

      <div className="p-3 rounded bg-[var(--bg-elevated)] text-xs text-[var(--text-muted)] relative z-10">
        <div className="flex items-center justify-between">
          <span className="label-caps text-[10px]">Monitoring</span>
          <span className="font-bold text-[var(--accent-ai)]">3 SYSTEMS</span>
        </div>
      </div>
    </div>
  );
}
