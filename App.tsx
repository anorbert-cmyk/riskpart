import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from './components/Navigation';
import { RiskMatrix, MetricsDashboard, RoiTables, TeamTable, MilestoneTable, ComplianceGrid } from './components/DashboardModules';
import { Footer } from './components/Footer';
import { StitchStudio } from './components/StitchStudio';
import { BuilderProvider, useBuilder } from './components/builder/BuilderContext';
import { ThemeProvider } from './components/builder/ThemeContext';
import { LandingPage } from './components/builder/LandingPage';
import { AISetupFlow } from './components/builder/AISetupFlow';
import { BuildingScreen } from './components/builder/BuildingScreen';
import { FinalDashboard } from './components/builder/FinalDashboard';
import { parseDossierText, generateDefaultRawText, ParsedDossierData } from './utils/dossierParser';
import type { AppView } from './types/app';

interface SectionWrapperProps {
  id: string;
  number: string;
  title: string;
  bg: string;
  children?: React.ReactNode;
}

const SectionWrapper = ({ id, number, title, children, bg }: SectionWrapperProps) => (
    <section className={`px-4 md:px-8 lg:px-16 py-12 md:py-20 border-b border-border-hairline ${bg}`} id={id}>
        <div className="max-w-7xl mx-auto">
            <div className="flex items-baseline gap-4 mb-8 md:mb-12">
                <span className="text-charcoal font-bold text-sm uppercase tracking-widest">{number}.</span>
                <h2 className="text-xl md:text-2xl font-serif text-charcoal">{title}</h2>
            </div>
            {children}
        </div>
    </section>
);

// ─── Builder Router ─────────────────────────────────────────────────
const BuilderRouter = () => {
  const { state } = useBuilder();

  switch (state.phase) {
    case 'landing':
      return <LandingPage />;
    case 'ai-setup':
    case 'review':
      return <AISetupFlow />;
    case 'building':
      return <BuildingScreen />;
    case 'dashboard':
      return <FinalDashboard />;
    default:
      return <LandingPage />;
  }
};

