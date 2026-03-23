import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import type { DashboardComponent, ComponentCategory } from '../../types/dashboard-builder';

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  'market-overview': 'Market Overview',
  'inventory': 'Inventory & Detail',
  'pricing': 'Pricing',
  'liquidity': 'Liquidity',
  'alerts': 'Alerts',
  'analytics': 'Analytics',
  'watchlist': 'Watchlist',
  'trading': 'Trading',
};

export const ComponentCatalog = () => {
  const { state, setEditPanelOpen, activateComponent, deactivateComponent, setComponentPriority } = useBuilder();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const activeComps = state.activeComponents;
  const inactiveComps = state.availableComponents.filter((c) => !c.isActive);

  // Group inactive by category
  const grouped: Record<string, DashboardComponent[]> = {};
  for (const c of inactiveComps) {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnActive = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
      activateComponent(draggedId);
      setDraggedId(null);
    }
  };

  const handleDropOnInactive = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
      deactivateComponent(draggedId);
      setDraggedId(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/20 backdrop-blur-[2px] z-50 transition-opacity"
        onClick={() => setEditPanelOpen(false)}
      />

      {/* Slide-in panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-[-8px_0_40px_-12px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-[#FAFAF8]">
          <div>
            <h2 className="font-serif text-lg text-charcoal">Edit Dashboard</h2>
            <p className="text-[9px] font-mono text-charcoal-muted uppercase tracking-widest mt-0.5">
              Drag & drop or click to add/remove
            </p>
          </div>
          <button
            onClick={() => setEditPanelOpen(false)}
            className="w-8 h-8 flex items-center justify-center hover:bg-charcoal/5 transition-colors"
          >
            <span className="material-symbols-outlined text-charcoal">close</span>
          </button>
        </div>

        {/* Drag hint */}
        <div className="px-6 py-2.5 bg-charcoal/[0.02] border-b border-black/[0.04]">
          <div className="flex items-center gap-2 text-[9px] font-mono text-charcoal-muted">
            <span className="material-symbols-outlined text-xs">drag_indicator</span>
            <span>Drag components between sections, or use the add/remove buttons</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Currently Used */}
          <div
            className="px-6 py-4 border-b border-black/[0.06]"
            onDragOver={handleDragOver}
            onDrop={handleDropOnActive}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-charcoal">
                Currently Used
              </span>
              <span className="text-[9px] font-mono text-charcoal-muted ml-auto">{activeComps.length}</span>
            </div>

            {activeComps.length === 0 ? (
              <div className="py-6 border border-dashed border-charcoal/10 text-center">
                <p className="text-[10px] font-mono text-charcoal-muted">Drop components here</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeComps.map((comp) => (
                  <ComponentRow
                    key={comp.id}
                    component={comp}
                    isActive
                    onRemove={() => deactivateComponent(comp.id)}
                    onDragStart={(e) => handleDragStart(e, comp.id)}
                    onPriorityChange={(p) => setComponentPriority(comp.id, p)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Available Components */}
          <div
            className="px-6 py-4"
            onDragOver={handleDragOver}
            onDrop={handleDropOnInactive}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-charcoal/20" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-charcoal">
                Components Available
              </span>
              <span className="text-[9px] font-mono text-charcoal-muted ml-auto">{inactiveComps.length}</span>
            </div>

            {Object.entries(grouped).map(([category, comps]) => (
              <div key={category} className="mb-4">
                <span className="text-[8px] font-mono uppercase tracking-widest text-charcoal-muted/60 block mb-2">
                  {CATEGORY_LABELS[category as ComponentCategory] || category}
                </span>
                <div className="space-y-1.5">
                  {comps.map((comp) => (
                    <ComponentRow
                      key={comp.id}
                      component={comp}
                      isActive={false}
                      onAdd={() => activateComponent(comp.id)}
                      onDragStart={(e) => handleDragStart(e, comp.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-[#FAFAF8]">
          <button
            onClick={() => setEditPanelOpen(false)}
            className="w-full bg-charcoal text-white py-3 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-colors"
          >
            Done Editing
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Component Row ──────────────────────────────────────────────────
interface ComponentRowProps {
  component: DashboardComponent;
  isActive: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onPriorityChange?: (p: DashboardComponent['priority']) => void;
}

const ComponentRow: React.FC<ComponentRowProps> = ({ component, isActive, onAdd, onRemove, onDragStart, onPriorityChange }) => {
  const [showPriority, setShowPriority] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all group border ${
        isActive
          ? 'bg-white border-black/[0.06] hover:border-charcoal/20'
          : 'bg-[#FAFAF8] border-transparent hover:border-black/[0.06]'
      }`}
    >
      {/* Drag handle */}
      <span className="material-symbols-outlined text-xs text-charcoal-muted/30 group-hover:text-charcoal-muted transition-colors shrink-0">
        drag_indicator
      </span>

      {/* Icon */}
      <div className={`w-7 h-7 rounded-[3px] flex items-center justify-center shrink-0 ${isActive ? 'bg-charcoal/5' : 'bg-charcoal/[0.03]'}`}>
        <span className="material-symbols-outlined text-sm text-charcoal-muted">{component.icon}</span>
      </div>

      {/* Name & description */}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono font-bold text-charcoal truncate">{component.name}</div>
        <div className="text-[8px] font-mono text-charcoal-muted truncate">{component.description}</div>
      </div>

      {/* Priority indicator (for active) */}
      {isActive && onPriorityChange && (
        <div className="relative">
          <button
            onClick={() => setShowPriority(!showPriority)}
            className={`text-[7px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 ${
              component.priority === 'primary' ? 'bg-charcoal text-white' :
              component.priority === 'secondary' ? 'bg-charcoal/10 text-charcoal' :
              'bg-charcoal/5 text-charcoal-muted'
            }`}
          >
            {component.priority === 'primary' ? 'PRI' : component.priority === 'secondary' ? 'SEC' : 'OPT'}
          </button>
          {showPriority && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPriority(false)} />
              <div className="absolute top-full right-0 mt-1 bg-white border border-black/[0.08] shadow-lg z-20 py-1">
                {(['primary', 'secondary', 'optional'] as const).map((p) => (
                  <button key={p} onClick={() => { onPriorityChange(p); setShowPriority(false); }} className="block w-full text-left px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider hover:bg-off-white text-charcoal">
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add/Remove button */}
      {isActive && onRemove ? (
        <button
          onClick={onRemove}
          className="text-[8px] font-mono font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0 px-2 py-1 hover:bg-red-50"
        >
          Remove
        </button>
      ) : !isActive && onAdd ? (
        <button
          onClick={onAdd}
          className="text-[8px] font-mono font-bold uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors opacity-0 group-hover:opacity-100 shrink-0 px-2 py-1 hover:bg-green-50"
        >
          Add
        </button>
      ) : null}
    </div>
  );
};
