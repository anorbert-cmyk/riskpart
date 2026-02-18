import { RiskItem, MetricItem, MilestoneItem, TeamRole, ComplianceItem } from './types';

export const riskData: RiskItem[] = [
    {
        id: "R-01",
        description: { title: "Model Hallucination in FinTech", subtitle: "Generative output provides incorrect financial advice or data." },
        likelihood: "Med",
        impact: "Critical",
        score: 85,
        mitigation: "RAG with strict citation requirements. Human-in-the-loop for high-stakes outputs.",
        contingency: "Legal disclaimer modal + Insurance."
    },
    {
        id: "R-02",
        description: { title: "API Dependency Costs", subtitle: "Token costs scaling non-linearly with user growth." },
        likelihood: "High",
        impact: "High",
        score: 72,
        mitigation: "Proprietary SLM for routine tasks. Cache frequent queries.",
        contingency: "Tiered pricing model adjustment."
    },
    {
        id: "R-03",
        description: { title: "Regulatory Non-Compliance", subtitle: "EU AI Act transparency violations." },
        likelihood: "Low",
        impact: "Critical",
        score: 45,
        mitigation: "Maintain \"Model Cards\" & audit logs. Fractional compliance officer.",
        contingency: "Geo-fencing specific features."
    },
    {
        id: "R-04",
        description: { title: "Data Privacy Leakage", subtitle: "User proprietary data leaking into training sets." },
        likelihood: "Low",
        impact: "Critical",
        score: 20,
        mitigation: "Zero-retention policy enterprise agreements. Local vector stores.",
        contingency: "Immediate breach protocol."
    },
    {
        id: "R-05",
        description: { title: "Vendor Lock-in", subtitle: "Over-reliance on a single LLM provider (e.g., OpenAI)." },
        likelihood: "High",
        impact: "Med",
        score: 60,
        mitigation: "LLM-agnostic architecture layer (LangChain abstraction).",
        contingency: "Rapid hot-swap to Anthropic/Llama."
    },
    {
        id: "R-06",
        description: { title: "Talent Acquisition Failure", subtitle: "Inability to hire specialized AI/ML engineers within budget." },
        likelihood: "Med",
        impact: "High",
        score: 65,
        mitigation: "Remote-first policy to tap global talent pool. High equity comp.",
        contingency: "Contract agencies as bridge."
    },
    {
        id: "R-07",
        description: { title: "UI/UX Complexity", subtitle: "Users overwhelmed by advanced dashboard features." },
        likelihood: "Med",
        impact: "Med",
        score: 40,
        mitigation: "Progressive disclosure design. Detailed onboarding academy.",
        contingency: "Simplify to \"Lite\" mode default."
    },
    {
        id: "R-08",
        description: { title: "Infrastructure Latency", subtitle: "Real-time analysis exceeding 300ms threshold." },
        likelihood: "Low",
        impact: "Med",
        score: 30,
        mitigation: "Edge computing deployment. WebAssembly for client-side processing.",
        contingency: "Async processing notification system."
    },
    {
        id: "R-09",
        description: { title: "Competitor Feature Parity", subtitle: "Incumbents (Salesforce/HubSpot) cloning core AI features." },
        likelihood: "High",
        impact: "High",
        score: 80,
        mitigation: "Deep vertical specialization in FinTech/Legal. Proprietary data moat.",
        contingency: "Pivot to \"API-first\" integration partner."
    },
    {
        id: "R-10",
        description: { title: "Series A Funding Gap", subtitle: "Failure to hit ARR targets before runway ends." },
        likelihood: "Med",
        impact: "Critical",
        score: 90,
        mitigation: "Maintain 18-month runway buffer. Aggressive sales targets.",
        contingency: "Venture debt or bridge round."
    }
];

export const metricsData: MetricItem[] = [
    {
        label: "MRR Growth",
        icon: "trending_up",
        value: "$142k",
        delta: "+22.4%",
        deltaType: "positive",
        subtext: "vs last month"
    },
    {
        label: "Net Promoter Score",
        icon: "sentiment_satisfied",
        value: "74",
        delta: "Excellent",
        deltaType: "neutral",
        subtext: "Industry avg: 42"
    },
    {
        label: "Login Frequency",
        icon: "schedule",
        value: "4.2",
        delta: "+0.8",
        deltaType: "positive",
        subtext: "User stickiness high"
    }
];

export const teamRoles: TeamRole[] = [
    { role: "AI Engineering Lead", phase1: "40h/wk (Founder)", phase2: "40h/wk (Hire #1)", phase3: "VP of Engineering + 2 Leads" },
    { role: "Full-Stack Dev", phase1: "60h/wk (Contract)", phase2: "80h/wk (2 FTE)", phase3: "Scrum Team (5 FTE)" },
    { role: "Product & Design", phase1: "20h/wk (Founder)", phase2: "40h/wk (Hire #2)", phase3: "Head of Product + 2 Designers" },
    { role: "GTM / Sales", phase1: "Founder-led", phase2: "Founder + 1 SDR", phase3: "VP Sales + 4 AEs" },
];

export const milestones: MilestoneItem[] = [
    { id: "M1 - M3", description: "Pre-Seed Foundation & Architecture", owner: "CTO", successCriteria: "Core Vector DB operational.", timeline: "Q1 2024" },
    { id: "M4 - M8", description: "Alpha Release (Closed Beta)", owner: "Product Lead", successCriteria: "10 Design Partners onboarded.", timeline: "Q2 2024" },
    { id: "M9 - M12", description: "Public Beta & SOC2 Audit", owner: "Ops & Security", successCriteria: "Type 1 Report issued. 500 active users.", timeline: "Q3 2024" },
    { id: "M13 - M15", description: "Series A Fundraising", owner: "CEO", successCriteria: "$1.5M ARR run-rate achieved.", timeline: "Q4 2024" },
    { id: "M16 - M17", description: "International Expansion (EMEA)", owner: "VP Sales", successCriteria: "GDPR full compliance. EU Server loc.", timeline: "Q1 2025" }
];

export const complianceItems: ComplianceItem[] = [
    { icon: "gavel", title: "GDPR Article 22", description: "Automated individual decision-making, including profiling. Requires explicit user consent and 'right to explanation'.", status: "Compliant", statusColor: "green" },
    { icon: "security", title: "SOC2 Type II", description: "Auditing procedure that ensures service providers securely manage your data to protect the interests of your organization.", status: "In Progress (85%)", statusColor: "orange" },
    { icon: "policy", title: "CCPA / CPRA", description: "California Consumer Privacy Act. Gives consumers more control over the personal information that businesses collect.", status: "Compliant", statusColor: "green" },
    { icon: "copyright", title: "IP Indemnification", description: "Protection against claims that the generated content infringes on third-party intellectual property rights.", status: "Under Review", statusColor: "gray" },
];

export const roiProjections = {
    year1: 820,
    year3: 1020
};