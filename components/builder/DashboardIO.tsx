import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useBuilder } from './BuilderContext';
import { useTheme } from './ThemeContext';
import type { BuilderProfile, BuilderPreferences } from '../../types/dashboard-builder';

// ─── Types ───────────────────────────────────────────────────────────

const CONFIG_VERSION = 1;
const STORAGE_KEY = 'riskpart_dashboards';
const AUTOSAVE_KEY = 'riskpart_autosave';
const AUTOSAVE_DEBOUNCE_MS = 2000;

export interface DashboardConfig {
  version: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  themeId: string;
  profile: BuilderProfile;
  preferences: BuilderPreferences;
  activeComponentIds: string[];
  componentOrder: string[];
  widgetLayouts?: Record<string, any>;
}

export interface SavedDashboardEntry {
  id: string;
  config: DashboardConfig;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Validation ──────────────────────────────────────────────────────

export function validateConfig(data: unknown): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Config must be a JSON object'], warnings };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    errors.push('Missing or invalid "version" field');
  } else if (obj.version > CONFIG_VERSION) {
    warnings.push(`Config version ${obj.version} is newer than supported (${CONFIG_VERSION})`);
  }

  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    errors.push('Missing or empty "name" field');
  }

  if (typeof obj.createdAt !== 'number') errors.push('Missing "createdAt" timestamp');
  if (typeof obj.updatedAt !== 'number') errors.push('Missing "updatedAt" timestamp');
  if (typeof obj.themeId !== 'string') errors.push('Missing "themeId"');

  if (!obj.profile || typeof obj.profile !== 'object') {
    errors.push('Missing "profile" object');
  }

  if (!obj.preferences || typeof obj.preferences !== 'object') {
    errors.push('Missing "preferences" object');
  }

  if (!Array.isArray(obj.activeComponentIds)) {
    errors.push('"activeComponentIds" must be an array');
  }

  if (!Array.isArray(obj.componentOrder)) {
    errors.push('"componentOrder" must be an array');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Serialization helpers ───────────────────────────────────────────

function buildConfigFromState(
  name: string,
  state: ReturnType<typeof useBuilder>['state'],
  themeId: string,
): DashboardConfig {
  const now = Date.now();
  return {
    version: CONFIG_VERSION,
    name,
    createdAt: now,
    updatedAt: now,
    themeId,
    profile: { ...state.profile },
    preferences: { ...state.preferences },
    activeComponentIds: state.activeComponents.map((c) => c.id),
    componentOrder: state.activeComponents.map((c) => c.id),
  };
}

// ─── localStorage helpers ────────────────────────────────────────────

function loadAllSaved(): SavedDashboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedDashboardEntry[];
  } catch {
    return [];
  }
}

function persistAll(entries: SavedDashboardEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ─── URL encoding / decoding ─────────────────────────────────────────

export function configToShareURL(config: DashboardConfig): string {
  const json = JSON.stringify(config);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}${window.location.pathname}#dashboard=${encoded}`;
}

