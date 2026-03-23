import React from 'react';
import { useBuilder } from './BuilderContext';

export const BuildingScreen = () => {
  const { state } = useBuilder();
  const progress = Math.round(state.buildProgress);

  const stages = [
    { label: 'Assembling component layout', threshold: 15 },
    { label: 'Configuring inventory table', threshold: 30 },
    { label: 'Setting up alert rules', threshold: 50 },
    { label: 'Applying data preferences', threshold: 70 },
    { label: 'Generating initial view', threshold: 85 },
    { label: 'Finalizing dashboard', threshold: 95 },
  ];

  const currentStage = stages.filter((s) => progress >= s.threshold).pop() || stages[0];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FAFAF8]">
      {/* Subtle grid */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 flex flex-col items-center max-w-md px-8">
        {/* Logo */}
        <div className="w-14 h-14 bg-charcoal rounded-[6px] flex items-center justify-center mb-10">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="1.5"/></svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-serif text-charcoal mb-2 text-center">Building your dashboard</h1>
        <p className="text-[10px] font-mono text-charcoal-muted uppercase tracking-widest mb-10 text-center">
          {currentStage.label}...
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-[3px] bg-charcoal/[0.06] w-full overflow-hidden">
            <div
              className="h-full bg-charcoal transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-mono text-charcoal-muted">{progress}%</span>
            <span className="text-[9px] font-mono text-charcoal-muted">{state.activeComponents.length} components</span>
          </div>
        </div>

        {/* Component list building animation */}
        <div className="mt-10 space-y-2 w-full max-w-xs">
          {state.activeComponents.slice(0, 5).map((comp, i) => {
            const isActive = progress > (i + 1) * 15;
            return (
              <div
                key={comp.id}
                className={`flex items-center gap-3 px-3 py-2 transition-all duration-500 ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-2'
                }`}
              >
                <span className={`material-symbols-outlined text-xs transition-colors ${isActive ? 'text-green-500' : 'text-charcoal-muted/30'}`}>
                  {isActive ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="text-[10px] font-mono text-charcoal">{comp.name}</span>
              </div>
            );
          })}
          {state.activeComponents.length > 5 && (
            <div className="text-[9px] font-mono text-charcoal-muted pl-8">
              +{state.activeComponents.length - 5} more components
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
