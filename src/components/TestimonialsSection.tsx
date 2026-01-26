import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export const TestimonialsSection = () => {
  const { settings } = useSettings();
  const testimonials = settings.testimonials || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Touch/Swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Get the indices for the visible slides (previous, current, next)
  const getVisibleIndices = useCallback(() => {
    if (testimonials.length === 0) return { prev: 0, current: 0, next: 0 };
    const prev = (currentIndex - 1 + testimonials.length) % testimonials.length;
    const next = (currentIndex + 1) % testimonials.length;
    return { prev, current: currentIndex, next };
  }, [currentIndex, testimonials.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    goToSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % testimonials.length);
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      if (distance > 0) {
        // Swiped left -> go to next
        goToNext();
      } else {
        // Swiped right -> go to previous
        goToPrev();
      }
    }
    
    // Reset touch values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (testimonials.length === 0) {
    return null;
  }

  const { prev, current, next } = getVisibleIndices();

  // For single testimonial, just show it centered
  if (testimonials.length === 1) {
    const testimonial = testimonials[0];
    return (
      <section id="testimonials" className="py-20 sm:py-28 overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              ✦ 수강생 후기
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">수강생들의 생생한 이야기</h2>
            <p className="text-muted-foreground">이미 수천 명이 변화를 경험했습니다</p>
          </div>

          <div className="max-w-lg mx-auto">
            <TestimonialCard testimonial={testimonial} isCenter />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 sm:py-28 overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 수강생 후기
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">수강생들의 생생한 이야기</h2>
          <p className="text-muted-foreground">이미 수천 명이 변화를 경험했습니다</p>
        </div>

        {/* Carousel Container with Touch Support */}
        <div 
          ref={containerRef}
          className="relative max-w-6xl mx-auto px-4 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Buttons */}
          <button 
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-lg"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-lg"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slides Container */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-8 select-none">
            {/* Previous Slide */}
            <div 
              className="hidden sm:block w-1/4 flex-shrink-0 cursor-pointer"
              onClick={goToPrev}
            >
              <TestimonialCard 
                testimonial={testimonials[prev]} 
                isCenter={false}
              />
            </div>

            {/* Center Slide */}
            <div className="w-full sm:w-1/2 flex-shrink-0">
              <TestimonialCard 
                testimonial={testimonials[current]} 
                isCenter
              />
            </div>

            {/* Next Slide */}
            <div 
              className="hidden sm:block w-1/4 flex-shrink-0 cursor-pointer"
              onClick={goToNext}
            >
              <TestimonialCard 
                testimonial={testimonials[next]} 
                isCenter={false}
              />
            </div>
          </div>

          {/* Swipe Hint for Mobile */}
          <p className="text-center text-xs text-muted-foreground sm:hidden mb-2">
            ← 좌우로 스와이프 →
          </p>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-4 sm:mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-primary w-8" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Separate card component for cleaner code
interface TestimonialCardProps {
  testimonial: {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
  };
  isCenter: boolean;
}

const TestimonialCard = ({ testimonial, isCenter }: TestimonialCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 border",
        isCenter 
          ? "bg-card border-primary/30 shadow-xl shadow-primary/10 scale-100 opacity-100" 
          : "bg-card/50 border-border/50 scale-90 opacity-50 hover:opacity-70"
      )}
    >
      {/* Quote icon */}
      <Quote 
        className={cn(
          "absolute top-4 right-4 w-10 h-10 transition-colors duration-300",
          isCenter ? "text-primary/20" : "text-primary/10"
        )} 
      />
      
      {/* Rating - Centered */}
      <div className="flex justify-center gap-1 mb-6">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-5 h-5 fill-primary",
              isCenter ? "text-primary" : "text-primary/50"
            )} 
          />
        ))}
      </div>

      {/* Content - Centered */}
      <p 
        className={cn(
          "text-center leading-relaxed relative z-10 mb-6",
          isCenter 
            ? "text-foreground text-base sm:text-lg" 
            : "text-muted-foreground text-sm"
        )}
      >
        "{testimonial.content}"
      </p>

      {/* Author - Centered */}
      <div className="flex flex-col items-center gap-3">
        <div 
          className={cn(
            "w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-bold text-lg",
            !isCenter && "w-10 h-10 text-base"
          )}
        >
          {testimonial.name[0]}
        </div>
        <div className="text-center">
          <p className={cn(
            "font-semibold",
            isCenter ? "text-base" : "text-sm"
          )}>
            {testimonial.name}
          </p>
          <p className={cn(
            "text-muted-foreground",
            isCenter ? "text-sm" : "text-xs"
          )}>
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
};
