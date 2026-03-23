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
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col relative overflow-hidden">
      {/* Inline CSS animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 0%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(25px, -40px) scale(0.95); }
        }
        @keyframes logoSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(13,115,119,0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(13,115,119,0.7)); }
        }
        @keyframes gradientText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatShape {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.15; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
        }
        @keyframes floatShapeSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-35px) rotate(90deg); opacity: 0.25; }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px); opacity: 0.2; }
          50% { transform: translateY(-15px); opacity: 0.5; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(13,115,119,0), inset 0 0 20px rgba(13,115,119,0); }
          50% { box-shadow: 0 0 30px rgba(13,115,119,0.08), inset 0 0 30px rgba(13,115,119,0.03); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes lineFloat {
          0%, 100% { transform: rotate(var(--rotation)) scaleX(1); opacity: 0.08; }
          50% { transform: rotate(var(--rotation)) scaleX(1.3); opacity: 0.18; }
        }
        .anim-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(13,115,119,0.3);
          box-shadow: 0 8px 60px -12px rgba(13,115,119,0.15), 0 0 1px rgba(13,115,119,0.3);
          transform: perspective(1000px) rotateX(1deg) rotateY(-1deg) scale(1.02);
        }
        .glass-card-role:hover {
          transform: perspective(1000px) rotateX(1deg) rotateY(1deg) scale(1.02);
        }
      `}</style>

      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary blob */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(13,115,119,0.4) 0%, rgba(67,56,202,0.2) 40%, transparent 70%)',
            animation: 'blobFloat1 20s ease-in-out infinite',
            filter: 'blur(100px)',
          }}
        />
        {/* Secondary blob */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            bottom: '-5%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(67,56,202,0.4) 0%, rgba(13,115,119,0.2) 40%, transparent 70%)',
            animation: 'blobFloat2 25s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
        {/* Tertiary accent blob */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            top: '40%',
            left: '30%',
            background: 'radial-gradient(circle, rgba(13,115,119,0.3) 0%, transparent 60%)',
            animation: 'blobFloat1 30s ease-in-out infinite reverse',
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Triangles */}
        <svg className="absolute" style={{ top: '15%', left: '8%', animation: 'floatShape 12s ease-in-out infinite', animationDelay: '0s' }} width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 22H22L12 2Z" stroke="rgba(13,115,119,0.4)" strokeWidth="1"/>
        </svg>
        <svg className="absolute" style={{ top: '70%', right: '12%', animation: 'floatShapeSlow 18s ease-in-out infinite', animationDelay: '3s' }} width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 22H22L12 2Z" stroke="rgba(67,56,202,0.3)" strokeWidth="1"/>
        </svg>
        <svg className="absolute" style={{ top: '45%', left: '5%', animation: 'floatShape 15s ease-in-out infinite', animationDelay: '6s' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 22H22L12 2Z" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </svg>

        {/* Circles */}
        <div className="absolute w-3 h-3 rounded-full border border-[rgba(13,115,119,0.2)]" style={{ top: '25%', right: '20%', animation: 'floatShapeSlow 14s ease-in-out infinite', animationDelay: '2s' }} />
        <div className="absolute w-5 h-5 rounded-full border border-[rgba(67,56,202,0.15)]" style={{ top: '60%', left: '15%', animation: 'floatShape 16s ease-in-out infinite', animationDelay: '5s' }} />
        <div className="absolute w-2 h-2 rounded-full border border-[rgba(255,255,255,0.08)]" style={{ top: '80%', right: '30%', animation: 'floatShapeSlow 20s ease-in-out infinite', animationDelay: '8s' }} />

        {/* Lines */}
        <div className="absolute w-16 h-[1px] bg-gradient-to-r from-transparent via-[rgba(13,115,119,0.2)] to-transparent" style={{ top: '35%', right: '8%', '--rotation': '30deg', animation: 'lineFloat 10s ease-in-out infinite', animationDelay: '1s', transform: 'rotate(30deg)' } as React.CSSProperties} />
        <div className="absolute w-12 h-[1px] bg-gradient-to-r from-transparent via-[rgba(67,56,202,0.15)] to-transparent" style={{ top: '55%', left: '10%', '--rotation': '-20deg', animation: 'lineFloat 13s ease-in-out infinite', animationDelay: '4s', transform: 'rotate(-20deg)' } as React.CSSProperties} />
      </div>

      {/* Particle dots */}
      <div className="fixed inset-0 pointer-events-none">
        {[
          { top: '10%', left: '20%', delay: '0s', dur: '8s' },
          { top: '20%', left: '70%', delay: '1s', dur: '10s' },
          { top: '30%', left: '40%', delay: '2s', dur: '7s' },
          { top: '50%', left: '85%', delay: '3s', dur: '12s' },
          { top: '65%', left: '25%', delay: '4s', dur: '9s' },
          { top: '75%', left: '60%', delay: '0.5s', dur: '11s' },
          { top: '85%', left: '45%', delay: '2.5s', dur: '8s' },
          { top: '15%', left: '55%', delay: '1.5s', dur: '13s' },
          { top: '40%', left: '10%', delay: '3.5s', dur: '10s' },
          { top: '55%', left: '50%', delay: '5s', dur: '9s' },
          { top: '90%', left: '75%', delay: '6s', dur: '7s' },
          { top: '35%', left: '90%', delay: '4.5s', dur: '11s' },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-[rgba(13,115,119,0.5)]"
            style={{
              top: dot.top,
              left: dot.left,
              animation: `floatDot ${dot.dur} ease-in-out infinite`,
              animationDelay: dot.delay,
            }}
          />
        ))}
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-6 border-b border-white/[0.06] anim-fade-in-up"
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex items-center gap-3">
          {/* Animated logo */}
          <div className="w-9 h-9 rounded-lg flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, rgba(13,115,119,0.2), rgba(67,56,202,0.2))' }}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              style={{
                animation: 'logoSpin 20s linear infinite, logoPulse 3s ease-in-out infinite',
              }}
            >
              <path d="M12 2L2 22H22L12 2Z" stroke="rgba(13,115,119,0.9)" strokeWidth="2" fill="rgba(13,115,119,0.1)"/>
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/90 block leading-tight">Syndicate</span>
            <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/40">Bond Trading Platform</span>
          </div>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 hidden sm:block">Dashboard Builder</span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20">
        {/* Title Section */}
        <div className="text-center mb-16 max-w-2xl">
          <span
            className="inline-block px-4 py-1.5 border border-white/[0.08] rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/40 mb-8 anim-fade-in-up"
            style={{
              animationDelay: '100ms',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(10px)',
            }}
          >
            Welcome to your workspace
          </span>

          {/* Animated gradient heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif tracking-tight leading-[1.08] mb-6 anim-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #F9F9F7, #0D7377, #4338CA, #0D7377, #F9F9F7)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientText 8s ease infinite',
              }}
            >
              Build your
            </span>
            <br/>
            <span
              className="italic font-light"
              style={{
                background: 'linear-gradient(135deg, #0D7377, #4338CA, #F9F9F7, #4338CA, #0D7377)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientText 8s ease infinite',
                animationDelay: '1s',
              }}
            >
              trading overview
            </span>
          </h1>

          <p
            className="text-sm font-serif text-white/40 leading-relaxed max-w-md mx-auto anim-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            Create a personalized bond trading dashboard tailored to your role, workflow, and market focus. Choose how you'd like to begin.
          </p>
        </div>

        {/* Two Cards */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl anim-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          {/* Card 1: Role-Based */}
          <div
            className="glass-card glass-card-role group relative rounded-2xl cursor-pointer p-8 lg:p-10"
            style={{
              perspective: '1000px',
              animation: hoveredCard === 'role' ? 'cardGlow 3s ease-in-out infinite' : 'none',
            }}
            onMouseEnter={() => setHoveredCard('role')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setShowRoleSelect(!showRoleSelect)}
          >
            {/* Number tag */}
            <span className="absolute top-5 right-5 text-[9px] font-mono font-bold uppercase tracking-widest text-white/20">01</span>

            {/* Icon area with radial gradient on hover */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-500"
              style={{
                background: hoveredCard === 'role'
                  ? 'radial-gradient(circle at center, rgba(13,115,119,0.4), rgba(13,115,119,0.1))'
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <span className={`material-symbols-outlined text-xl transition-colors duration-500 ${hoveredCard === 'role' ? 'text-[#0D7377]' : 'text-white/50'}`}>person</span>
            </div>

            <h2 className="text-xl font-serif text-white/90 mb-2">Role-based setup</h2>
            <p className="text-xs font-mono text-white/35 leading-relaxed mb-6">
              Select your position and get a pre-configured dashboard instantly. Optimized layouts for Portfolio Managers, Traders, Sales, Analysts, and Risk.
            </p>

            {/* Role selector (slide down) */}
            <div className={`overflow-hidden transition-all duration-500 ${showRoleSelect ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1.5 mb-4 pt-4 border-t border-white/[0.06]">
                {ROLE_PRESETS.map((role) => (
                  <button
                    key={role.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedRole(role.id); }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                      selectedRole === role.id
                        ? 'bg-[rgba(13,115,119,0.2)] border border-[rgba(13,115,119,0.3)]'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-base ${selectedRole === role.id ? 'text-[#0D7377]' : 'text-white/30'}`}>{role.icon}</span>
                    <div>
                      <div className={`text-[11px] font-mono font-bold uppercase tracking-wider ${selectedRole === role.id ? 'text-[#0D7377]' : 'text-white/70'}`}>{role.title}</div>
                      <div className={`text-[9px] font-mono ${selectedRole === role.id ? 'text-[#0D7377]/60' : 'text-white/25'}`}>{role.subtitle}</div>
                    </div>
                    {selectedRole === role.id && <span className="material-symbols-outlined text-sm ml-auto text-[#0D7377]">check</span>}
                  </button>
                ))}
              </div>

              {selectedRole && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRoleSelect(); }}
                  className="w-full py-3 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0D7377, #4338CA)',
                  }}
                >
                  <span>Load Dashboard</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>

            {!showRoleSelect && (
              <div className="flex items-center gap-2 text-white/30 group-hover:text-[#0D7377] transition-colors duration-500">
                <span className="text-[9px] font-mono uppercase tracking-widest">Select role</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-500">arrow_forward</span>
              </div>
            )}
          </div>

          {/* Card 2: AI-Assisted */}
          <div
            className="glass-card group relative rounded-2xl cursor-pointer p-8 lg:p-10"
            style={{
              perspective: '1000px',
              animation: hoveredCard === 'ai' ? 'cardGlow 3s ease-in-out infinite' : 'none',
            }}
            onMouseEnter={() => setHoveredCard('ai')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setPhase('ai-setup')}
          >
            <span className="absolute top-5 right-5 text-[9px] font-mono font-bold uppercase tracking-widest text-white/20">02</span>

            {/* Icon area with radial gradient on hover */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-500"
              style={{
                background: hoveredCard === 'ai'
                  ? 'radial-gradient(circle at center, rgba(67,56,202,0.4), rgba(67,56,202,0.1))'
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <span className={`material-symbols-outlined text-xl transition-colors duration-500 ${hoveredCard === 'ai' ? 'text-[#4338CA]' : 'text-white/50'}`}>auto_awesome</span>
            </div>

            <h2 className="text-xl font-serif text-white/90 mb-2">AI-assisted builder</h2>
            <p className="text-xs font-mono text-white/35 leading-relaxed mb-6">
              Have a conversation with AI to build your ideal dashboard. Answer a few questions about your workflow, market focus, and data needs — and we'll assemble it together.
            </p>

            <div className="flex items-center gap-2 text-white/30 group-hover:text-[#4338CA] transition-colors duration-500">
              <span className="text-[9px] font-mono uppercase tracking-widest">Start conversation</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-500">arrow_forward</span>
            </div>

            {/* AI visual hint - animated dots */}
            <div className="absolute bottom-5 right-5 flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: 'rgba(67,56,202,0.5)',
                    animation: `floatDot 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p
          className="mt-12 text-[9px] font-mono text-white/20 uppercase tracking-widest text-center anim-fade-in-up"
          style={{ animationDelay: '500ms' }}
        >
          Your dashboard can always be modified later
        </p>
      </main>

      {/* Bottom status bar */}
      <div
        className="relative z-10 border-t border-white/[0.06] px-8 lg:px-16 py-3 flex items-center justify-between anim-fade-in-up"
        style={{
          animationDelay: '600ms',
          background: 'rgba(255,255,255,0.01)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-[#0D7377]"
              style={{ animation: 'statusPulse 2s ease-in-out infinite' }}
            />
            <span className="text-[9px] font-mono text-white/30">3 active sessions</span>
          </div>
          <span className="text-white/10">·</span>
          <span className="text-[9px] font-mono text-white/30">12 dashboards created</span>
          <span className="text-white/10">·</span>
          <span className="text-[9px] font-mono text-white/30">Last build: 2min ago</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">v2.4.0</span>
        </div>
      </div>
    </div>
  );
};
