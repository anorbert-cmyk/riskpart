import React from 'react';
import { useBuilder } from './BuilderContext';

export const BuildingScreen = () => {
  const { state } = useBuilder();
  const progress = Math.round(state.buildProgress);

  const stages = [
    { label: 'Assembling component layout', icon: 'grid_view', threshold: 15 },
    { label: 'Configuring inventory table', icon: 'table_chart', threshold: 30 },
    { label: 'Setting up alert rules', icon: 'notifications_active', threshold: 50 },
    { label: 'Applying data preferences', icon: 'tune', threshold: 70 },
    { label: 'Generating initial view', icon: 'visibility', threshold: 85 },
    { label: 'Finalizing dashboard', icon: 'check_circle', threshold: 95 },
  ];

  const currentStageIndex = stages.reduce((acc, s, i) => (progress >= s.threshold ? i : acc), 0);
  const currentStage = stages[currentStageIndex];

  // SVG circle math
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  // Orbital dots count based on active components
  const orbitalCount = Math.min(state.activeComponents.length, 8);

  return (
    <>
      <style>{`
        @keyframes bs-orbit {
          from { transform: rotate(0deg) translateX(130px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(130px) rotate(-360deg); }
        }
        @keyframes bs-orbit-reverse {
          from { transform: rotate(360deg) translateX(105px) rotate(-360deg); }
          to { transform: rotate(0deg) translateX(105px) rotate(0deg); }
        }
        @keyframes bs-particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translateY(-80px) translateX(20px); opacity: 0.3; }
          90% { opacity: 0.1; }
        }
        @keyframes bs-pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes bs-slide-in {
          from { opacity: 0; transform: translateX(-24px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes bs-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(13, 115, 119, 0.15); }
          50% { box-shadow: 0 0 24px rgba(13, 115, 119, 0.35); }
        }
        @keyframes bs-check-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bs-progress-glow {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(13, 115, 119, 0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(13, 115, 119, 0.6)); }
        }
        @keyframes bs-nucleus-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .bs-gradient-text {
          background: linear-gradient(135deg, #1A1A1A 0%, #0D7377 50%, #4338CA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #FAFAF8 0%, #F0F0EE 50%, #EAEAE8 100%)' }}>

        {/* Subtle grid background */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Particle effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: i % 2 === 0 ? '#0D7377' : '#4338CA',
                left: `${5 + (i * 4.7) % 90}%`,
                top: `${10 + (i * 7.3) % 80}%`,
                animation: `bs-particle-float ${4 + (i % 5) * 1.5}s ease-in-out infinite`,
                animationDelay: `${(i * 0.7) % 6}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-8">

          {/* Orbital nucleus area */}
          <div className="relative flex items-center justify-center mb-10" style={{ width: 280, height: 280 }}>

            {/* Radial progress ring */}
            <svg
              className="absolute inset-0"
              width="280"
              height="280"
              viewBox="0 0 280 280"
              style={{ animation: 'bs-progress-glow 3s ease-in-out infinite' }}
            >
              {/* Background ring */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                fill="none"
                stroke="rgba(26, 26, 26, 0.06)"
                strokeWidth="3"
              />
              {/* Progress ring */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                fill="none"
                stroke="url(#bs-progress-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 140 140)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="bs-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D7377" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>
              </defs>
            </svg>

            {/* Outer orbital dots */}
            {Array.from({ length: orbitalCount }).map((_, i) => (
              <div
                key={`orbit-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: `linear-gradient(135deg, #0D7377, #4338CA)`,
                  top: '50%',
                  left: '50%',
                  marginTop: -3,
                  marginLeft: -3,
                  animation: `bs-orbit ${8 + i * 0.6}s linear infinite`,
                  animationDelay: `${(i * (8 / orbitalCount))}s`,
                  opacity: 0.7,
                }}
              />
            ))}

            {/* Inner orbital dots (reverse) */}
            {Array.from({ length: Math.max(0, orbitalCount - 3) }).map((_, i) => (
              <div
                key={`orbit-inner-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: '#4338CA',
                  top: '50%',
                  left: '50%',
                  marginTop: -2,
                  marginLeft: -2,
                  animation: `bs-orbit-reverse ${10 + i}s linear infinite`,
                  animationDelay: `${i * 2}s`,
                  opacity: 0.4,
                }}
              />
            ))}

            {/* Pulse ring behind nucleus */}
            <div
              className="absolute rounded-2xl"
              style={{
                width: 72,
                height: 72,
                top: '50%',
                left: '50%',
                marginTop: -36,
                marginLeft: -36,
                background: 'linear-gradient(135deg, #0D7377, #4338CA)',
                animation: 'bs-pulse-ring 2.5s ease-out infinite',
              }}
            />

            {/* Nucleus - Logo */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center z-10"
              style={{
                background: 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)',
                boxShadow: '0 8px 32px rgba(13, 115, 119, 0.25), 0 2px 8px rgba(0,0,0,0.2)',
                animation: 'bs-nucleus-breathe 3s ease-in-out infinite',
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Center percentage */}
            <div className="absolute flex flex-col items-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, 40px)' }}>
              <span className="text-2xl font-mono font-bold bs-gradient-text">{progress}%</span>
            </div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-3xl font-serif mb-2 text-center tracking-tight bs-gradient-text">
            Building your dashboard
          </h1>
          <p className="text-[10px] font-mono text-charcoal-muted uppercase tracking-[0.2em] mb-8 text-center">
            {currentStage.label}...
          </p>

          {/* Glassmorphism stage cards */}
          <div className="grid grid-cols-3 gap-2 w-full mb-8">
            {stages.map((stage, i) => {
              const isDone = progress >= stage.threshold;
              const isActive = i === currentStageIndex;
              return (
                <div
                  key={stage.threshold}
                  className="relative rounded-xl px-2 py-3 flex flex-col items-center text-center transition-all duration-500"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(13, 115, 119, 0.08), rgba(67, 56, 202, 0.06))'
                      : isDone
                      ? 'rgba(13, 115, 119, 0.04)'
                      : 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(12px)',
                    border: isActive
                      ? '1px solid rgba(13, 115, 119, 0.3)'
                      : isDone
                      ? '1px solid rgba(13, 115, 119, 0.12)'
                      : '1px solid rgba(26, 26, 26, 0.06)',
                    animation: isActive ? 'bs-glow-pulse 2.5s ease-in-out infinite' : 'none',
                  }}
                >
                  <span
                    className="material-symbols-outlined text-base mb-1 transition-colors duration-300"
                    style={{
                      color: isDone ? '#0D7377' : isActive ? '#1A1A1A' : 'rgba(26, 26, 26, 0.2)',
                    }}
                  >
                    {isDone ? 'check_circle' : stage.icon}
                  </span>
                  <span
                    className="text-[7px] font-mono uppercase tracking-wider leading-tight transition-colors duration-300"
                    style={{
                      color: isDone ? '#0D7377' : isActive ? '#1A1A1A' : 'rgba(26, 26, 26, 0.3)',
                    }}
                  >
                    {stage.label.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Component list with staggered animation */}
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-xs" style={{ color: '#0D7377' }}>widgets</span>
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] font-bold text-charcoal">
                Components
              </span>
              <span className="text-[9px] font-mono text-charcoal-muted ml-auto">
                {state.activeComponents.length} active
              </span>
            </div>
            <div className="space-y-1.5">
              {state.activeComponents.slice(0, 6).map((comp, i) => {
                const isActive = progress > (i + 1) * 12;
                return (
                  <div
                    key={comp.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300"
                    style={{
                      animation: `bs-slide-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                      animationDelay: `${i * 0.12}s`,
                      opacity: 0,
                      background: isActive ? 'rgba(13, 115, 119, 0.04)' : 'transparent',
                      border: isActive ? '1px solid rgba(13, 115, 119, 0.08)' : '1px solid transparent',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-sm transition-all duration-300"
                      style={{
                        color: isActive ? '#0D7377' : 'rgba(26, 26, 26, 0.15)',
                        animation: isActive ? 'bs-check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
                      }}
                    >
                      {isActive ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span
                      className="text-[10px] font-mono transition-colors duration-300"
                      style={{ color: isActive ? '#1A1A1A' : 'rgba(26, 26, 26, 0.3)' }}
                    >
                      {comp.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[7px] font-mono uppercase tracking-wider" style={{ color: '#0D7377' }}>
                        Ready
                      </span>
                    )}
                  </div>
                );
              })}
              {state.activeComponents.length > 6 && (
                <div className="text-[9px] font-mono text-charcoal-muted pl-9 pt-1">
                  +{state.activeComponents.length - 6} more components
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
