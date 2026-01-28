import { ApiKey, User, ApiLog, TelegramLog, ActivityLog, DashboardStats, RenewalRequest } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@hypersofts.com',
    telegramId: '6596742955',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2026-01-28T10:30:00Z',
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    telegramId: '1896145195',
    role: 'user',
    isActive: true,
    createdAt: '2024-06-15T00:00:00Z',
    lastLogin: '2026-01-27T15:45:00Z',
  },
  {
    id: '3',
    username: 'player42',
    email: 'player42@domain.com',
    telegramId: '9876543210',
    role: 'user',
    isActive: true,
    createdAt: '2024-08-20T00:00:00Z',
    lastLogin: '2026-01-26T08:20:00Z',
  },
  {
    id: '4',
    username: 'testuser',
    email: 'test@test.com',
    role: 'user',
    isActive: false,
    createdAt: '2024-10-01T00:00:00Z',
  },
];

// Mock API Keys
export const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    key: 'HYPER_759e8099ed951258554d67f0bba90195751957d187a0bdef',
    userId: '2',
    gameType: 'wingo',
    duration: '1min',
    domain: '107.172.75.145',
    ipWhitelist: ['107.172.75.145', '192.168.1.1'],
    domainWhitelist: ['107.172.75.145'],
    validityDays: 30,
    expiresAt: '2026-02-17T23:30:23Z',
    createdAt: '2026-01-18T23:30:23Z',
    isActive: true,
    totalCalls: 15420,
    lastUsed: '2026-01-28T09:15:00Z',
  },
  {
    id: '2',
    key: 'HYPER_2b69446cb62e30fffb9cb0530075451fdd51e5515c371107',
    userId: '3',
    gameType: 'trx',
    duration: '5min',
    domain: 'p2plottery.club',
    ipWhitelist: ['45.33.32.156'],
    domainWhitelist: ['p2plottery.club', 'www.p2plottery.club'],
    validityDays: 30,
    expiresAt: '2025-12-24T02:06:27Z',
    createdAt: '2025-11-24T02:06:28Z',
    isActive: false,
    totalCalls: 8932,
    lastUsed: '2025-12-20T18:45:00Z',
  },
  {
    id: '3',
    key: 'HYPER_abc123def456ghi789jkl012mno345pqr678stu901vwx234',
    userId: '2',
    gameType: 'k3',
    duration: '3min',
    domain: 'mygamesite.com',
    ipWhitelist: ['203.0.113.50'],
    domainWhitelist: ['mygamesite.com'],
    validityDays: 60,
    expiresAt: '2026-03-15T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
    isActive: true,
    totalCalls: 3250,
    lastUsed: '2026-01-28T08:00:00Z',
  },
  {
    id: '4',
    key: 'HYPER_5d_sample_key_for_testing_purposes_only_12345678',
    userId: '3',
    gameType: '5d',
    duration: '10min',
    domain: 'lottery5d.net',
    ipWhitelist: ['198.51.100.1'],
    domainWhitelist: ['lottery5d.net'],
    validityDays: 15,
    expiresAt: '2026-02-05T00:00:00Z',
    createdAt: '2026-01-21T00:00:00Z',
    isActive: true,
    totalCalls: 1120,
    lastUsed: '2026-01-27T22:30:00Z',
  },
];

// Mock API Logs
export const mockApiLogs: ApiLog[] = [
  {
    id: '1',
    apiKeyId: '1',
    endpoint: '/api/trend/wingo/wg1',
    ip: '107.172.75.145',
    domain: '107.172.75.145',
    status: 'success',
    responseTime: 45,
    createdAt: '2026-01-28T09:15:00Z',
  },
  {
    id: '2',
    apiKeyId: '1',
    endpoint: '/api/trend/wingo/wg3',
    ip: '107.172.75.145',
    domain: '107.172.75.145',
    status: 'success',
    responseTime: 52,
    createdAt: '2026-01-28T09:14:30Z',
  },
  {
    id: '3',
    apiKeyId: '3',
    endpoint: '/api/trend/k3/k31',
    ip: '203.0.113.50',
    domain: 'mygamesite.com',
    status: 'success',
    responseTime: 38,
    createdAt: '2026-01-28T08:00:00Z',
  },
  {
    id: '4',
    apiKeyId: '1',
    endpoint: '/api/trend/wingo/wg5',
    ip: '192.168.1.100',
    domain: 'unknown.com',
    status: 'blocked',
    responseTime: 5,
    createdAt: '2026-01-28T07:45:00Z',
  },
  {
    id: '5',
    apiKeyId: '4',
    endpoint: '/api/trend/5d/5d1',
    ip: '198.51.100.1',
    domain: 'lottery5d.net',
    status: 'success',
    responseTime: 62,
    createdAt: '2026-01-27T22:30:00Z',
  },
];

// Mock Telegram Logs
export const mockTelegramLogs: TelegramLog[] = [
  {
    id: '1',
    type: 'new_key',
    recipientId: '6596742955',
    message: 'New API Key Generated for user1',
    status: 'sent',
    createdAt: '2026-01-18T23:30:23Z',
  },
  {
    id: '2',
    type: 'reminder',
    recipientId: '1896145195',
    message: 'API Key expiring in 6 days',
    status: 'sent',
    createdAt: '2026-01-11T20:07:32Z',
  },
  {
    id: '3',
    type: 'renewal_request',
    recipientId: '6596742955',
    message: 'Renewal request from player42',
    status: 'sent',
    createdAt: '2026-01-25T14:20:00Z',
  },
  {
    id: '4',
    type: 'login_alert',
    recipientId: '6596742955',
    message: 'Admin login detected',
    status: 'sent',
    createdAt: '2026-01-28T10:30:00Z',
  },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'LOGIN',
    details: 'Admin logged in successfully',
    ip: '192.168.1.1',
    createdAt: '2026-01-28T10:30:00Z',
  },
  {
    id: '2',
    userId: '1',
    action: 'CREATE_KEY',
    details: 'Created API key for user1 (WinGo)',
    ip: '192.168.1.1',
    createdAt: '2026-01-18T23:30:23Z',
  },
  {
    id: '3',
    userId: '2',
    action: 'LOGIN',
    details: 'User logged in successfully',
    ip: '107.172.75.145',
    createdAt: '2026-01-27T15:45:00Z',
  },
  {
    id: '4',
    userId: '1',
    action: 'SEND_REMINDER',
    details: 'Manual reminder sent to user1',
    ip: '192.168.1.1',
    createdAt: '2026-01-11T20:07:32Z',
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalUsers: 4,
  activeKeys: 3,
  expiredKeys: 1,
  todayApiCalls: 156,
  totalApiCalls: 28722,
  serverHealth: 'healthy',
};

// Mock Renewal Requests
export const mockRenewalRequests: RenewalRequest[] = [
  {
    id: '1',
    userId: '3',
    apiKeyId: '2',
    message: 'Please renew my TRX key for another 30 days',
    status: 'pending',
    createdAt: '2025-12-23T10:00:00Z',
  },
];

// Helper functions
export const generateApiKey = (prefix: string = 'HYPER'): string => {
  const chars = 'abcdef0123456789';
  let key = `${prefix}_`;
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export const formatDate = (dateString: string, includeTime: boolean = true): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    timeZone: 'Asia/Kolkata',
  };
  return date.toLocaleString('en-IN', options);
};

export const getDaysUntilExpiry = (expiresAt: string): number => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};
