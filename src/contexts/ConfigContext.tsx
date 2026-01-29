import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SiteConfig {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  adminEmail: string;
  logoUrl: string;
  faviconUrl: string;
  // Internal API (actual source - hidden from users)
  apiDomain: string;
  apiEndpoint: string;
  // User-facing API (what merchants/users see in documentation)
  userApiDomain: string;
  userApiEndpoint: string;
  telegramBotToken: string;
  adminTelegramId: string;
  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessage: string;
  ownerTelegramId: string;
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
  // Internal - the REAL API source (hidden)
  apiDomain: 'https://betapi.space',
  apiEndpoint: '/Xdrtrend',
  // User-facing - Edge Function API
  userApiDomain: 'https://xynoldhqgtrmmsccutfp.supabase.co/functions/v1/trend-api',
  userApiEndpoint: '',
  telegramBotToken: '7843243355:AAFaHx7XrIAehoIqVRw83uEkZGjT8G75HO8',
  adminTelegramId: '1896145195',
  // Maintenance Mode
  maintenanceMode: false,
  maintenanceMessage: 'System is under maintenance. Please try again later.',
  ownerTelegramId: 'Hyperdeveloperr',
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

// Build URL for internal API (actual source - admin only)
export const buildInternalApiUrl = (typeId: string, config: SiteConfig): string => {
  return `${config.apiDomain}${config.apiEndpoint}?typeId=${typeId}`;
};

// Build URL for user-facing API (what merchants see)
export const buildUserApiUrl = (typeId: string, config: SiteConfig): string => {
  return `${config.userApiDomain}${config.userApiEndpoint}?typeId=${typeId}`;
};

export type { SiteConfig };
