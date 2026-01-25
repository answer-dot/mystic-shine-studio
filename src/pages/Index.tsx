import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CurriculumSection } from '@/components/CurriculumSection';
import { InstructorSection } from '@/components/InstructorSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { EventsSection } from '@/components/EventsSection';
import { FAQSection } from '@/components/FAQSection';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { SocialProofToast } from '@/components/SocialProofToast';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CurriculumSection />
        <InstructorSection />
        <TestimonialsSection />
        <EventsSection />
        <FAQSection />
        <PricingSection />
      </main>
      <Footer />
      <SocialProofToast />
    </div>
  );
};

export default Index;
