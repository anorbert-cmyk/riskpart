// ─── Chat & Conversation ────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  // Optional rich content
  componentSuggestions?: ComponentSuggestion[];
  options?: ChatOption[];
  multiSelect?: boolean;
  inputType?: 'text' | 'select' | 'multiselect' | 'confirm';
  stepId?: string;
}

export interface ChatOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  selected?: boolean;
}

export interface ComponentSuggestion {
  componentId: string;
  reason: string;
}

// ─── Dashboard Components ───────────────────────────────────────────
export interface DashboardComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ComponentCategory;
  isActive: boolean;
  priority: 'primary' | 'secondary' | 'optional';
  gridWidth: 1 | 2 | 3; // how many columns it spans (out of 3)
  gridHeight: 1 | 2; // how many rows
}

export type ComponentCategory =
  | 'market-overview'
  | 'inventory'
  | 'pricing'
  | 'liquidity'
  | 'alerts'
  | 'analytics'
  | 'watchlist'
  | 'trading';

// ─── Table Configuration ────────────────────────────────────────────
export interface TableColumn {
  id: string;
  label: string;
  category: 'identifier' | 'pricing' | 'analytics' | 'liquidity' | 'meta';
  visible: boolean;
  priority: 'critical' | 'useful' | 'hidden';
  width?: number;
}

// ─── Alert Configuration ────────────────────────────────────────────
export interface AlertConfig {
  id: string;
  label: string;
  type: 'critical' | 'info' | 'warning';
  enabled: boolean;
  scope: 'universe' | 'watchlist';
}

// ─── Builder State ──────────────────────────────────────────────────
export interface BuilderProfile {
  name: string;
  occupation: string;
  role: string;
  desk: string;
  primaryTask: string;
}

export interface BuilderPreferences {
  primaryGoal: string;
  secondaryGoals: string[];
  bondUniverses: string[];
  defaultScope: string;
  primaryIdentifier: string;
  secondaryIdentifier: string;
  groupingLogic: string;
  aboveTheFold: string[];
  criticalInputs: string[];
  usefulInputs: string[];
  freshnessMode: string;
  workflowMode: string;
}

export interface BuilderState {
  // Flow state
  phase: 'landing' | 'role-setup' | 'ai-setup' | 'review' | 'building' | 'dashboard';
  currentStep: number;
  totalSteps: number;

  // User data
  profile: BuilderProfile;
  preferences: BuilderPreferences;

  // Dashboard config
  activeComponents: DashboardComponent[];
  availableComponents: DashboardComponent[];
  tableColumns: TableColumn[];
  alerts: AlertConfig[];

  // Chat
  messages: ChatMessage[];

  // UI state
  isEditPanelOpen: boolean;
  isBuilding: boolean;
  buildProgress: number;
}

// ─── Setup Steps ────────────────────────────────────────────────────
export interface SetupStep {
  id: string;
  number: number;
  title: string;
  description: string;
  phase: 'intro' | 'profile' | 'goals' | 'market' | 'data' | 'alerts' | 'workflow' | 'review' | 'build';
}

