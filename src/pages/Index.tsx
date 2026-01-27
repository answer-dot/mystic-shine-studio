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

// Wrapper component for individual sections to prevent cascading failures
const SafeSection = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
  <ErrorBoundary fallback={fallback || <div className="py-12 text-center text-muted-foreground">섹션을 로드할 수 없습니다</div>}>
    {children}
  </ErrorBoundary>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SafeSection>
          <HeroSection />
        </SafeSection>
        <SafeSection>
          <FreePreviewSection />
        </SafeSection>
        <SafeSection>
          <CurriculumSection />
        </SafeSection>
        <SafeSection>
          <InstructorSection />
        </SafeSection>
        <SafeSection>
          <TestimonialsSection />
        </SafeSection>
        <SafeSection>
          <EventsSection />
        </SafeSection>
        <SafeSection>
          <FAQSection />
        </SafeSection>
        <SafeSection>
          <PricingSection />
        </SafeSection>
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
