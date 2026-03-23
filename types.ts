export interface RiskItem {
    id: string;
    description: {
        title: string;
        subtitle: string;
    };
    likelihood: 'Low' | 'Med' | 'High';
    impact: 'Med' | 'High' | 'Critical';
    score: number;
    mitigation: string;
    contingency: string;
}

export interface MetricItem {
    label: string;
    icon: string;
    value: string;
    delta: string;
    deltaType: 'positive' | 'negative' | 'neutral';
    subtext: string;
}

export interface MilestoneItem {
    id: string;
    description: string;
    owner: string;
    successCriteria: string;
    timeline: string;
}

export interface TeamRole {
    role: string;
    phase1: string;
    phase2: string;
    phase3: string;
}

export interface ComplianceItem {
    icon: string;
    title: string;
    description: string;
    status: string;
    statusColor: 'green' | 'orange' | 'red' | 'gray';
}

// Stitch API types
export type StitchDeviceType = 'MOBILE' | 'DESKTOP' | 'TABLET' | 'AGNOSTIC';
export type StitchModelId = 'GEMINI_3_PRO' | 'GEMINI_3_FLASH';

export interface StitchGenerateResult {
    sessionId: string;
    screenId: string;
    projectId: string;
    html: string;
    imageUrl: string;
}

export interface StitchProject {
    id: string;
    data: {
        name: string;
        title?: string;
        createTime: string;
        updateTime: string;
    };
}