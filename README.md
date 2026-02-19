# Syndicate Strategic Dossier

A client-side React dashboard that transforms raw text into a structured strategic risk assessment. Supports both **structured** (pipe-delimited) and **native** (plain text) input formats — no AI or external API required.

## Features

- 8-section strategic dashboard (Risk Matrix, Metrics, Assumptions, ROI CapEx/Returns, Team, Milestones, Compliance)
- Dual-mode parser with automatic format detection
- In-browser text editor with live parsing
- Export to PDF, CSV, and JSON
- Fully client-side — zero API calls, zero dependencies on external services

## Quick Start

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Architecture

The parser is the core of the app. Here's how text flows through it:

```
App.tsx
 └─ parseDossierText(rawText)          # Entry point — auto-detects format
     ├─ Structured path (dossierParser.ts)   # If text contains "### " headers
     └─ Heuristic path (heuristicParser.ts)  # If no headers found
         ├─ 1. Segment → paragraphs
         ├─ 2. Score → keyword matching
         ├─ 3. Classify → assign to sections
         └─ 4. Extract → structured fields
```

### File Structure

```
├── App.tsx                        # Main app, editor modal, section layout
├── index.tsx                      # React entry point
├── types.ts                       # Shared TypeScript interfaces
├── data.ts                        # Sample data
├── utils/
│   ├── dossierParser.ts           # Structured parser + auto-detect router
│   └── heuristicParser.ts         # Keyword-scoring heuristic parser
├── components/
│   ├── DashboardModules.tsx       # Risk, Metrics, ROI, Team, Milestone, Compliance components
│   ├── Navigation.tsx             # Sidebar + Header
│   └── Footer.tsx                 # Footer
├── vite.config.ts                 # Vite dev server config
└── package.json
```

## Parser Documentation

### Auto-Detection Logic

`parseDossierText()` in `dossierParser.ts` is the single entry point. It checks:

```
Input text contains /^### /m (multiline regex)?
  YES → Structured parser (original pipe-delimited format)
  NO  → Heuristic parser (keyword scoring)
```

Both paths return the same `ParsedDossierData` interface, so downstream components don't need to know which parser was used.

### Structured Format (Original)

Uses `### SECTION_NAME` headers with pipe-delimited fields:

```
### RISK MATRIX
R-01 | Model Hallucination | Description here. | Med | Critical | 85 | Mitigation. | Contingency.

### METRICS
MRR Growth | trending_up | $142k | +22.4% | positive | vs last month

### ASSUMPTIONS
A1: Title - Content of the assumption.
WARNING: Critical warning text.

### ROI CAPEX
Infrastructure | $120,000 | One-time

### ROI RETURNS
Efficiency Gains | $2.4M | +300%

### ROI PROJECTIONS
820 | 1020

### TEAM
AI Engineering Lead | 40h/wk (Founder) | 40h/wk (Hire #1) | VP of Engineering

### MILESTONES
M1 - M3 | Description | Owner | Success Criteria | Q1 2024

### COMPLIANCE
gavel | GDPR Article 22 | Description. | Compliant | green
```

### Heuristic Parser (Native Text)

When no `### ` headers are found, the heuristic parser classifies plain text paragraphs into sections using keyword scoring.

#### Pipeline

**Step 1 — Segmentation**
Split input on double newlines (`\n\s*\n`) into paragraphs.

**Step 2 — Scoring**
Each paragraph is scored against all 8 section dictionaries. Each dictionary contains:

| Component | Description |
|-----------|-------------|
| **Keywords** | Weighted words/phrases (e.g., `risk` = 2.0, `mitigation` = 2.0) |
| **Regex patterns** | Pattern matches with weights (e.g., `/\bR-?\d+\b/` = 3.0) |
| **Anti-keywords** | Penalty words that reduce score by 0.5 per occurrence |

Scoring formula:
```
raw_score = sum(keyword_matches * weight) - sum(anti_keyword_matches * 0.5)
normalized_score = max(0, raw_score / sqrt(word_count))
```

The `sqrt(word_count)` normalization prevents long paragraphs from dominating by sheer length.

**Step 3 — Classification**
Each paragraph is assigned to the section with the highest normalized score, provided it exceeds the **confidence threshold of 0.3**. Paragraphs below threshold remain unclassified (gracefully dropped).

**Step 4 — Field Extraction**
Section-specific extractors parse structured fields from the classified paragraphs:

| Section | Extraction Strategy |
|---------|-------------------|
| **Risk** | 1st sentence = title, 2nd = subtitle. Regex for `likelihood:`, `impact:`, `score:`, `mitigation:`, `contingency:`. Defaults: Med/High/50 |
| **Metrics** | `$` or `%` patterns = value. Text before value = label. `+/-N%` = delta |
| **Assumptions** | `A\d+:` prefix = structured assumption. `WARNING:` = warning field. Otherwise full paragraph = one assumption |
| **ROI CapEx** | `$` amounts with preceding label text. Post-value text = note |
| **ROI Returns** | Same as CapEx. `+N%` patterns captured in note |
| **Team** | Role name detection (engineer, designer, VP, etc.). Pipe-split if available, single-line fallback |
| **Milestones** | `M\d+` or `Q\d YYYY` patterns. Pipe-split for structured fields, heuristic fallback |
| **Compliance** | Standard names (GDPR, SOC2, CCPA, HIPAA, AI Act). Status patterns (Compliant/In Progress/Under Review). Auto icon + color mapping |

#### Keyword Dictionaries

8 dictionaries cover all sections. Example (Risk):

```typescript
RISK: {
    keywords: [
        { word: 'risk', weight: 2 },
        { word: 'mitigation', weight: 2 },
        { word: 'contingency', weight: 2 },
        { regex: /\bR-?\d+\b/i, weight: 3 },
        // ... 13 total entries
    ],
    antiKeywords: ['return', 'revenue', 'roi', 'milestone'],
}
```

Full dictionary coverage: Risk (13 keywords), Metrics (14), Assumptions (11), ROI CapEx (12), ROI Returns (11), Team (15), Milestones (12), Compliance (14).

### Security Measures

- **Input size limit**: 512 KB hard cap on both parser entry points (prevents CPU/memory DoS)
- **ReDoS protection**: All regex patterns bounded (no unbounded quantifiers)
- **No `dangerouslySetInnerHTML`**: All output rendered via React JSX text interpolation
- **No external calls**: Parser is 100% synchronous, client-side only
- **NaN guards**: All `parseInt`/`parseFloat` calls have fallback defaults

### ROI Projection Calculation

When both CapEx and Returns data are present, the parser auto-calculates:

```
year1 = round((sum_returns / sum_investment) * 100)
year3 = round(year1 * 1.25)
```

Dollar values are parsed with suffix support: `$120k` = 120,000, `$2.4M` = 2,400,000, `$1.2B` = 1,200,000,000.

## Known Limitations

- **Label precision in native mode**: ROI labels capture all text before the `$` value, which can be verbose for sentence-style input
- **Single `$` per line**: If a line contains multiple dollar amounts, only the first is captured
- **No cross-paragraph context**: Each paragraph is classified independently — no multi-paragraph section merging
- **Ambiguous paragraphs**: A paragraph mentioning both "team risk" and "mitigation cost $500k" will be classified as RISK (keyword weights determine winner)

## Tech Stack

- React 19 + TypeScript 5.8
- Vite 6 (dev server + build)
- Tailwind CSS (via CDN)
- Google Material Symbols (icons)

## License

Private — all rights reserved.
