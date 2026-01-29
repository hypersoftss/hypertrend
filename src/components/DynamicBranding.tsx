import { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';

/**
 * Component that dynamically updates favicon and document title
 * based on admin-configured settings stored in ConfigContext
 */
const DynamicBranding = () => {
  const { config } = useConfig();

  useEffect(() => {
    // Update document title
    if (config.siteName) {
      const currentTitle = document.title;
      // Only update if it doesn't already include the site name
      if (!currentTitle.includes(config.siteName)) {
        document.title = `${config.siteName} - Same Trend API`;
      }
    }

    // Update favicon
    const updateFavicon = (url: string) => {
      // Remove existing favicons
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingFavicons.forEach(el => el.remove());

      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = url.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      link.href = url;
      document.head.appendChild(link);

      // Also update apple-touch-icon
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleTouchIcon) {
        appleTouchIcon.setAttribute('href', url);
      } else {
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = url;
        document.head.appendChild(appleLink);
      }
    };

    // Use configured favicon or logo, fallback to PWA icon
    if (config.faviconUrl) {
      updateFavicon(config.faviconUrl);
    } else if (config.logoUrl) {
      updateFavicon(config.logoUrl);
    }

    // Update theme-color meta
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#8B5CF6');
    }

    // Update OG image if logo is set
    if (config.logoUrl) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', config.logoUrl);
      }
    }

  }, [config.siteName, config.logoUrl, config.faviconUrl]);

  return null; // This component doesn't render anything
};

export default DynamicBranding;
