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
export const MetricsDashboard = ({ data }: { data: MetricItem[] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.map((metric, idx) => (
                <div key={idx} className="bg-white border border-border-hairline p-8 flex flex-col justify-between h-48 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal-muted">{metric.label}</span>
                        <span className="material-symbols-outlined text-charcoal text-lg opacity-50">{metric.icon}</span>
                    </div>
                    <div>
                        <span className="text-4xl font-mono font-light text-charcoal block mb-1">
                            {metric.value}
                            {metric.label === "Login Frequency" && <span className="text-lg">/day</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 border
                                ${metric.deltaType === 'positive' ? 'text-green-700 bg-green-50 border-green-100' : 
                                  metric.deltaType === 'neutral' ? 'text-charcoal bg-gray-100 border-gray-200' : 
                                  'text-red-700 bg-red-50 border-red-100'}
                            `}>
                                {metric.delta}
                            </span>
                            <span className="text-[10px] text-charcoal-muted">{metric.subtext}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
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