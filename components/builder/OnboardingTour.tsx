import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';

// ─── Types ───────────────────────────────────────────────────────────
interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  content: string;
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  centered?: boolean; // for steps with no target element (e.g. final step)
}

interface TourContextValue {
  startTour: () => void;
  isActive: boolean;
  currentStep: number;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

// ─── Constants ───────────────────────────────────────────────────────
const STORAGE_KEY = 'onboarding-complete';
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 16;
const TRANSITION_DURATION = 300;

const TOUR_STEPS: TourStep[] = [
  {
    target: 'dashboard-grid',
    title: 'Your Dashboard',
    content:
      'This is your personalized dashboard. Each widget shows real-time bond market data tailored to your role.',
    placement: 'bottom',
  },
  {
    target: 'edit-button',
    title: 'Edit Mode',
    content:
      'Click Edit to add, remove, or reorder dashboard components. Drag and drop to rearrange.',
    placement: 'bottom',
  },
  {
    target: 'theme-button',
    title: 'Theme Selector',
    content:
      'Choose from 4 professional themes — dark terminal, clean light, editorial, or cinematic dark.',
    placement: 'bottom',
  },
  {
    target: 'first-widget',
    title: 'Widget Interactions',
    content:
      'Hover over any widget to see options. Each widget shows live market data with automatic updates.',
    placement: 'bottom',
  },
  {
    target: '',
    title: "You're Ready",
    content:
      'Your dashboard is fully customizable. You can always rebuild it from scratch or fine-tune individual components.',
    centered: true,
  },
];

// ─── Tour Context ────────────────────────────────────────────────────
const TourContext = React.createContext<TourContextValue>({
  startTour: () => {},
  isActive: false,
  currentStep: 0,
});

export const useTour = (): TourContextValue => React.useContext(TourContext);

// ─── Helpers ─────────────────────────────────────────────────────────
function getElementRect(target: string): ElementRect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
  };
}

function computePlacement(
  rect: ElementRect | null,
  tooltipWidth: number,
  tooltipHeight: number,
  preferred: TourStep['placement']
): { top: number; left: number; arrow: 'top' | 'bottom' | 'left' | 'right' } {
  if (!rect) {
    // Centered fallback
    return {
      top: window.innerHeight / 2 - tooltipHeight / 2,
      left: window.innerWidth / 2 - tooltipWidth / 2,
      arrow: 'top',
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // Auto-detect best placement
  let placement = preferred || 'auto';
  if (placement === 'auto') {
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;
    const best = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
    if (best === spaceBelow) placement = 'bottom';
    else if (best === spaceAbove) placement = 'top';
    else if (best === spaceRight) placement = 'right';
    else placement = 'left';
  }

  let top = 0;
  let left = 0;
  let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top';

  switch (placement) {
    case 'bottom':
      top = rect.bottom + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      left = cx - tooltipWidth / 2;
      arrow = 'top';
      break;
    case 'top':
      top = rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipHeight;
      left = cx - tooltipWidth / 2;
      arrow = 'bottom';
      break;
    case 'right':
      top = cy - tooltipHeight / 2;
      left = rect.right + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      arrow = 'left';
      break;
    case 'left':
      top = cy - tooltipHeight / 2;
      left = rect.left - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipWidth;
      arrow = 'right';
      break;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, vw - tooltipWidth - 12));
  top = Math.max(12, Math.min(top, vh - tooltipHeight - 12));

  return { top, left, arrow };
}

// ─── Overlay SVG with spotlight cutout ───────────────────────────────
const SpotlightOverlay: React.FC<{
  rect: ElementRect | null;
  transitioning: boolean;
}> = ({ rect, transitioning }) => {
  const pad = SPOTLIGHT_PADDING;
  const rx = 6;

  // Spotlight rect (with padding)
  const sx = rect ? rect.left - pad : 0;
  const sy = rect ? rect.top - pad : 0;
  const sw = rect ? rect.width + pad * 2 : 0;
  const sh = rect ? rect.height + pad * 2 : 0;

  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 99998,
        pointerEvents: 'none',
        transition: transitioning ? `all ${TRANSITION_DURATION}ms ease-in-out` : undefined,
      }}
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {rect && (
            <rect
              x={sx}
              y={sy}
              width={sw}
              height={sh}
              rx={rx}
              ry={rx}
              fill="black"
              style={{
                transition: `all ${TRANSITION_DURATION}ms ease-in-out`,
              }}
            />
          )}
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.6)"
        mask="url(#tour-spotlight-mask)"
      />
    </svg>
  );
};

