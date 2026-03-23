import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';

// ─── Types ───────────────────────────────────────────────────────────
export interface WidgetLayout {
  id: string;
  colSpan: 1 | 2 | 3;
  rowSpan: 1 | 2 | 3;
  collapsed: boolean;
}

interface ResizableGridProps {
  layouts: Record<string, WidgetLayout>;
  onLayoutChange: (layouts: Record<string, WidgetLayout>) => void;
  columns?: number;
  gap?: number;
  isEditMode: boolean;
  children: React.ReactNode;
}

interface ResizableWidgetProps {
  id: string;
  title?: string;
  icon?: string;
  children: React.ReactNode;
}

interface WidgetLayoutContextValue {
  colSpan: 1 | 2 | 3;
  rowSpan: 1 | 2 | 3;
  collapsed: boolean;
}

interface ResizeState {
  widgetId: string;
  startX: number;
  startY: number;
  startColSpan: 1 | 2 | 3;
  startRowSpan: 1 | 2 | 3;
  currentColSpan: 1 | 2 | 3;
  currentRowSpan: 1 | 2 | 3;
}

// ─── Contexts ────────────────────────────────────────────────────────
const GridContext = createContext<{
  layouts: Record<string, WidgetLayout>;
  onLayoutChange: (layouts: Record<string, WidgetLayout>) => void;
  columns: number;
  gap: number;
  isEditMode: boolean;
  resizeState: ResizeState | null;
  startResize: (widgetId: string, e: React.MouseEvent) => void;
  toggleCollapse: (widgetId: string) => void;
  cellWidth: number;
  cellHeight: number;
} | null>(null);

const WidgetLayoutContext = createContext<WidgetLayoutContextValue>({
  colSpan: 1,
  rowSpan: 1,
  collapsed: false,
});

// ─── Constants ───────────────────────────────────────────────────────
const ROW_HEIGHT_BASE = 120; // px per row unit
const COLLAPSED_HEIGHT = 40; // px for collapsed title bar

// ─── Hook: useWidgetLayout ──────────────────────────────────────────
export const useWidgetLayout = (): WidgetLayoutContextValue => {
  return useContext(WidgetLayoutContext);
};

// ─── clamp helper ───────────────────────────────────────────────────
function clampSpan(value: number, max: number): 1 | 2 | 3 {
  const clamped = Math.max(1, Math.min(3, Math.min(max, Math.round(value))));
  return clamped as 1 | 2 | 3;
}