export function configFromShareURL(url: string): DashboardConfig | null {
  try {
    const hash = new URL(url).hash;
    const match = hash.match(/^#dashboard=(.+)$/);
    if (!match) return null;
    const json = decodeURIComponent(escape(atob(match[1])));
    return JSON.parse(json) as DashboardConfig;
  } catch {
    return null;
  }
}

// ─── Hook: useDashboardIO ────────────────────────────────────────────

export function useDashboardIO() {
  const builder = useBuilder();
  const { state, activateComponentsBulk, updateProfile, updatePreferences, resetBuilder } = builder;
  const { theme, setTheme } = useTheme();

  const [savedList, setSavedList] = useState<SavedDashboardEntry[]>(() => loadAllSaved());

  const refresh = useCallback(() => setSavedList(loadAllSaved()), []);

  // Save
  const saveDashboard = useCallback(
    (name: string): SavedDashboardEntry => {
      const config = buildConfigFromState(name, state, theme.id);
      const entry: SavedDashboardEntry = { id: `dash_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, config };
      const updated = [...loadAllSaved(), entry];
      persistAll(updated);
      setSavedList(updated);
      return entry;
    },
    [state, theme.id],
  );

  // Overwrite existing
  const updateSavedDashboard = useCallback(
    (id: string): void => {
      const entries = loadAllSaved();
      const idx = entries.findIndex((e) => e.id === id);
      if (idx === -1) return;
      const existing = entries[idx];
      const config = buildConfigFromState(existing.config.name, state, theme.id);
      config.createdAt = existing.config.createdAt;
      entries[idx] = { ...existing, config };
      persistAll(entries);
      setSavedList(entries);
    },
    [state, theme.id],
  );

  // Delete
  const deleteDashboard = useCallback((id: string) => {
    const entries = loadAllSaved().filter((e) => e.id !== id);
    persistAll(entries);
    setSavedList(entries);
  }, []);

  // Load config into builder
  const applyConfig = useCallback(
    (config: DashboardConfig) => {
      resetBuilder();
      // Small timeout so reset completes before we apply new state
      setTimeout(() => {
        updateProfile(config.profile);
        updatePreferences(config.preferences);
        setTheme(config.themeId);
        activateComponentsBulk(config.activeComponentIds);
      }, 50);
    },
    [resetBuilder, updateProfile, updatePreferences, setTheme, activateComponentsBulk],
  );

  // Load by id
  const loadDashboard = useCallback(
    (id: string) => {
      const entry = loadAllSaved().find((e) => e.id === id);
      if (entry) applyConfig(entry.config);
    },
    [applyConfig],
  );

  // Export JSON blob
  const exportJSON = useCallback(
    (name?: string) => {
      const config = buildConfigFromState(name || state.profile.role || 'Untitled', state, theme.id);
      const json = JSON.stringify(config, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name.replace(/\s+/g, '_').toLowerCase()}_dashboard.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [state, theme.id],
  );

  // Copy config to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      const config = buildConfigFromState(state.profile.role || 'Untitled', state, theme.id);
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      return true;
    } catch {
      return false;
    }
  }, [state, theme.id]);

  // Share URL
  const generateShareURL = useCallback((): string => {
    const config = buildConfigFromState(state.profile.role || 'Untitled', state, theme.id);
    return configToShareURL(config);
  }, [state, theme.id]);

  // Import from file content
  const importFromJSON = useCallback(
    (jsonString: string): ConfigValidationResult & { config?: DashboardConfig } => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        return { valid: false, errors: ['Invalid JSON'], warnings: [] };
      }
      const result = validateConfig(parsed);
      if (result.valid) {
        return { ...result, config: parsed as DashboardConfig };
      }
      return result;
    },
    [],
  );

  // Import from URL string
  const importFromURL = useCallback(
    (url: string): ConfigValidationResult & { config?: DashboardConfig } => {
      const config = configFromShareURL(url);
      if (!config) return { valid: false, errors: ['Could not decode dashboard from URL'], warnings: [] };
      const result = validateConfig(config);
      if (result.valid) return { ...result, config };
      return result;
    },
    [],
  );

  // Auto-save
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.phase !== 'dashboard') return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const config = buildConfigFromState('__autosave__', state, theme.id);
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(config));
      } catch {
        // silently ignore quota errors
      }
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [state, theme.id]);

  const loadAutosave = useCallback((): DashboardConfig | null => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as DashboardConfig;
    } catch {
      return null;
    }
  }, []);

  return {
    savedList,
    refresh,
    saveDashboard,
    updateSavedDashboard,
    deleteDashboard,
    loadDashboard,
    applyConfig,
    exportJSON,
    copyToClipboard,
    generateShareURL,
    importFromJSON,
    importFromURL,
    loadAutosave,
  };
}

// ─── Styles (CSS custom properties) ─────────────────────────────────

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 50,
    display: 'flex',
  },
  backdrop: {
    position: 'absolute' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    transition: 'opacity 0.3s ease',
  },
  panel: {
    position: 'relative' as const,
    zIndex: 51,
    width: '420px',
    maxWidth: '90vw',
    height: '100vh',
    overflowY: 'auto' as const,
    background: 'var(--theme-surface)',
    borderRight: '1px solid var(--theme-border)',
    boxShadow: 'var(--theme-shadow-lg)',
    animation: 'dashboardIOSlideIn 0.3s ease forwards',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid var(--theme-border)',
    background: 'var(--theme-widget-header)',
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: '12px 8px',
    fontSize: '9px',
    fontFamily: 'var(--theme-font-mono, monospace)',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: active ? 'var(--theme-accent)' : 'var(--theme-text2)',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--theme-accent)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  sectionTitle: {
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: 'var(--theme-text3)',
    marginBottom: '8px',
    fontFamily: 'monospace',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    borderRadius: 'var(--theme-radius)',
    border: '1px solid var(--theme-border)',
    background: 'var(--theme-surface)',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    borderRadius: 'var(--theme-radius)',
    border: '1px solid var(--theme-accent)',
    background: 'var(--theme-accent)',
    color: 'var(--theme-text-inv)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '12px',
    fontFamily: 'monospace',
    borderRadius: 'var(--theme-radius)',
    border: '1px solid var(--theme-border)',
    background: 'var(--theme-input)',
    color: 'var(--theme-text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  card: {
    padding: '12px',
    borderRadius: 'var(--theme-radius)',
    border: '1px solid var(--theme-border)',
    background: 'var(--theme-widget)',
    marginBottom: '8px',
    transition: 'all 0.15s ease',
  },
  dropZone: (active: boolean) => ({
    padding: '32px 16px',
    borderRadius: 'var(--theme-radius-lg)',
    border: `2px dashed ${active ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
    background: active ? 'var(--theme-accent-muted)' : 'var(--theme-surface2)',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  toast: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 100,
    padding: '10px 18px',
    borderRadius: 'var(--theme-radius)',
    background: 'var(--theme-accent)',
    color: 'var(--theme-text-inv)',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    boxShadow: 'var(--theme-shadow-lg)',
    animation: 'dashboardIOFadeInOut 2s ease forwards',
    pointerEvents: 'none' as const,
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    animation: 'dashboardIOFadeIn 0.2s ease forwards',
  },
  modal: {
    background: 'var(--theme-surface)',
    border: '1px solid var(--theme-border)',
    borderRadius: 'var(--theme-radius-lg)',
    boxShadow: 'var(--theme-shadow-lg)',
    padding: '24px',
    width: '380px',
    maxWidth: '90vw',
    animation: 'dashboardIOScaleIn 0.2s ease forwards',
  },
  errorBox: {
    padding: '10px 12px',
    borderRadius: 'var(--theme-radius)',
    background: 'rgba(255,23,68,0.08)',
    border: '1px solid rgba(255,23,68,0.2)',
    color: 'var(--theme-negative, #ff1744)',
    fontSize: '10px',
    fontFamily: 'monospace',
    marginTop: '8px',
  },
  warningBox: {
    padding: '10px 12px',
    borderRadius: 'var(--theme-radius)',
    background: 'rgba(255,171,0,0.08)',
    border: '1px solid rgba(255,171,0,0.2)',
    color: 'var(--theme-warning, #ffab00)',
    fontSize: '10px',
    fontFamily: 'monospace',
    marginTop: '8px',
  },
};

const keyframes = `
@keyframes dashboardIOSlideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@keyframes dashboardIOSlideOut {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes dashboardIOFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dashboardIOFadeInOut {
  0% { opacity: 0; transform: translateY(8px); }
  15% { opacity: 1; transform: translateY(0); }
  75% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
}
@keyframes dashboardIOScaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
`;

// ─── QuickSaveIndicator ──────────────────────────────────────────────

export const QuickSaveIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.toast}>
        <span className="material-symbols-outlined" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle' }}>
          check_circle
        </span>
        Auto-saved
      </div>
    </>
  );
};

// ─── SaveDialog ──────────────────────────────────────────────────────

export const SaveDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}> = ({ open, onClose, onSave, defaultName = '' }) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  if (!open) return null;

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onSave(trimmed);
      onClose();
    }
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ ...styles.sectionTitle, marginBottom: 0, fontSize: '11px' }}>Save Dashboard</span>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-text3)', fontSize: '18px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          <label style={{ ...styles.sectionTitle, display: 'block', marginBottom: '6px' }}>Dashboard Name</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. IG Trading Setup"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button style={styles.btn} onClick={onClose}>Cancel</button>
            <button style={styles.btnPrimary} onClick={handleSave} disabled={!name.trim()}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── ImportDropZone ──────────────────────────────────────────────────

