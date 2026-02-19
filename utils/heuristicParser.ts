import { RiskItem, MetricItem, MilestoneItem, TeamRole, ComplianceItem } from '../types';
import { RoiItem } from '../components/DashboardModules';
import { ParsedDossierData, AssumptionItem, defaultDossierData } from './dossierParser';

// ─── Keyword Dictionaries ───────────────────────────────────────────────────

type SectionKey = 'RISK' | 'METRICS' | 'ASSUMPTIONS' | 'ROI_CAPEX' | 'ROI_RETURNS' | 'TEAM' | 'MILESTONES' | 'COMPLIANCE';

interface KeywordEntry {
    /** Exact or partial word match (case-insensitive) */
    word?: string;
    /** Regex match against the full paragraph */
    regex?: RegExp;
    /** Weight multiplier (default 1) */
    weight: number;
}

interface SectionDictionary {
    keywords: KeywordEntry[];
    /** Words that reduce the score when present (avoid false positives) */
    antiKeywords?: string[];
}

const DICTIONARIES: Record<SectionKey, SectionDictionary> = {
    RISK: {
        keywords: [
            { word: 'risk', weight: 2 },
            { word: 'threat', weight: 1.5 },
            { word: 'vulnerability', weight: 1.5 },
            { word: 'likelihood', weight: 2 },
            { word: 'impact', weight: 1.5 },
            { word: 'mitigation', weight: 2 },
            { word: 'contingency', weight: 2 },
            { word: 'hazard', weight: 1.5 },
            { word: 'exposure', weight: 1 },
            { word: 'probability', weight: 1 },
            { word: 'severity', weight: 1.5 },
            { regex: /\bR-?\d+\b/i, weight: 3 },
            { regex: /\b(low|med|high|critical)\s+(risk|impact|likelihood)\b/i, weight: 2 },
        ],
        antiKeywords: ['return', 'revenue', 'roi', 'milestone'],
    },
    METRICS: {
        keywords: [
            { word: 'MRR', weight: 3 },
            { word: 'ARR', weight: 3 },
            { word: 'NPS', weight: 3 },
            { word: 'KPI', weight: 2.5 },
            { word: 'churn', weight: 2 },
            { word: 'retention', weight: 1.5 },
            { word: 'growth', weight: 1 },
            { word: 'conversion', weight: 1.5 },
            { word: 'metric', weight: 2 },
            { word: 'dashboard', weight: 1 },
            { word: 'benchmark', weight: 1 },
            { regex: /\$\d+[km]?\b/i, weight: 2 },
            { regex: /[+-]\d+(\.\d+)?%/, weight: 2.5 },
            { regex: /\b\d+(\.\d+)?%\b/, weight: 1 },
        ],
        antiKeywords: ['compliance', 'regulation', 'milestone', 'hire'],
    },
    ASSUMPTIONS: {
        keywords: [
            { word: 'assume', weight: 2.5 },
            { word: 'assumption', weight: 3 },
            { word: 'hypothesis', weight: 2.5 },
            { word: 'thesis', weight: 2 },
            { word: 'postulate', weight: 2.5 },
            { word: 'believe', weight: 1.5 },
            { word: 'presume', weight: 2 },
            { regex: /\bwe (assume|believe|expect|hypothesize)\b/i, weight: 3 },
            { regex: /\bif\s+.{5,50}\s+then\b/i, weight: 2 },
            { regex: /\bmust hold\b/i, weight: 3 },
            { regex: /\bA\d+:/i, weight: 3 },
        ],
        antiKeywords: ['milestone', 'hire', 'capex', 'investment'],
    },
    ROI_CAPEX: {
        keywords: [
            { word: 'investment', weight: 2 },
            { word: 'capex', weight: 3 },
            { word: 'cost', weight: 1.5 },
            { word: 'infrastructure', weight: 1.5 },
            { word: 'budget', weight: 2 },
            { word: 'expense', weight: 2 },
            { word: 'headcount', weight: 1.5 },
            { word: 'audit cost', weight: 2 },
            { word: 'overhead', weight: 1.5 },
            { word: 'procurement', weight: 1.5 },
            { regex: /\$\d[\d,]*\b/, weight: 1.5 },
            { regex: /\b(one-time|annual|monthly)\b/i, weight: 2 },
        ],
        antiKeywords: ['return', 'revenue', 'savings', 'efficiency', 'gain'],
    },
    ROI_RETURNS: {
        keywords: [
            { word: 'return', weight: 2 },
            { word: 'ROI', weight: 3 },
            { word: 'efficiency', weight: 2 },
            { word: 'savings', weight: 2.5 },
            { word: 'revenue gain', weight: 2.5 },
            { word: 'value creation', weight: 2 },
            { word: 'penetration', weight: 1.5 },
            { word: 'reduction', weight: 1.5 },
            { word: 'profit', weight: 2 },
            { regex: /\+\d+%/, weight: 2.5 },
            { regex: /\$\d[\d,.]*[mk]\b/i, weight: 2 },
        ],
        antiKeywords: ['cost', 'expense', 'capex', 'budget', 'invest'],
    },
    TEAM: {
        keywords: [
            { word: 'engineer', weight: 2 },
            { word: 'developer', weight: 2 },
            { word: 'designer', weight: 2 },
            { word: 'sales', weight: 1.5 },
            { word: 'founder', weight: 1.5 },
            { word: 'hire', weight: 2 },
            { word: 'FTE', weight: 3 },
            { word: 'contractor', weight: 2 },
            { word: 'scaling', weight: 1 },
            { word: 'headcount', weight: 2 },
            { word: 'team', weight: 1.5 },
            { word: 'role', weight: 1.5 },
            { word: 'phase', weight: 1.5 },
            { regex: /\b\d+h\/wk\b/i, weight: 3 },
            { regex: /\b(VP|CTO|CEO|COO|CPO|lead)\b/i, weight: 1.5 },
        ],
        antiKeywords: ['risk', 'compliance', 'milestone', 'assumption'],
    },
    MILESTONES: {
        keywords: [
            { word: 'milestone', weight: 3 },
            { word: 'deliverable', weight: 2 },
            { word: 'timeline', weight: 2 },
            { word: 'deadline', weight: 2 },
            { word: 'launch', weight: 1.5 },
            { word: 'beta', weight: 1.5 },
            { word: 'alpha', weight: 1.5 },
            { word: 'fundraising', weight: 1 },
            { word: 'phase', weight: 1 },
            { regex: /\bQ[1-4]\s*\d{4}\b/i, weight: 3 },
            { regex: /\bM\d+\b/, weight: 3 },
            { regex: /\b(Q[1-4]|quarter)\b/i, weight: 2 },
        ],
        antiKeywords: ['assumption', 'compliance', 'roi'],
    },
    COMPLIANCE: {
        keywords: [
            { word: 'GDPR', weight: 3 },
            { word: 'SOC2', weight: 3 },
            { word: 'CCPA', weight: 3 },
            { word: 'compliance', weight: 2.5 },
            { word: 'regulation', weight: 2 },
            { word: 'audit', weight: 1.5 },
            { word: 'legal', weight: 1.5 },
            { word: 'indemnification', weight: 2 },
            { word: 'privacy', weight: 1.5 },
            { word: 'AI Act', weight: 3 },
            { word: 'CPRA', weight: 3 },
            { word: 'HIPAA', weight: 3 },
            { regex: /\b(compliant|in progress|under review)\b/i, weight: 2.5 },
            { regex: /\b(article|section)\s+\d+\b/i, weight: 2 },
        ],
        antiKeywords: ['assumption', 'milestone', 'team', 'roi'],
    },
};

