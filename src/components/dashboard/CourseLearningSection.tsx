import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/VideoPlayer';
import { CourseMaterialsDownload } from './CourseMaterialsDownload';
import { CertificateDownload } from './CertificateDownload';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Play,
  Lock,
  Clock,
  CheckCircle,
  BookOpen,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoUrl?: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
}

interface CourseLearningProps {
  courseId: string;
  courseTitle: string;
  curriculum: Chapter[];
  isEnrolled: boolean;
  userName?: string;
  completedAt?: string | null;
}

export const CourseLearningSection = ({
  courseId,
  courseTitle,
  curriculum,
  isEnrolled,
  userName = '학습자',
  completedAt,
}: CourseLearningProps) => {
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  
  // Use the progress hook for enrolled users
  const {
    completedLessons,
    completedCount,
    totalLessons,
    progressPercentage,
    isCompleted,
    certificateIssued,
    certificateIssuedAt,
    markLessonComplete,
    issueCertificate,
    getNextLesson,
  } = useCourseProgress(courseId, curriculum);

  const toggleVideo = (lessonId: string) => {
    if (playingLessonId === lessonId) {
      setPlayingLessonId(null);
    } else {
      setPlayingLessonId(lessonId);
    }
  };

  const handleVideoEnded = (lessonId: string) => {
    if (isEnrolled) {
      markLessonComplete(lessonId);
    }
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>아직 커리큘럼이 준비되지 않았습니다</p>
        </CardContent>
      </Card>
    );
  }

  const nextLesson = getNextLesson();

  return (
    <div className="space-y-6">
      {/* Progress & Certificate Section - Full Width on Mobile */}
      {isEnrolled && (
        <div className="grid grid-cols-1 gap-4">
          <CertificateDownload
            progressPercentage={progressPercentage}
            isCompleted={isCompleted}
            certificateIssued={certificateIssued}
            certificateIssuedAt={certificateIssuedAt}
            onIssueCertificate={issueCertificate}
            userName={userName}
            courseTitle={courseTitle}
            completedAt={completedAt}
          />
        </div>
      )}

      {/* Course Progress Header - Compact */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{courseTitle}</h2>
                <p className="text-gray-500 text-xs">
                  {curriculum.length}개 챕터 · {totalLessons}개 레슨
                </p>
              </div>
              {isEnrolled && totalLessons > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    <span className="font-bold text-primary">{completedCount}</span> / {totalLessons} 완료
                  </span>
                </div>
              )}
            </div>

            {/* Continue Learning Button - High Contrast */}
            {isEnrolled && nextLesson && !isCompleted && (
              <Button 
                onClick={() => toggleVideo(nextLesson.lessonId)}
                size="sm"
                className="w-full sm:w-auto bg-primary text-primary-foreground font-bold"
              >
                <Play className="w-3 h-3 mr-1" />
                이어서 학습: {nextLesson.lessonTitle}
              </Button>
            )}

            {isEnrolled && isCompleted && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium text-sm">🎉 모든 강의 완료!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Accordion - Compact */}
      <Accordion type="single" collapsible className="space-y-2">
        {curriculum.map((chapter, chapterIndex) => {
          // Calculate chapter completion
          const chapterLessonIds = chapter.lessons?.map(l => l.id) || [];
          const chapterCompletedCount = chapterLessonIds.filter(id => completedLessons.has(id)).length;
          const chapterTotal = chapterLessonIds.length;
          const chapterCompleted = chapterTotal > 0 && chapterCompletedCount === chapterTotal;

          return (
            <AccordionItem
              key={chapter.id}
              value={chapter.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center gap-2 text-left flex-1">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
                    chapterCompleted ? "bg-green-100" : "bg-primary/10"
                  )}>
                    {chapterCompleted ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{chapterIndex + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{chapter.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{chapter.duration}</span>
                      <span>·</span>
                      <span>{chapterCompletedCount}/{chapterTotal}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-2">
                {chapter.description && (
                  <p className="text-xs text-gray-500 mb-2 pl-8">
                    {chapter.description}
                  </p>
                )}
                <div className="space-y-1">
                  {chapter.lessons?.map((lesson, lessonIndex) => {
                    const isPlaying = playingLessonId === lesson.id;
                    const isLessonCompleted = completedLessons.has(lesson.id);
                    const canPlay = isEnrolled || lesson.isPreview;
                    const hasVideo = !!lesson.videoUrl;

                    return (
                      <div key={lesson.id} className="space-y-1">
                        <div
                          className={cn(
                            'flex items-center gap-2 py-1.5 px-2 rounded-md transition-all',
                            canPlay && hasVideo
                              ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                              : 'bg-gray-50/50',
                            isPlaying && 'bg-primary/5 ring-1 ring-primary/20'
                          )}
                          onClick={() => canPlay && hasVideo && toggleVideo(lesson.id)}
                        >
                          {/* Status Icon - Smaller */}
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                              isLessonCompleted
                                ? 'bg-green-100'
                                : canPlay
                                ? 'bg-primary/10'
                                : 'bg-gray-100'
                            )}
                          >
                            {isLessonCompleted ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : canPlay ? (
                              <Play className="w-2.5 h-2.5 text-primary" />
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-gray-400" />
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-xs truncate',
                                canPlay ? 'text-gray-900' : 'text-gray-400'
                              )}
                            >
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                          </div>

                          {/* Duration & High-Contrast Buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-gray-500">{lesson.duration}</span>
                            {lesson.isPreview && !isEnrolled && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary text-primary">
                                미리보기
                              </Badge>
                            )}
                            {canPlay && hasVideo && (
                              <Badge
                                variant={isPlaying ? 'default' : 'secondary'}
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-bold",
                                  isPlaying 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                                )}
                              >
                                {isPlaying ? '닫기' : '재생'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Video Player - FULL WIDTH on Mobile */}
                        {isPlaying && hasVideo && (
                          <div className="w-full p-2 bg-gray-900/5 rounded-lg">
                            <VideoPlayer
                              src={lesson.videoUrl!}
                              showLabel={lesson.isPreview && !isEnrolled ? '미리보기' : undefined}
                              className="w-full rounded-lg"
                              onEnded={() => handleVideoEnded(lesson.id)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Materials Download Section - Only for enrolled users */}
      {isEnrolled && (
        <CourseMaterialsDownload courseId={courseId} courseName={courseTitle} />
      )}
    </div>
  );
};
