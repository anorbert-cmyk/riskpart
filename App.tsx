import React from 'react';
import { Sidebar, Header } from './components/Navigation';
import { RiskMatrix, MetricsDashboard, RoiTables, TeamTable, MilestoneTable, ComplianceGrid } from './components/DashboardModules';
import { Footer } from './components/Footer';
import { roiProjections } from './data';

interface SectionWrapperProps {
  id: string;
  number: string;
  title: string;
  bg: string;
  children?: React.ReactNode;
}

const SectionWrapper = ({ id, number, title, children, bg }: SectionWrapperProps) => (
    <section className={`px-8 lg:px-16 py-20 border-b border-border-hairline ${bg}`} id={id}>
        <div className="max-w-7xl mx-auto">
            <div className="flex items-baseline gap-4 mb-12">
                <span className="text-charcoal font-bold text-sm uppercase tracking-widest">{number}.</span>
                <h2 className="text-2xl font-serif text-charcoal">{title}</h2>
            </div>
            {children}
        </div>
    </section>
);

function App() {
  return (
    <div className="flex flex-col min-h-screen lg:ml-20 bg-off-white">
      <Sidebar />
      <main className="flex-1 min-w-0 border-r border-border-hairline selection:bg-charcoal/10 selection:text-charcoal">
        <Header />
        
        {/* Intro Hero */}
        <div className="w-full">
            <section className="px-8 lg:px-16 pt-20 pb-12 border-b border-border-hairline bg-off-white">
                <div className="max-w-7xl mx-auto">
                    <span className="inline-block px-2 py-0.5 border border-charcoal text-charcoal text-[9px] font-mono font-bold uppercase tracking-widest mb-6">Syndicate // Part 06</span>
                    <h1 className="text-5xl lg:text-7xl font-serif text-charcoal mb-4 tracking-tight leading-[1.1]">
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

            {/* 01. Risk Matrix */}
            <SectionWrapper id="01" number="01" title="Comprehensive Risk Matrix (R1-R10)" bg="bg-white">
                <RiskMatrix />
            </SectionWrapper>

            {/* 02. Success Metrics */}
            <SectionWrapper id="02" number="02" title="Success Metrics Dashboard" bg="bg-off-white">
                <MetricsDashboard />
            </SectionWrapper>

            {/* 03. Assumptions */}
            <SectionWrapper id="03" number="03" title="Assumptions That Must Hold True" bg="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="font-serif text-charcoal text-sm leading-8 text-justify">
                        <p className="mb-6">
                            <strong className="font-sans text-xs uppercase tracking-widest block mb-2 text-charcoal-muted">A1: AI Visibility Horizon</strong>
                            The core thesis assumes that LLM commoditization will not accelerate to the point where foundational models (GPT-5, Claude 4) offer native, zero-shot capabilities that render our specialized fine-tuning obsolete within 24 months. We assume a "Last Mile" problem will persist in FinTech and Legal verticals, necessitating our middleware layer for compliance and context injection.
                        </p>
                        <p>
                            <strong className="font-sans text-xs uppercase tracking-widest block mb-2 text-charcoal-muted">A2: Pricing Power Durability</strong>
                            We assume enterprise clients will continue to pay a premium (&gt;30% vs generic tools) for data residency guarantees and auditable logic trails. If the market shifts entirely to a "race to the bottom" on token pricing, our margin structure will need immediate revision. Our model relies on value-based pricing, not cost-plus.
                        </p>
                    </div>
                    <div className="font-serif text-charcoal text-sm leading-8 text-justify">
                        <p className="mb-6">
                            <strong className="font-sans text-xs uppercase tracking-widest block mb-2 text-charcoal-muted">A3: The Dashboard Moat</strong>
                            We postulate that the UX/UI wrapper—specifically the "Success Metrics Dashboard"—provides stickiness beyond the underlying AI generation. If users bypass the dashboard to consume our API headlessly at scale, we lose the opportunity to cross-sell visualization features, reducing LTV by an estimated 40%.
                        </p>
                        <div className="bg-off-white border border-border-hairline p-6 mt-6">
                            <span className="material-symbols-outlined text-charcoal mb-2">warning</span>
                            <p className="text-xs italic text-charcoal-muted">"If any of these three pillars collapse, the Series A valuation target of $40M pre-money becomes mathematically indefensible."</p>
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            {/* 04. ROI */}
            <SectionWrapper id="04" number="04" title="ROI Justification" bg="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="col-span-12 lg:col-span-4">
                        <p className="font-serif text-charcoal-muted leading-relaxed mb-8">
                            The initial capital deployment into architectural robustness yields compounding returns by month 12. The "Investment Required" table outlines the upfront CapEx, while "Expected Returns" projects conservative efficiency gains for our enterprise clients.
                        </p>
                        <div className="bg-off-white border border-border-hairline p-6 shadow-sm">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-4">Net ROI Projection (Year 1)</span>
                            <span className="text-6xl font-light font-mono text-charcoal block mb-2">{roiProjections.year1}%</span>
                            <span className="text-xs text-charcoal-muted">Conservative Estimate</span>
                        </div>
                        <div className="bg-charcoal text-white border border-charcoal p-6 mt-4 shadow-lg">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-70 block mb-4">Net ROI Projection (Year 3)</span>
                            <span className="text-6xl font-light font-mono text-white block mb-2">{roiProjections.year3}%</span>
                            <span className="text-xs opacity-70">Optimistic Scale</span>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <RoiTables />
                    </div>
                </div>
            </SectionWrapper>

            {/* 05. Team */}
            <SectionWrapper id="05" number="05" title="Team Collaboration Model (Scaling)" bg="bg-off-white">
                <TeamTable />
            </SectionWrapper>

            {/* 06. Milestones */}
            <SectionWrapper id="06" number="06" title="Milestone Summary Table (M1-M17)" bg="bg-white">
                <MilestoneTable />
            </SectionWrapper>

            {/* 07. Compliance */}
            <SectionWrapper id="07" number="07" title="Compliance & Legal Technical Matrix" bg="bg-off-white">
                <ComplianceGrid />
            </SectionWrapper>

            {/* 08. Strategic Pivots */}
            <section className="px-8 lg:px-16 py-24 bg-white relative overflow-hidden" id="08">
                {/* CSS Pattern Overlay */}
                <div className="absolute inset-0 bg-hairline-grid bg-grid-20 opacity-30 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-baseline gap-4 mb-16 justify-center">
                        <span className="text-charcoal font-bold text-sm uppercase tracking-widest">08.</span>
                        <h2 className="text-3xl font-serif text-charcoal text-center">Behind the Decision & Strategic Pivots</h2>
                    </div>
                    <div className="columns-1 md:columns-2 gap-12 font-serif text-charcoal-muted text-sm leading-7 text-justify">
                        <p className="mb-6 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-4px] first-letter:text-charcoal">
                            The decision to proceed with the federated architecture was not made lightly. While a monolithic approach offered speed in the short term, the risk assessment clearly indicated that technical debt would cripple velocity by Q3. The strategic pivot to micro-services, though higher in initial CapEx, secures the long-term scalability required for enterprise adoption.
                        </p>
                        <p className="mb-6">
                            Furthermore, the integration of local vector stores directly addresses the privacy concerns raised by our European partners. This "privacy-first" architecture is not just a compliance checkbox but a competitive moat. In a market saturated with wrapper-startups, our proprietary infrastructure becomes the key differentiator.
                        </p>
                        <p className="mb-6">
                            We are effectively trading short-term cash flow for long-term asset value. The ROI models, even when stress-tested with conservative adoption rates, show a break-even point within 14 months. This is an acceptable risk profile given the potential upside of capturing the regulated industries market share.
                        </p>
                        <div className="break-inside-avoid-column border-t border-b border-charcoal py-4 my-6 text-center">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-charcoal font-bold">Decision approved by Board</span>
                            <div className="mt-2 font-handwriting text-2xl text-charcoal opacity-70 font-serif italic">
                                J. Alexander
                            </div>
                        </div>
                        <p className="mb-6">
                            Moving forward, the focus shifts to execution. The hiring plan outlined in the investment section is critical. We cannot afford delays in securing top-tier AI talent. The "War for Talent" is the single largest external threat to this roadmap, hence the allocated budget premium for engineering headcount.
                        </p>
                        
                        <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-charcoal mt-8 mb-4">Strategic Pivot Scenarios</h3>
                        
                        <p className="mb-4">
                            <strong>Scenario A: AI Underperformance.</strong> If model hallucination rates exceed 5% in the closed beta, we will pivot to a "Human-in-the-Loop" service model, marketing the tool as an assistant rather than an autonomous agent. This preserves credibility while technology matures.
                        </p>
                        <p className="mb-4">
                            <strong>Scenario B: Regulatory Crackdown.</strong> If the EU AI Act imposes stricter liability on foundation models, we shift development resources entirely to on-premise, open-source SLM deployments (Llama 3 hosted locally), severing dependence on US-based API providers.
                        </p>
                        <p>
                            <strong>Scenario C: Acquisition Offer.</strong> In the event of an early exit offer from a major incumbent (e.g., Salesforce), the "Poison Pill" architecture ensures they must acquire the entire team to decipher the proprietary RAG implementation, maximizing exit valuation.
                        </p>
                    </div>
                </div>
            </section>
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default App;