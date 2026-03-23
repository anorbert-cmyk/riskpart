import React from 'react';
import { useBuilder } from './BuilderContext';
import { WIDGET_MAP } from '../dashboard/DashboardWidgets';
import { ComponentCatalog } from './ComponentCatalog';

export const FinalDashboard = () => {
  const { state, setEditPanelOpen, resetBuilder } = useBuilder();
  const { activeComponents, isEditPanelOpen, profile } = state;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Dashboard header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="flex items-center gap-4 px-6 lg:px-8 py-3">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-charcoal rounded-[3px] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2"/></svg>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-charcoal block leading-tight">
                Bond Trading Overview
              </span>
              <span className="text-[8px] font-mono text-charcoal-muted">
                {profile.role || 'Custom'} Dashboard · {activeComponents.length} components
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.08] hover:border-charcoal/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-charcoal">edit</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal">Edit</span>
            </button>
            <button
              onClick={resetBuilder}
              className="flex items-center gap-1.5 px-3 py-1.5 text-charcoal-muted hover:text-charcoal transition-colors"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span className="text-[9px] font-mono uppercase tracking-widest hidden sm:block">Rebuild</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard grid */}
      <main className="flex-1 px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1400px] mx-auto">
          {activeComponents.map((comp) => {
            const Widget = WIDGET_MAP[comp.id];
            const colSpan =
              comp.gridWidth === 3 ? 'md:col-span-2 lg:col-span-3' :
              comp.gridWidth === 2 ? 'md:col-span-2' :
              'col-span-1';

            return (
              <div key={comp.id} className={colSpan}>
                {Widget ? <Widget /> : (
                  <div className="bg-white border border-border-hairline p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-sm text-charcoal-muted">{comp.icon}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal">{comp.name}</span>
                    </div>
                    <p className="text-[10px] font-mono text-charcoal-muted">{comp.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeComponents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-charcoal-muted">
            <span className="material-symbols-outlined text-4xl opacity-20 mb-4">dashboard</span>
            <p className="font-serif text-lg text-charcoal/30 mb-2">No components</p>
            <button
              onClick={() => setEditPanelOpen(true)}
              className="text-[10px] font-mono uppercase tracking-widest text-charcoal hover:underline"
            >
              Add components →
            </button>
          </div>
        )}
      </main>

      {/* Edit panel (slide-in) */}
      {isEditPanelOpen && <ComponentCatalog />}
    </div>
  );
};
