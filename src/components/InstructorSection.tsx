import { Award, Users, BookOpen, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import defaultInstructorImage from '@/assets/instructor-profile.jpg';

export const InstructorSection = () => {
  const { settings } = useSettings();
  const profileImage = settings.instructorImageUrl || defaultInstructorImage;

  return (
    <section id="instructor" className="py-20 sm:py-28 bg-gradient-to-b from-surface-overlay to-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            👩‍🏫 강사 소개
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">{settings.instructorName || '이하늘 코치'}</h2>
        </div>

        {/* Main Card - 50:50 Split Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden border border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              
              {/* Left: Profile Image - Large & Full Width on Mobile */}
              <div className="relative bg-gradient-to-br from-card to-secondary/30">
                {/* Mobile: Full width image */}
                <div className="w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-square overflow-hidden">
                  <img 
                    src={profileImage} 
                    alt={settings.instructorName || '강사 프로필'}
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                {/* Subtle overlay gradient for text readability on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:hidden pointer-events-none" />
                
                {/* Mobile Stats Overlay - Compact grid at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:hidden">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-primary/30">
                      <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">15K+</p>
                      <p className="text-xs text-white/70">수강생</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-primary/30">
                      <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">120+</p>
                      <p className="text-xs text-white/70">강의 제작</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-primary/30">
                      <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">5년</p>
                      <p className="text-xs text-white/70">경력</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Info Section */}
              <div className="p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
                {/* Bio */}
                <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
                  {settings.instructorBio || '15년 이상의 타로 리딩 경력을 가진 전문가로, 심리학 박사 학위를 보유하고 있습니다. 수천 명의 수강생을 배출하며 타로를 통한 자기 이해와 성장을 돕고 있습니다.'}
                </p>

                {/* Desktop Stats - Large Cards */}
                <div className="hidden lg:grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-5 rounded-xl bg-secondary/50 border border-primary/20 hover:border-primary/40 transition-colors">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">15K+</p>
                    <p className="text-sm text-muted-foreground">수강생</p>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-secondary/50 border border-primary/20 hover:border-primary/40 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">120+</p>
                    <p className="text-sm text-muted-foreground">강의 제작</p>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-secondary/50 border border-primary/20 hover:border-primary/40 transition-colors">
                    <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">5년</p>
                    <p className="text-sm text-muted-foreground">경력</p>
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">유튜브 구독자 10만+</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">베스트셀러 '지식 창업의 정석' 저자</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">여러 기업 강연 및 컨설팅 진행</span>
                  </div>
                </div>

                {/* CTA Button - Large with Gold Glow */}
                <Button 
                  variant="gold" 
                  size="xl"
                  className="w-full sm:w-auto px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                  style={{
                    boxShadow: '0 0 40px -10px hsl(var(--primary)/0.5), 0 10px 30px -10px rgba(0,0,0,0.3)'
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  강사에게 질문하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
