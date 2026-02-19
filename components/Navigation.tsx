import React, { useState, useEffect } from 'react';

export const Sidebar = () => {
    const [activeSection, setActiveSection] = useState('01');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['01', '02', '03', '04', '05', '06', '07', '08'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= 300) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = ['01', '02', '03', '04', '05', '06', '07', '08'];

    return (
        <aside className="hidden lg:flex w-20 fixed h-screen top-0 left-0 border-r border-border-hairline bg-off-white z-50 flex-col items-center py-8 justify-between">
            <div className="size-6 text-charcoal cursor-pointer hover:rotate-90 transition-transform duration-500">
                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="1.5"></path>
                </svg>
            </div>
            <nav className="flex flex-col gap-6 text-[10px] font-bold font-mono text-charcoal-muted">
                {navItems.map((item) => (
                    <a 
                        key={item}
                        href={`#${item}`}
                        className={`hover:text-charcoal transition-all flex flex-col items-center gap-1 group ${activeSection === item ? 'text-charcoal scale-110' : ''}`}
                    >
                        <span className="group-hover:-translate-x-1 transition-transform duration-300">{item}</span>
                    </a>
                ))}
            </nav>
            <div className="writing-vertical-rl text-[9px] uppercase tracking-widest text-charcoal-muted opacity-50 rotate-180">
                Syndicate v2.0
            </div>
        </aside>
    );
};

interface HeaderProps {
    onExport?: (type: 'pdf' | 'csv' | 'json') => void;
}

export const Header = ({ onExport }: HeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-off-white/95 backdrop-blur border-b border-border-hairline w-full">
            <div className="px-4 lg:px-16 py-4 flex items-center justify-between">
                
                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-charcoal">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                {/* Mobile Logo (Centered) */}
                <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
                     <svg className="size-5 text-charcoal" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="1.5"></path>
                    </svg>
                </div>


                {/* Desktop Tags */}
                <div className="hidden lg:flex items-center space-x-1 lg:space-x-2 overflow-x-auto no-scrollbar mask-gradient">
                    <NavTag text="01: Discovery" />
                    <NavTag text="02: Competitors" />
                    <NavTag text="03: Roadmap" locked />
                    <NavTag text="04: Core Design" locked />
                    <NavTag text="05: Edge Cases" locked />
                    <NavTag text="06: Risk & ROI" active />
                </div>
                
                {/* Desktop Actions */}
                <div className="hidden lg:flex gap-4 border-l border-border-hairline pl-6 relative">
                    <button 
                        className="text-charcoal hover:text-charcoal-muted transition-colors flex items-center gap-2 group outline-none"
                        onClick={() => setIsExportOpen(!isExportOpen)}
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Export</span>
                        <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-y-0.5">expand_more</span>
                    </button>

                    {isExportOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)}></div>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-border-hairline shadow-lg z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { onExport?.('pdf'); setIsExportOpen(false); }} className="px-4 py-3 text-left hover:bg-off-white text-xs font-mono text-charcoal flex items-center gap-3 transition-colors">
                                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF Document
                                </button>
                                <button onClick={() => { onExport?.('csv'); setIsExportOpen(false); }} className="px-4 py-3 text-left hover:bg-off-white text-xs font-mono text-charcoal flex items-center gap-3 transition-colors">
                                    <span className="material-symbols-outlined text-sm">table_view</span> CSV (Risk Matrix)
                                </button>
                                <button onClick={() => { onExport?.('json'); setIsExportOpen(false); }} className="px-4 py-3 text-left hover:bg-off-white text-xs font-mono text-charcoal flex items-center gap-3 transition-colors">
                                    <span className="material-symbols-outlined text-sm">data_object</span> JSON Data
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-off-white border-b border-border-hairline p-4 lg:hidden shadow-lg flex flex-col gap-2">
                        <MobileNavLink href="#01" label="01. Risk Matrix" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#02" label="02. Metrics" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#03" label="03. Assumptions" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#04" label="04. ROI" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#05" label="05. Team" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#06" label="06. Milestones" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#07" label="07. Compliance" onClick={() => setIsMenuOpen(false)} />
                        <MobileNavLink href="#08" label="08. Decisions" onClick={() => setIsMenuOpen(false)} />
                    </div>
                )}
            </div>
        </header>
    );
};

const NavTag = ({ text, locked, active }: { text: string; locked?: boolean; active?: boolean }) => (
    <a href="#" className={`
        px-3 py-1.5 text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap
        ${active 
            ? 'bg-charcoal text-white border border-charcoal' 
            : 'text-charcoal-muted border border-transparent hover:border-border-hairline opacity-50 hover:opacity-100'}
    `}>
        {text} {locked ? <span className="text-[8px] align-top ml-0.5">🔒</span> : active ? <span className="text-[8px] align-top ml-0.5">🔓</span> : ''}
    </a>
);

const MobileNavLink = ({ href, label, onClick }: { href: string; label: string; onClick: () => void }) => (
    <a href={href} onClick={onClick} className="block py-2 px-4 text-sm font-mono uppercase text-charcoal hover:bg-gray-100">
        {label}
    </a>
);