export const SETUP_STEPS: SetupStep[] = [
  { id: 'welcome', number: 0, title: 'Welcome', description: 'AI setup introduction', phase: 'intro' },
  { id: 'profile', number: 1, title: 'Profile', description: 'Role and background', phase: 'profile' },
  { id: 'primary-goal', number: 2, title: 'Primary Goal', description: 'Dashboard purpose', phase: 'goals' },
  { id: 'bond-universe', number: 3, title: 'Bond Universe', description: 'Market coverage', phase: 'market' },
  { id: 'identifiers', number: 4, title: 'Identifiers', description: 'Navigation and grouping', phase: 'market' },
  { id: 'above-fold', number: 5, title: 'Above the Fold', description: 'Priority elements', phase: 'data' },
  { id: 'decision-inputs', number: 6, title: 'Decision Inputs', description: 'Critical data points', phase: 'data' },
  { id: 'data-freshness', number: 7, title: 'Data Quality', description: 'Source and freshness', phase: 'data' },
  { id: 'alerts', number: 8, title: 'Alerts', description: 'Exceptions and notifications', phase: 'alerts' },
  { id: 'workflow', number: 9, title: 'Workflow', description: 'Interaction preferences', phase: 'workflow' },
  { id: 'ai-recommendation', number: 10, title: 'AI Recommendation', description: 'Dashboard proposal', phase: 'review' },
  { id: 'component-review', number: 11, title: 'Component Review', description: 'Validate and modify', phase: 'review' },
  { id: 'column-config', number: 12, title: 'Table Columns', description: 'Inventory fields', phase: 'review' },
  { id: 'alert-finalize', number: 13, title: 'Alert Finalize', description: 'Final alert config', phase: 'review' },
  { id: 'full-review', number: 14, title: 'Full Review', description: 'Complete overview', phase: 'review' },
  { id: 'approve', number: 15, title: 'Approve', description: 'Final confirmation', phase: 'build' },
  { id: 'building', number: 16, title: 'Building', description: 'Dashboard creation', phase: 'build' },
  { id: 'complete', number: 17, title: 'Complete', description: 'Dashboard ready', phase: 'build' },
];

// ─── Default Components Catalog ─────────────────────────────────────
export const COMPONENT_CATALOG: DashboardComponent[] = [
  { id: 'market-pulse', name: 'Market Pulse', description: 'Real-time treasury yields, credit index spreads, and key market indicators', icon: 'monitoring', category: 'market-overview', isActive: false, priority: 'primary', gridWidth: 3, gridHeight: 1 },
  { id: 'collapsed-inventory', name: 'Collapsed Inventory', description: 'Aggregated bond inventory with grouping by issuer, sector, or rating', icon: 'table_chart', category: 'inventory', isActive: false, priority: 'primary', gridWidth: 3, gridHeight: 2 },
  { id: 'dealer-axes', name: 'Dealer Axes & Inventory', description: 'Aggregated dealer axes with direction, size, and freshness indicators', icon: 'swap_vert', category: 'trading', isActive: false, priority: 'primary', gridWidth: 2, gridHeight: 1 },
  { id: 'trace-prints', name: 'Recent TRACE Prints', description: 'Latest TRACE transaction data with size, price, and yield', icon: 'receipt_long', category: 'pricing', isActive: false, priority: 'primary', gridWidth: 2, gridHeight: 1 },
  { id: 'reference-pricing', name: 'Reference Pricing', description: 'Composite reference prices with source attribution and confidence', icon: 'price_check', category: 'pricing', isActive: false, priority: 'secondary', gridWidth: 1, gridHeight: 1 },
  { id: 'liquidity-panel', name: 'Liquidity Panel', description: 'Liquidity scores, bid-ask spreads, quote dispersion, and depth', icon: 'water_drop', category: 'liquidity', isActive: false, priority: 'secondary', gridWidth: 1, gridHeight: 1 },
  { id: 'watchlist', name: 'Watchlist', description: 'Personal watchlist with real-time updates and alert integration', icon: 'visibility', category: 'watchlist', isActive: false, priority: 'primary', gridWidth: 1, gridHeight: 2 },
  { id: 'alerts-exceptions', name: 'Alerts & Exceptions', description: 'Active alerts for spread moves, new axes, volume spikes, and stale quotes', icon: 'notifications_active', category: 'alerts', isActive: false, priority: 'primary', gridWidth: 1, gridHeight: 1 },
  { id: 'relative-value', name: 'Relative Value', description: 'Comparable bonds analysis with spread differentials and curve positioning', icon: 'compare_arrows', category: 'analytics', isActive: false, priority: 'secondary', gridWidth: 2, gridHeight: 1 },
  { id: 'volume-monitor', name: 'TRACE Volume Monitor', description: 'Volume heatmap by sector, rating, and maturity bucket', icon: 'bar_chart', category: 'analytics', isActive: false, priority: 'secondary', gridWidth: 2, gridHeight: 1 },
  { id: 'heatmap', name: 'Spread Heatmap', description: 'Visual heatmap of spread changes across sectors and ratings', icon: 'grid_view', category: 'analytics', isActive: false, priority: 'optional', gridWidth: 2, gridHeight: 1 },
  { id: 'yield-curve', name: 'Yield Curve', description: 'Interactive treasury and credit yield curves with historical overlay', icon: 'show_chart', category: 'market-overview', isActive: false, priority: 'optional', gridWidth: 1, gridHeight: 1 },
  { id: 'new-issues', name: 'New Issues Monitor', description: 'New bond issuances in your coverage universe with pricing details', icon: 'fiber_new', category: 'market-overview', isActive: false, priority: 'optional', gridWidth: 1, gridHeight: 1 },
  { id: 'ratings-snapshot', name: 'Ratings Snapshot', description: 'Rating distribution and recent rating actions in your universe', icon: 'stars', category: 'analytics', isActive: false, priority: 'optional', gridWidth: 1, gridHeight: 1 },
  { id: 'dealer-ranking', name: 'Dealer Ranking', description: 'Top dealers by volume, axes frequency, and execution quality', icon: 'leaderboard', category: 'trading', isActive: false, priority: 'optional', gridWidth: 1, gridHeight: 1 },
  { id: 'sector-performance', name: 'Sector Performance', description: 'Sector-level spread and return performance with trend indicators', icon: 'donut_small', category: 'analytics', isActive: false, priority: 'optional', gridWidth: 1, gridHeight: 1 },
  { id: 'security-detail', name: 'Security Detail', description: 'Deep-dive bond detail drawer with full analytics and history', icon: 'article', category: 'inventory', isActive: false, priority: 'secondary', gridWidth: 1, gridHeight: 1 },
  { id: 'portfolio-summary', name: 'Portfolio Summary', description: 'Portfolio-level metrics, exposures, and risk breakdown', icon: 'account_balance', category: 'analytics', isActive: false, priority: 'optional', gridWidth: 2, gridHeight: 1 },
];