// ─── ResizableGrid ──────────────────────────────────────────────────
export const ResizableGrid: React.FC<ResizableGridProps> = ({
  layouts,
  onLayoutChange,
  columns = 3,
  gap = 16,
  isEditMode,
  children,
}) => {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(300);
  const cellHeight = ROW_HEIGHT_BASE;

  // Measure cell width from the grid container
  useEffect(() => {
    const measure = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.clientWidth;
        const totalGap = gap * (columns - 1);
        setCellWidth((gridWidth - totalGap) / columns);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [columns, gap]);

  // ── Start resize ──
  const startResize = useCallback(
    (widgetId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const layout = layouts[widgetId];
      if (!layout) return;
      setResizeState({
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        startColSpan: layout.colSpan,
        startRowSpan: layout.rowSpan,
        currentColSpan: layout.colSpan,
        currentRowSpan: layout.rowSpan,
      });
    },
    [layouts],
  );

  // ── Mouse move / up for resize ──
  useEffect(() => {
    if (!resizeState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;

      const colDelta = deltaX / (cellWidth + gap);
      const rowDelta = deltaY / (cellHeight + gap);

      const newColSpan = clampSpan(resizeState.startColSpan + colDelta, columns);
      const newRowSpan = clampSpan(resizeState.startRowSpan + rowDelta, 3);

      setResizeState((prev) =>
        prev
          ? { ...prev, currentColSpan: newColSpan, currentRowSpan: newRowSpan }
          : null,
      );
    };

    const handleMouseUp = () => {
      if (resizeState) {
        const updated = { ...layouts };
        updated[resizeState.widgetId] = {
          ...updated[resizeState.widgetId],
          colSpan: resizeState.currentColSpan,
          rowSpan: resizeState.currentRowSpan,
        };
        onLayoutChange(updated);
      }
      setResizeState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, cellWidth, cellHeight, gap, columns, layouts, onLayoutChange]);

  // ── Toggle collapse ──
  const toggleCollapse = useCallback(
    (widgetId: string) => {
      const updated = { ...layouts };
      if (updated[widgetId]) {
        updated[widgetId] = {
          ...updated[widgetId],
          collapsed: !updated[widgetId].collapsed,
        };
        onLayoutChange(updated);
      }
    },
    [layouts, onLayoutChange],
  );

  const contextValue = useMemo(
    () => ({
      layouts,
      onLayoutChange,
      columns,
      gap,
      isEditMode,
      resizeState,
      startResize,
      toggleCollapse,
      cellWidth,
      cellHeight,
    }),
    [
      layouts,
      onLayoutChange,
      columns,
      gap,
      isEditMode,
      resizeState,
      startResize,
      toggleCollapse,
      cellWidth,
      cellHeight,
    ],
  );

  return (
    <GridContext.Provider value={contextValue}>
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </GridContext.Provider>
  );
};

// ─── ResizableWidget ────────────────────────────────────────────────
export const ResizableWidget: React.FC<ResizableWidgetProps> = ({
  id,
  title,
  icon,
  children,
}) => {
  const ctx = useContext(GridContext);
  if (!ctx) {
    throw new Error('ResizableWidget must be used within a ResizableGrid');
  }

  const {
    layouts,
    isEditMode,
    resizeState,
    startResize,
    toggleCollapse,
    cellHeight,
    columns,
  } = ctx;

  const layout = layouts[id] || { id, colSpan: 1, rowSpan: 1, collapsed: false };
  const isResizing = resizeState?.widgetId === id;

  // Use live resize dimensions while dragging, committed dimensions otherwise
  const displayColSpan = isResizing ? resizeState!.currentColSpan : layout.colSpan;
  const displayRowSpan = isResizing ? resizeState!.currentRowSpan : layout.rowSpan;

  const widgetLayoutValue = useMemo<WidgetLayoutContextValue>(
    () => ({
      colSpan: displayColSpan,
      rowSpan: displayRowSpan,
      collapsed: layout.collapsed,
    }),
    [displayColSpan, displayRowSpan, layout.collapsed],
  );

  // Determine grid placement
  const effectiveColSpan = Math.min(displayColSpan, columns) as 1 | 2 | 3;
  const height = layout.collapsed
    ? COLLAPSED_HEIGHT
    : displayRowSpan * cellHeight + (displayRowSpan - 1) * ctx.gap;

  return (
    <WidgetLayoutContext.Provider value={widgetLayoutValue}>
      <div
        data-widget-id={id}
        style={{
          gridColumn: `span ${effectiveColSpan}`,
          height: `${height}px`,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--theme-radius, 2px)',
          border: isResizing
            ? '2px solid var(--theme-accent, #3b82f6)'
            : '1px solid var(--theme-border, rgba(0,0,0,0.06))',
          boxShadow: isResizing
            ? '0 0 0 3px rgba(59,130,246,0.15)'
            : 'var(--theme-shadow, none)',
          background: 'var(--theme-bg-widget, #ffffff)',
          transition: isResizing
            ? 'none'
            : 'height 0.25s cubic-bezier(0.4,0,0.2,1), grid-column 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.15s ease, box-shadow 0.15s ease',
          userSelect: isResizing ? 'none' : undefined,
        }}
      >
        {/* ── Title bar (clickable to collapse) ── */}
        {title && (
          <div
            onClick={() => toggleCollapse(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: layout.collapsed
                ? 'none'
                : '1px solid var(--theme-border, rgba(0,0,0,0.06))',
              background: 'var(--theme-bg-surface, rgba(0,0,0,0.02))',
              userSelect: 'none',
              height: `${COLLAPSED_HEIGHT}px`,
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            {icon && (
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '14px',
                  color: 'var(--theme-text-secondary, #666)',
                }}
              >
                {icon}
              </span>
            )}
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--theme-font-mono, ui-monospace, monospace)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--theme-text-primary, #1a1a1a)',
              }}
            >
              {title}
            </span>
            <div style={{ flex: 1 }} />
            {/* Collapse indicator */}
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '14px',
                color: 'var(--theme-text-muted, #999)',
                transition: 'transform 0.2s ease',
                transform: layout.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              }}
            >
              expand_more
            </span>
          </div>
        )}

        {/* ── Content area ── */}
        <div
          style={{
            overflow: 'auto',
            height: layout.collapsed
              ? '0px'
              : title
                ? `calc(100% - ${COLLAPSED_HEIGHT}px)`
                : '100%',
            opacity: layout.collapsed ? 0 : 1,
            transition: layout.collapsed
              ? 'opacity 0.15s ease'
              : 'opacity 0.2s ease 0.05s',
          }}
        >
          {children}
        </div>

        {/* ── Resize handle (edit mode only, hidden when collapsed) ── */}
        {isEditMode && !layout.collapsed && (
          <div
            onMouseDown={(e) => startResize(id, e)}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '20px',
              height: '20px',
              cursor: 'nwse-resize',
              zIndex: 10,
              opacity: isResizing ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
            // Show on hover via parent group - we use a class-based approach below
            className="resizable-widget-handle"
          >
            {/* Grip dots */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              style={{ position: 'absolute', bottom: 0, right: 0 }}
            >
              <circle cx="14" cy="14" r="1.5" fill="var(--theme-accent, #3b82f6)" opacity="0.7" />
              <circle cx="9" cy="14" r="1.5" fill="var(--theme-accent, #3b82f6)" opacity="0.5" />
              <circle cx="14" cy="9" r="1.5" fill="var(--theme-accent, #3b82f6)" opacity="0.5" />
              <circle cx="4" cy="14" r="1.5" fill="var(--theme-accent, #3b82f6)" opacity="0.3" />
              <circle cx="14" cy="4" r="1.5" fill="var(--theme-accent, #3b82f6)" opacity="0.3" />
              <circle cx="9" cy="9" r="1.5" fill="var(--theme-accent, #3b82f6)" opacity="0.3" />
            </svg>
          </div>
        )}

        {/* ── Size indicator badge (visible during resize) ── */}
        {isResizing && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--theme-accent, #3b82f6)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'var(--theme-font-mono, ui-monospace, monospace)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              pointerEvents: 'none',
              zIndex: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {displayColSpan}&times;{displayRowSpan}
          </div>
        )}

        {/* ── Inline style for hover reveal of resize handle ── */}
        <style>{`
          [data-widget-id="${id}"]:hover .resizable-widget-handle {
            opacity: 1 !important;
          }
        `}</style>
      </div>
    </WidgetLayoutContext.Provider>
  );
};
