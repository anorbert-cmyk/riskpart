import React, { useState, useRef, useEffect } from 'react';
import { useBuilder } from './BuilderContext';
import type { ChatMessage, ChatOption } from '../../types/dashboard-builder';
import { SETUP_STEPS } from '../../types/dashboard-builder';

// ─── Step Flow Definitions ──────────────────────────────────────────
interface StepFlow {
  assistantMessage: string;
  options?: ChatOption[];
  multiSelect?: boolean;
  inputType?: ChatMessage['inputType'];
  componentSuggestions?: string[];
  onResponse: (response: string, ctx: FlowContext) => void;
}

interface FlowContext {
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateProfile: (u: any) => void;
  updatePreferences: (u: any) => void;
  activateComponentsBulk: (ids: string[]) => void;
  nextStep: () => void;
  startBuild: () => void;
  setStep: (step: number) => void;
}

const GOAL_OPTIONS: ChatOption[] = [
  { id: 'morning-scan', label: 'Morning Market Scan', icon: 'wb_sunny', description: 'Start each day with market overview' },
  { id: 'intraday-monitor', label: 'Intraday Monitoring', icon: 'monitor_heart', description: 'Real-time position tracking' },
  { id: 'opportunity', label: 'Opportunity Discovery', icon: 'search', description: 'Find trading opportunities' },
  { id: 'pricing-validation', label: 'Pricing Validation', icon: 'price_check', description: 'Validate bid/ask/reference prices' },
  { id: 'liquidity', label: 'Liquidity Discovery', icon: 'water_drop', description: 'Find liquidity across dealers' },
  { id: 'watchlist-mgmt', label: 'Watchlist Management', icon: 'visibility', description: 'Monitor specific bonds' },
  { id: 'issuer-monitoring', label: 'Issuer Monitoring', icon: 'business', description: 'Track issuer-level activity' },
  { id: 'relative-value', label: 'Relative Value Comparison', icon: 'compare_arrows', description: 'Compare similar bonds' },
];

const UNIVERSE_OPTIONS: ChatOption[] = [
  { id: 'us-ig', label: 'U.S. IG Corporates', icon: 'star' },
  { id: 'us-hy', label: 'U.S. HY Corporates', icon: 'trending_up' },
  { id: 'em', label: 'Emerging Markets', icon: 'public' },
  { id: 'munis', label: 'Municipals', icon: 'location_city' },
  { id: 'agencies', label: 'Agencies', icon: 'account_balance' },
  { id: 'securitized', label: 'Securitized', icon: 'layers' },
  { id: 'sovereigns', label: 'Sovereigns', icon: 'flag' },
  { id: 'mixed', label: 'Mixed Credit', icon: 'join' },
];

const ATF_OPTIONS: ChatOption[] = [
  { id: 'market-summary', label: 'Market Summary' },
  { id: 'collapsed-inventory', label: 'Collapsed Inventory' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'alerts', label: 'Alerts & Exceptions' },
  { id: 'reference-pricing', label: 'Reference Pricing' },
  { id: 'trace-prints', label: 'Recent TRACE Prints' },
  { id: 'dealer-axes', label: 'Dealer Axes Summary' },
  { id: 'liquidity-panel', label: 'Liquidity Panel' },
];

const INPUT_OPTIONS: ChatOption[] = [
  { id: 'bid', label: 'Bid' }, { id: 'ask', label: 'Ask' }, { id: 'mid', label: 'Mid' },
  { id: 'spread', label: 'Spread' }, { id: 'yield', label: 'Yield' }, { id: 'ytw', label: 'Yield to Worst' },
  { id: 'duration', label: 'Duration' }, { id: 'rating', label: 'Rating' },
  { id: 'trace-prints', label: 'Recent TRACE Prints' }, { id: 'trace-volume', label: 'TRACE Volume' },
  { id: 'dealer-axes', label: 'Dealer Axes' }, { id: 'ref-price', label: 'Reference Price' },
  { id: 'liq-score', label: 'Liquidity Score' }, { id: 'quote-dispersion', label: 'Quote Dispersion' },
  { id: 'last-trade', label: 'Last Trade Time' }, { id: 'sector-move', label: 'Sector Move' },
];

