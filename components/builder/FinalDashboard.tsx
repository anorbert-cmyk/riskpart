import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { useTheme } from './ThemeContext';
import { WIDGET_MAP } from '../dashboard/DashboardWidgets';
import { ComponentCatalog } from './ComponentCatalog';

export const FinalDashboard = () => {
  const { state, setEditPanelOpen, resetBuilder } = useBuilder();
  const { theme, setTheme, themes } = useTheme();
  const { activeComponents, isEditPanelOpen, profile } = state;
  const [showThemePicker, setShowThemePicker] = useState(false);
  const t = theme.tokens;

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
                {profile.role || 'Custom'} Dashboard · {activeComponents.length} components
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Theme selector */}
          <div className="relative">
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
                      {/* Theme preview swatch */}
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
            <button
              onClick={() => setEditPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
              style={{ border: `1px solid ${t.border}`, borderRadius: t.radius, color: t.textPrimary }}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Edit</span>
            </button>
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
                  <div style={{ background: t.bgWidget, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '24px' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-sm" style={{ color: t.textSecondary }}>{comp.icon}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: t.textPrimary }}>{comp.name}</span>
                    </div>
                    <p className="text-[10px] font-mono" style={{ color: t.textSecondary }}>{comp.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeComponents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
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

      {/* Edit panel (slide-in) */}
      {isEditPanelOpen && <ComponentCatalog />}
    </div>
  );
};
