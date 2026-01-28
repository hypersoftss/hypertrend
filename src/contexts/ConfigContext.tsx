import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SiteConfig {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  adminEmail: string;
  logoUrl: string;
  faviconUrl: string;
  apiDomain: string;
  apiEndpoint: string;
  telegramBotToken: string;
  adminTelegramId: string;
}

interface ConfigContextType {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
}

const defaultConfig: SiteConfig = {
  siteName: 'Hyper Softs',
  siteDescription: 'Trend API Management System',
  supportEmail: 'support@hypersofts.com',
  adminEmail: 'admin@hypersofts.com',
  logoUrl: '',
  faviconUrl: '',
  apiDomain: 'https://betapi.space',
  apiEndpoint: '/Xdrtrend',
  telegramBotToken: '7843243355:AAFaHx7XrIAehoIqVRw83uEkZGjT8G75HO8',
  adminTelegramId: '1896145195',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(() => {
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

  const updateConfig = (updates: Partial<SiteConfig>) => {
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

export const buildApiUrl = (typeId: string, config: SiteConfig): string => {
  return `${config.apiDomain}${config.apiEndpoint}?typeId=${typeId}`;
};

export type { SiteConfig };
