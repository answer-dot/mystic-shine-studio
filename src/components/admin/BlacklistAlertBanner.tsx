import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BlacklistAlert {
  id: string;
  user_id: string;
  user_name: string | null;
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export const BlacklistAlertBanner = () => {
  const [alerts, setAlerts] = useState<BlacklistAlert[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('blacklist_alerts_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blacklist_alerts',
        },
        (payload) => {
          const newAlert = payload.new as BlacklistAlert;
          setAlerts((prev) => [newAlert, ...prev]);
          setVisible(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('blacklist_alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setAlerts(data as BlacklistAlert[]);
    }
  };

  const dismissAlert = async (id: string) => {
    await supabase
      .from('blacklist_alerts')
      .update({ is_read: true })
      .eq('id', id);

    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const dismissAll = async () => {
    const ids = alerts.map((a) => a.id);
    await supabase
      .from('blacklist_alerts')
      .update({ is_read: true })
      .in('id', ids);

    setAlerts([]);
    setVisible(false);
  };

  if (!visible || alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-red-800">
                블랙리스트 알림 ({alerts.length}건)
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 h-7 text-xs"
              >
                모두 읽음 처리
              </Button>
            </div>
            <div className="space-y-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Ban className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-gray-900">
                      {alert.user_name || '알 수 없는 사용자'}
                    </span>
                    <span className="text-gray-500">
                      님이 로그인을 시도했습니다
                    </span>
                    <span className="text-xs text-gray-400">
                      ({format(new Date(alert.created_at), 'HH:mm', { locale: ko })})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-gray-400 hover:text-gray-600"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
