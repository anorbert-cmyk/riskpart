import { RiskItem, MetricItem, MilestoneItem, TeamRole, ComplianceItem } from '../types';
import { RoiItem } from '../components/DashboardModules';
import { parseNativeText } from './heuristicParser';

export interface AssumptionItem {
    id: string;
    title: string;
    content: string;
}

export interface ParsedDossierData {
    risks: RiskItem[];
    metrics: MetricItem[];
    assumptions: AssumptionItem[];
    assumptionWarning: string;
    roiInvestment: RoiItem[];
    roiReturns: RoiItem[];
    team: TeamRole[];
    milestones: MilestoneItem[];
    compliance: ComplianceItem[];
    roiProjections: { year1: number, year3: number };
}

export const defaultDossierData: ParsedDossierData = {
    risks: [],
    metrics: [],
    assumptions: [],
    assumptionWarning: '',
    roiInvestment: [],
    roiReturns: [],
    team: [],
    milestones: [],
    compliance: [],
    roiProjections: { year1: 0, year3: 0 }
};

/**
 * Auto-detect: if the text contains `### ` section headers → structured parser.
 * Otherwise → heuristic keyword-scoring parser (no AI/API needed).
 */
const MAX_INPUT_BYTES = 512_000; // 512 KB hard limit — must match heuristicParser

export const parseDossierText = (text: string): ParsedDossierData => {
    if (!text.trim()) return { ...defaultDossierData };
    if (text.length > MAX_INPUT_BYTES) {
        throw new Error(`Input exceeds maximum allowed size (${MAX_INPUT_BYTES} bytes). Truncate your document and try again.`);
    }

    // Auto-detect: structured format uses "### SECTION" headers
    const hasStructuredHeaders = /^### /m.test(text);
    if (!hasStructuredHeaders) {
        return parseNativeText(text);
    }

    // ─── Structured parser (original logic) ────────────────────
    const lines = text.split('\n');
    let currentSection = '';
    const result: ParsedDossierData = {
        risks: [],
        metrics: [],
        assumptions: [],
        assumptionWarning: '',
        roiInvestment: [],
        roiReturns: [],
        team: [],
        milestones: [],
        compliance: [],
        roiProjections: { year1: 0, year3: 0 },
    };

    // Helper to clean cell data
    const c = (s: string) => s?.trim() || '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect Headers
        if (line.startsWith('### RISK MATRIX')) { currentSection = 'RISK'; continue; }
        if (line.startsWith('### METRICS')) { currentSection = 'METRICS'; continue; }
        if (line.startsWith('### ASSUMPTIONS')) { currentSection = 'ASSUMPTIONS'; continue; }
        if (line.startsWith('### ROI CAPEX')) { currentSection = 'ROI_CAPEX'; continue; }
        if (line.startsWith('### ROI RETURNS')) { currentSection = 'ROI_RETURNS'; continue; }
        if (line.startsWith('### ROI PROJECTIONS')) { currentSection = 'ROI_PROJECTIONS'; continue; }
        if (line.startsWith('### TEAM')) { currentSection = 'TEAM'; continue; }
        if (line.startsWith('### MILESTONES')) { currentSection = 'MILESTONES'; continue; }
        if (line.startsWith('### COMPLIANCE')) { currentSection = 'COMPLIANCE'; continue; }

        // Parse Section Data
        const parts = line.split('|').map(c);

        switch (currentSection) {
            case 'RISK':
                if (parts.length >= 7) {
                    result.risks.push({
                        id: parts[0],
                        description: { title: parts[1], subtitle: parts[2] },
                        likelihood: parts[3] as any,
                        impact: parts[4] as any,
                        score: parseInt(parts[5]) || 0,
                        mitigation: parts[6],
                        contingency: parts[7] || ''
                    });
                }
                break;
            case 'METRICS':
                if (parts.length >= 5) {
                    result.metrics.push({
                        label: parts[0],
                        icon: parts[1],
                        value: parts[2],
                        delta: parts[3],
                        deltaType: parts[4] as any,
                        subtext: parts[5] || ''
                    });
                }
                break;
            case 'ASSUMPTIONS':
                if (line.startsWith('WARNING:')) {
                    result.assumptionWarning = line.replace('WARNING:', '').trim();
                } else {
                    // Try to parse "ID: Title - Content"
                    const firstColon = line.indexOf(':');
                    const firstDash = line.indexOf('-');
                    
                    if (firstColon > -1 && firstDash > firstColon) {
                        result.assumptions.push({
                            id: line.substring(0, firstColon).trim(),
                            title: line.substring(firstColon + 1, firstDash).trim(),
                            content: line.substring(firstDash + 1).trim()
                        });
                    } else {
                        // Fallback if formatting is missing
                        result.assumptions.push({
                            id: `A${result.assumptions.length + 1}`,
                            title: 'Assumption',
                            content: line
                        });
                    }
                }
                break;
            case 'ROI_CAPEX':
                if (parts.length >= 3) {
                    result.roiInvestment.push({
                        label: parts[0],
                        value: parts[1],
                        note: parts[2]
                    });
                }
                break;
            case 'ROI_RETURNS':
                if (parts.length >= 3) {
                    result.roiReturns.push({
                        label: parts[0],
                        value: parts[1],
                        note: parts[2]
                    });
                }
                break;
            case 'ROI_PROJECTIONS':
                if (parts.length >= 2) {
                   result.roiProjections.year1 = parseInt(parts[0]) || 820;
                   result.roiProjections.year3 = parseInt(parts[1]) || 1020;
                }
                break;
            case 'TEAM':
                if (parts.length >= 4) {
                    result.team.push({
                        role: parts[0],
                        phase1: parts[1],
                        phase2: parts[2],
                        phase3: parts[3]
                    });
                }
                break;
            case 'MILESTONES':
                if (parts.length >= 5) {
                    result.milestones.push({
                        id: parts[0],
                        description: parts[1],
                        owner: parts[2],
                        successCriteria: parts[3],
                        timeline: parts[4]
                    });
                }
                break;
            case 'COMPLIANCE':
                if (parts.length >= 5) {
                    result.compliance.push({
                        icon: parts[0],
                        title: parts[1],
                        description: parts[2],
                        status: parts[3],
                        statusColor: parts[4] as any
                    });
                }
                break;
        }
    }
    return result;
};


