import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ROLE_PRESETS } from '../../types/dashboard-builder';

export const LandingPage = () => {
  const { setPhase, applyRolePreset } = useBuilder();
  const [hoveredCard, setHoveredCard] = useState<'role' | 'ai' | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const handleRoleSelect = () => {
    if (selectedRole) {
      applyRolePreset(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-charcoal rounded-[4px] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2"/></svg>
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-charcoal block leading-tight">Syndicate</span>
            <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-charcoal-muted">Bond Trading Platform</span>
          </div>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-charcoal-muted hidden sm:block">Dashboard Builder</span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20">
        {/* Title */}
        <div className="text-center mb-16 max-w-2xl">
          <span className="inline-block px-3 py-1 border border-charcoal/10 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-charcoal-muted mb-8">
            Welcome to your workspace
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-charcoal tracking-tight leading-[1.08] mb-6">
            Build your <br/>
            <span className="italic font-light">trading overview</span>
          </h1>
          <p className="text-sm font-serif text-charcoal-muted leading-relaxed max-w-md mx-auto">
            Create a personalized bond trading dashboard tailored to your role, workflow, and market focus. Choose how you'd like to begin.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl">
          {/* Card 1: Role-Based */}
          <div
            className={`group relative bg-white border transition-all duration-500 cursor-pointer p-8 lg:p-10 ${
              hoveredCard === 'role' ? 'border-charcoal shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]' : 'border-black/[0.06] hover:border-charcoal/30'
            }`}
            onMouseEnter={() => setHoveredCard('role')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowRoleSelect(!showRoleSelect)}
          >
            {/* Number tag */}
            <span className="absolute top-4 right-4 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted opacity-40">01</span>

            <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 transition-all duration-500 ${hoveredCard === 'role' ? 'bg-charcoal' : 'bg-charcoal/5'}`}>
              <span className={`material-symbols-outlined text-xl transition-colors duration-500 ${hoveredCard === 'role' ? 'text-white' : 'text-charcoal'}`}>person</span>
            </div>

            <h2 className="text-xl font-serif text-charcoal mb-2">Role-based setup</h2>
            <p className="text-xs font-mono text-charcoal-muted leading-relaxed mb-6">
              Select your position and get a pre-configured dashboard instantly. Optimized layouts for Portfolio Managers, Traders, Sales, Analysts, and Risk.
            </p>

            {/* Role selector (slide down) */}
            <div className={`overflow-hidden transition-all duration-500 ${showRoleSelect ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-2 mb-4 pt-4 border-t border-border-hairline">
                {ROLE_PRESETS.map((role) => (
                  <button
                    key={role.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedRole(role.id); }}
                    className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                      selectedRole === role.id
                        ? 'bg-charcoal text-white'
                        : 'bg-off-white hover:bg-charcoal/5 text-charcoal'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-base ${selectedRole === role.id ? 'text-white' : 'text-charcoal-muted'}`}>{role.icon}</span>
                    <div>
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider">{role.title}</div>
                      <div className={`text-[9px] font-mono ${selectedRole === role.id ? 'text-white/60' : 'text-charcoal-muted'}`}>{role.subtitle}</div>
                    </div>
                    {selectedRole === role.id && <span className="material-symbols-outlined text-sm ml-auto">check</span>}
                  </button>
                ))}
              </div>

              {selectedRole && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRoleSelect(); }}
                  className="w-full bg-charcoal text-white py-3 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <span>Load Dashboard</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>

            {!showRoleSelect && (
              <div className="flex items-center gap-2 text-charcoal-muted group-hover:text-charcoal transition-colors">
                <span className="text-[9px] font-mono uppercase tracking-widest">Select role</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            )}
          </div>

          {/* Card 2: AI-Assisted */}
          <div
            className={`group relative bg-white border transition-all duration-500 cursor-pointer p-8 lg:p-10 ${
              hoveredCard === 'ai' ? 'border-charcoal shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]' : 'border-black/[0.06] hover:border-charcoal/30'
            }`}
            onMouseEnter={() => setHoveredCard('ai')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setPhase('ai-setup')}
          >
            <span className="absolute top-4 right-4 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted opacity-40">02</span>

            <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 transition-all duration-500 ${hoveredCard === 'ai' ? 'bg-charcoal' : 'bg-charcoal/5'}`}>
              <span className={`material-symbols-outlined text-xl transition-colors duration-500 ${hoveredCard === 'ai' ? 'text-white' : 'text-charcoal'}`}>auto_awesome</span>
            </div>

            <h2 className="text-xl font-serif text-charcoal mb-2">AI-assisted builder</h2>
            <p className="text-xs font-mono text-charcoal-muted leading-relaxed mb-6">
              Have a conversation with AI to build your ideal dashboard. Answer a few questions about your workflow, market focus, and data needs — and we'll assemble it together.
            </p>

            <div className="flex items-center gap-2 text-charcoal-muted group-hover:text-charcoal transition-colors">
              <span className="text-[9px] font-mono uppercase tracking-widest">Start conversation</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>

            {/* AI visual hint */}
            <div className="absolute bottom-4 right-4 flex gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-charcoal animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-[9px] font-mono text-charcoal-muted/50 uppercase tracking-widest text-center">
          Your dashboard can always be modified later
        </p>
      </main>
    </div>
  );
};