const SECTION_KEYS: SectionKey[] = ['RISK', 'METRICS', 'ASSUMPTIONS', 'ROI_CAPEX', 'ROI_RETURNS', 'TEAM', 'MILESTONES', 'COMPLIANCE'];

// Confidence threshold — paragraph must score above this to be assigned
const CONFIDENCE_THRESHOLD = 0.3;

// ─── Scoring Engine ─────────────────────────────────────────────────────────

function scoreParagraph(text: string, dict: SectionDictionary): number {
    const lower = text.toLowerCase();
    const wordCount = text.split(/\s+/).length || 1;
    let score = 0;

    for (const entry of dict.keywords) {
        if (entry.word) {
            // Count occurrences of the keyword (case-insensitive, word-boundary aware)
            // Multi-word phrases: use \b only on word-character edges (not on spaces)
            const escaped = entry.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = escaped.includes(' ')
                ? `\\b${escaped.replace(/ /g, '\\b\\s+\\b')}\\b`
                : `\\b${escaped}\\b`;
            const matches = lower.match(new RegExp(pattern, 'gi'));
            if (matches) {
                score += matches.length * entry.weight;
            }
        }
        if (entry.regex) {
            // Build flags: preserve existing flags, ensure 'g' is present, deduplicate
            const baseFlags = entry.regex.flags.replace(/g/g, '');
            const matches = text.match(new RegExp(entry.regex.source, baseFlags + 'g'));
            if (matches) {
                score += matches.length * entry.weight;
            }
        }
    }

    // Apply anti-keyword penalty
    if (dict.antiKeywords) {
        for (const anti of dict.antiKeywords) {
            const escaped = anti.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = escaped.includes(' ')
                ? `\\b${escaped.replace(/ /g, '\\b\\s+\\b')}\\b`
                : `\\b${escaped}\\b`;
            const matches = lower.match(new RegExp(pattern, 'gi'));
            if (matches) {
                score -= matches.length * 0.5;
            }
        }
    }

    // Normalize by word count (longer paragraphs shouldn't dominate just by length)
    return Math.max(0, score / Math.sqrt(wordCount));
}

