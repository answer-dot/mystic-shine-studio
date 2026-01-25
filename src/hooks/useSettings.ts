import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, SiteSettings } from '@/lib/store';

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const updateSettings = useCallback((updates: Partial<SiteSettings>) => {
    saveSettings(updates);
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const refreshSettings = useCallback(() => {
    setSettings(getSettings());
  }, []);

  return { settings, updateSettings, refreshSettings };
};
