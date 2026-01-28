// Game Types
export type GameType = 'wingo' | 'k3' | '5d' | 'trx' | 'numeric';

export type GameDuration = '1min' | '3min' | '5min' | '10min' | '30min';

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  telegramId?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  gameType: GameType;
  duration: GameDuration;
  domain: string;
  ipWhitelist: string[];
  domainWhitelist: string[];
  validityDays: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
  totalCalls: number;
  lastUsed?: string;
}

// Log Types
export interface ApiLog {
  id: string;
  apiKeyId: string;
  endpoint: string;
  ip: string;
  domain: string;
  status: 'success' | 'error' | 'blocked';
  responseTime: number;
  createdAt: string;
}

export interface TelegramLog {
  id: string;
  type: 'new_key' | 'reminder' | 'renewal_request' | 'login_alert' | 'health_status';
  recipientId: string;
  message: string;
  status: 'sent' | 'failed';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}

// Settings Types
export interface Settings {
  siteName: string;
  logo?: string;
  adminEmail: string;
  telegramBotToken?: string;
  adminTelegramId?: string;
  webhookUrl?: string;
  betApiKey: string;
  autoReminderDays: number;
}

// Stats Types
export interface DashboardStats {
  totalUsers: number;
  activeKeys: number;
  expiredKeys: number;
  todayApiCalls: number;
  totalApiCalls: number;
  serverHealth: 'healthy' | 'warning' | 'critical';
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Renewal Request
export interface RenewalRequest {
  id: string;
  userId: string;
  apiKeyId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
