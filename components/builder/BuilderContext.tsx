import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  BuilderState,
  BuilderProfile,
  BuilderPreferences,
  DashboardComponent,
  TableColumn,
  AlertConfig,
  ChatMessage,
} from '../../types/dashboard-builder';
import {
  COMPONENT_CATALOG,
  DEFAULT_TABLE_COLUMNS,
  DEFAULT_ALERTS,
  ROLE_PRESETS,
} from '../../types/dashboard-builder';

const emptyProfile: BuilderProfile = { name: '', occupation: '', role: '', desk: '', primaryTask: '' };
const emptyPreferences: BuilderPreferences = {
  primaryGoal: '', secondaryGoals: [], bondUniverses: [], defaultScope: '',
  primaryIdentifier: '', secondaryIdentifier: '', groupingLogic: '',
  aboveTheFold: [], criticalInputs: [], usefulInputs: [],
  freshnessMode: '', workflowMode: '',
};

const initialState: BuilderState = {
  phase: 'landing',
  currentStep: 0,
  totalSteps: 17,
  profile: emptyProfile,
  preferences: emptyPreferences,
  activeComponents: [],
  availableComponents: COMPONENT_CATALOG.map((c) => ({ ...c })),
  tableColumns: DEFAULT_TABLE_COLUMNS.map((c) => ({ ...c })),
  alerts: DEFAULT_ALERTS.map((a) => ({ ...a })),
  messages: [],
  isEditPanelOpen: false,
  isBuilding: false,
  buildProgress: 0,
};

interface BuilderContextType {
  state: BuilderState;
  setPhase: (phase: BuilderState['phase']) => void;
  setStep: (step: number) => void;
  updateProfile: (updates: Partial<BuilderProfile>) => void;
  updatePreferences: (updates: Partial<BuilderPreferences>) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  activateComponent: (id: string) => void;
  deactivateComponent: (id: string) => void;
  setComponentPriority: (id: string, priority: DashboardComponent['priority']) => void;
  toggleColumn: (id: string) => void;
  toggleAlert: (id: string) => void;
  setEditPanelOpen: (open: boolean) => void;
  applyRolePreset: (roleId: string) => void;
  startBuild: () => void;
  resetBuilder: () => void;
  activateComponentsBulk: (ids: string[]) => void;
  reorderComponents: (fromIndex: number, toIndex: number) => void;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
};

export const BuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<BuilderState>(initialState);

  const setPhase = useCallback((phase: BuilderState['phase']) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState((s) => ({ ...s, currentStep: step }));
  }, []);

  const updateProfile = useCallback((updates: Partial<BuilderProfile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...updates } }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<BuilderPreferences>) => {
    setState((s) => ({ ...s, preferences: { ...s.preferences, ...updates } }));
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setState((s) => ({
      ...s,
      messages: [...s.messages, { ...msg, id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now() }],
    }));
  }, []);

  const activateComponent = useCallback((id: string) => {
    setState((s) => {
      const comp = s.availableComponents.find((c) => c.id === id);
      if (!comp || s.activeComponents.some((c) => c.id === id)) return s;
      return {
        ...s,
        activeComponents: [...s.activeComponents, { ...comp, isActive: true }],
        availableComponents: s.availableComponents.map((c) => c.id === id ? { ...c, isActive: true } : c),
      };
    });
  }, []);

  const deactivateComponent = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      activeComponents: s.activeComponents.filter((c) => c.id !== id),
      availableComponents: s.availableComponents.map((c) => c.id === id ? { ...c, isActive: false } : c),
    }));
  }, []);

  const activateComponentsBulk = useCallback((ids: string[]) => {
    setState((s) => {
      const newActive = [...s.activeComponents];
      const newAvailable = s.availableComponents.map((c) => {
        if (ids.includes(c.id) && !newActive.some((a) => a.id === c.id)) {
          newActive.push({ ...c, isActive: true });
          return { ...c, isActive: true };
        }
        return c;
      });
      return { ...s, activeComponents: newActive, availableComponents: newAvailable };
    });
  }, []);

  const setComponentPriority = useCallback((id: string, priority: DashboardComponent['priority']) => {
    setState((s) => ({
      ...s,
      activeComponents: s.activeComponents.map((c) => c.id === id ? { ...c, priority } : c),
    }));
  }, []);

  const toggleColumn = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tableColumns: s.tableColumns.map((c) => c.id === id ? { ...c, visible: !c.visible } : c),
    }));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      alerts: s.alerts.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a),
    }));
  }, []);

  const setEditPanelOpen = useCallback((open: boolean) => {
    setState((s) => ({ ...s, isEditPanelOpen: open }));
  }, []);

  const applyRolePreset = useCallback((roleId: string) => {
    const preset = ROLE_PRESETS.find((r) => r.id === roleId);
    if (!preset) return;
    setState((s) => {
      const newActive: DashboardComponent[] = [];
      const newAvailable = s.availableComponents.map((c) => {
        const isInPreset = preset.defaultComponents.includes(c.id);
        if (isInPreset) newActive.push({ ...c, isActive: true });
        return { ...c, isActive: isInPreset };
      });
      return {
        ...s,
        activeComponents: newActive,
        availableComponents: newAvailable,
        profile: { ...s.profile, role: preset.title },
        phase: 'dashboard' as const,
      };
    });
  }, []);

  const startBuild = useCallback(() => {
    setState((s) => ({ ...s, isBuilding: true, buildProgress: 0, phase: 'building' }));
    // Simulate build progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setState((s) => ({ ...s, isBuilding: false, buildProgress: 100, phase: 'dashboard' }));
      } else {
        setState((s) => ({ ...s, buildProgress: Math.min(progress, 99) }));
      }
    }, 400);
  }, []);

  const reorderComponents = useCallback((fromIndex: number, toIndex: number) => {
    setState((s) => {
      const arr = [...s.activeComponents];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { ...s, activeComponents: arr };
    });
  }, []);

  const resetBuilder = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <BuilderContext.Provider value={{
      state, setPhase, setStep, updateProfile, updatePreferences, addMessage,
      activateComponent, deactivateComponent, setComponentPriority,
      toggleColumn, toggleAlert, setEditPanelOpen, applyRolePreset,
      startBuild, resetBuilder, activateComponentsBulk, reorderComponents,
    }}>
      {children}
    </BuilderContext.Provider>
  );
};