// ─── Pulsing border around the spotlighted element ───────────────────
const PulsingBorder: React.FC<{ rect: ElementRect | null }> = ({ rect }) => {
  if (!rect) return null;
  const pad = SPOTLIGHT_PADDING;
  return (
    <div
      style={{
        position: 'fixed',
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        borderRadius: 6,
        border: '2px solid var(--theme-accent, #3B82F6)',
        zIndex: 99999,
        pointerEvents: 'none',
        animation: 'tour-pulse 2s ease-in-out infinite',
        transition: `all ${TRANSITION_DURATION}ms ease-in-out`,
      }}
    />
  );
};

// ─── Tooltip ─────────────────────────────────────────────────────────
const TourTooltip: React.FC<{
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: ElementRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onDone: () => void;
  visible: boolean;
}> = ({ step, stepIndex, totalSteps, targetRect, onNext, onPrev, onSkip, onDone, visible }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 360, h: 200 });
  const [pos, setPos] = useState<{ top: number; left: number; arrow: string }>({
    top: 0,
    left: 0,
    arrow: 'top',
  });

  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  // Measure tooltip after render
  useEffect(() => {
    if (tooltipRef.current) {
      const { offsetWidth, offsetHeight } = tooltipRef.current;
      setDims({ w: offsetWidth, h: offsetHeight });
    }
  }, [step, visible]);

  // Compute position
  useEffect(() => {
    const rect = step.centered ? null : targetRect;
    const computed = computePlacement(rect, dims.w, dims.h, step.placement);
    setPos(computed);
  }, [targetRect, dims, step]);

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 100000,
        width: 360,
        maxWidth: 'calc(100vw - 24px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity ${TRANSITION_DURATION}ms ease, transform ${TRANSITION_DURATION}ms ease`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          background: 'var(--theme-surface, #FFFFFF)',
          border: '1px solid var(--theme-border, rgba(0,0,0,0.1))',
          borderRadius: 'var(--theme-radius-lg, 8px)',
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header accent bar */}
        <div
          style={{
            height: 3,
            background: 'var(--theme-accent, #3B82F6)',
          }}
        />

        {/* Content */}
        <div style={{ padding: '20px 24px 16px' }}>
          {/* Step counter */}
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.15em',
              color: 'var(--theme-text-muted, #999)',
              marginBottom: 8,
            }}
          >
            {stepIndex + 1} of {totalSteps}
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: 'var(--theme-font-heading, Georgia, serif)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--theme-text, #1A1A1A)',
              margin: '0 0 8px 0',
              lineHeight: 1.3,
            }}
          >
            {step.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              lineHeight: 1.6,
              color: 'var(--theme-text-secondary, #6B6B6B)',
              margin: 0,
            }}
          >
            {step.content}
          </p>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px 16px',
            gap: 8,
          }}
        >
          {/* Skip */}
          <button
            onClick={onSkip}
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.15em',
              color: 'var(--theme-text-muted, #999)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
            }}
          >
            Skip
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Previous */}
            {!isFirst && (
              <button
                onClick={onPrev}
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: 'var(--theme-text, #1A1A1A)',
                  background: 'var(--theme-accent-muted, rgba(0,0,0,0.05))',
                  border: '1px solid var(--theme-border, rgba(0,0,0,0.1))',
                  borderRadius: 'var(--theme-radius, 4px)',
                  cursor: 'pointer',
                  padding: '8px 16px',
                }}
              >
                Previous
              </button>
            )}

            {/* Next / Done */}
            <button
              onClick={isLast ? onDone : onNext}
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.12em',
                color: 'var(--theme-text-inverse, #FFFFFF)',
                background: 'var(--theme-accent, #1A1A1A)',
                border: 'none',
                borderRadius: 'var(--theme-radius, 4px)',
                cursor: 'pointer',
                padding: '8px 20px',
              }}
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            paddingBottom: 14,
          }}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === stepIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === stepIndex
                    ? 'var(--theme-accent, #1A1A1A)'
                    : i < stepIndex
                    ? 'var(--theme-accent, #1A1A1A)'
                    : 'var(--theme-border, rgba(0,0,0,0.15))',
                opacity: i < stepIndex ? 0.4 : 1,
                transition: `all ${TRANSITION_DURATION}ms ease`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Keyframe injection ──────────────────────────────────────────────