// ─── Default Table Columns ──────────────────────────────────────────
export const DEFAULT_TABLE_COLUMNS: TableColumn[] = [
  { id: 'cusip', label: 'CUSIP', category: 'identifier', visible: true, priority: 'critical' },
  { id: 'isin', label: 'ISIN', category: 'identifier', visible: false, priority: 'useful' },
  { id: 'ticker', label: 'Ticker', category: 'identifier', visible: true, priority: 'critical' },
  { id: 'issuer', label: 'Issuer', category: 'identifier', visible: true, priority: 'critical' },
  { id: 'coupon', label: 'Coupon', category: 'meta', visible: true, priority: 'useful' },
  { id: 'maturity', label: 'Maturity', category: 'meta', visible: true, priority: 'critical' },
  { id: 'rating', label: 'Rating', category: 'meta', visible: true, priority: 'critical' },
  { id: 'bid', label: 'Bid', category: 'pricing', visible: true, priority: 'critical' },
  { id: 'ask', label: 'Ask', category: 'pricing', visible: true, priority: 'critical' },
  { id: 'mid', label: 'Mid', category: 'pricing', visible: false, priority: 'useful' },
  { id: 'spread', label: 'Spread', category: 'pricing', visible: true, priority: 'critical' },
  { id: 'yield', label: 'Yield', category: 'pricing', visible: true, priority: 'critical' },
  { id: 'ytw', label: 'YTW', category: 'pricing', visible: false, priority: 'useful' },
  { id: 'duration', label: 'Duration', category: 'analytics', visible: false, priority: 'useful' },
  { id: 'trace-price', label: 'Last TRACE', category: 'pricing', visible: true, priority: 'useful' },
  { id: 'trace-time', label: 'Last Trade', category: 'pricing', visible: true, priority: 'useful' },
  { id: 'trace-volume', label: 'Volume', category: 'liquidity', visible: false, priority: 'useful' },
  { id: 'liquidity-score', label: 'Liq. Score', category: 'liquidity', visible: true, priority: 'useful' },
  { id: 'ref-price', label: 'Ref. Price', category: 'pricing', visible: true, priority: 'useful' },
  { id: 'axes-count', label: 'Axes', category: 'liquidity', visible: true, priority: 'useful' },
  { id: 'amount-out', label: 'Amt Out', category: 'meta', visible: false, priority: 'hidden' },
  { id: 'sector', label: 'Sector', category: 'meta', visible: true, priority: 'useful' },
  { id: 'delta-1d', label: 'Δ 1D', category: 'analytics', visible: false, priority: 'useful' },
];

