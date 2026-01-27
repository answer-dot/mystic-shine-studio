import { useState, useEffect, useCallback, useRef } from 'react';
import { getSettings, saveSettings, SiteSettings, CurriculumItem, EventItem, TestimonialItem } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

// Keys that we store in the database
const DB_SETTINGS_KEYS = [
  'siteName',
  'webinarDate', 
  'remainingSeats',
  'instructorName',
  'instructorTitle',
  'instructorBio',
  'instructorImageUrl',
  'price',
  'originalPrice',
  'curriculum',
  'events',
  'testimonials',
  'resendApiKey',
] as const;

// Timeout for database operations
const DB_TIMEOUT_MS = 5000;

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadAttempted = useRef(false);

  // Load settings from database on mount
  useEffect(() => {
    // Prevent multiple load attempts
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const loadFromDatabase = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);

      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value');
        
        clearTimeout(timeoutId);

        if (error) {
          console.warn('Failed to load settings from database, using defaults:', error);
          setError(error);
          // Continue with local settings
          return;
        }

        if (data && data.length > 0) {
          const dbSettings: Record<string, unknown> = {};
          data.forEach(row => {
            const key = row.key;
            if (DB_SETTINGS_KEYS.includes(key as typeof DB_SETTINGS_KEYS[number])) {
              dbSettings[key] = row.value;
            }
          });
          
          setSettings(prev => ({ ...prev, ...dbSettings } as SiteSettings));
          // Also sync to localStorage for offline access
          saveSettings(dbSettings as Partial<SiteSettings>);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Error loading settings, using defaults:', error);
        setError(error as Error);
        // Continue with local settings - don't block the UI
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDatabase();
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    // Immediately update local state for responsive UI
    setSettings(prev => ({ ...prev, ...updates }));
    
    // Save to localStorage as backup
    saveSettings(updates);

    // Save to database in background (don't await)
    try {
      const upsertPromises = Object.entries(updates).map(async ([key, value]) => {
        // Skip adminPin - it has its own table
        if (key === 'adminPin') return;
        
        if (!DB_SETTINGS_KEYS.includes(key as typeof DB_SETTINGS_KEYS[number])) return;

        const { error } = await supabase
          .from('site_settings')
          .upsert(
            { key, value: value as never },
            { onConflict: 'key' }
          );

        if (error) {
          console.error(`Failed to save setting ${key}:`, error);
        }
      });

      await Promise.all(upsertPromises);
    } catch (error) {
      console.error('Error saving settings to database:', error);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');
      
      if (error) {
        console.error('Failed to refresh settings:', error);
        setError(error);
        setSettings(getSettings());
        return;
      }

      if (data && data.length > 0) {
        const dbSettings: Record<string, unknown> = {};
        data.forEach(row => {
          const key = row.key;
          if (DB_SETTINGS_KEYS.includes(key as typeof DB_SETTINGS_KEYS[number])) {
            dbSettings[key] = row.value;
          }
        });
        
        const localSettings = getSettings();
        setSettings({ ...localSettings, ...dbSettings } as SiteSettings);
      } else {
        setSettings(getSettings());
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
      setError(error as Error);
      setSettings(getSettings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { settings, updateSettings, refreshSettings, isLoading, error };
};