export const generateDefaultRawText = () => {
    return `### RISK MATRIX
R-01 | Model Hallucination in FinTech | Generative output provides incorrect financial advice or data. | Med | Critical | 85 | RAG with strict citation requirements. Human-in-the-loop for high-stakes outputs. | Legal disclaimer modal + Insurance.
R-02 | API Dependency Costs | Token costs scaling non-linearly with user growth. | High | High | 72 | Proprietary SLM for routine tasks. Cache frequent queries. | Tiered pricing model adjustment.
R-03 | Regulatory Non-Compliance | EU AI Act transparency violations. | Low | Critical | 45 | Maintain "Model Cards" & audit logs. Fractional compliance officer. | Geo-fencing specific features.
R-04 | Data Privacy Leakage | User proprietary data leaking into training sets. | Low | Critical | 20 | Zero-retention policy enterprise agreements. Local vector stores. | Immediate breach protocol.
R-05 | Vendor Lock-in | Over-reliance on a single LLM provider (e.g., OpenAI). | High | Med | 60 | LLM-agnostic architecture layer (LangChain abstraction). | Rapid hot-swap to Anthropic/Llama.
R-06 | Talent Acquisition Failure | Inability to hire specialized AI/ML engineers within budget. | Med | High | 65 | Remote-first policy to tap global talent pool. High equity comp. | Contract agencies as bridge.
R-07 | UI/UX Complexity | Users overwhelmed by advanced dashboard features. | Med | Med | 40 | Progressive disclosure design. Detailed onboarding academy. | Simplify to "Lite" mode default.
R-08 | Infrastructure Latency | Real-time analysis exceeding 300ms threshold. | Low | Med | 30 | Edge computing deployment. WebAssembly for client-side processing. | Async processing notification system.
R-09 | Competitor Feature Parity | Incumbents (Salesforce/HubSpot) cloning core AI features. | High | High | 80 | Deep vertical specialization in FinTech/Legal. Proprietary data moat. | Pivot to "API-first" integration partner.
R-10 | Series A Funding Gap | Failure to hit ARR targets before runway ends. | Med | Critical | 90 | Maintain 18-month runway buffer. Aggressive sales targets. | Venture debt or bridge round.

### METRICS
MRR Growth | trending_up | $142k | +22.4% | positive | vs last month
Net Promoter Score | sentiment_satisfied | 74 | Excellent | neutral | Industry avg: 42
Login Frequency | schedule | 4.2 | +0.8 | positive | User stickiness high

### ASSUMPTIONS
A1: AI Visibility Horizon - The core thesis assumes that LLM commoditization will not accelerate to the point where foundational models (GPT-5, Claude 4) offer native, zero-shot capabilities that render our specialized fine-tuning obsolete within 24 months. We assume a "Last Mile" problem will persist in FinTech and Legal verticals, necessitating our middleware layer for compliance and context injection.
A2: Pricing Power Durability - We assume enterprise clients will continue to pay a premium (>30% vs generic tools) for data residency guarantees and auditable logic trails. If the market shifts entirely to a "race to the bottom" on token pricing, our margin structure will need immediate revision. Our model relies on value-based pricing, not cost-plus.
A3: The Dashboard Moat - We postulate that the UX/UI wrapper—specifically the "Success Metrics Dashboard"—provides stickiness beyond the underlying AI generation. If users bypass the dashboard to consume our API headlessly at scale, we lose the opportunity to cross-sell visualization features, reducing LTV by an estimated 40%.
WARNING: If any of these three pillars collapse, the Series A valuation target of $40M pre-money becomes mathematically indefensible.

### ROI PROJECTIONS
820 | 1020

### ROI CAPEX
Infrastructure Overhaul (GPU Cluster) | $120,000 | One-time
Security Audit & Compliance (SOC2) | $45,000 | Annual
Senior AI Engineer Headcount (x2) | $480,000 | Annual

### ROI RETURNS
Operational Efficiency (Headcount Reduc.) | $2.4M | +300%
Churn Reduction (Retention) | $850k | +12%
New Market Penetration (Enterprise) | $3.2M | New

### TEAM
AI Engineering Lead | 40h/wk (Founder) | 40h/wk (Hire #1) | VP of Engineering + 2 Leads
Full-Stack Dev | 60h/wk (Contract) | 80h/wk (2 FTE) | Scrum Team (5 FTE)
Product & Design | 20h/wk (Founder) | 40h/wk (Hire #2) | Head of Product + 2 Designers
GTM / Sales | Founder-led | Founder + 1 SDR | VP Sales + 4 AEs

### MILESTONES
M1 - M3 | Pre-Seed Foundation & Architecture | CTO | Core Vector DB operational. | Q1 2024
M4 - M8 | Alpha Release (Closed Beta) | Product Lead | 10 Design Partners onboarded. | Q2 2024
M9 - M12 | Public Beta & SOC2 Audit | Ops & Security | Type 1 Report issued. 500 active users. | Q3 2024
M13 - M15 | Series A Fundraising | CEO | $1.5M ARR run-rate achieved. | Q4 2024
M16 - M17 | International Expansion (EMEA) | VP Sales | GDPR full compliance. EU Server loc. | Q1 2025

### COMPLIANCE
gavel | GDPR Article 22 | Automated individual decision-making, including profiling. Requires explicit user consent. | Compliant | green
security | SOC2 Type II | Auditing procedure that ensures service providers securely manage your data. | In Progress (85%) | orange
policy | CCPA / CPRA | California Consumer Privacy Act. Gives consumers more control over personal info. | Compliant | green
copyright | IP Indemnification | Protection against claims that the generated content infringes on third-party IP rights. | Under Review | gray`;
}