function getStepFlow(stepIndex: number): StepFlow {
  const flows: Record<number, StepFlow> = {
    0: {
      assistantMessage: `Welcome to the AI Dashboard Builder.\n\nI'll help you create a personalized bond trading overview dashboard. Here's what will happen:\n\n• I'll ask a few questions about your role, workflow, and market focus\n• Based on your answers, I'll recommend components for your dashboard\n• You can review, modify, add, or remove any component\n• Your dashboard will always be editable later\n\nWhen you're ready, just tell me to start.`,
      inputType: 'text',
      onResponse: (_resp, ctx) => { ctx.nextStep(); },
    },
    1: {
      assistantMessage: `Let's start with your profile.\n\nWhat's your role? This helps me understand whether your dashboard should focus on execution, monitoring, analysis, or something else.`,
      options: [
        { id: 'trader', label: 'Trader', description: 'Execution & liquidity focus' },
        { id: 'portfolio-manager', label: 'Portfolio Manager', description: 'Investment oversight' },
        { id: 'sales-trader', label: 'Sales Trader', description: 'Client flow & pricing' },
        { id: 'credit-analyst', label: 'Credit Analyst', description: 'Fundamental research' },
        { id: 'risk-manager', label: 'Risk Manager', description: 'Risk monitoring' },
      ],
      inputType: 'select',
      onResponse: (resp, ctx) => {
        ctx.updateProfile({ role: resp });
        ctx.nextStep();
      },
    },
    2: {
      assistantMessage: `What's the primary purpose of your dashboard? Select the most important one — you can add secondary goals too.`,
      options: GOAL_OPTIONS,
      multiSelect: true,
      inputType: 'multiselect',
      onResponse: (resp, ctx) => {
        const goals = resp.split(',').map(s => s.trim());
        ctx.updatePreferences({ primaryGoal: goals[0], secondaryGoals: goals.slice(1) });
        ctx.nextStep();
      },
    },
    3: {
      assistantMessage: `Which bond universe do you primarily work with?`,
      options: UNIVERSE_OPTIONS,
      multiSelect: true,
      inputType: 'multiselect',
      onResponse: (resp, ctx) => {
        ctx.updatePreferences({ bondUniverses: resp.split(',').map(s => s.trim()) });
        ctx.nextStep();
      },
    },
    4: {
      assistantMessage: `How do you identify bonds most often? This determines the primary column and search logic in your inventory.`,
      options: [
        { id: 'cusip', label: 'CUSIP' },
        { id: 'isin', label: 'ISIN' },
        { id: 'ticker', label: 'Ticker' },
        { id: 'issuer', label: 'Issuer Name' },
      ],
      inputType: 'select',
      onResponse: (resp, ctx) => {
        ctx.updatePreferences({ primaryIdentifier: resp });
        ctx.nextStep();
      },
    },
    5: {
      assistantMessage: `What should always be visible on your dashboard without scrolling? These "above-the-fold" elements are the first thing you see.`,
      options: ATF_OPTIONS,
      multiSelect: true,
      inputType: 'multiselect',
      onResponse: (resp, ctx) => {
        ctx.updatePreferences({ aboveTheFold: resp.split(',').map(s => s.trim()) });
        ctx.nextStep();
      },
    },
    6: {
      assistantMessage: `Which data points are critical for your decision-making? Select the inputs you need to see to decide whether a bond is worth investigating.`,
      options: INPUT_OPTIONS,
      multiSelect: true,
      inputType: 'multiselect',
      onResponse: (resp, ctx) => {
        ctx.updatePreferences({ criticalInputs: resp.split(',').map(s => s.trim()) });
        ctx.nextStep();
      },
    },
    7: {
      assistantMessage: `How should the system handle data freshness? This determines how stale or uncertain data is displayed.`,
      options: [
        { id: 'show-all', label: 'Show all data, mark stale', description: 'Visual indicators for data age' },
        { id: 'prefer-ref', label: 'Prefer reference prices', description: 'Use reference when live is weak' },
        { id: 'highlight-fresh', label: 'Highlight fresh sources', description: 'Emphasize recent data' },
        { id: 'hide-stale', label: 'Hide very stale data', description: 'Only show reliable data' },
      ],
      inputType: 'select',
      onResponse: (resp, ctx) => {
        ctx.updatePreferences({ freshnessMode: resp });
        ctx.nextStep();
      },
    },
    8: {
      assistantMessage: `What events should trigger alerts on your dashboard? These help you catch important market movements.`,
      options: [
        { id: 'new-axe', label: 'New Dealer Axe' },
        { id: 'trace-print', label: 'New TRACE Print' },
        { id: 'spread-move', label: 'Spread Widening/Tightening' },
        { id: 'stale-quote', label: 'Stale Quote' },
        { id: 'liq-change', label: 'Liquidity Change' },
        { id: 'price-gap', label: 'Large Price Gap' },
        { id: 'rating-action', label: 'Rating Action' },
        { id: 'volume-spike', label: 'Volume Spike' },
      ],
      multiSelect: true,
      inputType: 'multiselect',
      onResponse: (_resp, ctx) => { ctx.nextStep(); },
    },
    9: {
      assistantMessage: `Last question — what's your preferred workflow style?`,
      options: [
        { id: 'speed', label: 'Speed-first', description: 'Quick scans, minimal clicks' },
        { id: 'comparison', label: 'Comparison-first', description: 'Side-by-side analysis' },
        { id: 'detail', label: 'Detail-first', description: 'Deep-dive into each bond' },
        { id: 'monitoring', label: 'Monitoring-first', description: 'Watchlist-centric with alerts' },
      ],
      inputType: 'select',
      onResponse: (resp, ctx) => {
        ctx.updatePreferences({ workflowMode: resp });
        ctx.nextStep();
      },
    },
    10: {
      assistantMessage: `Based on your answers, here's my recommended dashboard layout. I've selected these components specifically for your workflow:\n\nReview the components below — you can accept, modify, or add more before I build your dashboard.`,
      componentSuggestions: ['market-pulse', 'collapsed-inventory', 'dealer-axes', 'trace-prints', 'watchlist', 'alerts-exceptions', 'liquidity-panel', 'relative-value'],
      inputType: 'text',
      onResponse: (resp, ctx) => {
        const lower = resp.toLowerCase();
        if (lower.includes('build') || lower.includes('create') || lower.includes('done') || lower.includes('ready') || lower.includes('go') || lower.includes('készítsd') || lower.includes('kész')) {
          ctx.activateComponentsBulk(['market-pulse', 'collapsed-inventory', 'dealer-axes', 'trace-prints', 'watchlist', 'alerts-exceptions', 'liquidity-panel', 'relative-value']);
          ctx.addMessage({ role: 'assistant', content: 'Building your dashboard now. This will take a moment...' });
          setTimeout(() => ctx.startBuild(), 500);
        } else {
          ctx.addMessage({ role: 'assistant', content: 'No problem — tell me what you\'d like to change. You can add components like "add volume monitor" or remove them like "remove liquidity panel". When you\'re satisfied, just say "build it".' });
        }
      },
    },
  };
  return flows[stepIndex] || flows[0];
}

