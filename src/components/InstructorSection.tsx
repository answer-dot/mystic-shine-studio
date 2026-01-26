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
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            👩‍🏫 강사 소개
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">{settings.instructorName || '이하늘 코치'}</h2>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-10 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
              
              {/* Profile Image - Vertical Rectangle */}
              <div className="w-full lg:w-2/5 flex flex-col items-center">
                <div className="relative">
                  <div className="w-52 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl">
                    <img 
                      src={profileImage} 
                      alt={settings.instructorName || '강사 프로필'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Decorations */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full opacity-60" />
                  <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-orange-500 rounded-full opacity-40" />
                </div>

                {/* Stats - Centered below image on mobile, stays here on desktop */}
                <div className="grid grid-cols-3 gap-3 mt-6 w-full max-w-xs lg:hidden">
                  <div className="text-center p-3 rounded-xl bg-secondary/50 border border-primary/20">
                    <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">15K+</p>
                    <p className="text-xs text-muted-foreground">수강생</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50 border border-primary/20">
                    <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">120+</p>
                    <p className="text-xs text-muted-foreground">강의 제작</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50 border border-primary/20">
                    <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">5년</p>
                    <p className="text-xs text-muted-foreground">경력</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {settings.instructorBio || '안녕하세요, 저는 지난 5년간 온라인 지식 창업을 통해 수많은 분들의 삶을 변화시켜온 이하늘입니다. 직장인에서 시작해 현재는 월 수천만원의 패시브 인컴을 만들어내는 시스템을 구축했습니다.'}
                </p>

                {/* Stats - Desktop only, beside the content */}
                <div className="hidden lg:grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-secondary/50 border border-primary/20">
                    <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">15K+</p>
                    <p className="text-xs text-muted-foreground">수강생</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/50 border border-primary/20">
                    <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">120+</p>
                    <p className="text-xs text-muted-foreground">강의 제작</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/50 border border-primary/20">
                    <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">5년</p>
                    <p className="text-xs text-muted-foreground">경력</p>
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">유튜브 구독자 10만+</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">베스트셀러 '지식 창업의 정석' 저자</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">여러 기업 강연 및 컨설팅 진행</span>
                  </div>
                </div>

                <Button variant="goldOutline" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
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
