import React from 'react';
import { useBuilder } from './BuilderContext';
import { SETUP_STEPS } from '../../types/dashboard-builder';

// Phase groups for visual grouping
const PHASE_GROUPS = [
  { label: 'Getting Started', phase: 'intro', steps: [0], icon: 'rocket_launch' },
  { label: 'Your Profile', phase: 'profile', steps: [1], icon: 'person' },
  { label: 'Goals & Market', phase: 'goals', steps: [2, 3, 4], icon: 'trending_up' },
  { label: 'Data Preferences', phase: 'data', steps: [5, 6, 7], icon: 'tune' },
  { label: 'Alerts & Workflow', phase: 'alerts', steps: [8, 9], icon: 'notifications_active' },
  { label: 'Review & Build', phase: 'review', steps: [10], icon: 'check_circle' },
];

export const StepTracker = () => {
  const { state } = useBuilder();
  const current = state.currentStep;
  const total = PHASE_GROUPS.reduce((sum, g) => sum + g.steps.length, 0);
  const completed = Math.min(current, total);
  const pct = Math.round((completed / total) * 100);

  // Mini radial ring math
  const miniRadius = 14;
  const miniCircumference = 2 * Math.PI * miniRadius;
  const miniOffset = miniCircumference - (pct / 100) * miniCircumference;

  // Timeline fill: how many groups are fully done
  const doneGroupCount = PHASE_GROUPS.filter(g => g.steps.every(s => s < current)).length;
  const activeGroupIndex = PHASE_GROUPS.findIndex(g => g.steps.some(s => s === current));
  // Calculate timeline fill percentage
  const timelineFillPct = activeGroupIndex >= 0
    ? ((doneGroupCount + 0.5) / PHASE_GROUPS.length) * 100
    : (doneGroupCount / PHASE_GROUPS.length) * 100;

  return (
    <>
      <style>{`
        @keyframes st-pulse-node {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13, 115, 119, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(13, 115, 119, 0); }
        }
        @keyframes st-done-glow {
          0%, 100% { box-shadow: 0 0 6px rgba(13, 115, 119, 0.15); }
          50% { box-shadow: 0 0 12px rgba(13, 115, 119, 0.3); }
        }
        @keyframes st-card-enter {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes st-check-in {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes st-fill-line {
          from { height: 0%; }
          to { height: var(--st-fill-h); }
        }
        @keyframes st-ring-appear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes st-shimmer-line {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .st-gradient-accent {
          background: linear-gradient(135deg, #0D7377 0%, #4338CA 100%);
        }
      `}</style>

      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--theme-border, rgba(0,0,0,0.06))', background: 'var(--theme-surface2, #F5F5F3)' }}>

        {/* Progress summary header with mini radial ring */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {/* Mini radial progress ring */}
            <div className="relative flex items-center justify-center" style={{ width: 36, height: 36, animation: 'st-ring-appear 0.5s ease-out forwards' }}>
              <svg width="36" height="36" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="st-mini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0D7377" />
                    <stop offset="100%" stopColor="#4338CA" />
                  </linearGradient>
                </defs>
                <circle
                  cx="18" cy="18" r={miniRadius}
                  fill="none"
                  stroke="var(--theme-border, rgba(0,0,0,0.06))"
                  strokeWidth="2"
                />
                <circle
                  cx="18" cy="18" r={miniRadius}
                  fill="none"
                  stroke="url(#st-mini-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={miniCircumference}
                  strokeDashoffset={miniOffset}
                  transform="rotate(-90 18 18)"
                  style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <span className="absolute text-[8px] font-mono font-black" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
                {pct}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
                Progress
              </span>
              <span className="text-[8px] font-mono" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
                {completed} of {total} steps
              </span>
            </div>
          </div>
        </div>

        {/* Connected timeline with phase groups */}
        <div className="relative pl-5">

          {/* Timeline vertical line - background */}
          <div
            className="absolute left-[7px] top-2 rounded-full"
            style={{
              width: 2,
              bottom: 8,
              background: 'var(--theme-border, rgba(0,0,0,0.06))',
            }}
          />

          {/* Timeline vertical line - filled progress */}
          <div
            className="absolute left-[7px] top-2 rounded-full"
            style={{
              width: 2,
              height: `${timelineFillPct}%`,
              background: 'linear-gradient(180deg, #0D7377, #4338CA)',
              transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              maxHeight: 'calc(100% - 16px)',
            }}
          >
            {/* Animated shimmer on the fill line */}
            <div
              className="absolute bottom-0 left-0 w-full rounded-full"
              style={{
                height: 8,
                background: 'linear-gradient(180deg, transparent, rgba(13, 115, 119, 0.6))',
                animation: 'st-shimmer-line 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Phase groups */}
          <div className="space-y-1">
            {PHASE_GROUPS.map((group, groupIdx) => {
              const isGroupDone = group.steps.every((s) => s < current);
              const isGroupActive = group.steps.some((s) => s === current);
              const isGroupFuture = group.steps.every((s) => s > current);

              // Steps completed within this group
              const stepsInGroupDone = group.steps.filter(s => s < current).length;

              return (
                <div key={group.phase} className="relative flex items-start gap-3 py-1.5">

                  {/* Timeline node */}
                  <div
                    className="absolute flex items-center justify-center shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      left: -20,
                      top: 6,
                    }}
                  >
                    {isGroupDone ? (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #0D7377, #4338CA)',
                          animation: 'st-done-glow 3s ease-in-out infinite',
                          animationDelay: `${groupIdx * 0.3}s`,
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-white"
                          style={{
                            fontSize: 10,
                            animation: 'st-check-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                          }}
                        >
                          check
                        </span>
                      </div>
                    ) : isGroupActive ? (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #0D7377, #4338CA)',
                          animation: 'st-pulse-node 2s ease-in-out infinite',
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full bg-white absolute"
                          style={{ top: 4, left: 4 }}
                        />
                      </div>
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          borderColor: 'var(--theme-border, rgba(0,0,0,0.1))',
                          background: 'var(--theme-surface2, #F5F5F3)',
                          marginLeft: 2,
                          marginTop: 2,
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined transition-all duration-300"
                        style={{
                          fontSize: 12,
                          color: isGroupDone
                            ? '#0D7377'
                            : isGroupActive
                            ? 'var(--theme-text, #1A1A1A)'
                            : 'var(--theme-text3, #A0A0A0)',
                        }}
                      >
                        {isGroupDone ? 'check_circle' : group.icon}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider transition-all duration-300 ${isGroupActive ? 'font-bold' : ''}`}
                        style={{
                          color: isGroupDone
                            ? '#0D7377'
                            : isGroupActive
                            ? 'var(--theme-text, #1A1A1A)'
                            : 'var(--theme-text3, #A0A0A0)',
                        }}
                      >
                        {group.label}
                      </span>

                      {/* Step fraction */}
                      <span className="text-[8px] font-mono ml-auto" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
                        {isGroupDone
                          ? `${group.steps.length}/${group.steps.length}`
                          : isGroupActive
                          ? `${stepsInGroupDone}/${group.steps.length}`
                          : ''}
                      </span>
                    </div>

                    {/* Active group: show individual step dots */}
                    {isGroupActive && group.steps.length > 1 && (
                      <div className="flex items-center gap-1 mt-1.5 ml-5">
                        {group.steps.map((stepIdx) => {
                          const stepDone = stepIdx < current;
                          const stepActive = stepIdx === current;
                          return (
                            <div
                              key={stepIdx}
                              className="rounded-full transition-all duration-500"
                              style={{
                                width: stepActive ? 12 : 5,
                                height: 5,
                                background: stepDone
                                  ? 'linear-gradient(135deg, #0D7377, #4338CA)'
                                  : stepActive
                                  ? 'linear-gradient(135deg, #0D7377, #4338CA)'
                                  : 'var(--theme-border, rgba(0,0,0,0.08))',
                                opacity: stepDone ? 0.6 : 1,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step detail - glass card */}
        {SETUP_STEPS[current] && (
          <div
            className="mt-3 rounded-xl px-3.5 py-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 115, 119, 0.04), rgba(67, 56, 202, 0.02))',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(13, 115, 119, 0.12)',
              animation: 'st-card-enter 0.4s ease-out forwards',
            }}
          >
            {/* Subtle glow border at top */}
            <div className="absolute top-0 left-4 right-4 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(13, 115, 119, 0.25), rgba(67, 56, 202, 0.2), transparent)',
            }} />

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(13, 115, 119, 0.1), rgba(67, 56, 202, 0.08))',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 11, color: '#0D7377' }}>arrow_forward</span>
              </div>
              <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
                {SETUP_STEPS[current].title}
              </span>
            </div>
            <p className="text-[8px] font-mono mt-1 ml-7 leading-relaxed" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
              {SETUP_STEPS[current].description}
            </p>
          </div>
        )}
      </div>
    </>
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
