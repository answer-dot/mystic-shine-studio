import { useNavigate } from 'react-router-dom';
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
  BookOpen,
  ExternalLink,
  MessageCircle,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNewReviewsCount } from '@/hooks/useReviews';

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
  { id: 'materials', label: '자료실', icon: FolderOpen },
  { id: 'events', label: '이벤트', icon: Calendar },
  { id: 'testimonials', label: '수강생 후기', icon: Star },
  { id: 'reviews', label: '리뷰 관리', icon: MessageCircle },
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
  const navigate = useNavigate();
  const { data: newReviewsCount = 0 } = useNewReviewsCount();
  
  return (
    <aside 
      className={cn(
        "fixed left-0 h-full bg-gray-900 z-50 flex flex-col transition-all duration-300",
        "top-14 lg:top-0", // Mobile: below header, Desktop: from top
        "w-64 lg:w-auto",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}
    >
      {/* Header - Hidden on mobile (shown in main header) */}
      <div className="hidden lg:flex p-4 border-b border-gray-800 items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm truncate text-white">관리자센터</h1>
            <p className="text-xs text-gray-400 truncate">{siteName}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          const showBadge = (item.id === 'inquiries' && unreadInquiries > 0) || 
                           (item.id === 'reviews' && newReviewsCount > 0);
          const badgeCount = item.id === 'inquiries' ? unreadInquiries : newReviewsCount;
          
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
              {/* Always show labels on mobile, respect collapsed on desktop */}
              <span className={cn("flex-1 text-left", collapsed && "lg:hidden")}>
                {item.label}
              </span>
              {showBadge && (
                <span className={cn(
                  "w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center",
                  collapsed && "lg:absolute lg:-top-1 lg:-right-1 lg:w-4 lg:h-4 lg:text-[10px]"
                )}>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        {/* View Site Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="w-full justify-start gap-3 text-orange-400 hover:text-orange-300 hover:bg-gray-800"
        >
          <ExternalLink className="w-5 h-5" />
          <span className={cn(collapsed && "lg:hidden")}>사이트 보기</span>
        </Button>
        {/* Collapse toggle - Desktop only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800"
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
          <span className={cn(collapsed && "lg:hidden")}>로그아웃</span>
        </Button>
      </div>
    </aside>
  );
};