// ─── Chat Interface Component ───────────────────────────────────────
export const ChatInterface = () => {
  const { state, addMessage, updateProfile, updatePreferences, activateComponentsBulk, setStep, startBuild, activateComponent, deactivateComponent } = useBuilder();
  const [input, setInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStepFlow = getStepFlow(state.currentStep);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Show initial message for current step
  useEffect(() => {
    const flow = getStepFlow(state.currentStep);
    const stepId = SETUP_STEPS[state.currentStep]?.id;
    const alreadyShown = state.messages.some((m) => m.stepId === stepId && m.role === 'assistant');
    if (!alreadyShown) {
      setIsTyping(true);
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: flow.assistantMessage,
          options: flow.options,
          multiSelect: flow.multiSelect,
          inputType: flow.inputType,
          componentSuggestions: flow.componentSuggestions?.map((id) => ({ componentId: id, reason: 'Recommended based on your profile' })),
          stepId,
        });
        setIsTyping(false);
        // Auto-activate suggested components
        if (flow.componentSuggestions) {
          activateComponentsBulk(flow.componentSuggestions);
        }
      }, 600);
    }
  }, [state.currentStep]);

  const nextStep = () => {
    setSelectedOptions(new Set());
    setStep(state.currentStep + 1);
  };

  const ctx: FlowContext = {
    addMessage, updateProfile, updatePreferences, activateComponentsBulk, nextStep, startBuild, setStep,
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text && selectedOptions.size === 0) return;

    const response = selectedOptions.size > 0 ? Array.from(selectedOptions).join(', ') : text;
    addMessage({ role: 'user', content: response });
    setInput('');
    setSelectedOptions(new Set());

    // Check for component add/remove commands
    const lower = response.toLowerCase();
    if (lower.startsWith('add ') || lower.startsWith('remove ')) {
      const isAdd = lower.startsWith('add ');
      const compName = lower.replace(/^(add|remove)\s+/, '');
      const catalog = state.availableComponents;
      const match = catalog.find((c) => c.name.toLowerCase().includes(compName));
      if (match) {
        if (isAdd) { activateComponent(match.id); } else { deactivateComponent(match.id); }
        setIsTyping(true);
        setTimeout(() => {
          addMessage({ role: 'assistant', content: `Done — ${isAdd ? 'added' : 'removed'} "${match.name}" ${isAdd ? 'to' : 'from'} your dashboard. Anything else, or shall I build it?` });
          setIsTyping(false);
        }, 400);
        return;
      }
    }

    setIsTyping(true);
    setTimeout(() => {
      currentStepFlow.onResponse(response, ctx);
      setIsTyping(false);
    }, 500);
  };

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (currentStepFlow.multiSelect) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  // Get last message with options (if any)
  const lastAssistantMsg = [...state.messages].reverse().find((m) => m.role === 'assistant');
  const showOptions = lastAssistantMsg?.options && state.messages[state.messages.length - 1]?.role === 'assistant';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-black/[0.06] bg-[#FAFAF8]">
        <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-xs">auto_awesome</span>
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-charcoal block leading-tight">Dashboard Assistant</span>
          <span className="text-[8px] font-mono text-charcoal-muted">
            {SETUP_STEPS[state.currentStep] ? SETUP_STEPS[state.currentStep].title : 'Ready'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {state.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-charcoal/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-charcoal text-xs">auto_awesome</span>
            </div>
            <div className="bg-[#F5F5F3] px-4 py-3 rounded-[2px]">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-charcoal/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Options selector */}
      {showOptions && lastAssistantMsg?.options && (
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-2">
            {lastAssistantMsg.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={`px-3 py-2 text-[10px] font-mono transition-all border ${
                  selectedOptions.has(opt.id)
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-white text-charcoal border-black/[0.08] hover:border-charcoal/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {opt.icon && <span className="material-symbols-outlined text-xs">{opt.icon}</span>}
                  <span className="font-bold uppercase tracking-wider">{opt.label}</span>
                  {selectedOptions.has(opt.id) && <span className="material-symbols-outlined text-xs">check</span>}
                </div>
                {opt.description && (
                  <div className={`text-[8px] mt-0.5 ${selectedOptions.has(opt.id) ? 'text-white/60' : 'text-charcoal-muted'}`}>{opt.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Component suggestions */}
      {lastAssistantMsg?.componentSuggestions && state.messages[state.messages.length - 1]?.role === 'assistant' && (
        <div className="px-5 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {lastAssistantMsg.componentSuggestions.map((s) => {
              const comp = state.availableComponents.find((c) => c.id === s.componentId);
              if (!comp) return null;
              return (
                <div key={s.componentId} className="flex items-center gap-2 px-3 py-2 bg-green-50/50 border border-green-200/50 text-[10px] font-mono">
                  <span className="material-symbols-outlined text-xs text-green-600">{comp.icon}</span>
                  <span className="font-bold text-charcoal">{comp.name}</span>
                  <span className="material-symbols-outlined text-xs text-green-500 ml-auto">check_circle</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 border-t border-black/[0.06] bg-[#FAFAF8]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedOptions.size > 0 ? 'Press Send to confirm selection, or type to add more...' : 'Type your response...'}
            className="flex-1 bg-white border border-black/[0.08] px-4 py-2.5 font-mono text-xs text-charcoal focus:outline-none focus:border-charcoal transition-colors placeholder:text-charcoal-muted/50"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && selectedOptions.size === 0}
            className="bg-charcoal text-white px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:opacity-30 flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-xs">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Message Bubble ─────────────────────────────────────────────────
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isAssistant ? 'bg-charcoal/10' : 'bg-charcoal'}`}>
        <span className={`material-symbols-outlined text-xs ${isAssistant ? 'text-charcoal' : 'text-white'}`}>
          {isAssistant ? 'auto_awesome' : 'person'}
        </span>
      </div>
      <div className={`max-w-[85%] ${isAssistant ? '' : 'text-right'}`}>
        <div className={`inline-block px-4 py-3 text-[11px] font-mono leading-relaxed whitespace-pre-line ${
          isAssistant ? 'bg-[#F5F5F3] text-charcoal rounded-[2px]' : 'bg-charcoal text-white rounded-[2px]'
        }`}>
          {message.content}
        </div>
        <div className={`text-[8px] font-mono text-charcoal-muted/40 mt-1 ${isAssistant ? '' : 'text-right'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
