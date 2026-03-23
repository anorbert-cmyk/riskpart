import React, { useState, useRef } from 'react';
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
  const { state, setEditPanelOpen, activateComponent, deactivateComponent, setComponentPriority, reorderComponents } = useBuilder();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSource, setDragSource] = useState<'active' | 'inactive' | null>(null);
  const activeListRef = useRef<HTMLDivElement>(null);

  const activeComps = state.activeComponents;
  const inactiveComps = state.availableComponents.filter((c) => !c.isActive);

  // Group inactive by category
  const grouped: Record<string, DashboardComponent[]> = {};
  for (const c of inactiveComps) {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  }

  const handleDragStart = (e: React.DragEvent, id: string, source: 'active' | 'inactive') => {
    setDraggedId(id);
    setDragSource(source);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Style the drag ghost
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
    setTimeout(() => { target.style.opacity = ''; }, 0);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverIndex(null);
    setDragSource(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragOverZone = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnActiveItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedId) return;

    if (dragSource === 'active') {
      // Reorder within active list
      const fromIndex = activeComps.findIndex((c) => c.id === draggedId);
      if (fromIndex !== -1 && fromIndex !== targetIndex) {
        reorderComponents(fromIndex, targetIndex);
      }
    } else {
      // Adding from inactive — activate then reorder to position
      activateComponent(draggedId);
      // After activation, the component will be at the end. We need to move it.
      setTimeout(() => {
        const newIndex = activeComps.length; // it was appended
        if (newIndex !== targetIndex) {
          reorderComponents(newIndex, targetIndex);
        }
      }, 0);
    }

    setDraggedId(null);
    setDragOverIndex(null);
    setDragSource(null);
  };

  const handleDropOnActiveZone = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId && dragSource === 'inactive') {
      activateComponent(draggedId);
    }
    setDraggedId(null);
    setDragOverIndex(null);
    setDragSource(null);
  };

  const handleDropOnInactive = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
      deactivateComponent(draggedId);
    }
    setDraggedId(null);
    setDragOverIndex(null);
    setDragSource(null);
  };

  // Move component up/down with buttons
  const moveUp = (index: number) => {
    if (index > 0) reorderComponents(index, index - 1);
  };
  const moveDown = (index: number) => {
    if (index < activeComps.length - 1) reorderComponents(index, index + 1);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }}
        onClick={() => setEditPanelOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col animate-in slide-in-from-right duration-300"
        style={{
          background: 'var(--theme-surface, #FFFFFF)',
          boxShadow: '-8px 0 40px -12px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--theme-border, rgba(0,0,0,0.06))', background: 'var(--theme-surface2, #FAFAF8)' }}
        >
          <div>
            <h2 className="text-lg" style={{ fontFamily: 'var(--theme-font-heading, Georgia, serif)', color: 'var(--theme-text, #1A1A1A)' }}>Edit Dashboard</h2>
            <p className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
              Drag to reorder · Click to add/remove
            </p>
          </div>
          <button
            onClick={() => setEditPanelOpen(false)}
            className="w-8 h-8 flex items-center justify-center transition-colors rounded"
            style={{ color: 'var(--theme-text, #1A1A1A)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Reorder hint */}
        <div className="px-6 py-2.5" style={{ borderBottom: '1px solid var(--theme-border-light, rgba(0,0,0,0.03))', background: 'var(--theme-accent-muted, rgba(0,0,0,0.02))' }}>
          <div className="flex items-center gap-2 text-[9px] font-mono" style={{ color: 'var(--theme-text2, #6B6B6B)' }}>
            <span className="material-symbols-outlined text-xs">swap_vert</span>
            <span>Drag to reorder components, or use the arrow buttons</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Currently Used */}
          <div
            ref={activeListRef}
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--theme-border, rgba(0,0,0,0.06))' }}
            onDragOver={handleDragOverZone}
            onDrop={handleDropOnActiveZone}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--theme-positive, #16A34A)' }} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
                Active Components
              </span>
              <span className="text-[9px] font-mono ml-auto" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{activeComps.length}</span>
            </div>

            {activeComps.length === 0 ? (
              <div className="py-6 border border-dashed text-center" style={{ borderColor: 'var(--theme-border, rgba(0,0,0,0.1))' }}>
                <p className="text-[10px] font-mono" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>Drop components here</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {activeComps.map((comp, index) => (
                  <React.Fragment key={comp.id}>
                    {/* Drop indicator line */}
                    {dragOverIndex === index && draggedId !== comp.id && (
                      <div className="h-[2px] mx-2 rounded-full transition-all" style={{ background: 'var(--theme-accent, #1A1A1A)' }} />
                    )}
                    <ActiveComponentRow
                      component={comp}
                      index={index}
                      total={activeComps.length}
                      isDragging={draggedId === comp.id}
                      onRemove={() => deactivateComponent(comp.id)}
                      onDragStart={(e) => handleDragStart(e, comp.id, 'active')}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOverItem(e, index)}
                      onDrop={(e) => handleDropOnActiveItem(e, index)}
                      onPriorityChange={(p) => setComponentPriority(comp.id, p)}
                      onMoveUp={() => moveUp(index)}
                      onMoveDown={() => moveDown(index)}
                    />
                  </React.Fragment>
                ))}
                {/* Drop indicator at end */}
                {dragOverIndex === activeComps.length && (
                  <div className="h-[2px] mx-2 rounded-full" style={{ background: 'var(--theme-accent, #1A1A1A)' }} />
                )}
              </div>
            )}
          </div>

          {/* Available Components */}
          <div
            className="px-6 py-4"
            onDragOver={handleDragOverZone}
            onDrop={handleDropOnInactive}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--theme-border, rgba(0,0,0,0.2))' }} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
                Available
              </span>
              <span className="text-[9px] font-mono ml-auto" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{inactiveComps.length}</span>
            </div>

            {Object.entries(grouped).map(([category, comps]) => (
              <div key={category} className="mb-4">
                <span className="text-[8px] font-mono uppercase tracking-widest block mb-2" style={{ color: 'var(--theme-text3, #A0A0A0)', opacity: 0.6 }}>
                  {CATEGORY_LABELS[category as ComponentCategory] || category}
                </span>
                <div className="space-y-1">
                  {comps.map((comp) => (
                    <InactiveComponentRow
                      key={comp.id}
                      component={comp}
                      isDragging={draggedId === comp.id}
                      onAdd={() => activateComponent(comp.id)}
                      onDragStart={(e) => handleDragStart(e, comp.id, 'inactive')}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--theme-border, rgba(0,0,0,0.06))', background: 'var(--theme-surface2, #FAFAF8)' }}>
          <button
            onClick={() => setEditPanelOpen(false)}
            className="w-full py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
            style={{ background: 'var(--theme-accent, #1A1A1A)', color: 'var(--theme-text-inv, #FFFFFF)' }}
          >
            Done Editing
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Active Component Row (with reorder controls) ──────────────────
interface ActiveRowProps {
  component: DashboardComponent;
  index: number;
  total: number;
  isDragging: boolean;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPriorityChange: (p: DashboardComponent['priority']) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ActiveComponentRow: React.FC<ActiveRowProps> = ({
  component, index, total, isDragging, onRemove, onDragStart, onDragEnd, onDragOver, onDrop, onPriorityChange, onMoveUp, onMoveDown,
}) => {
  const [showPriority, setShowPriority] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all group ${isDragging ? 'opacity-30 scale-95' : ''}`}
      style={{
        background: isDragging ? 'transparent' : 'var(--theme-surface, #FFFFFF)',
        border: '1px solid var(--theme-border, rgba(0,0,0,0.06))',
        borderRadius: 'var(--theme-radius, 2px)',
      }}
    >
      {/* Order number + drag handle */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[8px] font-mono font-bold w-4 text-center" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
          {index + 1}
        </span>
        <span className="material-symbols-outlined text-xs transition-colors" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
          drag_indicator
        </span>
      </div>

      {/* Reorder arrows */}
      <div className="flex flex-col shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          className="p-0 leading-none disabled:opacity-20"
          style={{ color: 'var(--theme-text2, #6B6B6B)' }}
        >
          <span className="material-symbols-outlined text-[10px]">keyboard_arrow_up</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === total - 1}
          className="p-0 leading-none disabled:opacity-20"
          style={{ color: 'var(--theme-text2, #6B6B6B)' }}
        >
          <span className="material-symbols-outlined text-[10px]">keyboard_arrow_down</span>
        </button>
      </div>

      {/* Icon */}
      <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: 'var(--theme-accent-muted, rgba(0,0,0,0.05))', borderRadius: 'var(--theme-radius, 2px)' }}>
        <span className="material-symbols-outlined text-sm" style={{ color: 'var(--theme-text2, #6B6B6B)' }}>{component.icon}</span>
      </div>

      {/* Name & description */}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono font-bold truncate" style={{ color: 'var(--theme-text, #1A1A1A)' }}>{component.name}</div>
        <div className="text-[8px] font-mono truncate" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{component.description}</div>
      </div>

      {/* Priority */}
      <div className="relative">
        <button
          onClick={() => setShowPriority(!showPriority)}
          className="text-[7px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5"
          style={{
            background: component.priority === 'primary' ? 'var(--theme-accent, #1A1A1A)' : component.priority === 'secondary' ? 'var(--theme-accent-muted, rgba(0,0,0,0.1))' : 'var(--theme-border-light, rgba(0,0,0,0.03))',
            color: component.priority === 'primary' ? 'var(--theme-text-inv, #FFF)' : 'var(--theme-text2, #6B6B6B)',
            borderRadius: 'var(--theme-radius, 2px)',
          }}
        >
          {component.priority === 'primary' ? 'PRI' : component.priority === 'secondary' ? 'SEC' : 'OPT'}
        </button>
        {showPriority && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowPriority(false)} />
            <div className="absolute top-full right-0 mt-1 z-20 py-1" style={{ background: 'var(--theme-surface, #FFF)', border: '1px solid var(--theme-border, rgba(0,0,0,0.08))', boxShadow: 'var(--theme-shadow-lg, 0 4px 12px rgba(0,0,0,0.1))', borderRadius: 'var(--theme-radius, 2px)' }}>
              {(['primary', 'secondary', 'optional'] as const).map((p) => (
                <button key={p} onClick={() => { onPriorityChange(p); setShowPriority(false); }} className="block w-full text-left px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider" style={{ color: 'var(--theme-text, #1A1A1A)' }}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-[8px] font-mono font-bold uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 shrink-0 px-1.5 py-1"
        style={{ color: 'var(--theme-negative, #DC2626)' }}
      >
        <span className="material-symbols-outlined text-xs">close</span>
      </button>
    </div>
  );
};

// ─── Inactive Component Row ────────────────────────────────────────
interface InactiveRowProps {
  component: DashboardComponent;
  isDragging: boolean;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const InactiveComponentRow: React.FC<InactiveRowProps> = ({ component, isDragging, onAdd, onDragStart, onDragEnd }) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    className={`flex items-center gap-3 px-3 py-2 cursor-grab active:cursor-grabbing transition-all group ${isDragging ? 'opacity-30' : ''}`}
    style={{
      background: 'var(--theme-surface2, #FAFAF8)',
      border: '1px solid transparent',
      borderRadius: 'var(--theme-radius, 2px)',
    }}
  >
    <span className="material-symbols-outlined text-xs shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>
      drag_indicator
    </span>
    <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ background: 'var(--theme-border-light, rgba(0,0,0,0.03))', borderRadius: 'var(--theme-radius, 2px)' }}>
      <span className="material-symbols-outlined text-xs" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{component.icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-mono font-bold truncate" style={{ color: 'var(--theme-text, #1A1A1A)' }}>{component.name}</div>
      <div className="text-[8px] font-mono truncate" style={{ color: 'var(--theme-text3, #A0A0A0)' }}>{component.description}</div>
    </div>
    <button
      onClick={onAdd}
      className="text-[8px] font-mono font-bold uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100 shrink-0 px-2 py-1"
      style={{ color: 'var(--theme-positive, #16A34A)' }}
    >
      + Add
    </button>
  </div>
);
