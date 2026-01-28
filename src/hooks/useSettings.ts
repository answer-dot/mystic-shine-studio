import { useState, useEffect, useCallback, useRef } from 'react';
import { getSettings, saveSettings, SiteSettings, CurriculumItem, EventItem, TestimonialItem } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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
  'termsOfService',
  'privacyPolicy',
  'refundPolicy',
  'csEmail',
  'csPhone',
  'csAddress',
  'courseVisible',  // 강의 노출 여부 스위치
  'eventsVisible',  // 이벤트 섹션 노출 여부 스위치
  'primaryColor',   // 🎨 메인 테마 색상
  'backgroundColor', // 🎨 배경 색상
] as const;

// Timeout for database operations
const DB_TIMEOUT_MS = 5000;

// Helper to parse JSONB value from Supabase
const parseDbValue = (value: unknown): unknown => {
  // If it's already a primitive (string, number, boolean), return as-is
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  // If it's an object or array, return as-is (already parsed by Supabase)
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  return value;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadAttempted = useRef(false);
  const queryClient = useQueryClient();

  // Load settings from database and setup realtime subscription
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
          return;
        }

        if (data && data.length > 0) {
          const localSettings = getSettings();
          const dbSettings: Record<string, unknown> = {};
          
          data.forEach(row => {
            const key = row.key;
            if (DB_SETTINGS_KEYS.includes(key as typeof DB_SETTINGS_KEYS[number])) {
              // Parse the JSONB value properly
              dbSettings[key] = parseDbValue(row.value);
            }
          });
          
          // Merge with local settings, DB values take precedence
          const mergedSettings = { ...localSettings, ...dbSettings };
          setSettings(mergedSettings as SiteSettings);
          // Also sync to localStorage for offline access
          saveSettings(dbSettings as Partial<SiteSettings>);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Error loading settings, using defaults:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDatabase();

    // 🚀 REALTIME SUBSCRIPTION: Listen for site_settings changes
    const channel = supabase
      .channel('site-settings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('[Realtime] site_settings changed:', payload);
          
          // Handle different event types
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newRow = payload.new as { key: string; value: unknown };
            if (newRow && DB_SETTINGS_KEYS.includes(newRow.key as typeof DB_SETTINGS_KEYS[number])) {
              const parsedValue = parseDbValue(newRow.value);
              
              // Immediately update local state
              setSettings(prev => ({
                ...prev,
                [newRow.key]: parsedValue,
              }));
              
              // Update localStorage
              saveSettings({ [newRow.key]: parsedValue } as Partial<SiteSettings>);
              
              console.log(`[Realtime] Updated ${newRow.key} in real-time`);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { key: string };
            if (oldRow) {
              console.log(`[Realtime] Setting ${oldRow.key} was deleted`);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] site_settings subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('[Realtime] Unsubscribing from site_settings');
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    // Immediately update local state for responsive UI
    setSettings(prev => ({ ...prev, ...updates }));
    
    // Save to localStorage as backup
    saveSettings(updates);

    // Save to database - AWAIT to ensure it completes
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
          throw error;
        }
      });

      await Promise.all(upsertPromises);
      console.log('Settings saved to database:', Object.keys(updates));
      
      // 🔄 CACHE INVALIDATION: Clear relevant query caches to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    } catch (error) {
      console.error('Error saving settings to database:', error);
    }
  }, [queryClient]);

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
        const localSettings = getSettings();
        const dbSettings: Record<string, unknown> = {};
        
        data.forEach(row => {
          const key = row.key;
          if (DB_SETTINGS_KEYS.includes(key as typeof DB_SETTINGS_KEYS[number])) {
            dbSettings[key] = parseDbValue(row.value);
          }
        });
        
        const mergedSettings = { ...localSettings, ...dbSettings };
        setSettings(mergedSettings as SiteSettings);
        // Also update localStorage
        saveSettings(dbSettings as Partial<SiteSettings>);
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

  // Alias for compatibility
  const refetchSettings = refreshSettings;

  return { settings, updateSettings, refreshSettings, refetchSettings, isLoading, error };
};
