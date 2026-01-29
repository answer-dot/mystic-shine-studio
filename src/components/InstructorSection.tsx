import { useState } from 'react';
import { Award, Users, BookOpen, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import defaultInstructorImage from '@/assets/instructor-profile.jpg';
import { InquiryModal } from './InquiryModal';

export const InstructorSection = () => {
  const { settings } = useSettings();
  const profileImage = settings.instructorImageUrl || defaultInstructorImage;
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  return (
    <>
      <section id="instructor" className="py-16 sm:py-24 bg-background">
        <div className="section-container px-6">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              👩‍🏫 강사 소개
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">{settings.instructorName || '이하늘 코치'}</h2>
          </div>

          {/* Clean 50:50 Grid - Consistent padding for both columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: PHOTO ONLY */}
            <div className="w-full">
              <img 
                src={profileImage} 
                alt={settings.instructorName || '강사 프로필'}
                className="w-full aspect-[3/4] object-cover object-top rounded-[20px] shadow-2xl"
              />
            </div>

            {/* Right Column: TEXT ONLY */}
            <div className="flex flex-col justify-center">
              <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                {settings.instructorBio || '15년 이상의 타로 리딩 경력을 가진 전문가로, 심리학 박사 학위를 보유하고 있습니다. 수천 명의 수강생을 배출하며 타로를 통한 자기 이해와 성장을 돕고 있습니다.'}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                <div className="text-center p-4 sm:p-5 rounded-xl bg-secondary/50 border border-primary/20 hover:border-primary/40 transition-colors">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-foreground">15K+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">수강생</p>
                </div>
                <div className="text-center p-4 sm:p-5 rounded-xl bg-secondary/50 border border-primary/20 hover:border-primary/40 transition-colors">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-foreground">120+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">강의 제작</p>
                </div>
                <div className="text-center p-4 sm:p-5 rounded-xl bg-secondary/50 border border-primary/20 hover:border-primary/40 transition-colors">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-foreground">5년</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">경력</p>
                </div>
              </div>

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

              <Button 
                variant="gold" 
                size="xl"
                className="w-full sm:w-auto px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{
                  boxShadow: '0 0 40px -10px hsl(var(--primary)/0.5), 0 10px 30px -10px rgba(0,0,0,0.3)'
                }}
                onClick={() => setShowInquiryModal(true)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                강사에게 질문하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Modal - Auto-set subject to [강사 문의] */}
      <InquiryModal 
        open={showInquiryModal} 
        onOpenChange={setShowInquiryModal}
        defaultSubject="[강사 문의] "
      />
    </>
  );
};