function classifyParagraph(text: string): { section: SectionKey | null; confidence: number } {
    let bestSection: SectionKey | null = null;
    let bestScore = 0;

    for (const key of SECTION_KEYS) {
        const s = scoreParagraph(text, DICTIONARIES[key]);
        if (s > bestScore) {
            bestScore = s;
            bestSection = key;
        }
    }

    return {
        section: bestScore >= CONFIDENCE_THRESHOLD ? bestSection : null,
        confidence: bestScore,
    };
}

// ─── Field Extraction ───────────────────────────────────────────────────────

function extractRisks(paragraphs: string[]): RiskItem[] {
    const risks: RiskItem[] = [];

    for (const para of paragraphs) {
        const sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        const title = sentences[0]?.trim() || 'Untitled Risk';
        const subtitle = sentences[1]?.trim() || '';

        // Extract structured fields via regex
        const likelihoodMatch = para.match(/\b(likelihood|probability)\s*[:=]?\s*(low|med|medium|high)\b/i);
        const impactMatch = para.match(/\b(impact|severity)\s*[:=]?\s*(med|medium|high|critical)\b/i);
        const scoreMatch = para.match(/\b(score|rating)\s*[:=]?\s*(\d+)\b/i);
        const mitigationMatch = para.match(/\b(mitigation|mitigate)\s*[:=]?\s*(.+?)(?:\.|$)/im);
        const contingencyMatch = para.match(/\b(contingency|fallback)\s*[:=]?\s*(.+?)(?:\.|$)/im);

        const normalizeLikelihood = (s?: string): 'Low' | 'Med' | 'High' => {
            if (!s) return 'Med';
            const l = s.toLowerCase();
            if (l === 'low') return 'Low';
            if (l === 'high') return 'High';
            return 'Med';
        };

        const normalizeImpact = (s?: string): 'Med' | 'High' | 'Critical' => {
            if (!s) return 'High';
            const l = s.toLowerCase();
            if (l === 'critical') return 'Critical';
            if (l === 'med' || l === 'medium') return 'Med';
            return 'High';
        };

        risks.push({
            id: `R-${String(risks.length + 1).padStart(2, '0')}`,
            description: {
                title: title.length > 120 ? title.slice(0, 117) + '...' : title,
                subtitle: subtitle.length > 200 ? subtitle.slice(0, 197) + '...' : subtitle,
            },
            likelihood: normalizeLikelihood(likelihoodMatch?.[2]),
            impact: normalizeImpact(impactMatch?.[2]),
            score: scoreMatch ? (parseInt(scoreMatch[2]) || 50) : 50,
            mitigation: mitigationMatch?.[2]?.trim() || 'To be determined.',
            contingency: contingencyMatch?.[2]?.trim() || '',
        });
    }

    return risks;
}

