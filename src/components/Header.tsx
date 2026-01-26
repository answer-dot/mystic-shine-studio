import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export const Header = () => {
  const { settings } = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?mode=signup');
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
                지금 신청하기
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
                지금 신청하기
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