// ─── Default Alerts ─────────────────────────────────────────────────
export const DEFAULT_ALERTS: AlertConfig[] = [
  { id: 'new-axe', label: 'New Dealer Axe', type: 'info', enabled: true, scope: 'watchlist' },
  { id: 'trace-print', label: 'New TRACE Print', type: 'info', enabled: true, scope: 'watchlist' },
  { id: 'spread-widen', label: 'Spread Widening', type: 'warning', enabled: true, scope: 'universe' },
  { id: 'spread-tight', label: 'Spread Tightening', type: 'info', enabled: true, scope: 'universe' },
  { id: 'bid-ask-move', label: 'Bid/Ask Move', type: 'warning', enabled: false, scope: 'watchlist' },
  { id: 'stale-quote', label: 'Stale Quote', type: 'warning', enabled: true, scope: 'universe' },
  { id: 'liq-deterioration', label: 'Liquidity Deterioration', type: 'critical', enabled: true, scope: 'universe' },
  { id: 'price-gap', label: 'Large Gap vs Reference', type: 'critical', enabled: true, scope: 'universe' },
  { id: 'watchlist-activity', label: 'Watchlist Activity', type: 'info', enabled: true, scope: 'watchlist' },
  { id: 'rating-action', label: 'Rating Action', type: 'critical', enabled: true, scope: 'universe' },
  { id: 'volume-spike', label: 'Volume Spike', type: 'warning', enabled: false, scope: 'universe' },
  { id: 'new-issue', label: 'New Issue in Universe', type: 'info', enabled: false, scope: 'universe' },
];

// ─── Role Presets ───────────────────────────────────────────────────
export interface RolePreset {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  defaultComponents: string[];
  description: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  { id: 'portfolio-manager', title: 'Portfolio Manager', subtitle: 'Investment oversight & allocation', icon: 'account_balance', defaultComponents: ['market-pulse', 'collapsed-inventory', 'watchlist', 'alerts-exceptions', 'relative-value', 'portfolio-summary', 'yield-curve', 'ratings-snapshot'], description: 'Monitoring-first view with portfolio-level analytics and risk metrics' },
  { id: 'trader', title: 'Trader', subtitle: 'Execution & liquidity', icon: 'trending_up', defaultComponents: ['market-pulse', 'collapsed-inventory', 'dealer-axes', 'trace-prints', 'liquidity-panel', 'watchlist', 'alerts-exceptions', 'volume-monitor'], description: 'Execution-focused with real-time pricing, dealer axes, and liquidity data' },
  { id: 'sales-trader', title: 'Sales Trader', subtitle: 'Client flow & pricing', icon: 'handshake', defaultComponents: ['market-pulse', 'collapsed-inventory', 'dealer-axes', 'trace-prints', 'reference-pricing', 'watchlist', 'alerts-exceptions', 'dealer-ranking'], description: 'Client-facing view with pricing validation and dealer intelligence' },
  { id: 'credit-analyst', title: 'Credit Analyst', subtitle: 'Fundamental research', icon: 'analytics', defaultComponents: ['market-pulse', 'collapsed-inventory', 'relative-value', 'ratings-snapshot', 'sector-performance', 'new-issues', 'yield-curve'], description: 'Analysis-oriented with relative value, sector trends, and credit metrics' },
  { id: 'risk-manager', title: 'Risk Manager', subtitle: 'Risk monitoring & limits', icon: 'shield', defaultComponents: ['market-pulse', 'collapsed-inventory', 'alerts-exceptions', 'portfolio-summary', 'heatmap', 'volume-monitor', 'ratings-snapshot'], description: 'Risk-first view with alerts, exposure analysis, and limit monitoring' },
];
