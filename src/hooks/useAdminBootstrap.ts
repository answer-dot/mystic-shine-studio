import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminBootstrapState {
  isFirstAdmin: boolean;
  isChecking: boolean;
  signupDisabled: boolean;
}

export const useAdminBootstrap = () => {
  const [state, setState] = useState<AdminBootstrapState>({
    isFirstAdmin: false,
    isChecking: true,
    signupDisabled: false,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Check if any admins exist
      const { count, error: countError } = await supabase
        .from('admin_roles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking admin count:', countError);
      }

      const noAdminsExist = count === 0;

      // Check if signup is disabled in site_settings
      const { data: signupSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'signupDisabled')
        .maybeSingle();

      const signupDisabled = signupSetting?.value === true || signupSetting?.value === 'true';

      setState({
        isFirstAdmin: noAdminsExist,
        isChecking: false,
        signupDisabled: signupDisabled && !noAdminsExist, // Allow signup if no admins exist
      });
    } catch (error) {
      console.error('Error in admin bootstrap check:', error);
      setState(prev => ({ ...prev, isChecking: false }));
    }
  };

  const promoteToAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        console.error('Error promoting to admin:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in promoteToAdmin:', error);
      return false;
    }
  };

  return {
    ...state,
    promoteToAdmin,
    refetch: checkAdminStatus,
  };
};
