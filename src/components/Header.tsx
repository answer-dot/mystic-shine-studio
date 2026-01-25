import { Link } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useState } from 'react';

export const Header = () => {
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

          <div className="flex items-center gap-4">
            <Button 
              variant="gold" 
              size="sm"
              onClick={() => scrollToSection('pricing')}
              className="hidden sm:inline-flex"
            >
              지금 신청하기
            </Button>
            
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
            <Button 
              variant="gold" 
              className="w-full mt-4"
              onClick={() => scrollToSection('pricing')}
            >
              지금 신청하기
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
