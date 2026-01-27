import { useState } from 'react';
import { Clock, Play, Lock, Sparkles, FileText, Download } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePrimaryCourse, CurriculumItem, CurriculumLesson } from '@/hooks/usePrimaryCourse';
import { VideoPlayer } from '@/components/VideoPlayer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const CurriculumSection = () => {
  const { primaryCourse, isLoading } = usePrimaryCourse();
  const { user } = useAuth();
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);

  const toggleLessonVideo = (lessonId: string) => {
    setPlayingLessonId(playingLessonId === lessonId ? null : lessonId);
  };

  // Use curriculum from primary course, or empty array if none
  const curriculum: CurriculumItem[] = primaryCourse?.curriculum || [];

  if (isLoading) {
    return (
      <section id="curriculum" className="py-20 sm:py-28 bg-black">
        <div className="section-container px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/20 rounded w-48 mx-auto mb-4" />
              <div className="h-4 bg-muted/20 rounded w-64 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            {primaryCourse?.description || '처음 시작하는 분도 전문 리더가 될 수 있도록 설계된 커리큘럼'}
          </p>
          {primaryCourse && (
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {primaryCourse.duration}
              </span>
              <span className="text-border">•</span>
              <span>{curriculum.length}개 섹션</span>
              <span className="text-border">•</span>
              <span>{curriculum.reduce((acc, item) => acc + (item.lessons?.length || 0), 0)}개 강의</span>
            </div>
          )}
        </div>

        {/* Accordion - Chapter Cards */}
        <div className="max-w-3xl mx-auto">
          {curriculum.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-6">
              {curriculum.map((item, index) => {
                const hasPreviewLessons = item.lessons?.some(l => l.isPreview) || item.isPreview;
                const lessonCount = item.lessons?.length || 0;
                
                return (
                  <AccordionItem 
                    key={item.id} 
                    value={item.id}
                    className="bg-[#1A1A1A] rounded-2xl border border-primary/40 overflow-hidden shadow-lg shadow-black/20"
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
                            {lessonCount > 0 && (
                              <>
                                <span className="text-border">•</span>
                                <span>{lessonCount}개 강의</span>
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
                                  
                                  {/* Inline Video Player - Enhanced padding */}
                                  {canPlay && (
                                    <div className={cn(
                                      "overflow-hidden transition-all duration-300",
                                      isPlaying ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                    )}>
                                      {isPlaying && (
                                        <div className="p-4 sm:p-6 bg-black/30 rounded-xl mt-2">
                                          <VideoPlayer
                                            src={lesson.videoUrl!}
                                            showLabel="미리보기"
                                            className="rounded-xl shadow-xl"
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
          ) : (
            // Empty state - show placeholder chapters
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>커리큘럼이 준비 중입니다</p>
              <p className="text-sm mt-2">곧 상세한 커리큘럼이 공개됩니다</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
