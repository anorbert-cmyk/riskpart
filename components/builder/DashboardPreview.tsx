import React from 'react';
import { useBuilder } from './BuilderContext';
import { WIDGET_MAP } from '../dashboard/DashboardWidgets';

export const DashboardPreview = () => {
  const { state } = useBuilder();
  const { activeComponents } = state;

  if (activeComponents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#FAFAF8] text-charcoal-muted px-8">
        <div className="w-20 h-20 rounded-full bg-charcoal/[0.03] flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-3xl text-charcoal/20">dashboard</span>
        </div>
        <p className="font-serif text-lg text-charcoal/40 mb-2">Dashboard Preview</p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-center leading-relaxed max-w-xs text-charcoal-muted/50">
          Components will appear here as they're added during the conversation
        </p>
        {/* Ghost grid */}
        <div className="grid grid-cols-3 gap-3 mt-10 w-full max-w-lg opacity-[0.06]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`border border-charcoal/30 border-dashed rounded-[2px] ${i < 2 ? 'col-span-2 h-20' : 'h-16'}`} />
          ))}
        </div>
      </div>
    );
  }

  // Layout: arrange components in a grid
  // Full-width components (gridWidth: 3) get their own row
  // Others flow in columns
  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8] p-4">
      {/* Preview header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-sm text-charcoal-muted">visibility</span>
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-charcoal-muted">Live Preview</span>
        <span className="text-[8px] font-mono text-charcoal-muted/50 ml-auto">{activeComponents.length} components</span>
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-3 gap-3">
        {activeComponents.map((comp) => {
          const Widget = WIDGET_MAP[comp.id];
          const colSpan = comp.gridWidth === 3 ? 'col-span-3' : comp.gridWidth === 2 ? 'col-span-2' : 'col-span-1';

          return (
            <div key={comp.id} className={`${colSpan} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {Widget ? (
                <div className="transform scale-[0.85] origin-top-left w-[117.6%]">
                  <Widget />
                </div>
              ) : (
                <div className="bg-white border border-border-hairline p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-charcoal-muted">{comp.icon}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal">{comp.name}</span>
                  </div>
                  <p className="text-[8px] font-mono text-charcoal-muted">{comp.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
