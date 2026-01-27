import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, AlertTriangle, MessageSquare, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'enrollment':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'blacklist_alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: Notification['type'], isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (type) {
      case 'blacklist_alert':
        return 'bg-red-50';
      case 'enrollment':
        return 'bg-green-50';
      case 'inquiry':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">알림</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  {unreadCount}개 새 알림
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Notification List */}
          <ScrollArea className="h-80 max-h-[60vh]">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                      getNotificationBg(notification.type, notification.is_read)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        notification.type === 'blacklist_alert' ? 'bg-red-100' :
                        notification.type === 'enrollment' ? 'bg-green-100' : 'bg-blue-100'
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            notification.is_read ? 'text-gray-600' : 'text-gray-900'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => markAllAsRead()}
              >
                <Check className="w-4 h-4 mr-2" />
                모두 읽음으로 표시
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
