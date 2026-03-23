import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import type { DashboardComponent } from '../../types/dashboard-builder';

// ─── Types ───────────────────────────────────────────────────────────

export interface DashboardTab {
  id: string;
  name: string;
  components: DashboardComponent[];
  isActive: boolean;
}

interface TabContextType {
  tabs: DashboardTab[];
  activeTab: DashboardTab;
  addTab: (name: string) => void;
  removeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  switchTab: (id: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  updateTabComponents: (id: string, components: DashboardComponent[]) => void;
}

// ─── Context ─────────────────────────────────────────────────────────

const TabContext = createContext<TabContextType | null>(null);

export const useTabContext = (): TabContextType => {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTabContext must be used within TabProvider');
  return ctx;
};

// ─── Helpers ─────────────────────────────────────────────────────────

const generateId = (): string =>
  `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ─── Provider ────────────────────────────────────────────────────────

interface TabProviderProps {
  children: React.ReactNode;
  initialComponents?: DashboardComponent[];
}

export const TabProvider = ({ children, initialComponents = [] }: TabProviderProps) => {
  const [tabs, setTabs] = useState<DashboardTab[]>(() => {
    const defaultTab: DashboardTab = {
      id: generateId(),
      name: 'Main Dashboard',
      components: initialComponents,
      isActive: true,
    };
    return [defaultTab];
  });

  const activeTab = tabs.find((t) => t.isActive) || tabs[0];

  const addTab = useCallback((name: string) => {
    const newTab: DashboardTab = {
      id: generateId(),
      name: name.trim() || 'New Tab',
      components: [],
      isActive: true,
    };
    setTabs((prev) =>
      [...prev.map((t) => ({ ...t, isActive: false })), newTab]
    );
  }, []);

  const removeTab = useCallback((id: string) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const wasActive = prev[idx].isActive;
      const next = prev.filter((t) => t.id !== id);
      if (wasActive && next.length > 0) {
        const activateIdx = Math.min(idx, next.length - 1);
        next[activateIdx] = { ...next[activateIdx], isActive: true };
      }
      return next;
    });
  }, []);

  const renameTab = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: trimmed } : t))
    );
  }, []);

  const switchTab = useCallback((id: string) => {
    setTabs((prev) =>
      prev.map((t) => ({ ...t, isActive: t.id === id }))
    );
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      )
        return prev;
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }, []);

  const updateTabComponents = useCallback(
    (id: string, components: DashboardComponent[]) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === id ? { ...t, components } : t))
      );
    },
    []
  );

  // Sync initial components into the default tab when they change externally
  const initialCompRef = useRef(initialComponents);
  useEffect(() => {
    if (initialComponents !== initialCompRef.current) {
      initialCompRef.current = initialComponents;
      setTabs((prev) => {
        if (prev.length === 1 && prev[0].name === 'Main Dashboard' && prev[0].components.length === 0) {
          return [{ ...prev[0], components: initialComponents }];
        }
        return prev;
      });
    }
  }, [initialComponents]);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTab,
        addTab,
        removeTab,
        renameTab,
        switchTab,
        reorderTabs,
        updateTabComponents,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

// ─── Tab Manager UI ──────────────────────────────────────────────────

interface TabManagerProps {
  themeTokens: Record<string, string>;
}

export const TabManager = ({ themeTokens: t }: TabManagerProps) => {
  const {
    tabs,
    activeTab,
    addTab,
    removeTab,
    renameTab,
    switchTab,
    reorderTabs,
  } = useTabContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragState, setDragState] = useState<{
    dragging: string | null;
    overIndex: number | null;
  }>({ dragging: null, overIndex: null });

  const editInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the rename input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  // ── Rename handlers ──

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setContextMenu(null);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      renameTab(editingId, editValue);
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  // ── Add tab ──

  const handleAddTab = () => {
    const name = prompt('Tab name:');
    if (name !== null && name.trim()) {
      addTab(name);
    }
  };

  // ── Context menu ──

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  // ── Drag & drop ──

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDragState({ dragging: id, overIndex: null });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState((prev) => ({ ...prev, overIndex: index }));
  };

  const handleDragLeave = () => {
    setDragState((prev) => ({ ...prev, overIndex: null }));
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData('text/plain');
    const fromIndex = tabs.findIndex((t) => t.id === dragId);
    if (fromIndex !== -1 && fromIndex !== toIndex) {
      reorderTabs(fromIndex, toIndex);
    }
    setDragState({ dragging: null, overIndex: null });
  };

  const handleDragEnd = () => {
    setDragState({ dragging: null, overIndex: null });
  };

  // ── Styles ──

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    gap: 0,
    padding: '0 24px',
    background: t.bgPrimary || 'var(--theme-bg-primary, #0a0a0f)',
    borderBottom: `1px solid ${t.border || 'var(--theme-border, #1e1e2e)'}`,
    minHeight: 38,
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
  };

  const getTabStyle = (tab: DashboardTab, index: number): React.CSSProperties => {
    const isActive = tab.isActive;
    const isDragging = dragState.dragging === tab.id;
    const isDropTarget = dragState.overIndex === index && dragState.dragging !== tab.id;

    return {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 14px',
      height: 38,
      cursor: isDragging ? 'grabbing' : 'pointer',
      userSelect: 'none',
      position: 'relative',
      background: isActive
        ? (t.bgSurface || 'var(--theme-bg-surface, #12121a)')
        : 'transparent',
      borderBottom: isActive
        ? `2px solid ${t.accent || 'var(--theme-accent, #3b82f6)'}`
        : '2px solid transparent',
      borderLeft: isDropTarget
        ? `2px solid ${t.accent || 'var(--theme-accent, #3b82f6)'}`
        : '2px solid transparent',
      opacity: isDragging ? 0.5 : 1,
      transition: 'background 0.15s ease, border-bottom-color 0.15s ease, opacity 0.15s ease',
      flexShrink: 0,
      whiteSpace: 'nowrap',
    };
  };

  const tabLabelStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: 10,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontWeight: isActive ? 700 : 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: isActive
      ? (t.textPrimary || 'var(--theme-text-primary, #e0e0e0)')
      : (t.textSecondary || 'var(--theme-text-secondary, #888)'),
    transition: 'color 0.15s ease',
  });

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    height: 16,
    padding: '0 4px',
    borderRadius: 8,
    fontSize: 9,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontWeight: 700,
    background: t.accentMuted || 'var(--theme-accent-muted, rgba(59,130,246,0.15))',
    color: t.accent || 'var(--theme-accent, #3b82f6)',
    lineHeight: 1,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: 3,
    border: 'none',
    background: 'transparent',
    color: t.textMuted || 'var(--theme-text-muted, #555)',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
    padding: 0,
    transition: 'background 0.1s ease, color 0.1s ease',
  };

  const addButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    margin: '5px 0 5px 4px',
    borderRadius: t.radius || '6px',
    border: `1px dashed ${t.border || 'var(--theme-border, #1e1e2e)'}`,
    background: 'transparent',
    color: t.textMuted || 'var(--theme-text-muted, #555)',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    transition: 'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
    flexShrink: 0,
  };

  const editInputStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: t.textPrimary || 'var(--theme-text-primary, #e0e0e0)',
    background: t.bgPrimary || 'var(--theme-bg-primary, #0a0a0f)',
    border: `1px solid ${t.accent || 'var(--theme-accent, #3b82f6)'}`,
    borderRadius: 3,
    padding: '2px 4px',
    outline: 'none',
    width: 120,
  };

  const contextMenuStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    minWidth: 160,
    padding: '4px 0',
    background: t.bgSurface || 'var(--theme-bg-surface, #12121a)',
    border: `1px solid ${t.border || 'var(--theme-border, #1e1e2e)'}`,
    borderRadius: t.radius || '6px',
    boxShadow: t.shadowLg || '0 8px 32px rgba(0,0,0,0.4)',
  };

  const contextMenuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    color: t.textPrimary || 'var(--theme-text-primary, #e0e0e0)',
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.1s ease',
  };

  const contextMenuItemDangerStyle: React.CSSProperties = {
    ...contextMenuItemStyle,
    color: t.error || '#ef4444',
  };

  return (
    <>
      <div ref={containerRef} style={containerStyle}>
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            style={getTabStyle(tab, index)}
            draggable={editingId !== tab.id}
            onClick={() => {
              if (editingId !== tab.id) switchTab(tab.id);
            }}
            onDoubleClick={() => startRename(tab.id, tab.name)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            role="tab"
            aria-selected={tab.isActive}
            tabIndex={0}
          >
            {editingId === tab.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={editInputStyle}
                maxLength={32}
              />
            ) : (
              <span style={tabLabelStyle(tab.isActive)}>{tab.name}</span>
            )}

            {/* Component count badge */}
            <span style={badgeStyle}>{tab.components.length}</span>

            {/* Close button (hidden if only one tab) */}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    t.accentMuted || 'rgba(59,130,246,0.15)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    t.textPrimary || '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    t.textMuted || '#555';
                }}
                title="Close tab"
                aria-label={`Close ${tab.name}`}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add tab button */}
        <button
          onClick={handleAddTab}
          style={addButtonStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              t.accent || '#3b82f6';
            (e.currentTarget as HTMLButtonElement).style.color =
              t.accent || '#3b82f6';
            (e.currentTarget as HTMLButtonElement).style.background =
              t.accentMuted || 'rgba(59,130,246,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              t.border || '#1e1e2e';
            (e.currentTarget as HTMLButtonElement).style.color =
              t.textMuted || '#555';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          title="Add new tab"
          aria-label="Add new tab"
        >
          +
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            ...contextMenuStyle,
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={contextMenuItemStyle}
            onClick={() => {
              const tab = tabs.find((t) => t.id === contextMenu.id);
              if (tab) startRename(tab.id, tab.name);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                t.accentMuted || 'rgba(59,130,246,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14 }}
            >
              edit
            </span>
            Rename Tab
          </button>
          <button
            style={contextMenuItemStyle}
            onClick={() => {
              const tab = tabs.find((t) => t.id === contextMenu.id);
              if (tab) {
                addTab(`${tab.name} (copy)`);
                // After adding, update the newest tab to have same components
                // This is handled through addTab creating empty, then we need to set components
                // We rely on the consumer to handle duplication via updateTabComponents if needed
              }
              setContextMenu(null);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                t.accentMuted || 'rgba(59,130,246,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14 }}
            >
              content_copy
            </span>
            Duplicate Tab
          </button>
          {tabs.length > 1 && (
            <>
              <div
                style={{
                  height: 1,
                  margin: '4px 0',
                  background: t.border || 'var(--theme-border, #1e1e2e)',
                }}
              />
              <button
                style={contextMenuItemDangerStyle}
                onClick={() => {
                  removeTab(contextMenu.id);
                  setContextMenu(null);
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(239,68,68,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  close
                </span>
                Close Tab
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};
