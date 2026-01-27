import { supabase } from '@/integrations/supabase/client';

interface BlacklistCheckResult {
  isBlacklisted: boolean;
  reason: string | null;
}

export const checkUserBlacklist = async (userId: string): Promise<BlacklistCheckResult> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_blacklisted, blacklist_reason, display_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return { isBlacklisted: false, reason: null };
    }

    // If user is blacklisted, create an alert for admins
    if (data.is_blacklisted) {
      await supabase.from('blacklist_alerts').insert({
        user_id: userId,
        user_name: data.display_name || '알 수 없음',
        alert_type: 'login_attempt',
      });
    }

    return {
      isBlacklisted: data.is_blacklisted || false,
      reason: data.blacklist_reason,
    };
  } catch (error) {
    console.error('Error checking blacklist status:', error);
    return { isBlacklisted: false, reason: null };
  }
};

export const useBlacklistCheck = () => {
  return { checkUserBlacklist };
};