function extractMetrics(paragraphs: string[]): MetricItem[] {
    const metrics: MetricItem[] = [];

    for (const para of paragraphs) {
        // Strategy: find all $ or % values and extract context around them
        const lines = para.split(/\n/).filter(l => l.trim());

        for (const line of lines) {
            // Pattern: "$142k" or "22.4%" or similar
            const valueMatch = line.match(/(\$[\d,.]+[kmb]?)\b/i) || line.match(/\b([\d,.]+%)\b/);
            if (valueMatch) {
                // Label = text before the value
                const idx = line.indexOf(valueMatch[0]);
                const label = line.slice(0, idx).replace(/[:\-|,]+$/, '').trim() || 'Metric';

                // Try to find a delta (e.g., +22.4%)
                const deltaMatch = line.match(/([+-]\d+(?:\.\d+)?%)/);
                const delta = deltaMatch ? deltaMatch[1] : '';
                const deltaType: 'positive' | 'negative' | 'neutral' =
                    delta.startsWith('+') ? 'positive' : delta.startsWith('-') ? 'negative' : 'neutral';

                metrics.push({
                    label: label || `Metric ${metrics.length + 1}`,
                    icon: 'analytics',
                    value: valueMatch[0],
                    delta,
                    deltaType,
                    subtext: '',
                });
            }
        }
    }

    // Deduplicate by label+value
    const seen = new Set<string>();
    return metrics.filter(m => {
        const key = `${m.label}|${m.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function extractAssumptions(paragraphs: string[]): { items: AssumptionItem[]; warning: string } {
    const items: AssumptionItem[] = [];
    let warning = '';

    for (const para of paragraphs) {
        // Check for WARNING pattern
        const warningMatch = para.match(/\bWARNING\s*:\s*(.+)/i);
        if (warningMatch) {
            warning = warningMatch[1].trim();
        }

        // Check for "A1:" style prefix
        const prefixMatch = para.match(/^(A\d+)\s*:\s*(.+)/i);
        if (prefixMatch) {
            const id = prefixMatch[1].toUpperCase();
            const rest = prefixMatch[2];
            const dashIdx = rest.indexOf(' - ');
            const title = dashIdx > -1 ? rest.slice(0, dashIdx).trim() : 'Assumption';
            const content = dashIdx > -1 ? rest.slice(dashIdx + 3).trim() : rest.trim();

            items.push({ id, title, content });
        } else if (!warningMatch && para.trim()) {
            // Entire paragraph = one assumption
            const sentences = para.split(/(?<=[.!?])\s+/).filter(s => s.trim());
            items.push({
                id: `A${items.length + 1}`,
                title: sentences[0]?.slice(0, 60)?.trim() || 'Assumption',
                content: para.trim(),
            });
        }
    }

    return { items, warning };
}

function extractRoiItems(paragraphs: string[]): RoiItem[] {
    const items: RoiItem[] = [];

    for (const para of paragraphs) {
        const lines = para.split(/\n/).filter(l => l.trim());
        for (const line of lines) {
            const moneyMatch = line.match(/(\$[\d,.]+[kmb]?)\b/i);
            if (moneyMatch) {
                const idx = line.indexOf(moneyMatch[0]);
                const label = line.slice(0, idx).replace(/[:\-|,]+$/, '').trim() || 'Item';
                const afterValue = line.slice(idx + moneyMatch[0].length).trim();
                // Note could be a percentage or description
                const note = afterValue.replace(/^[|\-,:\s]+/, '').trim();

                items.push({
                    label,
                    value: moneyMatch[0],
                    note: note || '',
                });
            }
        }
    }

    return items;
}

function extractTeam(paragraphs: string[]): TeamRole[] {
    const roles: TeamRole[] = [];
    const rolePatterns = /\b(engineer|developer|designer|product|sales|marketing|founder|cto|ceo|coo|lead|manager|analyst|ops|devops|qa|tester)\b/i;

    for (const para of paragraphs) {
        const lines = para.split(/\n/).filter(l => l.trim());
        for (const line of lines) {
            if (rolePatterns.test(line)) {
                // Try pipe-split first
                const parts = line.split('|').map(s => s.trim()).filter(Boolean);
                if (parts.length >= 2) {
                    roles.push({
                        role: parts[0],
                        phase1: parts[1] || '',
                        phase2: parts[2] || '',
                        phase3: parts[3] || '',
                    });
                } else {
                    // Single-line role description
                    roles.push({
                        role: line.trim(),
                        phase1: 'Current',
                        phase2: '',
                        phase3: '',
                    });
                }
            }
        }
    }

    return roles;
}

function extractMilestones(paragraphs: string[]): MilestoneItem[] {
    const milestones: MilestoneItem[] = [];

    for (const para of paragraphs) {
        const lines = para.split(/\n/).filter(l => l.trim());
        for (const line of lines) {
            // Pattern: "M1" or "Q1 2024" style
            const mMatch = line.match(/\b(M\d+(?:\s*-\s*M\d+)?)\b/);
            const qMatch = line.match(/\b(Q[1-4]\s*\d{4})\b/i);

            if (mMatch || qMatch) {
                const parts = line.split('|').map(s => s.trim()).filter(Boolean);
                if (parts.length >= 3) {
                    milestones.push({
                        id: parts[0],
                        description: parts[1],
                        owner: parts[2],
                        successCriteria: parts[3] || '',
                        timeline: parts[4] || qMatch?.[1] || '',
                    });
                } else {
                    milestones.push({
                        id: mMatch?.[1] || `M${milestones.length + 1}`,
                        description: line.replace(mMatch?.[0] || '', '').replace(qMatch?.[0] || '', '').trim(),
                        owner: 'TBD',
                        successCriteria: '',
                        timeline: qMatch?.[1] || '',
                    });
                }
            }
        }
    }

    return milestones;
}

function extractCompliance(paragraphs: string[]): ComplianceItem[] {
    const items: ComplianceItem[] = [];
    const standardPatterns = /\b(GDPR|SOC\s?2|CCPA|CPRA|HIPAA|AI Act|PCI[- ]DSS|ISO\s?\d+|FedRAMP)\b/i;

    for (const para of paragraphs) {
        const match = para.match(standardPatterns);
        if (!match) continue;

        const title = match[0];
        // Status extraction
        const statusMatch = para.match(/\b(compliant|in progress|under review|non-compliant|pending|certified)\b/i);
        const status = statusMatch ? statusMatch[0] : 'Under Review';

        const statusLower = status.toLowerCase();
        const statusColor: 'green' | 'orange' | 'red' | 'gray' =
            statusLower === 'compliant' || statusLower === 'certified' ? 'green' :
            statusLower.includes('progress') ? 'orange' :
            statusLower === 'non-compliant' ? 'red' : 'gray';

        // Icon mapping
        const icon = title.toLowerCase().includes('soc') ? 'security' :
            title.toLowerCase().includes('gdpr') ? 'gavel' :
            title.toLowerCase().includes('ip') || title.toLowerCase().includes('indemnif') ? 'copyright' : 'policy';

        // Description = the paragraph text minus the standard name
        const description = para.replace(match[0], '').replace(statusMatch?.[0] || '', '').trim()
            .split(/(?<=[.!?])\s+/)[0] || `${title} compliance requirements.`;

        items.push({
            icon,
            title,
            description: description.length > 200 ? description.slice(0, 197) + '...' : description,
            status,
            statusColor,
        });
    }

    return items;
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

/**
 * Parses unstructured / native text into ParsedDossierData using
 * keyword scoring and regex extraction. No AI/API calls — fully synchronous.
 */
const MAX_INPUT_BYTES = 512_000; // 512 KB hard limit — prevents CPU/memory DoS

export function parseNativeText(text: string): ParsedDossierData {
    // Guard: reject oversized input before any regex work
    if (text.length > MAX_INPUT_BYTES) {
        throw new Error(`Input exceeds maximum allowed size (${MAX_INPUT_BYTES} bytes). Truncate your document and try again.`);
    }

    // Step 1: Segment into paragraphs (double newline or single blank line)
    const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    if (paragraphs.length === 0) {
        return { ...defaultDossierData };
    }

    // Step 2: Classify each paragraph
    const buckets: Record<SectionKey, string[]> = {
        RISK: [],
        METRICS: [],
        ASSUMPTIONS: [],
        ROI_CAPEX: [],
        ROI_RETURNS: [],
        TEAM: [],
        MILESTONES: [],
        COMPLIANCE: [],
    };

    const unclassified: string[] = [];

    for (const para of paragraphs) {
        const { section } = classifyParagraph(para);
        if (section) {
            buckets[section].push(para);
        } else {
            unclassified.push(para);
        }
    }

    // Step 3: Extract structured fields per section
    const risks = extractRisks(buckets.RISK);
    const metrics = extractMetrics(buckets.METRICS);
    const { items: assumptions, warning: assumptionWarning } = extractAssumptions(buckets.ASSUMPTIONS);
    const roiInvestment = extractRoiItems(buckets.ROI_CAPEX);
    const roiReturns = extractRoiItems(buckets.ROI_RETURNS);
    const team = extractTeam(buckets.TEAM);
    const milestones = extractMilestones(buckets.MILESTONES);
    const compliance = extractCompliance(buckets.COMPLIANCE);

    // Step 4: ROI projections (heuristic defaults if not explicitly stated)
    let roiProjections = { year1: 0, year3: 0 };
    if (roiReturns.length > 0 && roiInvestment.length > 0) {
        // Try to estimate from dollar amounts
        const parseDollarValue = (raw: string): number => {
            const cleaned = raw.replace(/[$,]/g, '').toLowerCase();
            const m = cleaned.match(/^([\d.]+)([kmb])?$/);
            if (!m) return 0;
            const base = parseFloat(m[1]);
            const multiplier = m[2] === 'k' ? 1_000 : m[2] === 'm' ? 1_000_000 : m[2] === 'b' ? 1_000_000_000 : 1;
            return isNaN(base) ? 0 : base * multiplier;
        };

        const sumReturns = roiReturns.reduce((acc, r) => acc + parseDollarValue(r.value), 0);
        const sumInvestment = roiInvestment.reduce((acc, r) => acc + parseDollarValue(r.value), 0);
        if (sumInvestment > 0) {
            roiProjections.year1 = Math.round((sumReturns / sumInvestment) * 100);
            roiProjections.year3 = Math.round(roiProjections.year1 * 1.25);
        }
    }

    return {
        risks,
        metrics,
        assumptions,
        assumptionWarning,
        roiInvestment,
        roiReturns,
        team,
        milestones,
        compliance,
        roiProjections,
    };
}
