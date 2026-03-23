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

  // SVG circle math - larger ring
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  // Secondary ring
  const innerRadius = 92;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerStrokeOffset = innerCircumference - (Math.min(progress + 8, 100) / 100) * innerCircumference;

  // Orbital dots count based on active components
  const orbitalCount = Math.min(state.activeComponents.length, 10);

  return (
    <>
      <style>{`
        @keyframes bs-orbit {
          from { transform: rotate(0deg) translateX(148px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(148px) rotate(-360deg); }
        }
        @keyframes bs-orbit-reverse {
          from { transform: rotate(360deg) translateX(124px) rotate(-360deg); }
          to { transform: rotate(0deg) translateX(124px) rotate(0deg); }
        }
        @keyframes bs-orbit-far {
          from { transform: rotate(0deg) translateX(168px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(168px) rotate(-360deg); }
        }
        @keyframes bs-particle-drift {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          8% { opacity: 0.7; }
          25% { transform: translateY(-40px) translateX(15px) scale(1.2); opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(-10px) scale(0.8); opacity: 0.3; }
          75% { transform: translateY(-140px) translateX(20px) scale(0.6); opacity: 0.15; }
          95% { opacity: 0; }
        }
        @keyframes bs-particle-rise {
          0%, 100% { transform: translateY(0) scale(0); opacity: 0; }
          10% { transform: translateY(-5px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-60px) scale(0.8); opacity: 0.3; }
          100% { transform: translateY(-120px) scale(0); opacity: 0; }
        }
        @keyframes bs-pulse-ring {
          0% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes bs-pulse-ring-2 {
          0% { transform: scale(1); opacity: 0.2; }
          60% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes bs-slide-in {
          from { opacity: 0; transform: translateX(-32px) scale(0.92); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes bs-glow-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(13, 115, 119, 0.12), inset 0 0 12px rgba(13, 115, 119, 0.04); }
          50% { box-shadow: 0 0 28px rgba(13, 115, 119, 0.3), inset 0 0 20px rgba(13, 115, 119, 0.08); }
        }
        @keyframes bs-check-pop {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.25) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes bs-progress-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(13, 115, 119, 0.25)); }
          50% { filter: drop-shadow(0 0 12px rgba(13, 115, 119, 0.55)); }
        }
        @keyframes bs-nucleus-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 40px rgba(13, 115, 119, 0.25), 0 2px 12px rgba(0,0,0,0.3); }
          50% { transform: scale(1.06); box-shadow: 0 12px 48px rgba(13, 115, 119, 0.4), 0 4px 16px rgba(0,0,0,0.25); }
        }
        @keyframes bs-ring-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bs-ring-counter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes bs-stage-enter {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bs-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes bs-active-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.5); }
        }
        @keyframes bs-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bs-gradient-text {
          background: linear-gradient(135deg, #1A1A1A 0%, #0D7377 40%, #4338CA 80%, #0D7377 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: bs-gradient-shift 6s ease-in-out infinite;
        }
        .bs-glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 100%);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .bs-glass-card-active {
          background: linear-gradient(135deg, rgba(13, 115, 119, 0.1) 0%, rgba(67, 56, 202, 0.07) 100%);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(13, 115, 119, 0.35);
        }
        .bs-glass-card-done {
          background: linear-gradient(135deg, rgba(13, 115, 119, 0.06) 0%, rgba(255,255,255,0.3) 100%);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(13, 115, 119, 0.18);
        }
      `}</style>

      <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #FAFAF8 0%, #F2F2F0 30%, #EEEEED 60%, #E8EAE8 100%)' }}>

        {/* Subtle dot matrix background */}
        <div className="fixed inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #1A1A1A 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Gradient wash overlay */}
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(13, 115, 119, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(67, 56, 202, 0.03) 0%, transparent 60%)',
        }} />

        {/* Particle effects - multiple layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${1.5 + (i % 4) * 0.8}px`,
                height: `${1.5 + (i % 4) * 0.8}px`,
                background: i % 3 === 0 ? '#0D7377' : i % 3 === 1 ? '#4338CA' : 'rgba(26, 26, 26, 0.4)',
                left: `${3 + (i * 3.3) % 94}%`,
                top: `${15 + (i * 5.7) % 70}%`,
                animation: `${i % 2 === 0 ? 'bs-particle-drift' : 'bs-particle-rise'} ${5 + (i % 7) * 1.2}s ease-in-out infinite`,
                animationDelay: `${(i * 0.5) % 8}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-8">

          {/* Orbital nucleus area */}
          <div className="relative flex items-center justify-center mb-12" style={{ width: 340, height: 340 }}>

            {/* Outermost decorative ring - faint */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width="340"
              height="340"
              viewBox="0 0 340 340"
              style={{ animation: 'bs-ring-counter 60s linear infinite', opacity: 0.08 }}
            >
              <circle cx="170" cy="170" r="164" fill="none" stroke="#0D7377" strokeWidth="0.5" strokeDasharray="4 8" />
            </svg>

            {/* Main progress ring SVG */}
            <svg
              className="absolute"
              width="280"
              height="280"
              viewBox="0 0 280 280"
              style={{
                top: 30, left: 30,
                animation: 'bs-progress-glow 3s ease-in-out infinite',
              }}
            >
              <defs>
                <linearGradient id="bs-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D7377" />
                  <stop offset="50%" stopColor="#0A8F93" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>
                <linearGradient id="bs-inner-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4338CA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0D7377" stopOpacity="0.3" />
                </linearGradient>
                <filter id="bs-ring-blur">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>

              {/* Background ring */}
              <circle
                cx="140" cy="140" r={radius}
                fill="none"
                stroke="rgba(26, 26, 26, 0.04)"
                strokeWidth="3"
              />

              {/* Inner secondary ring - background */}
              <circle
                cx="140" cy="140" r={innerRadius}
                fill="none"
                stroke="rgba(26, 26, 26, 0.025)"
                strokeWidth="1.5"
              />

              {/* Inner secondary progress ring */}
              <circle
                cx="140" cy="140" r={innerRadius}
                fill="none"
                stroke="url(#bs-inner-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={innerCircumference}
                strokeDashoffset={innerStrokeOffset}
                transform="rotate(-90 140 140)"
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Glow behind main progress */}
              <circle
                cx="140" cy="140" r={radius}
                fill="none"
                stroke="url(#bs-progress-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 140 140)"
                filter="url(#bs-ring-blur)"
                opacity="0.3"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Main progress ring */}
              <circle
                cx="140" cy="140" r={radius}
                fill="none"
                stroke="url(#bs-progress-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 140 140)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Tick marks around ring */}
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i * 6) * (Math.PI / 180);
                const isLong = i % 5 === 0;
                const r1 = radius + 10;
                const r2 = radius + (isLong ? 16 : 13);
                const x1 = 140 + r1 * Math.cos(angle);
                const y1 = 140 + r1 * Math.sin(angle);
                const x2 = 140 + r2 * Math.cos(angle);
                const y2 = 140 + r2 * Math.sin(angle);
                return (
                  <line
                    key={`tick-${i}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(26, 26, 26, 0.06)"
                    strokeWidth={isLong ? 1 : 0.5}
                  />
                );
              })}

              {/* Progress endpoint dot */}
              {progress > 0 && (() => {
                const angle = ((progress / 100) * 360 - 90) * (Math.PI / 180);
                const dotX = 140 + radius * Math.cos(angle);
                const dotY = 140 + radius * Math.sin(angle);
                return (
                  <>
                    <circle cx={dotX} cy={dotY} r="6" fill="url(#bs-progress-gradient)" opacity="0.2" style={{ animation: 'bs-active-dot 2s ease-in-out infinite' }} />
                    <circle cx={dotX} cy={dotY} r="3" fill="url(#bs-progress-gradient)" />
                  </>
                );
              })()}
            </svg>

            {/* Outer orbital dots */}
            {Array.from({ length: orbitalCount }).map((_, i) => (
              <div
                key={`orbit-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 5 + (i % 3),
                  height: 5 + (i % 3),
                  background: i % 2 === 0 ? '#0D7377' : '#4338CA',
                  top: '50%',
                  left: '50%',
                  marginTop: -(5 + (i % 3)) / 2,
                  marginLeft: -(5 + (i % 3)) / 2,
                  animation: `bs-orbit ${9 + i * 0.7}s linear infinite`,
                  animationDelay: `${(i * (9 / orbitalCount))}s`,
                  opacity: 0.55,
                  boxShadow: `0 0 6px ${i % 2 === 0 ? 'rgba(13,115,119,0.5)' : 'rgba(67,56,202,0.5)'}`,
                }}
              />
            ))}

            {/* Inner orbital dots (reverse) */}
            {Array.from({ length: Math.max(0, orbitalCount - 2) }).map((_, i) => (
              <div
                key={`orbit-inner-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: '#4338CA',
                  top: '50%',
                  left: '50%',
                  marginTop: -1.5,
                  marginLeft: -1.5,
                  animation: `bs-orbit-reverse ${11 + i * 1.2}s linear infinite`,
                  animationDelay: `${i * 1.8}s`,
                  opacity: 0.35,
                }}
              />
            ))}

            {/* Far orbit dots - sparse */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`orbit-far-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: 'rgba(13, 115, 119, 0.3)',
                  top: '50%',
                  left: '50%',
                  marginTop: -1.5,
                  marginLeft: -1.5,
                  animation: `bs-orbit-far ${15 + i * 3}s linear infinite`,
                  animationDelay: `${i * 5}s`,
                }}
              />
            ))}

            {/* Pulse rings behind nucleus */}
            <div
              className="absolute rounded-2xl"
              style={{
                width: 80, height: 80,
                top: '50%', left: '50%',
                marginTop: -40, marginLeft: -40,
                background: 'linear-gradient(135deg, #0D7377, #4338CA)',
                animation: 'bs-pulse-ring 3s ease-out infinite',
              }}
            />
            <div
              className="absolute rounded-2xl"
              style={{
                width: 80, height: 80,
                top: '50%', left: '50%',
                marginTop: -40, marginLeft: -40,
                background: 'linear-gradient(135deg, #4338CA, #0D7377)',
                animation: 'bs-pulse-ring-2 3s ease-out infinite',
                animationDelay: '1.5s',
              }}
            />

            {/* Nucleus - Logo */}
            <div
              className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center z-10"
              style={{
                background: 'linear-gradient(145deg, #1A1A1A 0%, #2D2D2D 100%)',
                animation: 'bs-nucleus-breathe 3.5s ease-in-out infinite',
              }}
            >
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Center percentage below nucleus */}
            <div className="absolute flex flex-col items-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, 48px)' }}>
              <span className="text-3xl font-mono font-black bs-gradient-text tracking-tight">{progress}%</span>
              <span className="text-[7px] font-mono uppercase tracking-[0.3em] mt-0.5" style={{ color: 'rgba(26, 26, 26, 0.35)' }}>complete</span>
            </div>
          </div>

          {/* Title with animated gradient */}
          <h1 className="text-[2rem] font-serif mb-1.5 text-center tracking-tight leading-tight bs-gradient-text">
            Building your dashboard
          </h1>
          <p className="text-[10px] font-mono text-charcoal-muted uppercase tracking-[0.25em] mb-10 text-center flex items-center gap-2">
            <span className="material-symbols-outlined text-[10px]" style={{ color: '#0D7377' }}>{currentStage.icon}</span>
            {currentStage.label}
          </p>

          {/* Glassmorphism stage cards */}
          <div className="grid grid-cols-3 gap-2.5 w-full mb-10">
            {stages.map((stage, i) => {
              const isDone = progress >= stage.threshold;
              const isActive = i === currentStageIndex;
              return (
                <div
                  key={stage.threshold}
                  className={`relative rounded-xl px-2.5 py-3.5 flex flex-col items-center text-center transition-all duration-700 ${
                    isActive ? 'bs-glass-card-active' : isDone ? 'bs-glass-card-done' : 'bs-glass-card'
                  }`}
                  style={{
                    animation: isActive
                      ? 'bs-glow-pulse 2.5s ease-in-out infinite, bs-stage-enter 0.5s ease-out forwards'
                      : isDone
                      ? 'bs-stage-enter 0.4s ease-out forwards'
                      : 'none',
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  {/* Active indicator bar at top */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full" style={{
                      background: 'linear-gradient(90deg, #0D7377, #4338CA)',
                    }} />
                  )}

                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-all duration-500"
                    style={{
                      background: isDone
                        ? 'linear-gradient(135deg, rgba(13, 115, 119, 0.12), rgba(67, 56, 202, 0.08))'
                        : isActive
                        ? 'rgba(26, 26, 26, 0.05)'
                        : 'transparent',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-sm transition-all duration-500"
                      style={{
                        color: isDone ? '#0D7377' : isActive ? '#1A1A1A' : 'rgba(26, 26, 26, 0.18)',
                        animation: isDone ? 'bs-check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
                      }}
                    >
                      {isDone ? 'check_circle' : stage.icon}
                    </span>
                  </div>
                  <span
                    className="text-[7px] font-mono uppercase tracking-wider leading-tight transition-colors duration-500"
                    style={{
                      color: isDone ? '#0D7377' : isActive ? '#1A1A1A' : 'rgba(26, 26, 26, 0.28)',
                    }}
                  >
                    {stage.label.split(' ').slice(0, 2).join(' ')}
                  </span>

                  {/* Completion shimmer */}
                  {isDone && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(13, 115, 119, 0.06) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'bs-shimmer 3s ease-in-out infinite',
                    }} />
                  )}
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
              <div className="flex-1 h-px mx-2" style={{ background: 'linear-gradient(90deg, rgba(13, 115, 119, 0.15), transparent)' }} />
              <span className="text-[9px] font-mono" style={{ color: '#0D7377' }}>
                {state.activeComponents.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {state.activeComponents.slice(0, 6).map((comp, i) => {
                const isActive = progress > (i + 1) * 12;
                return (
                  <div
                    key={comp.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500"
                    style={{
                      animation: `bs-slide-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0,
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(13, 115, 119, 0.05), rgba(67, 56, 202, 0.02))'
                        : 'rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(8px)',
                      border: isActive
                        ? '1px solid rgba(13, 115, 119, 0.12)'
                        : '1px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      {isActive && (
                        <div className="absolute inset-0 rounded-full" style={{
                          background: 'rgba(13, 115, 119, 0.1)',
                          animation: 'bs-pulse-ring 2s ease-out infinite',
                        }} />
                      )}
                      <span
                        className="material-symbols-outlined text-sm relative z-10 transition-all duration-300"
                        style={{
                          color: isActive ? '#0D7377' : 'rgba(26, 26, 26, 0.12)',
                          animation: isActive ? 'bs-check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
                        }}
                      >
                        {isActive ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-mono transition-colors duration-500"
                      style={{ color: isActive ? '#1A1A1A' : 'rgba(26, 26, 26, 0.25)' }}
                    >
                      {comp.name}
                    </span>
                    {isActive && (
                      <span
                        className="ml-auto text-[7px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          color: '#0D7377',
                          background: 'rgba(13, 115, 119, 0.08)',
                          border: '1px solid rgba(13, 115, 119, 0.1)',
                        }}
                      >
                        Ready
                      </span>
                    )}
                  </div>
                );
              })}
              {state.activeComponents.length > 6 && (
                <div className="text-[9px] font-mono text-charcoal-muted pl-11 pt-1">
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
