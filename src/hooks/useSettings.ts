import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, SiteSettings, CurriculumItem, EventItem } from '@/lib/store';
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
] as const;

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from database on mount
  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value');
        
        if (error) {
          console.error('Failed to load settings from database:', error);
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
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDatabase();
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    // Immediately update local state
    setSettings(prev => ({ ...prev, ...updates }));
    
    // Save to localStorage as backup
    saveSettings(updates);

    // Save to database
    try {
      const upsertPromises = Object.entries(updates).map(async ([key, value]) => {
        // Skip adminPin - it has its own table
        if (key === 'adminPin') return;
        
        if (!DB_SETTINGS_KEYS.includes(key as any)) return;

        const { error } = await supabase
          .from('site_settings')
          .upsert(
            { key, value: value as any },
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
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');
      
      if (error) {
        console.error('Failed to refresh settings:', error);
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
      setSettings(getSettings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { settings, updateSettings, refreshSettings, isLoading };
};