import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiConfig {
  apiDomain: string;
  apiEndpoint: string;
  telegramBotToken: string;
  adminTelegramId: string;
}

interface ConfigContextType {
  config: ApiConfig;
  updateConfig: (updates: Partial<ApiConfig>) => void;
}

const defaultConfig: ApiConfig = {
  apiDomain: 'https://betapi.space',
  apiEndpoint: '/Xdrtrend',
  telegramBotToken: '7843243355:AAFaHx7XrIAehoIqVRw83uEkZGjT8G75HO8',
  adminTelegramId: '1896145195',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ApiConfig>(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('hyper_config');
    if (stored) {
      try {
        return { ...defaultConfig, ...JSON.parse(stored) };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  const updateConfig = (updates: Partial<ApiConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('hyper_config', JSON.stringify(newConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// Helper to build full API URL
export const buildApiUrl = (typeId: string, config: ApiConfig): string => {
  return `${config.apiDomain}${config.apiEndpoint}?typeId=${typeId}`;
};
