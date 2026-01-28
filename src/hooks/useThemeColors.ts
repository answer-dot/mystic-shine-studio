import { useEffect } from 'react';
import { useSettings } from './useSettings';

// Convert HEX to HSL for CSS variables
const hexToHsl = (hex: string): string => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  let r = parseInt(hex.slice(0, 2), 16) / 255;
  let g = parseInt(hex.slice(2, 4), 16) / 255;
  let b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Return HSL values without the hsl() wrapper (for CSS variable format)
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Calculate foreground color based on background luminance
const getContrastColor = (hex: string): string => {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '0 0% 10%' : '0 0% 98%';
};

export const useThemeColors = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply primary color (for buttons, accents, highlights)
    if (settings.primaryColor) {
      const primaryHsl = hexToHsl(settings.primaryColor);
      
      // Set primary color variables
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--accent', primaryHsl);
      root.style.setProperty('--gold', primaryHsl);
      root.style.setProperty('--gold-light', primaryHsl);
      root.style.setProperty('--gold-dark', primaryHsl);
      root.style.setProperty('--gold-glow', primaryHsl);
      
      // Calculate foreground for primary
      const primaryForeground = getContrastColor(settings.primaryColor);
      root.style.setProperty('--primary-foreground', primaryForeground);
      root.style.setProperty('--accent-foreground', primaryForeground);
      
      // Update gradient variables with new primary color
      root.style.setProperty('--gradient-gold', `linear-gradient(135deg, ${settings.primaryColor}, ${settings.primaryColor})`);
      root.style.setProperty('--gradient-gold-hover', `linear-gradient(135deg, ${settings.primaryColor}, ${settings.primaryColor})`);
      root.style.setProperty('--shadow-gold', `0 4px 30px -5px ${settings.primaryColor}50`);
    }
    
    // Apply background color
    if (settings.backgroundColor) {
      const bgHsl = hexToHsl(settings.backgroundColor);
      const textColor = getContrastColor(settings.backgroundColor);
      
      // Set background variables
      root.style.setProperty('--background', bgHsl);
      root.style.setProperty('--foreground', textColor);
      
      // Adjust card and surface colors based on background
      const isLightBg = settings.backgroundColor.toLowerCase() !== '#000000' && 
                        settings.backgroundColor.toLowerCase() !== '#0a0a0a';
      
      if (isLightBg) {
        // Light theme adjustments
        root.style.setProperty('--card', bgHsl);
        root.style.setProperty('--card-foreground', textColor);
        root.style.setProperty('--popover', bgHsl);
        root.style.setProperty('--popover-foreground', textColor);
        root.style.setProperty('--muted', '0 0% 96%');
        root.style.setProperty('--muted-foreground', '0 0% 45%');
        root.style.setProperty('--border', '0 0% 90%');
        root.style.setProperty('--input', '0 0% 90%');
      } else {
        // Dark theme adjustments
        root.style.setProperty('--card', '0 0% 8%');
        root.style.setProperty('--card-foreground', '45 10% 95%');
        root.style.setProperty('--popover', '0 0% 8%');
        root.style.setProperty('--popover-foreground', '45 10% 95%');
        root.style.setProperty('--muted', '0 0% 15%');
        root.style.setProperty('--muted-foreground', '0 0% 60%');
        root.style.setProperty('--border', '0 0% 18%');
        root.style.setProperty('--input', '0 0% 15%');
      }
    }
  }, [settings.primaryColor, settings.backgroundColor]);

  return {
    primaryColor: settings.primaryColor || '#f97316',
    backgroundColor: settings.backgroundColor || '#ffffff',
  };
};
