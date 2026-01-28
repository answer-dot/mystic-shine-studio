import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, User, LogOut, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { InquiryModal } from './InquiryModal';

export const Header = () => {
  const { settings } = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  const scrollToSection = (id: string) => {
    // If not on home page, navigate to home first with hash
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      // 비로그인 사용자: 웨비나 폼으로 스크롤 (auth 리다이렉트 제거!)
      if (location.pathname !== '/') {
        navigate('/');
      }
      // 잠시 후 히어로 섹션 상단으로 스크롤 (웨비나 폼 위치)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">{settings.siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('curriculum')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              커리큘럼
            </button>
            <button onClick={() => scrollToSection('instructor')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              강사 소개
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              수강생 후기
            </button>
            <button onClick={() => scrollToSection('events')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              이벤트
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </button>
            <button 
              onClick={() => setShowInquiryModal(true)} 
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              1대1 문의
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:inline-flex gap-2"
                >
                  <User className="w-4 h-4" />
                  내 강의실
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex gap-2 text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="gold" 
                size="sm"
                onClick={handleAuthAction}
                className="hidden sm:inline-flex"
              >
                무료 웨비나 신청
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 animate-fade-in">
            <button onClick={() => scrollToSection('curriculum')} className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              커리큘럼
            </button>
            <button onClick={() => scrollToSection('instructor')} className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              강사 소개
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              수강생 후기
            </button>
            <button onClick={() => scrollToSection('events')} className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              이벤트
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              FAQ
            </button>
            <button 
              onClick={() => {
                setShowInquiryModal(true);
                setMobileMenuOpen(false);
              }} 
              className="block w-full text-left px-4 py-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              1대1 문의하기
            </button>
            
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 gap-2"
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4" />
                  내 강의실
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full gap-2 text-muted-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Button 
                variant="gold" 
                className="w-full mt-4"
                onClick={handleAuthAction}
              >
                무료 웨비나 신청
              </Button>
            )}
          </nav>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal open={showInquiryModal} onOpenChange={setShowInquiryModal} />
    </header>
  );
};
