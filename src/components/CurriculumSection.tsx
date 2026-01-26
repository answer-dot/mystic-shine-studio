import { useState } from 'react';
import { Clock, Play, Lock, ChevronDown, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSettings } from '@/hooks/useSettings';
import { VideoPlayer } from '@/components/VideoPlayer';
import { cn } from '@/lib/utils';

export const CurriculumSection = () => {
  const { settings } = useSettings();
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);

  const toggleLessonVideo = (lessonId: string) => {
    setPlayingLessonId(playingLessonId === lessonId ? null : lessonId);
  };

  return (
    <section id="curriculum" className="py-20 sm:py-28 bg-black">
      <div className="section-container px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 inline mr-1" />
            커리큘럼
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">체계적인 단계별 학습</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            처음 시작하는 분도 전문 리더가 될 수 있도록 설계된 커리큘럼
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-5">
            {settings.curriculum.map((item, index) => {
              const hasPreviewLessons = item.lessons?.some(l => l.isPreview) || item.isPreview;
              
              return (
                <AccordionItem 
                  key={item.id} 
                  value={item.id}
                  className="bg-[#1A1A1A] rounded-xl border border-primary/40 overflow-hidden"
                >
                  <AccordionTrigger className="px-5 sm:px-7 py-5 sm:py-6 hover:no-underline hover:bg-white/5 transition-colors [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-3 sm:gap-4 text-left flex-1">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-black font-bold text-sm sm:text-base">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">{item.title}</h3>
                          {hasPreviewLessons && (
                            <span className="px-3 py-1 rounded-full bg-primary text-black text-xs font-bold shadow-md">
                              맛보기
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration}</span>
                          {item.lessons && item.lessons.length > 0 && (
                            <>
                              <span className="text-border">•</span>
                              <span>{item.lessons.length}개 강의</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-7 pb-6 bg-[#0D0D0D]">
                    <div className="sm:pl-14 space-y-4 pt-2">
                      {/* Chapter Description */}
                      <p className="text-muted-foreground">{item.description}</p>
                      
                      {/* Lessons List */}
                      {item.lessons && item.lessons.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <h4 className="text-sm font-medium text-foreground/80 mb-3">📚 강의 목차</h4>
                          {item.lessons.map((lesson, lessonIndex) => {
                            const isPlaying = playingLessonId === lesson.id;
                            const canPlay = lesson.isPreview && lesson.videoUrl;
                            
                            return (
                              <div key={lesson.id} className="space-y-2">
                                <div
                                  className={cn(
                                    "flex items-center gap-3 p-4 rounded-lg transition-all border",
                                    lesson.isPreview 
                                      ? "bg-[#1A1A1A] hover:bg-[#222222] cursor-pointer border-primary/30" 
                                      : "bg-[#111111] border-transparent"
                                  )}
                                  onClick={() => canPlay && toggleLessonVideo(lesson.id)}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    lesson.isPreview 
                                      ? "bg-gradient-to-br from-primary to-orange-500 shadow-md" 
                                      : "bg-muted"
                                  )}>
                                    {lesson.isPreview ? (
                                      <Play className="w-4 h-4 text-black" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm truncate",
                                      lesson.isPreview ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                      {lessonIndex + 1}. {lesson.title}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                    {lesson.isPreview && (
                                      <span className={cn(
                                        "text-xs font-bold px-3 py-1 rounded-full transition-colors border",
                                        isPlaying 
                                          ? "bg-primary text-black border-primary" 
                                          : "bg-transparent text-primary border-primary hover:bg-primary/10"
                                      )}>
                                        {isPlaying ? '닫기' : '미리보기'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Inline Video Player */}
                                {canPlay && (
                                  <div className={cn(
                                    "overflow-hidden transition-all duration-300",
                                    isPlaying ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                  )}>
                                    {isPlaying && (
                                      <div className="p-2">
                                        <VideoPlayer
                                          src={lesson.videoUrl!}
                                          showLabel="미리보기"
                                          className="rounded-lg"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