export const ImportDropZone: React.FC<{
  onImport: (jsonString: string) => void;
}> = ({ onImport }) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') onImport(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div
      style={styles.dropZone(dragging)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '32px', color: dragging ? 'var(--theme-accent)' : 'var(--theme-text3)', display: 'block', marginBottom: '8px' }}
      >
        upload_file
      </span>
      <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--theme-text)', marginBottom: '4px' }}>
        {dragging ? 'Drop JSON file here' : 'Drag & drop JSON file'}
      </div>
      <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--theme-text3)' }}>
        or click to browse
      </div>
    </div>
  );
};

// ─── ShareButton ─────────────────────────────────────────────────────

export const ShareButton: React.FC = () => {
  const { generateShareURL } = useDashboardIO();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: prompt
      window.prompt('Copy this share URL:', url);
    }
  };

  return (
    <button style={styles.btnPrimary} onClick={handleShare}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {copied ? 'check' : 'share'}
      </span>
      {copied ? 'Copied!' : 'Share URL'}
    </button>
  );
};

// ─── Tab: Saved Dashboards ───────────────────────────────────────────

const SavedTab: React.FC<{
  onOpenSaveDialog: () => void;
}> = ({ onOpenSaveDialog }) => {
  const { savedList, deleteDashboard, loadDashboard, updateSavedDashboard } = useDashboardIO();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={styles.sectionTitle}>Saved Dashboards ({savedList.length})</span>
        <button style={styles.btnPrimary} onClick={onOpenSaveDialog}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
          Save Current
        </button>
      </div>

      {savedList.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--theme-text3)', fontSize: '11px', fontFamily: 'monospace' }}>
          No saved dashboards yet
        </div>
      )}

      {savedList.map((entry) => (
        <div key={entry.id} style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--theme-text)', marginBottom: '2px' }}>
                {entry.config.name}
              </div>
              <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--theme-text3)' }}>
                {entry.config.activeComponentIds.length} components ·
                {' '}{new Date(entry.config.updatedAt).toLocaleDateString()} ·
                {' '}{entry.config.themeId}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button style={{ ...styles.btn, flex: 1 }} onClick={() => loadDashboard(entry.id)}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
              Load
            </button>
            <button style={{ ...styles.btn, flex: 1 }} onClick={() => updateSavedDashboard(entry.id)}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>sync</span>
              Update
            </button>
            {confirmDeleteId === entry.id ? (
              <button
                style={{ ...styles.btn, flex: 1, borderColor: 'var(--theme-negative)', color: 'var(--theme-negative)' }}
                onClick={() => { deleteDashboard(entry.id); setConfirmDeleteId(null); }}
              >
                Confirm
              </button>
            ) : (
              <button
                style={{ ...styles.btn, padding: '8px' }}
                onClick={() => setConfirmDeleteId(entry.id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--theme-text3)' }}>delete</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Tab: Export ──────────────────────────────────────────────────────

const ExportTab: React.FC = () => {
  const { exportJSON, copyToClipboard } = useDashboardIO();
  const [clipboardCopied, setClipboardCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard();
    if (ok) {
      setClipboardCopied(true);
      setTimeout(() => setClipboardCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <span style={styles.sectionTitle}>Export Dashboard</span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        {/* JSON File */}
        <button style={{ ...styles.btn, width: '100%', justifyContent: 'flex-start' }} onClick={() => exportJSON()}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          <div style={{ textAlign: 'left' }}>
            <div>Export as JSON</div>
            <div style={{ fontSize: '8px', fontWeight: 400, color: 'var(--theme-text3)', textTransform: 'none', letterSpacing: 'normal', marginTop: '2px' }}>
              Download full config as a .json file
            </div>
          </div>
        </button>

        {/* Share URL */}
        <div>
          <ShareButton />
          <div style={{ fontSize: '8px', fontFamily: 'monospace', color: 'var(--theme-text3)', marginTop: '6px', paddingLeft: '2px' }}>
            Generates a URL with the config encoded in the hash
          </div>
        </div>

        {/* Clipboard */}
        <button style={{ ...styles.btn, width: '100%', justifyContent: 'flex-start' }} onClick={handleCopy}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {clipboardCopied ? 'check' : 'content_copy'}
          </span>
          <div style={{ textAlign: 'left' }}>
            <div>{clipboardCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}</div>
            <div style={{ fontSize: '8px', fontWeight: 400, color: 'var(--theme-text3)', textTransform: 'none', letterSpacing: 'normal', marginTop: '2px' }}>
              Copy raw JSON config to your clipboard
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

// ─── Tab: Import ─────────────────────────────────────────────────────

const ImportTab: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { importFromJSON, importFromURL, applyConfig } = useDashboardIO();
  const [urlInput, setUrlInput] = useState('');
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);
  const [pendingConfig, setPendingConfig] = useState<DashboardConfig | null>(null);

  const handleFileImport = (jsonString: string) => {
    const result = importFromJSON(jsonString);
    setValidationResult(result);
    if (result.valid && 'config' in result && result.config) {
      setPendingConfig(result.config);
    } else {
      setPendingConfig(null);
    }
  };

  const handleURLImport = () => {
    if (!urlInput.trim()) return;
    const result = importFromURL(urlInput.trim());
    setValidationResult(result);
    if (result.valid && 'config' in result && result.config) {
      setPendingConfig(result.config);
    } else {
      setPendingConfig(null);
    }
  };

  const handleApply = () => {
    if (pendingConfig) {
      applyConfig(pendingConfig);
      onClose();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <span style={styles.sectionTitle}>Import from File</span>
      <div style={{ marginTop: '8px', marginBottom: '20px' }}>
        <ImportDropZone onImport={handleFileImport} />
      </div>

      <span style={styles.sectionTitle}>Import from URL</span>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '12px' }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste a shared dashboard URL..."
          onKeyDown={(e) => e.key === 'Enter' && handleURLImport()}
        />
        <button style={styles.btn} onClick={handleURLImport}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>link</span>
          Load
        </button>
      </div>

      {/* Validation feedback */}
      {validationResult && !validationResult.valid && (
        <div style={styles.errorBox}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Validation Failed</div>
          {validationResult.errors.map((err, i) => (
            <div key={i}>- {err}</div>
          ))}
        </div>
      )}

      {validationResult && validationResult.warnings.length > 0 && (
        <div style={styles.warningBox}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Warnings</div>
          {validationResult.warnings.map((w, i) => (
            <div key={i}>- {w}</div>
          ))}
        </div>
      )}

      {/* Preview + apply */}
      {pendingConfig && (
        <div style={{ ...styles.card, marginTop: '16px', borderColor: 'var(--theme-accent)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--theme-accent)', marginBottom: '8px' }}>
            Ready to Import
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--theme-text)', marginBottom: '2px' }}>
            {pendingConfig.name}
          </div>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--theme-text3)', marginBottom: '12px' }}>
            {pendingConfig.activeComponentIds.length} components · Theme: {pendingConfig.themeId} · v{pendingConfig.version}
          </div>
          <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleApply}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
            Apply Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

// ─── DashboardIOPanel ────────────────────────────────────────────────

type IOTab = 'saved' | 'export' | 'import';

export const DashboardIOPanel: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<IOTab>('saved');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const io = useDashboardIO();

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  if (!open && !closing) return null;

  const panelStyle = closing
    ? { ...styles.panel, animation: 'dashboardIOSlideOut 0.25s ease forwards' }
    : styles.panel;

  const backdropStyle = closing
    ? { ...styles.backdrop, opacity: 0 }
    : styles.backdrop;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.overlay}>
        <div style={backdropStyle} onClick={handleClose} />
        <div style={panelStyle}>
          {/* Header */}
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--theme-text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Dashboard Manager
              </div>
              <div style={{ fontSize: '8px', fontFamily: 'monospace', color: 'var(--theme-text3)', marginTop: '2px' }}>
                Save, load, export, and import configurations
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-text3)', padding: '4px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>

          {/* Tabs */}
          <div style={styles.tabBar}>
            <button style={styles.tab(activeTab === 'saved')} onClick={() => setActiveTab('saved')}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', display: 'block', margin: '0 auto 2px' }}>folder</span>
              Saved
            </button>
            <button style={styles.tab(activeTab === 'export')} onClick={() => setActiveTab('export')}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', display: 'block', margin: '0 auto 2px' }}>upload</span>
              Export
            </button>
            <button style={styles.tab(activeTab === 'import')} onClick={() => setActiveTab('import')}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', display: 'block', margin: '0 auto 2px' }}>download</span>
              Import
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'saved' && <SavedTab onOpenSaveDialog={() => setSaveDialogOpen(true)} />}
          {activeTab === 'export' && <ExportTab />}
          {activeTab === 'import' && <ImportTab onClose={handleClose} />}
        </div>
      </div>

      <SaveDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={(name) => io.saveDashboard(name)}
        defaultName={io.savedList.length === 0 ? 'My Dashboard' : ''}
      />
    </>
  );
};
