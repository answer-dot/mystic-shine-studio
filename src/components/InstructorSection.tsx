import { Award, Users, Youtube, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

export const InstructorSection = () => {
  const { settings } = useSettings();

  const credentials = [
    { icon: Award, label: "15년+ 리딩 경력" },
    { icon: Users, label: "2,800+ 수강생 배출" },
    { icon: Youtube, label: "유튜브 10만+ 구독자" },
    { icon: BookOpen, label: "심리학 박사 학위" },
  ];

  return (
    <section id="instructor" className="py-20 sm:py-28 bg-gradient-to-b from-surface-overlay to-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 강사 소개
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">{settings.instructorName}</h2>
          <p className="text-primary font-medium mt-2">{settings.instructorTitle}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-10 overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Photo placeholder */}
              <div className="w-full lg:w-1/3 aspect-square max-w-[280px] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-2xl" />
                <div className="absolute inset-2 bg-gradient-to-br from-card to-secondary rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                      <span className="text-4xl">🔮</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Instructor Photo</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {settings.instructorBio}
                </p>

                {/* Credentials */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {credentials.map((cred, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <cred.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{cred.label}</span>
                    </div>
                  ))}
                </div>

                <Button variant="goldOutline" size="lg">
                  👀 무료 샘플 영상 보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
