import React from 'react';

// ─── Shared Widget Shell (theme-aware via CSS variable overrides) ───
const WidgetShell = ({ title, icon, children, className = '' }: { title: string; icon: string; children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white overflow-hidden group transition-all ${className}`}
    style={{
      borderRadius: 'var(--theme-radius, 2px)',
      boxShadow: 'var(--theme-shadow, none)',
      border: '1px solid var(--theme-border, rgba(0,0,0,0.06))',
    }}
  >
    <div
      className="flex items-center gap-2 px-4 py-2.5 bg-off-white/50"
      style={{ borderBottom: '1px solid var(--theme-border, rgba(0,0,0,0.06))' }}
    >
      <span className="material-symbols-outlined text-sm text-charcoal-muted">{icon}</span>
      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal">{title}</span>
      <div className="flex-1" />
      <span className="material-symbols-outlined text-xs text-charcoal-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">more_horiz</span>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

// ─── Mini sparkline (pure CSS) ──────────────────────────────────────
const Spark = ({ values, color = '#1A1A1A' }: { values: number[]; color?: string }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-[1px] h-4">
      {values.map((v, i) => (
        <div key={i} className="w-[3px] rounded-sm" style={{ height: `${((v - min) / range) * 100}%`, minHeight: 2, backgroundColor: color, opacity: 0.3 + (i / values.length) * 0.7 }} />
      ))}
    </div>
  );
};

// ─── Market Pulse ───────────────────────────────────────────────────
export const MarketPulseWidget = () => {
  const data = [
    { label: 'UST 10Y', value: '4.28%', delta: '+3bp', trend: 'up', spark: [4.2, 4.22, 4.25, 4.23, 4.26, 4.28] },
    { label: 'UST 2Y', value: '4.72%', delta: '+1bp', trend: 'up', spark: [4.7, 4.69, 4.71, 4.72, 4.71, 4.72] },
    { label: 'CDX IG', value: '52.3', delta: '-0.8', trend: 'down', spark: [54, 53.5, 53, 52.8, 52.5, 52.3] },
    { label: 'CDX HY', value: '342', delta: '-2.1', trend: 'down', spark: [348, 346, 345, 344, 343, 342] },
    { label: 'VIX', value: '14.2', delta: '-0.3', trend: 'down', spark: [15, 14.8, 14.5, 14.3, 14.1, 14.2] },
  ];
  return (
    <WidgetShell title="Market Pulse" icon="monitoring">
      <div className="flex gap-4 overflow-x-auto">
        {data.map((d) => (
          <div key={d.label} className="flex-shrink-0 min-w-[100px]">
            <div className="text-[8px] font-mono uppercase tracking-widest text-charcoal-muted mb-1">{d.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono font-light text-charcoal">{d.value}</span>
              <span className={`text-[9px] font-mono ${d.trend === 'up' ? 'text-red-500' : 'text-green-600'}`}>{d.delta}</span>
            </div>
            <div className="mt-1"><Spark values={d.spark} color={d.trend === 'up' ? '#ef4444' : '#16a34a'} /></div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── Collapsed Inventory ────────────────────────────────────────────
export const CollapsedInventoryWidget = () => {
  const rows = [
    { ticker: 'AAPL', cusip: '037833100', coupon: '3.25%', maturity: '02/2029', rating: 'AA+', bid: '98.45', ask: '98.72', spread: '+52', yield: '3.61%', liq: 'H', axes: 4, trace: '98.50', traceTime: '2m' },
    { ticker: 'MSFT', cusip: '594918104', coupon: '2.75%', maturity: '06/2030', rating: 'AAA', bid: '96.20', ask: '96.48', spread: '+38', yield: '3.28%', liq: 'H', axes: 6, trace: '96.35', traceTime: '5m' },
    { ticker: 'JPM', cusip: '46625H100', coupon: '4.50%', maturity: '01/2028', rating: 'A-', bid: '101.15', ask: '101.42', spread: '+78', yield: '4.12%', liq: 'M', axes: 3, trace: '101.20', traceTime: '12m' },
    { ticker: 'GS', cusip: '38141G104', coupon: '5.00%', maturity: '09/2027', rating: 'A-', bid: '102.30', ask: '102.55', spread: '+92', yield: '4.35%', liq: 'M', axes: 2, trace: '102.40', traceTime: '8m' },
    { ticker: 'AMZN', cusip: '023135106', coupon: '3.60%', maturity: '04/2032', rating: 'AA', bid: '94.80', ask: '95.15', spread: '+65', yield: '4.18%', liq: 'H', axes: 5, trace: '95.00', traceTime: '1m' },
    { ticker: 'T', cusip: '00206R102', coupon: '4.35%', maturity: '03/2029', rating: 'BBB', bid: '99.10', ask: '99.45', spread: '+115', yield: '4.53%', liq: 'L', axes: 1, trace: '99.20', traceTime: '45m' },
  ];
  return (
    <WidgetShell title="Collapsed Inventory" icon="table_chart">
      <div className="overflow-x-auto -mx-3 px-3">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="text-charcoal-muted uppercase tracking-wider">
              {['Ticker', 'CUSIP', 'Cpn', 'Mat', 'Rtg', 'Bid', 'Ask', 'Sprd', 'Yld', 'Liq', 'Axes', 'TRACE', 'Age'].map((h) => (
                <th key={h} className="text-left py-1.5 px-1.5 font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.cusip} className="border-t border-border-hairline/50 hover:bg-off-white/50 cursor-pointer transition-colors">
                <td className="py-1.5 px-1.5 font-bold text-charcoal">{r.ticker}</td>
                <td className="py-1.5 px-1.5 text-charcoal-muted">{r.cusip.slice(0, 6)}...</td>
                <td className="py-1.5 px-1.5">{r.coupon}</td>
                <td className="py-1.5 px-1.5">{r.maturity}</td>
                <td className="py-1.5 px-1.5"><span className={`px-1 py-0.5 text-[8px] ${r.rating.startsWith('AA') ? 'bg-green-50 text-green-700' : r.rating.startsWith('A') ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{r.rating}</span></td>
                <td className="py-1.5 px-1.5 text-charcoal">{r.bid}</td>
                <td className="py-1.5 px-1.5 text-charcoal">{r.ask}</td>
                <td className="py-1.5 px-1.5 text-charcoal font-bold">{r.spread}</td>
                <td className="py-1.5 px-1.5">{r.yield}</td>
                <td className="py-1.5 px-1.5"><span className={`inline-block w-1.5 h-1.5 rounded-full ${r.liq === 'H' ? 'bg-green-500' : r.liq === 'M' ? 'bg-amber-400' : 'bg-red-400'}`} /></td>
                <td className="py-1.5 px-1.5 text-center">{r.axes}</td>
                <td className="py-1.5 px-1.5">{r.trace}</td>
                <td className="py-1.5 px-1.5 text-charcoal-muted">{r.traceTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
};

// ─── Dealer Axes ────────────────────────────────────────────────────
export const DealerAxesWidget = () => {
  const axes = [
    { dealer: 'GS', ticker: 'AAPL 3.25 29', side: 'BID', size: '5MM', spread: '+51', age: '3m', fresh: true },
    { dealer: 'JPM', ticker: 'MSFT 2.75 30', side: 'OFR', size: '10MM', spread: '+39', age: '8m', fresh: true },
    { dealer: 'MS', ticker: 'AMZN 3.60 32', side: 'BID', size: '3MM', spread: '+64', age: '15m', fresh: true },
    { dealer: 'BARC', ticker: 'JPM 4.50 28', side: 'OFR', size: '7MM', spread: '+79', age: '25m', fresh: false },
    { dealer: 'CITI', ticker: 'T 4.35 29', side: 'BID', size: '2MM', spread: '+113', age: '42m', fresh: false },
  ];
  return (
    <WidgetShell title="Dealer Axes & Inventory" icon="swap_vert">
      <div className="space-y-1">
        {axes.map((a, i) => (
          <div key={i} className={`flex items-center gap-3 py-1.5 px-2 rounded-sm hover:bg-off-white/80 transition-colors ${!a.fresh ? 'opacity-60' : ''}`}>
            <span className="text-[9px] font-mono font-bold text-charcoal w-8">{a.dealer}</span>
            <span className="text-[10px] font-mono text-charcoal flex-1">{a.ticker}</span>
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 ${a.side === 'BID' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{a.side}</span>
            <span className="text-[9px] font-mono text-charcoal-muted w-10 text-right">{a.size}</span>
            <span className="text-[9px] font-mono font-bold text-charcoal w-8 text-right">{a.spread}</span>
            <span className="text-[8px] font-mono text-charcoal-muted w-8 text-right">{a.age}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── TRACE Prints ───────────────────────────────────────────────────
export const TracePrintsWidget = () => {
  const prints = [
    { time: '14:32:15', ticker: 'AMZN 3.60 32', price: '95.00', yield: '4.18%', size: '1MM', side: 'D→C' },
    { time: '14:30:42', ticker: 'AAPL 3.25 29', price: '98.50', yield: '3.61%', size: '5MM', side: 'C→D' },
    { time: '14:28:11', ticker: 'MSFT 2.75 30', price: '96.35', yield: '3.28%', size: '2MM', side: 'D→D' },
    { time: '14:25:03', ticker: 'GS 5.00 27', price: '102.40', yield: '4.35%', size: '3MM', side: 'D→C' },
  ];
  return (
    <WidgetShell title="Recent TRACE Prints" icon="receipt_long">
      <div className="space-y-1">
        {prints.map((p, i) => (
          <div key={i} className="flex items-center gap-3 py-1 text-[10px] font-mono border-b border-border-hairline/30 last:border-0">
            <span className="text-charcoal-muted w-14">{p.time}</span>
            <span className="text-charcoal font-bold flex-1">{p.ticker}</span>
            <span className="text-charcoal w-12 text-right">{p.price}</span>
            <span className="text-charcoal-muted w-10 text-right">{p.yield}</span>
            <span className="text-charcoal-muted w-8 text-right">{p.size}</span>
            <span className="text-[8px] text-charcoal-muted w-8 text-right">{p.side}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── Reference Pricing ──────────────────────────────────────────────
export const ReferencePricingWidget = () => {
  const items = [
    { ticker: 'AAPL 29', ref: '98.58', source: 'Composite', confidence: 'High', age: '1m' },
    { ticker: 'MSFT 30', ref: '96.34', source: 'BVAL', confidence: 'High', age: '3m' },
    { ticker: 'T 29', ref: '99.25', source: 'ICE', confidence: 'Med', age: '15m' },
  ];
  return (
    <WidgetShell title="Reference Pricing" icon="price_check">
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-charcoal font-bold">{item.ticker}</span>
            <span className="text-charcoal">{item.ref}</span>
            <span className="text-charcoal-muted text-[8px]">{item.source}</span>
            <span className={`text-[8px] px-1 py-0.5 ${item.confidence === 'High' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{item.confidence}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── Liquidity Panel ────────────────────────────────────────────────
export const LiquidityPanelWidget = () => (
  <WidgetShell title="Liquidity Panel" icon="water_drop">
    <div className="space-y-2">
      {[
        { label: 'Avg Bid-Ask', value: '0.27', status: 'normal' },
        { label: 'Quote Dispersion', value: '0.15', status: 'normal' },
        { label: 'Depth Score', value: '7.2/10', status: 'good' },
        { label: 'Stale Quotes', value: '3', status: 'warn' },
      ].map((m) => (
        <div key={m.label} className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-charcoal-muted">{m.label}</span>
          <span className={`font-bold ${m.status === 'good' ? 'text-green-600' : m.status === 'warn' ? 'text-amber-600' : 'text-charcoal'}`}>{m.value}</span>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── Watchlist ──────────────────────────────────────────────────────
export const WatchlistWidget = () => {
  const items = [
    { ticker: 'AAPL 3.25 29', spread: '+52', delta: '-2', alert: true },
    { ticker: 'MSFT 2.75 30', spread: '+38', delta: '+1', alert: false },
    { ticker: 'GS 5.00 27', spread: '+92', delta: '-5', alert: true },
    { ticker: 'AMZN 3.60 32', spread: '+65', delta: '0', alert: false },
    { ticker: 'T 4.35 29', spread: '+115', delta: '+3', alert: false },
  ];
  return (
    <WidgetShell title="Watchlist" icon="visibility">
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.ticker} className="flex items-center gap-2 py-1 text-[10px] font-mono border-b border-border-hairline/30 last:border-0">
            {item.alert && <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />}
            <span className="text-charcoal font-bold flex-1">{item.ticker}</span>
            <span className="text-charcoal">{item.spread}</span>
            <span className={`text-[9px] ${parseInt(item.delta) < 0 ? 'text-green-600' : parseInt(item.delta) > 0 ? 'text-red-500' : 'text-charcoal-muted'}`}>{item.delta}bp</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── Alerts & Exceptions ────────────────────────────────────────────
export const AlertsWidget = () => {
  const alerts = [
    { type: 'critical', icon: 'warning', text: 'Large price gap: T 4.35 29 vs ref (-35bp)', time: '2m' },
    { type: 'warning', icon: 'trending_up', text: 'Spread widening: GS 5.00 27 +5bp in 30m', time: '5m' },
    { type: 'info', icon: 'swap_vert', text: 'New axe: MS BID AMZN 3.60 32 3MM', time: '8m' },
    { type: 'info', icon: 'receipt_long', text: 'TRACE print: AAPL 3.25 29 5MM @ 98.50', time: '12m' },
  ];
  return (
    <WidgetShell title="Alerts & Exceptions" icon="notifications_active">
      <div className="space-y-1">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-start gap-2 py-1.5 px-2 rounded-sm text-[10px] font-mono ${a.type === 'critical' ? 'bg-red-50' : a.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
            <span className={`material-symbols-outlined text-xs mt-0.5 ${a.type === 'critical' ? 'text-red-500' : a.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>{a.icon}</span>
            <span className="flex-1 text-charcoal leading-relaxed">{a.text}</span>
            <span className="text-charcoal-muted text-[8px] shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── Relative Value ─────────────────────────────────────────────────
export const RelativeValueWidget = () => (
  <WidgetShell title="Relative Value Comparables" icon="compare_arrows">
    <div className="overflow-x-auto -mx-3 px-3">
      <table className="w-full text-[10px] font-mono">
        <thead><tr className="text-charcoal-muted uppercase tracking-wider text-[8px]">
          {['Bond', 'Spread', 'vs Sector', 'vs Rating', 'Z-Score'].map((h) => <th key={h} className="text-left py-1 px-1.5 font-bold">{h}</th>)}
        </tr></thead>
        <tbody>
          {[
            { bond: 'AAPL 3.25 29', spread: '+52', vsSector: '-8', vsRating: '-5', z: '-0.6' },
            { bond: 'MSFT 2.75 30', spread: '+38', vsSector: '-22', vsRating: '-18', z: '-1.2' },
            { bond: 'GS 5.00 27', spread: '+92', vsSector: '+12', vsRating: '+8', z: '+0.8' },
          ].map((r) => (
            <tr key={r.bond} className="border-t border-border-hairline/30">
              <td className="py-1 px-1.5 font-bold text-charcoal">{r.bond}</td>
              <td className="py-1 px-1.5">{r.spread}</td>
              <td className={`py-1 px-1.5 ${r.vsSector.startsWith('-') ? 'text-green-600' : 'text-red-500'}`}>{r.vsSector}</td>
              <td className={`py-1 px-1.5 ${r.vsRating.startsWith('-') ? 'text-green-600' : 'text-red-500'}`}>{r.vsRating}</td>
              <td className={`py-1 px-1.5 font-bold ${parseFloat(r.z) < 0 ? 'text-green-600' : 'text-red-500'}`}>{r.z}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </WidgetShell>
);

// ─── Volume Monitor ─────────────────────────────────────────────────
export const VolumeMonitorWidget = () => {
  const sectors = [
    { name: 'Financials', vol: '2.8B', pct: 85, color: '#1A1A1A' },
    { name: 'Technology', vol: '1.9B', pct: 65, color: '#555555' },
    { name: 'Healthcare', vol: '1.2B', pct: 45, color: '#888888' },
    { name: 'Energy', vol: '0.8B', pct: 30, color: '#AAAAAA' },
    { name: 'Utilities', vol: '0.4B', pct: 15, color: '#CCCCCC' },
  ];
  return (
    <WidgetShell title="TRACE Volume Monitor" icon="bar_chart">
      <div className="space-y-2">
        {sectors.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-charcoal-muted w-16 shrink-0">{s.name}</span>
            <div className="flex-1 h-3 bg-off-white rounded-sm overflow-hidden">
              <div className="h-full rounded-sm transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
            </div>
            <span className="text-charcoal font-bold w-8 text-right">{s.vol}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
};

// ─── Heatmap ────────────────────────────────────────────────────────
export const HeatmapWidget = () => {
  const grid = [
    { sector: 'Fin', aa: -2, a: +5, bbb: +8 },
    { sector: 'Tech', aa: -1, a: +2, bbb: +3 },
    { sector: 'HC', aa: 0, a: -3, bbb: +1 },
    { sector: 'Enrg', aa: +1, a: +7, bbb: +12 },
  ];
  const cellColor = (v: number) => v > 5 ? 'bg-red-200 text-red-800' : v > 0 ? 'bg-red-50 text-red-600' : v < -2 ? 'bg-green-200 text-green-800' : v < 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-charcoal-muted';
  return (
    <WidgetShell title="Spread Heatmap (Δ1D)" icon="grid_view">
      <table className="w-full text-[9px] font-mono text-center">
        <thead><tr className="text-charcoal-muted">
          <th className="py-1"></th><th className="py-1">AA</th><th className="py-1">A</th><th className="py-1">BBB</th>
        </tr></thead>
        <tbody>
          {grid.map((r) => (
            <tr key={r.sector}>
              <td className="py-1 text-left font-bold text-charcoal-muted">{r.sector}</td>
              {[r.aa, r.a, r.bbb].map((v, i) => (
                <td key={i} className={`py-1 px-2 ${cellColor(v)}`}>{v > 0 ? '+' : ''}{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetShell>
  );
};

// ─── Yield Curve ────────────────────────────────────────────────────
export const YieldCurveWidget = () => (
  <WidgetShell title="Yield Curve" icon="show_chart">
    <div className="flex items-end justify-between h-20 px-2">
      {[
        { mat: '1Y', val: 4.9 }, { mat: '2Y', val: 4.72 }, { mat: '3Y', val: 4.55 }, { mat: '5Y', val: 4.38 },
        { mat: '7Y', val: 4.32 }, { mat: '10Y', val: 4.28 }, { mat: '20Y', val: 4.52 }, { mat: '30Y', val: 4.48 },
      ].map((p) => (
        <div key={p.mat} className="flex flex-col items-center gap-1">
          <div className="w-2 bg-charcoal rounded-t-sm" style={{ height: `${(p.val - 4) * 80}px` }} />
          <span className="text-[7px] font-mono text-charcoal-muted">{p.mat}</span>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── New Issues ─────────────────────────────────────────────────────
export const NewIssuesWidget = () => (
  <WidgetShell title="New Issues Monitor" icon="fiber_new">
    <div className="space-y-2">
      {[
        { issuer: 'NVDA', size: '2.5B', coupon: '4.125%', mat: '2034', spread: '+55' },
        { issuer: 'META', size: '1.0B', coupon: '3.875%', mat: '2029', spread: '+42' },
      ].map((n) => (
        <div key={n.issuer} className="flex items-center gap-2 text-[10px] font-mono py-1 border-b border-border-hairline/30 last:border-0">
          <span className="font-bold text-charcoal">{n.issuer}</span>
          <span className="text-charcoal-muted">{n.size}</span>
          <span>{n.coupon}</span>
          <span className="text-charcoal-muted">{n.mat}</span>
          <span className="ml-auto font-bold">{n.spread}</span>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── Ratings Snapshot ───────────────────────────────────────────────
export const RatingsSnapshotWidget = () => (
  <WidgetShell title="Ratings Snapshot" icon="stars">
    <div className="space-y-1.5">
      {[
        { rating: 'AAA', count: 12, pct: 8 },
        { rating: 'AA', count: 45, pct: 28 },
        { rating: 'A', count: 62, pct: 38 },
        { rating: 'BBB', count: 41, pct: 26 },
      ].map((r) => (
        <div key={r.rating} className="flex items-center gap-2 text-[10px] font-mono">
          <span className="w-8 font-bold text-charcoal">{r.rating}</span>
          <div className="flex-1 h-2.5 bg-off-white rounded-sm overflow-hidden">
            <div className="h-full bg-charcoal/70 rounded-sm" style={{ width: `${r.pct}%` }} />
          </div>
          <span className="text-charcoal-muted w-6 text-right">{r.count}</span>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── Dealer Ranking ─────────────────────────────────────────────────
export const DealerRankingWidget = () => (
  <WidgetShell title="Dealer Ranking" icon="leaderboard">
    <div className="space-y-1">
      {[
        { rank: 1, dealer: 'Goldman Sachs', vol: '485M', axes: 42 },
        { rank: 2, dealer: 'JP Morgan', vol: '412M', axes: 38 },
        { rank: 3, dealer: 'Morgan Stanley', vol: '356M', axes: 31 },
        { rank: 4, dealer: 'Barclays', vol: '298M', axes: 27 },
      ].map((d) => (
        <div key={d.rank} className="flex items-center gap-2 text-[10px] font-mono py-1 border-b border-border-hairline/30 last:border-0">
          <span className="w-4 text-charcoal-muted text-[8px]">#{d.rank}</span>
          <span className="flex-1 font-bold text-charcoal">{d.dealer}</span>
          <span className="text-charcoal-muted">{d.vol}</span>
          <span className="text-charcoal-muted text-[8px]">{d.axes} axes</span>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── Sector Performance ─────────────────────────────────────────────
export const SectorPerformanceWidget = () => (
  <WidgetShell title="Sector Performance" icon="donut_small">
    <div className="space-y-1.5">
      {[
        { sector: 'Technology', spread: '+42', delta: '-3', trend: 'tight' },
        { sector: 'Financials', spread: '+68', delta: '+2', trend: 'wide' },
        { sector: 'Healthcare', spread: '+55', delta: '-1', trend: 'tight' },
        { sector: 'Energy', spread: '+95', delta: '+8', trend: 'wide' },
      ].map((s) => (
        <div key={s.sector} className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-charcoal flex-1">{s.sector}</span>
          <span className="font-bold text-charcoal">{s.spread}</span>
          <span className={`text-[9px] ${s.trend === 'tight' ? 'text-green-600' : 'text-red-500'}`}>{s.delta}bp</span>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── Portfolio Summary ──────────────────────────────────────────────
export const PortfolioSummaryWidget = () => (
  <WidgetShell title="Portfolio Summary" icon="account_balance">
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Market Value', value: '$2.4B' },
        { label: 'Avg Duration', value: '5.2Y' },
        { label: 'Avg Spread', value: '+67' },
        { label: 'Avg Rating', value: 'A' },
        { label: 'Positions', value: '342' },
        { label: 'YTD Return', value: '+3.8%' },
      ].map((m) => (
        <div key={m.label}>
          <div className="text-[7px] font-mono uppercase tracking-widest text-charcoal-muted mb-0.5">{m.label}</div>
          <div className="text-sm font-mono font-light text-charcoal">{m.value}</div>
        </div>
      ))}
    </div>
  </WidgetShell>
);

// ─── Security Detail (stub) ─────────────────────────────────────────
export const SecurityDetailWidget = () => (
  <WidgetShell title="Security Detail" icon="article">
    <div className="text-center py-4 text-charcoal-muted">
      <span className="material-symbols-outlined text-2xl opacity-30 mb-2 block">touch_app</span>
      <p className="text-[10px] font-mono uppercase tracking-widest">Select a bond to view details</p>
    </div>
  </WidgetShell>
);

// ─── Widget Registry ────────────────────────────────────────────────
export const WIDGET_MAP: Record<string, React.FC> = {
  'market-pulse': MarketPulseWidget,
  'collapsed-inventory': CollapsedInventoryWidget,
  'dealer-axes': DealerAxesWidget,
  'trace-prints': TracePrintsWidget,
  'reference-pricing': ReferencePricingWidget,
  'liquidity-panel': LiquidityPanelWidget,
  'watchlist': WatchlistWidget,
  'alerts-exceptions': AlertsWidget,
  'relative-value': RelativeValueWidget,
  'volume-monitor': VolumeMonitorWidget,
  'heatmap': HeatmapWidget,
  'yield-curve': YieldCurveWidget,
  'new-issues': NewIssuesWidget,
  'ratings-snapshot': RatingsSnapshotWidget,
  'dealer-ranking': DealerRankingWidget,
  'sector-performance': SectorPerformanceWidget,
  'security-detail': SecurityDetailWidget,
  'portfolio-summary': PortfolioSummaryWidget,
};
