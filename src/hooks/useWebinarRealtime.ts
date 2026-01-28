import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

/**
 * Hook for real-time webinar registration notifications.
 * Shows a toast when someone new registers for the webinar.
 */
export const useWebinarRealtime = () => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const lastSeatsRef = useRef<number>(settings.remainingSeats);

  useEffect(() => {
    // Subscribe to inquiries table for new webinar registrations
    const channel = supabase
      .channel('webinar-registrations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inquiries',
        },
        (payload) => {
          // Check if this is a webinar registration
          const message = (payload.new as { message?: string })?.message || '';
          if (message.startsWith('[웨비나 신청]')) {
            // Show toast notification to all users
            toast({
              title: '🔥 방금 1명이 신청했습니다!',
              description: `남은 좌석: ${Math.max(0, settings.remainingSeats)}석`,
              duration: 4000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Webinar registrations subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, settings.remainingSeats]);

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
