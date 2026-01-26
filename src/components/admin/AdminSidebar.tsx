import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Shield,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  siteName: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  unreadInquiries: number;
}

const menuItems = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'general', label: '일반 설정', icon: Settings },
  { id: 'instructor', label: '강사 관리', icon: Users },
  { id: 'courses', label: '강의 관리', icon: BookOpen },
  { id: 'curriculum', label: '커리큘럼', icon: FileText },
  { id: 'events', label: '이벤트', icon: Calendar },
  { id: 'testimonials', label: '수강생 후기', icon: Star },
  { id: 'inquiries', label: '문의 내역', icon: MessageSquare },
  { id: 'security', label: '보안', icon: Shield },
];

export const AdminSidebar = ({
  currentSection,
  onSectionChange,
  siteName,
  collapsed,
  onToggleCollapse,
  onLogout,
  unreadInquiries
}: AdminSidebarProps) => {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-gray-900 z-50 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm truncate text-white">관리자</h1>
            <p className="text-xs text-gray-400 truncate">{siteName}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          const showBadge = item.id === 'inquiries' && unreadInquiries > 0;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                "hover:bg-gray-800",
                isActive 
                  ? "bg-gradient-gold text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadInquiries > 9 ? '9+' : unreadInquiries}
                    </span>
                  )}
                </>
              )}
              {collapsed && showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {unreadInquiries > 9 ? '9+' : unreadInquiries}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>접기</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>로그아웃</span>}
        </Button>
      </div>
    </aside>
  );
};
