import React from 'react';
import { useBuilder } from './BuilderContext';
import { ChatInterface } from './ChatInterface';
import { DashboardPreview } from './DashboardPreview';

export const AISetupFlow = () => {
  const { state, setPhase } = useBuilder();

  return (
    <div className="h-screen flex flex-col bg-[#FAFAF8]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase('landing')}
            className="w-7 h-7 flex items-center justify-center hover:bg-charcoal/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-charcoal">arrow_back</span>
          </button>
          <div className="w-px h-5 bg-border-hairline" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-charcoal rounded-[3px] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2"/></svg>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-charcoal">AI Dashboard Builder</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-charcoal-muted uppercase tracking-widest hidden md:block">
            {state.activeComponents.length > 0 ? `${state.activeComponents.length} components active` : 'No components yet'}
          </span>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Dashboard Preview */}
        <div className="hidden lg:block flex-1 min-w-0 border-r border-black/[0.06]">
          <DashboardPreview />
        </div>

        {/* Right: Chat */}
        <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};
