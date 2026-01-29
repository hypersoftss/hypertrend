import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ApiKey, User } from '@/types';
import { mockApiKeys as initialMockApiKeys, mockUsers as initialMockUsers, generateApiKey as genKey } from '@/lib/mockData';

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

  // API Key operations
  const addApiKey = useCallback((key: ApiKey) => {
    setApiKeys(prev => {
      const updated = [key, ...prev];
      saveToStorage('hyper_api_keys', updated);
      return updated;
    });
  }, []);

  const updateApiKey = useCallback((keyId: string, updates: Partial<ApiKey>) => {
    setApiKeys(prev => {
      const updated = prev.map(k => k.id === keyId ? { ...k, ...updates } : k);
      saveToStorage('hyper_api_keys', updated);
      return updated;
    });
  }, []);

  const deleteApiKey = useCallback((keyId: string) => {
    setApiKeys(prev => {
      const updated = prev.filter(k => k.id !== keyId);
      saveToStorage('hyper_api_keys', updated);
      return updated;
    });
  }, []);

  // User operations
  const addUser = useCallback((user: User) => {
    setUsers(prev => {
      const updated = [user, ...prev];
      saveToStorage('hyper_users', updated);
      return updated;
    });
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, ...updates } : u);
      saveToStorage('hyper_users', updated);
      return updated;
    });
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      saveToStorage('hyper_users', updated);
      return updated;
    });
  }, []);

  // Utility functions
  const generateApiKey = useCallback((prefix: string = 'HYPER') => {
    return genKey(prefix);
  }, []);

  const refreshData = useCallback(() => {
    setApiKeys(loadFromStorage('hyper_api_keys', initialMockApiKeys));
    setUsers(loadFromStorage('hyper_users', initialMockUsers));
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
