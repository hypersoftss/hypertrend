import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ApiKey, User, ActivityLog, TelegramLog, ApiLog } from '@/types';
import { mockApiKeys as initialMockApiKeys, mockUsers as initialMockUsers, mockActivityLogs as initialActivityLogs, mockTelegramLogs as initialTelegramLogs, mockApiLogs as initialApiLogs, generateApiKey as genKey } from '@/lib/mockData';

interface ApiDataContextType {
  // API Keys
  apiKeys: ApiKey[];
  addApiKey: (key: ApiKey) => void;
  updateApiKey: (keyId: string, updates: Partial<ApiKey>) => void;
  deleteApiKey: (keyId: string) => void;
  
  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  
  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string, userId?: string) => void;
  
  // Telegram Logs
  telegramLogs: TelegramLog[];
  addTelegramLog: (type: TelegramLog['type'], recipientId: string, message: string, status?: 'sent' | 'failed') => void;
  
  // API Logs
  apiLogs: ApiLog[];
  addApiLog: (log: Omit<ApiLog, 'id' | 'createdAt'>) => void;
  
  // Utility
  generateApiKey: (prefix?: string) => string;
  refreshData: () => void;
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

// Load from localStorage or use initial mock data
const loadFromStorage = <T,>(key: string, initialData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }
  return initialData;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const ApiDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => 
    loadFromStorage('hyper_api_keys', initialMockApiKeys)
  );
  
  const [users, setUsers] = useState<User[]>(() => 
    loadFromStorage('hyper_users', initialMockUsers)
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => 
    loadFromStorage('hyper_activity_logs', initialActivityLogs)
  );

  const [telegramLogs, setTelegramLogs] = useState<TelegramLog[]>(() => 
    loadFromStorage('hyper_telegram_logs', initialTelegramLogs)
  );

  const [apiLogs, setApiLogs] = useState<ApiLog[]>(() => 
    loadFromStorage('hyper_api_logs', initialApiLogs)
  );

  // Sync all data to localStorage whenever they change
  React.useEffect(() => {
    saveToStorage('hyper_api_keys', apiKeys);
  }, [apiKeys]);

  React.useEffect(() => {
    saveToStorage('hyper_users', users);
  }, [users]);

  React.useEffect(() => {
    saveToStorage('hyper_activity_logs', activityLogs);
  }, [activityLogs]);

  React.useEffect(() => {
    saveToStorage('hyper_telegram_logs', telegramLogs);
  }, [telegramLogs]);

  React.useEffect(() => {
    saveToStorage('hyper_api_logs', apiLogs);
  }, [apiLogs]);

  // API Key operations
  const addApiKey = useCallback((key: ApiKey) => {
    setApiKeys(prev => [key, ...prev]);
  }, []);

  const updateApiKey = useCallback((keyId: string, updates: Partial<ApiKey>) => {
    setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, ...updates } : k));
  }, []);

  const deleteApiKey = useCallback((keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
  }, []);

  // User operations
  const addUser = useCallback((user: User) => {
    setUsers(prev => [user, ...prev]);
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  // Activity Log operations
  const addActivityLog = useCallback((action: string, details: string, userId?: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: userId || '1', // Default to admin
      action,
      details,
      ip: '192.168.1.1', // Simulated IP
      createdAt: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);

  // Telegram Log operations
  const addTelegramLog = useCallback((
    type: TelegramLog['type'], 
    recipientId: string, 
    message: string,
    status: 'sent' | 'failed' = 'sent'
  ) => {
    const newLog: TelegramLog = {
      id: Date.now().toString(),
      type,
      recipientId,
      message,
      status,
      createdAt: new Date().toISOString(),
    };
    setTelegramLogs(prev => [newLog, ...prev]);
  }, []);

  // API Log operations
  const addApiLog = useCallback((log: Omit<ApiLog, 'id' | 'createdAt'>) => {
    const newLog: ApiLog = {
      ...log,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setApiLogs(prev => [newLog, ...prev]);
  }, []);

  // Utility functions
  const generateApiKey = useCallback((prefix: string = 'HYPER') => {
    return genKey(prefix);
  }, []);

  const refreshData = useCallback(() => {
    setApiKeys(loadFromStorage('hyper_api_keys', initialMockApiKeys));
    setUsers(loadFromStorage('hyper_users', initialMockUsers));
    setActivityLogs(loadFromStorage('hyper_activity_logs', initialActivityLogs));
    setTelegramLogs(loadFromStorage('hyper_telegram_logs', initialTelegramLogs));
    setApiLogs(loadFromStorage('hyper_api_logs', initialApiLogs));
  }, []);

  return (
    <ApiDataContext.Provider value={{
      apiKeys,
      addApiKey,
      updateApiKey,
      deleteApiKey,
      users,
      addUser,
      updateUser,
      deleteUser,
      activityLogs,
      addActivityLog,
      telegramLogs,
      addTelegramLog,
      apiLogs,
      addApiLog,
      generateApiKey,
      refreshData,
    }}>
      {children}
    </ApiDataContext.Provider>
  );
};

export const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (context === undefined) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
};
