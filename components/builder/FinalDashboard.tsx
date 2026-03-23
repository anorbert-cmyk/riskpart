import React, { useState, useCallback, useMemo } from 'react';
import { useBuilder } from './BuilderContext';
import { useTheme } from './ThemeContext';
import { WIDGET_MAP } from '../dashboard/DashboardWidgets';
import { ComponentCatalog } from './ComponentCatalog';
import { TabProvider, TabManager, useTabContext } from './TabManager';
import { ResizableGrid, ResizableWidget } from './ResizableGrid';
import type { WidgetLayout } from './ResizableGrid';
import { OnboardingTour, TourTriggerButton } from './OnboardingTour';

// ─── Inner Dashboard (needs TabContext) ─────────────────────────────
const DashboardInner = () => {
  const { state, setEditPanelOpen, resetBuilder } = useBuilder();
  const { theme, setTheme, themes } = useTheme();
  const { activeTab, updateTabComponents } = useTabContext();
  const { isEditPanelOpen, profile } = state;
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showIOPanel, setShowIOPanel] = useState(false);
  const [isResizeMode, setIsResizeMode] = useState(false);
  const t = theme.tokens;

  // Use tab's components (or fall back to builder state)
  const components = activeTab.components.length > 0 ? activeTab.components : state.activeComponents;

  // Widget layouts for resizable grid
  const [widgetLayouts, setWidgetLayouts] = useState<Record<string, WidgetLayout>>(() => {
    const layouts: Record<string, WidgetLayout> = {};
    for (const comp of components) {
      layouts[comp.id] = {
        id: comp.id,
        colSpan: comp.gridWidth as 1 | 2 | 3,
        rowSpan: comp.gridHeight === 2 ? 2 : 1,
        collapsed: false,
      };
    }
    return layouts;
  });

  const handleLayoutChange = useCallback((newLayouts: Record<string, WidgetLayout>) => {
    setWidgetLayouts(newLayouts);
  }, []);

  // Ensure new components get default layouts
  const effectiveLayouts = useMemo(() => {
    const result = { ...widgetLayouts };
    for (const comp of components) {
      if (!result[comp.id]) {
        result[comp.id] = {
          id: comp.id,
          colSpan: comp.gridWidth as 1 | 2 | 3,
          rowSpan: comp.gridHeight === 2 ? 2 : 1,
          collapsed: false,
        };
      }
    }
    return result;
  }, [widgetLayouts, components]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: t.bgPrimary }}>
      {/* Dashboard header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: t.bgHeader,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div className="flex items-center gap-4 px-6 lg:px-8 py-3">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: t.accent, borderRadius: t.radius }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 22H22L12 2Z" stroke={t.textInverse} strokeWidth="2"/></svg>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] block leading-tight" style={{ color: t.textPrimary }}>
                Bond Trading Overview
              </span>
              <span className="text-[8px] font-mono" style={{ color: t.textSecondary }}>
                {profile.role || 'Custom'} Dashboard · {components.length} components
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Save/Load button */}
          <button
            onClick={() => setShowIOPanel(!showIOPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={{ border: `1px solid ${t.border}`, borderRadius: t.radius, color: t.textPrimary }}
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest hidden sm:block">Save</span>
          </button>

          {/* Theme selector */}
          <div className="relative" data-tour="theme-button">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{ border: `1px solid ${t.border}`, borderRadius: t.radius, color: t.textPrimary }}
            >
              <span className="material-symbols-outlined text-sm">palette</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest hidden sm:block">Theme</span>
            </button>

            {showThemePicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowThemePicker(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-72 z-40 py-2"
                  style={{
                    background: t.bgSurface,
                    border: `1px solid ${t.border}`,
                    borderRadius: t.radiusLg,
                    boxShadow: t.shadowLg,
                  }}
                >
                  <div className="px-4 py-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: t.textSecondary }}>
                      Choose Theme
                    </span>
                  </div>
                  {themes.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => { setTheme(th.id); setShowThemePicker(false); }}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all"
                      style={{ background: theme.id === th.id ? t.accentMuted : 'transparent' }}
                    >
                      <div className="flex gap-[2px] shrink-0">
                        <div className="w-4 h-8 rounded-sm" style={{ background: th.tokens.bgPrimary, border: `1px solid ${th.tokens.border}` }} />
                        <div className="flex flex-col gap-[2px]">
                          <div className="w-4 h-[15px] rounded-sm" style={{ background: th.tokens.bgWidget, border: `1px solid ${th.tokens.border}` }} />
                          <div className="w-4 h-[15px] rounded-sm" style={{ background: th.tokens.accent }} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold" style={{ color: t.textPrimary }}>{th.name}</div>
                        <div className="text-[8px] font-mono" style={{ color: t.textMuted }}>{th.description}</div>
                        <div className="text-[7px] font-mono italic mt-0.5" style={{ color: t.textMuted }}>Inspired by {th.inspiration}</div>
                      </div>
                      {theme.id === th.id && (
                        <span className="material-symbols-outlined text-sm ml-auto" style={{ color: t.accent }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Resize toggle */}
            <button
              onClick={() => setIsResizeMode(!isResizeMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{
                border: `1px solid ${isResizeMode ? t.accent : t.border}`,
                borderRadius: t.radius,
                color: isResizeMode ? t.textInverse : t.textPrimary,
                background: isResizeMode ? t.accent : 'transparent',
              }}
            >
              <span className="material-symbols-outlined text-sm">aspect_ratio</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest hidden sm:block">Resize</span>
            </button>

            {/* Edit button */}
            <button
              data-tour="edit-button"
              onClick={() => setEditPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{ border: `1px solid ${t.border}`, borderRadius: t.radius, color: t.textPrimary }}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Edit</span>
            </button>

            {/* Help/Tour button */}
            <TourTriggerButton />

            <button
              onClick={resetBuilder}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-colors"
              style={{ color: t.textSecondary }}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span className="text-[9px] font-mono uppercase tracking-widest hidden sm:block">Rebuild</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <TabManager themeTokens={t as unknown as Record<string, string>} />

      {/* Dashboard grid */}
      <main className="flex-1 px-4 lg:px-8 py-6" data-tour="dashboard-grid">
        {components.length > 0 ? (
          <ResizableGrid
            layouts={effectiveLayouts}
            onLayoutChange={handleLayoutChange}
            columns={3}
            gap={16}
            isEditMode={isResizeMode}
          >
            {components.map((comp, idx) => {
              const Widget = WIDGET_MAP[comp.id];
              return (
                <ResizableWidget
                  key={comp.id}
                  id={comp.id}
                  title={comp.name}
                  icon={comp.icon}
                >
                  <div data-tour={idx === 0 ? 'first-widget' : undefined}>
                    {Widget ? <Widget /> : (
                      <div style={{ background: t.bgWidget, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '24px' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-sm" style={{ color: t.textSecondary }}>{comp.icon}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: t.textPrimary }}>{comp.name}</span>
                        </div>
                        <p className="text-[10px] font-mono" style={{ color: t.textSecondary }}>{comp.description}</p>
                      </div>
                    )}
                  </div>
                </ResizableWidget>
              );
            })}
          </ResizableGrid>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 max-w-[1400px] mx-auto">
            <span className="material-symbols-outlined text-4xl mb-4" style={{ color: t.textMuted, opacity: 0.3 }}>dashboard</span>
            <p className="text-lg mb-2" style={{ fontFamily: t.fontHeading, color: t.textMuted }}>No components</p>
            <button
              onClick={() => setEditPanelOpen(true)}
              className="text-[10px] font-mono uppercase tracking-widest hover:underline"
              style={{ color: t.textPrimary }}
            >
              Add components →
            </button>
          </div>
        )}
      </main>

      {/* Save/Load Panel (slide-in from left) */}
      {showIOPanel && <DashboardIOInline onClose={() => setShowIOPanel(false)} themeTokens={t} />}

      {/* Edit panel (slide-in from right) */}
      {isEditPanelOpen && <ComponentCatalog />}
    </div>
  );
};

// ─── Inline Save/Load Panel ─────────────────────────────────────────
// (Built-in until DashboardIO agent delivers the full version)
interface DashboardIOInlineProps {
  onClose: () => void;
  themeTokens: any;
}

const STORAGE_KEY = 'riskpart-saved-dashboards';

interface SavedDashboard {
  id: string;
  name: string;
  savedAt: number;
  themeId: string;
  componentIds: string[];
}

const DashboardIOInline: React.FC<DashboardIOInlineProps> = ({ onClose, themeTokens: t }) => {
  const { state } = useBuilder();
  const { theme } = useTheme();
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState<SavedDashboard[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [exportData, setExportData] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'export' | 'import'>('save');

  const handleSave = () => {
    const name = saveName.trim() || `Dashboard ${new Date().toLocaleDateString()}`;
    const entry: SavedDashboard = {
      id: `dash_${Date.now()}`,
      name,
      savedAt: Date.now(),
      themeId: theme.id,
      componentIds: state.activeComponents.map((c) => c.id),
    };
    const updated = [...saved, entry];
    setSaved(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaveName('');
  };

  const handleDelete = (id: string) => {
    const updated = saved.filter((s) => s.id !== id);
    setSaved(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleExportJSON = () => {
    const config = {
      version: 1,
      name: 'Bond Trading Dashboard',
      exportedAt: Date.now(),
      themeId: theme.id,
      profile: state.profile,
      preferences: state.preferences,
      activeComponentIds: state.activeComponents.map((c) => c.id),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareURL = () => {
    const config = {
      t: theme.id,
      c: state.activeComponents.map((c) => c.id),
    };
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
    navigator.clipboard.writeText(url);
    setExportData('Copied to clipboard!');
    setTimeout(() => setExportData(''), 2000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const config = JSON.parse(reader.result as string);
        setExportData(`Imported: ${config.activeComponentIds?.length || 0} components, theme: ${config.themeId || 'default'}`);
      } catch {
        setExportData('Error: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'save' as const, label: 'Save', icon: 'save' },
    { id: 'load' as const, label: 'Load', icon: 'folder_open' },
    { id: 'export' as const, label: 'Export', icon: 'download' },
    { id: 'import' as const, label: 'Import', icon: 'upload' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div
        className="fixed top-0 left-0 h-full w-full max-w-sm z-50 flex flex-col animate-in slide-in-from-left duration-300"
        style={{ background: t.bgSurface, boxShadow: '8px 0 40px -12px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${t.border}`, background: t.bgSurface2 }}>
          <h2 className="text-lg" style={{ fontFamily: t.fontHeading, color: t.textPrimary }}>Dashboard Manager</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center" style={{ color: t.textPrimary }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: `1px solid ${t.border}` }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-mono uppercase tracking-widest transition-all"
              style={{
                color: activeTab === tab.id ? t.accent : t.textSecondary,
                borderBottom: activeTab === tab.id ? `2px solid ${t.accent}` : '2px solid transparent',
              }}
            >
              <span className="material-symbols-outlined text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'save' && (
            <div className="space-y-4">
              <p className="text-[10px] font-mono" style={{ color: t.textSecondary }}>
                Save your current dashboard configuration for later use.
              </p>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Dashboard name..."
                className="w-full px-4 py-2.5 text-xs font-mono focus:outline-none"
                style={{ background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: t.radius, color: t.textPrimary }}
              />
              <button
                onClick={handleSave}
                className="w-full py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
                style={{ background: t.accent, color: t.textInverse, borderRadius: t.radius }}
              >
                Save Dashboard
              </button>
              <div className="text-[9px] font-mono" style={{ color: t.textMuted }}>
                {state.activeComponents.length} components · Theme: {theme.name}
              </div>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="space-y-2">
              {saved.length === 0 ? (
                <p className="text-[10px] font-mono py-8 text-center" style={{ color: t.textMuted }}>No saved dashboards yet</p>
              ) : (
                saved.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-3 group" style={{ background: t.bgSurface2, borderRadius: t.radius, border: `1px solid ${t.border}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono font-bold truncate" style={{ color: t.textPrimary }}>{s.name}</div>
                      <div className="text-[8px] font-mono" style={{ color: t.textMuted }}>
                        {s.componentIds.length} components · {new Date(s.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="text-[8px] font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1" style={{ color: t.accent }}>Load</button>
                    <button onClick={() => handleDelete(s.id)} className="text-[8px] font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1" style={{ color: t.negative }}>Delete</button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                style={{ background: t.bgSurface2, borderRadius: t.radius, border: `1px solid ${t.border}` }}
              >
                <span className="material-symbols-outlined text-sm" style={{ color: t.accent }}>description</span>
                <div className="text-left">
                  <div className="text-[10px] font-mono font-bold" style={{ color: t.textPrimary }}>Export as JSON</div>
                  <div className="text-[8px] font-mono" style={{ color: t.textMuted }}>Download full configuration file</div>
                </div>
              </button>
              <button
                onClick={handleCopyShareURL}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                style={{ background: t.bgSurface2, borderRadius: t.radius, border: `1px solid ${t.border}` }}
              >
                <span className="material-symbols-outlined text-sm" style={{ color: t.accent }}>link</span>
                <div className="text-left">
                  <div className="text-[10px] font-mono font-bold" style={{ color: t.textPrimary }}>Copy Share URL</div>
                  <div className="text-[8px] font-mono" style={{ color: t.textMuted }}>Generate a shareable link with config</div>
                </div>
              </button>
              {exportData && (
                <div className="text-[9px] font-mono py-2 px-3" style={{ color: t.positive, background: t.accentMuted, borderRadius: t.radius }}>
                  {exportData}
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <label
                className="flex flex-col items-center justify-center py-8 cursor-pointer border-2 border-dashed transition-colors"
                style={{ borderColor: t.border, borderRadius: t.radiusLg }}
              >
                <span className="material-symbols-outlined text-2xl mb-2" style={{ color: t.textMuted }}>upload_file</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: t.textPrimary }}>Drop JSON file or click to browse</span>
                <span className="text-[8px] font-mono mt-1" style={{ color: t.textMuted }}>Accepts .json dashboard config files</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              {exportData && (
                <div className="text-[9px] font-mono py-2 px-3" style={{ color: exportData.startsWith('Error') ? t.negative : t.positive, background: t.accentMuted, borderRadius: t.radius }}>
                  {exportData}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Main Export (wraps with TabProvider + OnboardingTour) ───────────
export const FinalDashboard = () => {
  const { state } = useBuilder();

  return (
    <TabProvider initialComponents={state.activeComponents}>
      <OnboardingTour>
        <DashboardInner />
      </OnboardingTour>
    </TabProvider>
  );
};
