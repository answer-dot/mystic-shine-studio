import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationCounts {
  [eventTitle: string]: number;
}

export const useEventRegistrations = (eventTitles: string[]) => {
  const [registrationCounts, setRegistrationCounts] = useState<RegistrationCounts>({});
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    if (eventTitles.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all inquiries that match event registration pattern
      const { data, error } = await supabase
        .from('inquiries')
        .select('message')
        .like('message', '[이벤트 신청:%');

      if (error) throw error;

      // Count registrations per event
      const counts: RegistrationCounts = {};
      eventTitles.forEach(title => {
        counts[title] = 0;
      });

      (data || []).forEach((inquiry) => {
        // Extract event title from message pattern: [이벤트 신청: Title]
        const match = inquiry.message.match(/\[이벤트 신청: ([^\]]+)\]/);
        if (match && match[1]) {
          const eventTitle = match[1];
          if (counts[eventTitle] !== undefined) {
            counts[eventTitle]++;
          }
        }
      });

      setRegistrationCounts(counts);
    } catch (error) {
      console.error('Failed to fetch event registrations:', error);
    } finally {
      setLoading(false);
    }
  }, [eventTitles]);

  useEffect(() => {
    fetchCounts();

    // Subscribe to real-time updates on inquiries table
    const channel = supabase
      .channel('event-registrations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inquiries',
        },
        (payload) => {
          const message = (payload.new as { message?: string }).message || '';
          const match = message.match(/\[이벤트 신청: ([^\]]+)\]/);
          if (match && match[1]) {
            const eventTitle = match[1];
            setRegistrationCounts(prev => ({
              ...prev,
              [eventTitle]: (prev[eventTitle] || 0) + 1
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCounts]);

  const getRegistrationCount = (eventTitle: string): number => {
    return registrationCounts[eventTitle] || 0;
  };

  return { registrationCounts, getRegistrationCount, loading, refetch: fetchCounts };
};
