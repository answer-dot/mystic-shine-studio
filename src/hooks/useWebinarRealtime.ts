import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

/**
 * Hook for real-time webinar registration notifications.
 * Subscribes to webinar_registrations table and shows toast when someone registers.
 * Also triggers settings refresh to update seat counts in real-time.
 */
export const useWebinarRealtime = () => {
  const { toast } = useToast();
  const { settings, refetchSettings } = useSettings();
  const lastSeatsRef = useRef<number>(settings.remainingSeats);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) return;
    isSubscribedRef.current = true;

    // ✅ Subscribe to webinar_registrations table (CORRECT table)
    const channel = supabase
      .channel('webinar-registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webinar_registrations', // ✅ Correct table!
        },
        (payload) => {
          console.log('[Realtime] New webinar registration:', payload);
          
          // Show toast notification to all users
          toast({
            title: '🔥 방금 1명이 신청했습니다!',
            description: '남은 좌석이 줄어들고 있습니다!',
            duration: 4000,
          });

          // 🚀 CRITICAL: Refresh settings to update seat count immediately
          refetchSettings();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] webinar_registrations subscription:', status);
      });

    // ✅ Also subscribe to site_settings for admin changes (date, seats, etc.)
    const settingsChannel = supabase
      .channel('site-settings-webinar-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          console.log('[Realtime] site_settings changed:', payload);
          
          // Immediately refresh settings to get updated values
          refetchSettings();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] site_settings (webinar) subscription:', status);
      });

    return () => {
      console.log('[Realtime] Cleaning up webinar subscriptions');
      isSubscribedRef.current = false;
      supabase.removeChannel(channel);
      supabase.removeChannel(settingsChannel);
    };
  }, [toast, refetchSettings]);

  // Track seat changes and show urgent notification when seats are low
  useEffect(() => {
    const prevSeats = lastSeatsRef.current;
    const currentSeats = settings.remainingSeats;

    // Only show notification when seats decrease (someone registered)
    if (currentSeats < prevSeats && currentSeats > 0 && currentSeats <= 5) {
      toast({
        title: '⚠️ 마감 임박!',
        description: `잔여 좌석 ${currentSeats}석 남았습니다!`,
        variant: 'destructive',
        duration: 5000,
      });
    }

    // Show sold out notification
    if (currentSeats === 0 && prevSeats > 0) {
      toast({
        title: '🚫 마감되었습니다',
        description: '모든 좌석이 마감되었습니다.',
        variant: 'destructive',
        duration: 6000,
      });
    }

    lastSeatsRef.current = currentSeats;
  }, [settings.remainingSeats, toast]);

  return {
    remainingSeats: settings.remainingSeats,
    isSoldOut: settings.remainingSeats <= 0,
  };
};
