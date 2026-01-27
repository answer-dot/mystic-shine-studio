import { useState, useMemo } from 'react';
import { Calendar, Users, ArrowRight, Sparkles, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
import { EventCountdownTimer } from '@/components/EventCountdownTimer';

// Default placeholder for events without images
const defaultEventImage = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=600&fit=crop&q=80";

export const EventsSection = () => {
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expiredEvents, setExpiredEvents] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Get all event titles for registration tracking
  const eventTitles = useMemo(() => 
    settings.events.map(e => e.title), 
    [settings.events]
  );
  
  const { getRegistrationCount } = useEventRegistrations(eventTitles);

  const handleApplyClick = (eventTitle: string) => {
    setSelectedEvent(eventTitle);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('이름과 이메일을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: `[이벤트 신청: ${selectedEvent}]\n\n${formData.message || '참가 신청합니다.'}`
      });

      if (error) throw error;

      toast.success('이벤트 신청이 완료되었습니다!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Event application error:', error);
      toast.error('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountdownExpire = (eventId: string) => {
    setExpiredEvents(prev => new Set([...prev, eventId]));
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ongoing') {
      return (
        <span className="relative inline-flex items-center whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/40 backdrop-blur-sm">
          {/* Neon glow effect */}
          <span className="absolute inset-0 rounded-full bg-green-500/30 blur-md animate-pulse" />
          <span className="relative inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span>진행중</span>
          </span>
        </span>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40 backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span>예정</span>
          </span>
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border backdrop-blur-sm">
        종료
      </span>
    );
  };

  // Calculate remaining seats based on registrations
  const getRemainingSeats = (event: typeof settings.events[0]) => {
    const totalCapacity = event.totalCapacity || event.spots || 50;
    const registrations = getRegistrationCount(event.title);
    return Math.max(0, totalCapacity - registrations);
  };

  return (
    <section id="events" className="py-20 sm:py-28 bg-gradient-to-b from-surface-overlay to-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 이벤트
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">진행중인 이벤트</h2>
          <p className="text-muted-foreground">특별 혜택이 있는 이벤트를 놓치지 마세요</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {settings.events.map((event) => {
            const remainingSeats = getRemainingSeats(event);
            const totalCapacity = event.totalCapacity || event.spots || 50;
            const isExpired = expiredEvents.has(event.id);
            const isClosed = event.status === 'ended' || isExpired || remainingSeats <= 0;
            const isUrgent = remainingSeats > 0 && remainingSeats <= 5 && !isClosed;

            return (
              <div 
                key={event.id}
                className="group relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                style={{
                  boxShadow: event.status === 'ongoing' && !isClosed
                    ? '0 0 30px rgba(var(--primary), 0.15), 0 10px 40px -10px rgba(0,0,0,0.3)' 
                    : undefined
                }}
              >
                {/* Premium gold border glow for ongoing events */}
                {event.status === 'ongoing' && !isClosed && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-20" />
                )}

                {/* Full Background Image - Taller on mobile for content visibility */}
                <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
                  <img 
                    src={event.imageUrl || defaultEventImage}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Dark gradient overlay - stronger on mobile for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 sm:from-black/90 sm:via-black/50 sm:to-black/20" />
                  
                  {/* Floating Status Badge - Top Left */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 flex-wrap">
                    {getStatusBadge(isClosed ? 'ended' : event.status)}
                    
                    {/* Urgent "마감임박!" Tag */}
                    {isUrgent && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/90 text-white border border-red-400 animate-pulse shadow-lg shadow-red-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        마감임박!
                      </span>
                    )}
                  </div>

                  {/* Countdown Timer - Top Right */}
                  {event.startTime && !isClosed && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                      <EventCountdownTimer 
                        targetDate={event.startTime} 
                        onExpire={() => handleCountdownExpire(event.id)}
                      />
                    </div>
                  )}

                  {/* Content Overlay - Bottom */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 lg:p-10">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 mb-2 sm:mb-3">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      <span>{new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    
                    {/* Title - Responsive sizing */}
                    <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                      {event.title}
                    </h3>
                    
                    {/* Description - Line clamped on mobile */}
                    <p className="text-white/80 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-3xl line-clamp-3 sm:line-clamp-none">
                      {event.description}
                    </p>

                    {/* Footer: Seats + CTA */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/20">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        {/* Dynamic Seat Tracking */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-white font-medium">
                            총 {totalCapacity}석 | <span className={isUrgent ? 'text-red-400 font-bold' : ''}>잔여 {remainingSeats}석</span>
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant={isClosed ? 'outline' : 'gold'} 
                        size="lg"
                        disabled={isClosed}
                        className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 group/btn"
                        onClick={!isClosed ? () => handleApplyClick(event.title) : undefined}
                      >
                        {isClosed ? '마감' : '신청하기'}
                        {!isClosed && (
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Application Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200 mx-4 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">이벤트 신청</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedEvent}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="홍길동"
                className="bg-white border-gray-300 text-gray-900 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="example@email.com"
                className="bg-white border-gray-300 text-gray-900 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">연락처</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="010-1234-5678"
                className="bg-white border-gray-300 text-gray-900 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-700">추가 메시지</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="문의사항이 있으시면 작성해주세요"
                className="bg-white border-gray-300 text-gray-900 focus:ring-primary resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-medium"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '신청 중...' : '신청하기'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};
