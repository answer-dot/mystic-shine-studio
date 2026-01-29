import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Camera, ZoomIn, List } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useApprovedReviews } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export const TestimonialsSection = () => {
  const { settings } = useSettings();
  const { data: userReviews } = useApprovedReviews();
  const adminTestimonials = settings.testimonials || [];
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  
  // Combine admin testimonials with approved user reviews
  const testimonials = useMemo(() => {
    const adminItems = adminTestimonials.map(t => ({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
      photoUrl: undefined as string | undefined,
      isUserReview: false,
    }));
    
    const userItems = (userReviews || []).map(r => ({
      id: r.id,
      name: `수강생`, // Anonymous for privacy
      role: '수료생',
      content: r.content,
      rating: r.rating,
      photoUrl: r.photo_url || undefined,
      isUserReview: true,
    }));
    
    // Interleave admin and user reviews
    const combined = [...adminItems];
    userItems.forEach((item, index) => {
      const insertIndex = Math.min((index + 1) * 2, combined.length);
      combined.splice(insertIndex, 0, item);
    });
    
    return combined;
  }, [adminTestimonials, userReviews]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // Touch/Swipe & Mouse Drag state
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe/drag distance to trigger navigation (in pixels)
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

  // Process swipe/drag end
  const processSwipeEnd = () => {
    if (startX.current === null || currentX.current === null) return;
    
    const distance = startX.current - currentX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      if (distance > 0) {
        // Swiped/dragged left -> go to next
        goToNext();
      } else {
        // Swiped/dragged right -> go to previous
        goToPrev();
      }
    }
    
    // Reset values
    startX.current = null;
    currentX.current = null;
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.targetTouches[0].clientX;
    currentX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    processSwipeEnd();
  };

  // Mouse event handlers for drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    setIsDragging(true);
    startX.current = e.clientX;
    currentX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    currentX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    processSwipeEnd();
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    processSwipeEnd();
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
    <>
      <section id="testimonials" className="py-20 sm:py-28 overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              ✦ 수강생 후기
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">수강생들의 생생한 이야기</h2>
            <p className="text-muted-foreground">이미 수천 명이 변화를 경험했습니다</p>
          </div>

          {/* Carousel Container with Touch & Mouse Drag Support */}
          <div 
            ref={containerRef}
            className={cn(
              "relative max-w-6xl mx-auto px-4 touch-pan-y",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
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

          {/* View All Reviews Button */}
          {testimonials.length > 1 && (
            <div className="text-center mt-10">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary px-8"
                onClick={() => setShowAllReviewsModal(true)}
              >
                <List className="w-4 h-4 mr-2" />
                수강생 후기 전체보기 ({testimonials.length}개)
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* All Reviews Modal */}
      <Dialog open={showAllReviewsModal} onOpenChange={setShowAllReviewsModal}>
        <DialogContent 
          className="bg-white w-[calc(100vw-48px)] max-w-2xl max-h-[calc(100vh-80px)] p-0 flex flex-col overflow-hidden" 
          aria-describedby="all-reviews-description"
        >
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100 pt-8">
            <DialogTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <Star className="w-5 h-5 text-primary flex-shrink-0 fill-primary" />
              수강생 후기 전체보기
              <span className="text-sm text-muted-foreground font-normal">
                ({testimonials.length}개)
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div id="all-reviews-description" className="p-4 sm:p-6 space-y-4">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  {/* Header: Avatar + Name + Rating */}
                  <div className="flex items-center gap-3 mb-3">
                    {testimonial.photoUrl ? (
                      <img 
                        src={testimonial.photoUrl} 
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-bold">
                        {testimonial.name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {testimonial.name}
                        </span>
                        {testimonial.isUserReview && (
                          <Camera className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{testimonial.role}</span>
                    </div>
                    {/* Rating */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Photo if exists */}
                  {testimonial.photoUrl && (
                    <div className="mt-3">
                      <img 
                        src={testimonial.photoUrl} 
                        alt="후기 이미지"
                        className="max-w-[150px] rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
    photoUrl?: string;
    isUserReview?: boolean;
  };
  isCenter: boolean;
}

const TestimonialCard = ({ testimonial, isCenter }: TestimonialCardProps) => {
  const [showLightbox, setShowLightbox] = useState(false);

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

      {/* Photo with Lightbox (if review has a photo) */}
      {testimonial.photoUrl && isCenter && (
        <div 
          className="relative mb-4 mx-auto max-w-[200px] rounded-lg overflow-hidden border border-primary/20 cursor-zoom-in group"
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(true);
          }}
        >
          <img 
            src={testimonial.photoUrl} 
            alt="후기 이미지"
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Author - Centered */}
      <div className="flex flex-col items-center gap-3">
        {testimonial.photoUrl && !isCenter ? (
          <div className={cn(
            "rounded-full overflow-hidden border-2 border-primary/30",
            isCenter ? "w-12 h-12" : "w-10 h-10"
          )}>
            <img 
              src={testimonial.photoUrl} 
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div 
            className={cn(
              "rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-bold",
              isCenter ? "w-12 h-12 text-lg" : "w-10 h-10 text-base"
            )}
          >
            {testimonial.name[0]}
          </div>
        )}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className={cn(
              "font-semibold",
              isCenter ? "text-base" : "text-sm"
            )}>
              {testimonial.name}
            </p>
            {testimonial.isUserReview && (
              <Camera className="w-3 h-3 text-primary" />
            )}
          </div>
          <p className={cn(
            "text-muted-foreground",
            isCenter ? "text-sm" : "text-xs"
          )}>
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Lightbox for photo */}
      {testimonial.photoUrl && (
        <ImageLightbox
          src={testimonial.photoUrl}
          alt="후기 이미지"
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
};
