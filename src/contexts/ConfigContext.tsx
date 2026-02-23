import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  adminTelegramUsername: string;
  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessage: string;
  ownerTelegramId: string;
  // Payment
  upiId: string;
}

interface ConfigContextType {
  config: SiteConfig;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  refreshConfig: () => Promise<void>;
  isLoading: boolean;
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
  // User-facing - Your custom domain
  userApiDomain: 'https://trend.hyperapi.in',
  userApiEndpoint: '',
  telegramBotToken: '',
  adminTelegramId: '1896145195',
  adminTelegramUsername: '@Hyperdeveloperr',
  // Maintenance Mode
  maintenanceMode: false,
  maintenanceMessage: 'System is under maintenance. Please try again later.',
  ownerTelegramId: '@Hyperdeveloperr',
  // Payment
  upiId: 'payjha@fam',
};

// Settings key to config key mapping
const settingsKeyMap: Record<string, keyof SiteConfig> = {
  'site_name': 'siteName',
  'site_description': 'siteDescription',
  'support_email': 'supportEmail',
  'admin_email': 'adminEmail',
  'logo_url': 'logoUrl',
  'favicon_url': 'faviconUrl',
  'api_domain': 'apiDomain',
  'api_endpoint': 'apiEndpoint',
  'user_api_domain': 'userApiDomain',
  'user_api_endpoint': 'userApiEndpoint',
  'telegram_bot_token': 'telegramBotToken',
  'admin_telegram_id': 'adminTelegramId',
  'admin_telegram_username': 'adminTelegramUsername',
  'maintenance_mode': 'maintenanceMode',
  'maintenance_message': 'maintenanceMessage',
  'owner_telegram_id': 'ownerTelegramId',
  'upi_id': 'upiId',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings from Supabase
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const updates: Partial<SiteConfig> = {};
        
        data.forEach((setting) => {
          const configKey = settingsKeyMap[setting.key];
          if (configKey && setting.value !== null) {
            // Handle boolean values
            if (configKey === 'maintenanceMode') {
              updates[configKey] = setting.value === 'true';
            } else {
              (updates as any)[configKey] = setting.value;
            }
          }
        });

        setConfig(prev => ({ ...prev, ...updates }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchSettings();

    // Subscribe to settings changes
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
        },
        (payload) => {
          console.log('Settings changed:', payload);
          // Refresh config on any settings change
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateConfig = async (updates: Partial<SiteConfig>) => {
    // Update local state immediately
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    // Save to Supabase
    const reverseKeyMap: Record<string, string> = {};
    Object.entries(settingsKeyMap).forEach(([dbKey, configKey]) => {
      reverseKeyMap[configKey] = dbKey;
    });

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = reverseKeyMap[key];
      if (dbKey) {
        const stringValue = typeof value === 'boolean' ? String(value) : value;
        await supabase
          .from('settings')
          .upsert({ key: dbKey, value: stringValue as string }, { onConflict: 'key' });
      }
    }
  };

  const refreshConfig = async () => {
    setIsLoading(true);
    await fetchSettings();
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, refreshConfig, isLoading }}>
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