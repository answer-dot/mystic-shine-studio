import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FreePreviewSection } from '@/components/FreePreviewSection';
import { CurriculumSection } from '@/components/CurriculumSection';
import { InstructorSection } from '@/components/InstructorSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { EventsSection } from '@/components/EventsSection';
import { FAQSection } from '@/components/FAQSection';
import { PricingSection } from '@/components/PricingSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { SocialProofToast } from '@/components/SocialProofToast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSettings } from '@/hooks/useSettings';

// Wrapper component for individual sections to prevent cascading failures
const SafeSection = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <ErrorBoundary fallback={fallback || <div className="py-12 text-center text-muted-foreground">섹션을 로드할 수 없습니다</div>}>
    {children}
  </ErrorBoundary>
);

const Index = () => {
  const location = useLocation();
  const { settings } = useSettings();

  // Handle hash navigation when coming from other pages
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  // 강의 노출 여부 (courseVisible 스위치)
  const isCourseVisible = settings.courseVisible === true;
  // 이벤트 섹션 노출 여부 (eventsVisible 스위치)
  const isEventsVisible = settings.eventsVisible === true;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SafeSection>
          <HeroSection />
        </SafeSection>
        
        {/* 강의 섹션: courseVisible이 true일 때만 표시 */}
        {isCourseVisible && (
          <>
            <SafeSection>
              <FreePreviewSection />
            </SafeSection>
            <SafeSection>
              <CurriculumSection />
            </SafeSection>
          </>
        )}
        
        <SafeSection>
          <InstructorSection />
        </SafeSection>
        <SafeSection>
          <TestimonialsSection />
        </SafeSection>
        {/* 이벤트 섹션: eventsVisible이 true일 때만 표시 */}
        {isEventsVisible && (
          <SafeSection>
            <EventsSection />
          </SafeSection>
        )}
        <SafeSection>
          <FAQSection />
        </SafeSection>
        
        {/* 가격 섹션: courseVisible이 true일 때만 표시 */}
        {isCourseVisible && (
          <SafeSection>
            <PricingSection />
          </SafeSection>
        )}
        
        <SafeSection>
          <ContactSection />
        </SafeSection>
      </main>
      <Footer />
      <SocialProofToast />
    </div>
  );
};

export default Index;
