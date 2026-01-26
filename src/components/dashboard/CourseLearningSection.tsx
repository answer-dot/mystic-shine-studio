import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { CourseMaterialsDownload } from './CourseMaterialsDownload';
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
}

export const CourseLearningSection = ({
  courseId,
  courseTitle,
  curriculum,
  isEnrolled,
}: CourseLearningProps) => {
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const toggleVideo = (lessonId: string) => {
    if (playingLessonId === lessonId) {
      setPlayingLessonId(null);
    } else {
      setPlayingLessonId(lessonId);
    }
  };

  const markAsComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
  };

  const totalLessons = curriculum.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
  const completedCount = completedLessons.size;

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

  return (
    <div className="space-y-6">
      {/* Course Progress Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{courseTitle}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {curriculum.length}개 챕터 · {totalLessons}개 레슨
              </p>
            </div>
            {isEnrolled && totalLessons > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {completedCount} / {totalLessons} 완료
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Accordion */}
      <Accordion type="single" collapsible className="space-y-4">
        {curriculum.map((chapter, chapterIndex) => (
          <AccordionItem
            key={chapter.id}
            value={chapter.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{chapterIndex + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base">{chapter.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{chapter.duration}</span>
                    <span>·</span>
                    <span>{chapter.lessons?.length || 0}개 레슨</span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-4">
              {chapter.description && (
                <p className="text-sm text-muted-foreground mb-4 pl-11">
                  {chapter.description}
                </p>
              )}
              <div className="space-y-2">
                {chapter.lessons?.map((lesson, lessonIndex) => {
                  const isPlaying = playingLessonId === lesson.id;
                  const isCompleted = completedLessons.has(lesson.id);
                  const canPlay = isEnrolled || lesson.isPreview;
                  const hasVideo = !!lesson.videoUrl;

                  return (
                    <div key={lesson.id} className="space-y-2">
                      <div
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-all border',
                          canPlay && hasVideo
                            ? 'bg-muted/50 hover:bg-muted cursor-pointer border-transparent'
                            : 'bg-muted/20 border-transparent',
                          isPlaying && 'bg-primary/10 border-primary/30'
                        )}
                        onClick={() => canPlay && hasVideo && toggleVideo(lesson.id)}
                      >
                        {/* Status Icon */}
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            isCompleted
                              ? 'bg-green-500/20'
                              : canPlay
                              ? 'bg-primary/10'
                              : 'bg-muted'
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : canPlay ? (
                            <Play className="w-4 h-4 text-primary" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm truncate',
                              canPlay ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                        </div>

                        {/* Duration & Tags */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          {lesson.isPreview && !isEnrolled && (
                            <Badge variant="outline" className="text-xs border-primary text-primary">
                              미리보기
                            </Badge>
                          )}
                          {canPlay && hasVideo && (
                            <Badge
                              variant={isPlaying ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {isPlaying ? '닫기' : '재생'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Video Player */}
                      {isPlaying && hasVideo && (
                        <div className="ml-11 p-4 bg-black/50 rounded-xl">
                          <VideoPlayer
                            src={lesson.videoUrl!}
                            showLabel={lesson.isPreview && !isEnrolled ? '미리보기' : undefined}
                            className="rounded-lg"
                            onEnded={() => {
                              if (isEnrolled) {
                                markAsComplete(lesson.id);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Materials Download Section - Only for enrolled users */}
      {isEnrolled && (
        <CourseMaterialsDownload courseId={courseId} courseName={courseTitle} />
      )}
    </div>
  );
};