const STYLE_ID = 'tour-keyframes';
function ensureKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes tour-pulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--theme-accent, rgba(59,130,246,0.5)); }
      50% { box-shadow: 0 0 0 6px transparent; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Main OnboardingTour Component ───────────────────────────────────
export const OnboardingTour: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef<number>(0);

  // Inject CSS keyframes
  useEffect(() => {
    ensureKeyframes();
  }, []);

  // Auto-start on first load
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let dashboard render
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Track the highlighted element's position
  const updateTargetRect = useCallback(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[currentStep];
    if (!step || step.centered) {
      setTargetRect(null);
      return;
    }
    const rect = getElementRect(step.target);
    setTargetRect(rect);
  }, [isActive, currentStep]);

  // Continuously track position (handles scroll, resize, layout shifts)
  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      updateTargetRect();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, updateTargetRect]);

  // Show tooltip after a brief transition delay
  useEffect(() => {
    if (!isActive) {
      setTooltipVisible(false);
      return;
    }
    setTooltipVisible(false);
    const timer = setTimeout(() => setTooltipVisible(true), 50);
    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  // Handle resize
  useEffect(() => {
    if (!isActive) return;
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, currentStep]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setTransitioning(false);
  }, []);

  const completeTour = useCallback(() => {
    setTooltipVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => {
      setIsActive(false);
      setCurrentStep(0);
      setTargetRect(null);
    }, TRANSITION_DURATION);
  }, []);

  const goNext = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      completeTour();
      return;
    }
    setTransitioning(true);
    setTooltipVisible(false);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setTransitioning(false);
    }, TRANSITION_DURATION / 2);
  }, [currentStep, completeTour]);

  const goPrev = useCallback(() => {
    if (currentStep <= 0) return;
    setTransitioning(true);
    setTooltipVisible(false);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setTransitioning(false);
    }, TRANSITION_DURATION / 2);
  }, [currentStep]);

  const contextValue = useMemo<TourContextValue>(
    () => ({ startTour, isActive, currentStep }),
    [startTour, isActive, currentStep]
  );

  const step = TOUR_STEPS[currentStep];

  const overlay =
    isActive && step
      ? ReactDOM.createPortal(
          <>
            {/* Clickable backdrop to block interactions */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99997,
                cursor: 'default',
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* SVG overlay with spotlight cutout */}
            <SpotlightOverlay rect={targetRect} transitioning={transitioning} />

            {/* Pulsing border */}
            <PulsingBorder rect={targetRect} />

            {/* Tooltip */}
            <TourTooltip
              step={step}
              stepIndex={currentStep}
              totalSteps={TOUR_STEPS.length}
              targetRect={targetRect}
              onNext={goNext}
              onPrev={goPrev}
              onSkip={completeTour}
              onDone={completeTour}
              visible={tooltipVisible}
            />
          </>,
          document.body
        )
      : null;

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {overlay}
    </TourContext.Provider>
  );
};

// ─── "?" Trigger Button ──────────────────────────────────────────────
export const TourTriggerButton: React.FC = () => {
  const { startTour, isActive } = useTour();

  if (isActive) return null;

  return (
    <button
      onClick={startTour}
      aria-label="Start onboarding tour"
      data-tour="help-button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: '1px solid var(--theme-border, rgba(0,0,0,0.1))',
        background: 'var(--theme-surface, transparent)',
        color: 'var(--theme-text-secondary, #6B6B6B)',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          'var(--theme-accent-muted, rgba(0,0,0,0.05))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--theme-surface, transparent)';
      }}
    >
      ?
    </button>
  );
};
