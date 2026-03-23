import React from 'react';
import { useBuilder } from './BuilderContext';
import { SETUP_STEPS } from '../../types/dashboard-builder';

// Phase groups for visual grouping
const PHASE_GROUPS = [
  { label: 'Getting Started', phase: 'intro', steps: [0] },
  { label: 'Your Profile', phase: 'profile', steps: [1] },
  { label: 'Goals & Market', phase: 'goals', steps: [2, 3, 4] },
  { label: 'Data Preferences', phase: 'data', steps: [5, 6, 7] },
  { label: 'Alerts & Workflow', phase: 'alerts', steps: [8, 9] },
  { label: 'Review & Build', phase: 'review', steps: [10] },
];

export const StepTracker = () => {
  const { state } = useBuilder();
  const current = state.currentStep;
  const total = PHASE_GROUPS.reduce((sum, g) => sum + g.steps.length, 0);
  const completed = Math.min(current, total);
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--theme-border, rgba(0,0,0,0.06))', background: 'var(--theme-surface2, #F5F5F3)' }}>
      {/* Progress summary */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
          Progress
        </span>
        <span className="text-[9px] font-mono" style={{ color: 'var(--theme-text2, #6B6B6B)' }}>
          {completed}/{total} steps · {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full rounded-full overflow-hidden mb-4" style={{ background: 'var(--theme-border, rgba(0,0,0,0.06))' }}>
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%`, background: 'var(--theme-accent, #1A1A1A)' }}
        />
      </div>

      {/* Phase groups */}
      <div className="space-y-1">
        {PHASE_GROUPS.map((group) => {
          const isGroupDone = group.steps.every((s) => s < current);
          const isGroupActive = group.steps.some((s) => s === current);
          const isGroupFuture = group.steps.every((s) => s > current);

          return (
            <div key={group.phase} className="flex items-center gap-2.5">
              {/* Status icon */}
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isGroupDone ? (
                  <span className="material-symbols-outlined text-xs" style={{ color: 'var(--theme-positive, #16A34A)' }}>check_circle</span>
                ) : isGroupActive ? (
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--theme-accent, #1A1A1A)' }} />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--theme-border, rgba(0,0,0,0.1))' }} />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[9px] font-mono uppercase tracking-wider transition-all ${isGroupActive ? 'font-bold' : ''}`}
                style={{
                  color: isGroupDone
                    ? 'var(--theme-positive, #16A34A)'
                    : isGroupActive
                    ? 'var(--theme-text, #1A1A1A)'
                    : 'var(--theme-text3, #A0A0A0)',
                }}
              >
                {group.label}
              </span>

              {/* Step count */}
              <span className="text-[8px] font-mono ml-auto" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
                {isGroupDone ? `${group.steps.length}/${group.steps.length}` : isGroupActive ? `${current - group.steps[0]}/${group.steps.length}` : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current step detail */}
      {SETUP_STEPS[current] && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--theme-border-light, rgba(0,0,0,0.03))' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs" style={{ color: 'var(--theme-accent, #1A1A1A)' }}>arrow_forward</span>
            <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
              {SETUP_STEPS[current].title}
            </span>
          </div>
          <p className="text-[8px] font-mono mt-0.5 ml-6" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
            {SETUP_STEPS[current].description}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Agent Activity Indicator ───────────────────────────────────────
// Shows simulated "agents working" during AI processing
export const AgentActivity = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  const agents = [
    { name: 'Layout Agent', icon: 'dashboard', status: 'Analyzing workflow patterns...' },
    { name: 'Data Agent', icon: 'database', status: 'Mapping data sources...' },
    { name: 'UX Agent', icon: 'palette', status: 'Optimizing component placement...' },
  ];

  return (
    <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--theme-border, rgba(0,0,0,0.06))' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--theme-accent, #1A1A1A)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <span className="text-[8px] font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--theme-accent, #1A1A1A)' }}>
          3 agents working
        </span>
      </div>
      <div className="space-y-1">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-2 py-0.5">
            <span className="material-symbols-outlined text-[10px]" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{agent.icon}</span>
            <span className="text-[8px] font-mono" style={{ color: 'var(--theme-text2, #6B6B6B)' }}>{agent.name}</span>
            <span className="text-[7px] font-mono ml-auto truncate max-w-[140px]" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{agent.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