// ─── Main App ───────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState<AppView>('builder');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [rawText, setRawText] = useState(generateDefaultRawText());
  const [data, setData] = useState<ParsedDossierData | null>(null);

  useEffect(() => {
    setData(parseDossierText(rawText));
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setRawText(e.target.value);
  };

  const applyChanges = () => {
      setData(parseDossierText(rawText));
      setIsEditorOpen(false);
  };

  const handleExport = (type: 'pdf' | 'csv' | 'json') => {
      if (!data) return;
      if (type === 'pdf') {
          window.print();
      } else if (type === 'json') {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'syndicate-dossier.json';
          a.click();
          URL.revokeObjectURL(url);
      } else if (type === 'csv') {
          const headers = ['ID', 'Title', 'Subtitle', 'Likelihood', 'Impact', 'Score', 'Mitigation', 'Contingency'];
          const rows = data.risks.map(r => [
              r.id,
              `"${r.description.title.replace(/"/g, '""')}"`,
              `"${r.description.subtitle.replace(/"/g, '""')}"`,
              r.likelihood,
              r.impact,
              r.score,
              `"${r.mitigation.replace(/"/g, '""')}"`,
              `"${r.contingency.replace(/"/g, '""')}"`
          ]);
          const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'syndicate-risk-matrix.csv';
          a.click();
          URL.revokeObjectURL(url);
      }
  };

  // Builder view — full-screen, no sidebar/header chrome
  if (view === 'builder') {
    return (
      <BuilderProvider>
        <ThemeProvider>
          <BuilderRouter />
        </ThemeProvider>
      </BuilderProvider>
    );
  }

  if (!data) return null;

  const splitIndex = Math.ceil(data.assumptions.length / 2);
  const leftAssumptions = data.assumptions.slice(0, splitIndex);
  const rightAssumptions = data.assumptions.slice(splitIndex);

  return (
    <div className="flex flex-col min-h-screen lg:ml-20 bg-off-white">
      <Sidebar currentView={view} onNavigate={setView} />
      <main className="flex-1 min-w-0 border-r border-border-hairline selection:bg-charcoal/10 selection:text-charcoal w-full relative">
        <Header onExport={handleExport} currentView={view} onNavigate={setView} />

        {view === 'stitch' ? (
          <StitchStudio />
        ) : (
          <>
        <button
            onClick={() => setIsEditorOpen(true)}
            className="fixed bottom-8 right-8 z-50 bg-charcoal text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
        >
            <span className="material-symbols-outlined">edit_document</span>
            <span className="w-0 overflow-hidden group-hover:w-auto group-hover:pl-2 transition-all font-mono text-xs uppercase tracking-widest whitespace-nowrap">Edit Raw Data</span>
        </button>

        {isEditorOpen && (
            <div className="fixed inset-0 z-[60] bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12">
                <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] flex flex-col shadow-2xl rounded-sm overflow-hidden animate-fade-in">
                    <div className="flex justify-between items-center p-6 border-b border-border-hairline bg-off-white">
                        <h3 className="font-serif text-xl text-charcoal">Edit Strategic Dossier</h3>
                        <div className="flex gap-4">
                            <button onClick={() => setIsEditorOpen(false)} className="text-charcoal-muted hover:text-charcoal font-mono text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={applyChanges} className="bg-charcoal text-white px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-black transition-colors">Apply Changes</button>
                        </div>
                    </div>
                    <div className="flex-1 p-0 relative">
                        <textarea
                            value={rawText}
                            onChange={handleTextChange}
                            className="w-full h-full p-6 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 bg-white text-charcoal border-none"
                            placeholder="Paste your raw dossier data here..."
                            spellCheck={false}
                        />
                    </div>
                    <div className="p-4 bg-off-white border-t border-border-hairline text-[10px] text-charcoal-muted font-mono">
                        Structured format: ### RISK MATRIX, ### METRICS, ### ASSUMPTIONS, ### ROI CAPEX, ### ROI RETURNS, ### TEAM, ### MILESTONES, ### COMPLIANCE &mdash; or paste plain text (business plan, strategy doc) and sections will be auto-classified.
                    </div>
                </div>
            </div>
        )}

        <div className="w-full">
            <section className="px-4 md:px-8 lg:px-16 pt-16 md:pt-20 pb-12 border-b border-border-hairline bg-off-white">
                <div className="max-w-7xl mx-auto">
                    <span className="inline-block px-2 py-0.5 border border-charcoal text-charcoal text-[9px] font-mono font-bold uppercase tracking-widest mb-6">Syndicate // Part 06</span>
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-serif text-charcoal mb-4 tracking-tight leading-[1.1] break-words">
                        Comprehensive <br/><span className="italic font-light">Strategic Dossier</span>
                    </h1>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 items-center mt-8 font-mono text-xs text-charcoal-muted uppercase tracking-widest">
                        <span>Validation of core assumptions</span>
                        <span className="hidden sm:block w-px h-3 bg-border-hairline"></span>
                        <span>Status: Critical</span>
                        <span className="hidden sm:block w-px h-3 bg-border-hairline"></span>
                        <span>Horizon: 12-24 Months</span>
                    </div>
                </div>
            </section>

            <SectionWrapper id="01" number="01" title="Comprehensive Risk Matrix (R1-R10)" bg="bg-white">
                <RiskMatrix data={data.risks} />
            </SectionWrapper>
            <SectionWrapper id="02" number="02" title="Success Metrics Dashboard" bg="bg-off-white">
                <MetricsDashboard data={data.metrics} />
            </SectionWrapper>
            <SectionWrapper id="03" number="03" title="Assumptions That Must Hold True" bg="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    <div className="font-serif text-charcoal text-sm leading-8 text-justify">
                        {leftAssumptions.map((item, idx) => (
                             <div key={idx} className="mb-6">
                                <strong className="font-sans text-xs uppercase tracking-widest block mb-2 text-charcoal-muted">{item.id}: {item.title}</strong>
                                <p>{item.content}</p>
                            </div>
                        ))}
                    </div>
                    <div className="font-serif text-charcoal text-sm leading-8 text-justify">
                        {rightAssumptions.map((item, idx) => (
                             <div key={idx} className="mb-6">
                                <strong className="font-sans text-xs uppercase tracking-widest block mb-2 text-charcoal-muted">{item.id}: {item.title}</strong>
                                <p>{item.content}</p>
                            </div>
                        ))}
                        {data.assumptionWarning && (
                            <div className="bg-off-white border border-border-hairline p-6 mt-6">
                                <span className="material-symbols-outlined text-charcoal mb-2">warning</span>
                                <p className="text-xs italic text-charcoal-muted">"{data.assumptionWarning}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </SectionWrapper>
            <SectionWrapper id="04" number="04" title="ROI Justification" bg="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    <div className="col-span-12 lg:col-span-4">
                        <p className="font-serif text-charcoal-muted leading-relaxed mb-8">
                            The initial capital deployment into architectural robustness yields compounding returns by month 12.
                        </p>
                        <div className="bg-off-white border border-border-hairline p-6 shadow-sm">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-4">Net ROI Projection (Year 1)</span>
                            <span className="text-5xl md:text-6xl font-light font-mono text-charcoal block mb-2">{data.roiProjections.year1}%</span>
                            <span className="text-xs text-charcoal-muted">Conservative Estimate</span>
                        </div>
                        <div className="bg-charcoal text-white border border-charcoal p-6 mt-4 shadow-lg">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-70 block mb-4">Net ROI Projection (Year 3)</span>
                            <span className="text-5xl md:text-6xl font-light font-mono text-white block mb-2">{data.roiProjections.year3}%</span>
                            <span className="text-xs opacity-70">Optimistic Scale</span>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <RoiTables investmentData={data.roiInvestment} returnsData={data.roiReturns} />
                    </div>
                </div>
            </SectionWrapper>
            <SectionWrapper id="05" number="05" title="Team Collaboration Model (Scaling)" bg="bg-off-white">
                <TeamTable data={data.team} />
            </SectionWrapper>
            <SectionWrapper id="06" number="06" title="Milestone Summary Table (M1-M17)" bg="bg-white">
                <MilestoneTable data={data.milestones} />
            </SectionWrapper>
            <SectionWrapper id="07" number="07" title="Compliance & Legal Technical Matrix" bg="bg-off-white">
                <ComplianceGrid data={data.compliance} />
            </SectionWrapper>
            <section className="px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden" id="08">
                <div className="absolute inset-0 bg-hairline-grid bg-grid-20 opacity-30 pointer-events-none"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-baseline gap-4 mb-12 md:mb-16 justify-center">
                        <span className="text-charcoal font-bold text-sm uppercase tracking-widest">08.</span>
                        <h2 className="text-2xl md:text-3xl font-serif text-charcoal text-center">Behind the Decision & Strategic Pivots</h2>
                    </div>
                    <div className="columns-1 md:columns-2 gap-8 md:gap-12 font-serif text-charcoal-muted text-sm leading-7 text-justify">
                        <p className="mb-6 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-4px] first-letter:text-charcoal">
                            The decision to proceed with the federated architecture was not made lightly.
                        </p>
                        <p className="mb-6">Furthermore, the integration of local vector stores directly addresses privacy concerns.</p>
                        <p className="mb-6">We are effectively trading short-term cash flow for long-term asset value.</p>
                    </div>
                </div>
            </section>
        </div>
        <Footer />
        </>
        )}
      </main>
    </div>
  );
}

export default App;
