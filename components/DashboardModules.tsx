import React from 'react';
import { RiskItem, MetricItem, MilestoneItem, TeamRole, ComplianceItem } from '../types';

// --- Section 01: Risk Matrix ---
export const RiskMatrix = ({ data }: { data: RiskItem[] }) => {
    return (
        <div className="overflow-x-auto border border-border-hairline bg-white shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-off-white border-b border-border-hairline font-mono text-[9px] uppercase tracking-widest text-charcoal-muted">
                    <tr>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[5%]">ID</th>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[20%]">Risk Description</th>
                        <th className="py-4 px-4 font-bold border-r border-border-hairline w-[8%] text-center">Likelihood</th>
                        <th className="py-4 px-4 font-bold border-r border-border-hairline w-[8%] text-center">Impact</th>
                        <th className="py-4 px-4 font-bold border-r border-border-hairline w-[6%] text-center">Score</th>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[25%]">Mitigation Strategy</th>
                        <th className="py-4 px-6 font-bold w-[20%]">Contingency</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline font-serif text-xs text-charcoal">
                    {data.map((row) => (
                        <tr key={row.id} className="group hover:bg-off-white/50 transition-colors">
                            <td className="px-6 py-4 border-r border-border-hairline font-mono text-[10px] text-charcoal-muted">{row.id}</td>
                            <td className="px-6 py-4 border-r border-border-hairline">
                                <span className="font-bold block mb-1">{row.description.title}</span>
                                <span className="text-charcoal-muted">{row.description.subtitle}</span>
                            </td>
                            <td className="px-4 py-4 border-r border-border-hairline text-center font-mono text-[10px]">{row.likelihood}</td>
                            <td className="px-4 py-4 border-r border-border-hairline text-center font-mono text-[10px]">{row.impact}</td>
                            <td className={`px-4 py-4 border-r border-border-hairline text-center font-mono font-bold
                                ${row.score >= 80 ? 'bg-red-50 text-red-700' : 
                                  row.score >= 60 ? 'bg-orange-50 text-orange-700' : 
                                  row.score >= 45 ? 'bg-yellow-50 text-yellow-700' : 'text-charcoal-muted'}
                            `}>
                                {row.score}
                            </td>
                            <td className="px-6 py-4 border-r border-border-hairline text-charcoal-muted leading-relaxed">{row.mitigation}</td>
                            <td className="px-6 py-4 text-charcoal-muted leading-relaxed">{row.contingency}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Section 02: Metrics Dashboard ---

const sparklineData: Record<string, number[]> = {
    'MRR Growth': [60, 68, 65, 78, 82, 75, 88, 92, 85, 98, 105, 112, 108, 120, 128, 135, 142],
    'Net Promoter Score': [62, 65, 60, 68, 70, 66, 72, 69, 74, 71, 73, 75, 72, 74, 73, 74, 74],
    'Login Frequency': [2.8, 3.0, 3.1, 2.9, 3.3, 3.5, 3.4, 3.6, 3.8, 3.7, 3.9, 4.0, 3.8, 4.1, 4.0, 4.2, 4.2],
};

const gradientColors: Record<string, [string, string]> = {
    'MRR Growth': ['#10b981', '#059669'],
    'Net Promoter Score': ['#6366f1', '#4f46e5'],
    'Login Frequency': ['#f59e0b', '#d97706'],
};

const Sparkline = ({ data, color, width = 100, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;
    const gradientId = `spark-${color.replace('#', '')}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#${gradientId})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Animated dot at end */}
            <circle cx={width} cy={parseFloat(points.split(' ').pop()!.split(',')[1])} r="2.5" fill={color}>
                <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
        </svg>
    );
};

const ProgressRing = ({ percent, color, size = 48 }: { percent: number; color: string; size?: number }) => {
    const strokeWidth = 3.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
            <circle
                cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
        </svg>
    );
};

const healthScore = 87;

export const MetricsDashboard = ({ data }: { data: MetricItem[] }) => {
    return (
        <>
            <style>{`
                @keyframes metricsFadeInUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes metricsGradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes metricsPulseGlow {
                    0%, 100% { box-shadow: 0 0 4px 0px currentColor; }
                    50% { box-shadow: 0 0 12px 2px currentColor; }
                }
                @keyframes metricsCountUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .metrics-card-entrance { animation: metricsFadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .metrics-card-entrance:nth-child(1) { animation-delay: 0.1s; }
                .metrics-card-entrance:nth-child(2) { animation-delay: 0.25s; }
                .metrics-card-entrance:nth-child(3) { animation-delay: 0.4s; }
                .metrics-hero-entrance { animation: metricsFadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .metrics-value-entrance { animation: metricsCountUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 0.5s; }
                .metrics-delta-glow { animation: metricsPulseGlow 3s ease-in-out infinite; }
            `}</style>

            <div
                className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(249,249,247,0.9) 0%, rgba(240,238,235,0.7) 50%, rgba(249,249,247,0.9) 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'metricsGradientShift 12s ease infinite',
                }}
            >
                {/* Subtle grid texture overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.035]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #1A1A1A 0.5px, transparent 0.5px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Hero Summary Bar */}
                <div
                    className="metrics-hero-entrance relative mb-8 rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(224,224,224,0.6)',
                    }}
                >
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                        {/* Health ring */}
                        <div className="relative flex-shrink-0">
                            <ProgressRing percent={healthScore} color="#10b981" size={64} />
                            <span
                                className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-charcoal"
                                style={{ transform: 'rotate(0deg)' }}
                            >
                                {healthScore}
                            </span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal-muted mb-1">
                                Portfolio Health Score
                            </h3>
                            <p className="font-serif text-sm text-charcoal-muted leading-relaxed">
                                All systems nominal. Revenue trending above forecast with strong user engagement signals.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Status indicators */}
                            {[
                                { label: 'Revenue', status: 'positive' },
                                { label: 'Retention', status: 'positive' },
                                { label: 'Engagement', status: 'positive' },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-1.5">
                                    <span
                                        className="block w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: s.status === 'positive' ? '#10b981' : s.status === 'negative' ? '#ef4444' : '#f59e0b',
                                            boxShadow: s.status === 'positive'
                                                ? '0 0 6px 1px rgba(16,185,129,0.5)'
                                                : s.status === 'negative'
                                                ? '0 0 6px 1px rgba(239,68,68,0.5)'
                                                : '0 0 6px 1px rgba(245,158,11,0.5)',
                                        }}
                                    />
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-charcoal-muted font-bold">
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {data.map((metric, idx) => {
                        const colors = gradientColors[metric.label] || ['#6366f1', '#4f46e5'];
                        const sparkData = sparklineData[metric.label] || [1, 2, 3, 4, 5];
                        const ringPercent = metric.label === 'MRR Growth' ? 78 : metric.label === 'Net Promoter Score' ? 74 : 84;

                        return (
                            <div
                                key={idx}
                                className="metrics-card-entrance group relative rounded-xl overflow-hidden cursor-default"
                                style={{
                                    background: 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
                                    border: '1px solid rgba(224,224,224,0.6)',
                                    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.transform = 'translateY(-6px) scale(1.01)';
                                    el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.transform = 'translateY(0) scale(1)';
                                    el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)';
                                }}
                            >
                                {/* Gradient left accent border */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                                    style={{
                                        background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]})`,
                                        borderRadius: '3px 0 0 3px',
                                    }}
                                />

                                <div className="p-6 pl-7">
                                    {/* Header row */}
                                    <div className="flex justify-between items-start mb-5">
                                        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-charcoal-muted">
                                            {metric.label}
                                        </span>
                                        <div className="relative">
                                            <span
                                                className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:scale-110"
                                                style={{ color: colors[0], opacity: 0.6 }}
                                            >
                                                {metric.icon}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Value + Sparkline row */}
                                    <div className="flex items-end justify-between mb-4 gap-3">
                                        <div className="metrics-value-entrance">
                                            <span className="text-[40px] leading-none font-mono font-light text-charcoal tracking-tight block">
                                                {metric.value}
                                            </span>
                                            {metric.label === 'Login Frequency' && (
                                                <span className="font-mono text-sm text-charcoal-muted font-light">/day</span>
                                            )}
                                        </div>
                                        <div className="pb-1.5">
                                            <Sparkline data={sparkData} color={colors[0]} width={90} height={28} />
                                        </div>
                                    </div>

                                    {/* Delta badge + subtext + progress ring */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`
                                                    inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full
                                                    ${metric.deltaType === 'positive'
                                                        ? 'text-green-700 bg-green-50/80'
                                                        : metric.deltaType === 'negative'
                                                        ? 'text-red-700 bg-red-50/80'
                                                        : 'text-charcoal-muted bg-gray-100/80'}
                                                `}
                                                style={{
                                                    color: metric.deltaType === 'positive' ? '#059669' : metric.deltaType === 'negative' ? '#dc2626' : '#555555',
                                                    boxShadow: metric.deltaType === 'positive'
                                                        ? '0 0 8px 1px rgba(16,185,129,0.25)'
                                                        : metric.deltaType === 'negative'
                                                        ? '0 0 8px 1px rgba(239,68,68,0.25)'
                                                        : '0 0 6px 1px rgba(0,0,0,0.06)',
                                                }}
                                            >
                                                {metric.deltaType === 'positive' && '↑ '}
                                                {metric.deltaType === 'negative' && '↓ '}
                                                {metric.delta}
                                            </span>
                                            <span className="font-serif text-[11px] text-charcoal-muted italic">
                                                {metric.subtext}
                                            </span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ProgressRing percent={ringPercent} color={colors[0]} size={32} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export interface RoiItem {
    label: string;
    value: string;
    note: string;
}

// --- Section 04: ROI Tables ---
export const RoiTables = ({ investmentData, returnsData }: { investmentData: RoiItem[], returnsData: RoiItem[] }) => {
    
    // Helper to calculate totals (simplistic number parsing for demo)
    const calculateTotal = (items: RoiItem[]) => {
        // This is a visual calculation based on the string values provided
        // In a real app, you'd store numbers and format them later.
        // For this parser, we will rely on the user input or defaults.
        return null; 
    };

    return (
        <div className="space-y-12">
            <div>
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-charcoal mb-4 border-b border-border-hairline pb-2">Investment Required (CapEx)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs min-w-[500px]">
                        <tbody className="divide-y divide-border-hairline">
                            {investmentData.map((item, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-3 text-charcoal font-bold w-1/2">{item.label}</td>
                                    <td className="py-3 text-right text-charcoal-muted w-1/4">{item.value}</td>
                                    <td className="py-3 text-right text-charcoal-muted w-1/4">{item.note}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-charcoal">
                            <tr>
                                <td className="py-4 font-bold uppercase">Total Initial Outlay</td>
                                <td className="py-4 text-right font-bold text-lg">$645,000</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-charcoal mb-4 border-b border-border-hairline pb-2">Expected Returns (Value Creation)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs min-w-[500px]">
                        <tbody className="divide-y divide-border-hairline">
                             {returnsData.map((item, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-3 text-charcoal font-bold w-1/2">{item.label}</td>
                                    <td className="py-3 text-right text-charcoal-muted w-1/4">{item.value}</td>
                                    <td className={`py-3 text-right w-1/4 font-bold ${item.note.includes('+') ? 'text-green-700' : 'text-charcoal'}`}>{item.note}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-charcoal">
                            <tr>
                                <td className="py-4 font-bold uppercase">Total Projected Value</td>
                                <td className="py-4 text-right font-bold text-lg">$6.45M</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Section 05: Team Table ---
export const TeamTable = ({ data }: { data: TeamRole[] }) => {
    return (
        <div className="overflow-x-auto border border-border-hairline bg-white mb-8 shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-primary text-white border-b border-charcoal font-mono text-[9px] uppercase tracking-widest">
                    <tr>
                        <th className="py-4 px-6 font-bold border-r border-charcoal-muted/50 w-[20%]">Role / Function</th>
                        <th className="py-4 px-6 font-bold border-r border-charcoal-muted/50 w-[25%]">Phase 1 (MVP)</th>
                        <th className="py-4 px-6 font-bold border-r border-charcoal-muted/50 w-[25%]">Phase 2 (Growth)</th>
                        <th className="py-4 px-6 font-bold w-[30%]">Phase 3 (Scale)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline font-serif text-xs text-charcoal">
                    {data.map((role, idx) => (
                        <tr key={idx} className="group hover:bg-off-white/50 transition-colors">
                            <td className="px-6 py-4 border-r border-border-hairline font-bold">{role.role}</td>
                            <td className="px-6 py-4 border-r border-border-hairline text-charcoal-muted">{role.phase1}</td>
                            <td className="px-6 py-4 border-r border-border-hairline text-charcoal-muted">{role.phase2}</td>
                            <td className="px-6 py-4 text-charcoal-muted">{role.phase3}</td>
                        </tr>
                    ))}
                    <tr className="bg-off-white font-mono font-bold border-t border-charcoal">
                        <td className="px-6 py-4 border-r border-border-hairline">Est. Monthly Burn</td>
                        <td className="px-6 py-4 border-r border-border-hairline text-charcoal">$25,000</td>
                        <td className="px-6 py-4 border-r border-border-hairline text-charcoal">$85,000</td>
                        <td className="px-6 py-4 text-charcoal">$240,000</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// --- Section 06: Milestone Table ---
export const MilestoneTable = ({ data }: { data: MilestoneItem[] }) => {
    return (
        <div className="overflow-x-auto border border-border-hairline bg-white shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-off-white border-b border-border-hairline font-mono text-[9px] uppercase tracking-widest text-charcoal-muted">
                    <tr>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[10%]">Milestone</th>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[35%]">Description</th>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[15%]">Owner</th>
                        <th className="py-4 px-6 font-bold border-r border-border-hairline w-[25%]">Success Criteria</th>
                        <th className="py-4 px-6 font-bold w-[15%]">Timeline</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline font-mono text-[10px] text-charcoal-muted">
                    {data.map((ms) => (
                        <tr key={ms.id} className="group hover:bg-off-white/50 transition-colors">
                            <td className="px-6 py-3 border-r border-border-hairline font-bold text-charcoal">{ms.id}</td>
                            <td className="px-6 py-3 border-r border-border-hairline font-serif text-xs text-charcoal">{ms.description}</td>
                            <td className="px-6 py-3 border-r border-border-hairline">{ms.owner}</td>
                            <td className="px-6 py-3 border-r border-border-hairline">{ms.successCriteria}</td>
                            <td className="px-6 py-3">{ms.timeline}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Section 07: Compliance Grid ---
export const ComplianceGrid = ({ data }: { data: ComplianceItem[] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border-hairline border border-border-hairline">
            {data.map((item, idx) => (
                <div key={idx} className="bg-white p-6 hover:bg-off-white transition-colors group">
                    <span className="material-symbols-outlined text-charcoal mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <h4 className="font-mono text-xs font-bold uppercase mb-2">{item.title}</h4>
                    <p className="text-[10px] text-charcoal-muted leading-relaxed font-serif min-h-[60px]">{item.description}</p>
                    <div className="mt-4 pt-4 border-t border-border-hairline">
                        <span className={`text-[9px] font-mono uppercase font-bold
                            ${item.statusColor === 'green' ? 'text-green-700' : 
                              item.statusColor === 'orange' ? 'text-orange-600' : 
                              item.statusColor === 'red' ? 'text-red-700' : 'text-charcoal'}
                        `}>
                            Status: {item.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};