import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { 
  Play, 
  Clock, 
  Award,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronUp
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

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  image_url: string;
  price: string;
  duration: string;
  is_featured: boolean;
  curriculum: unknown[];
  features: string[];
}

interface Enrollment {
  course_id: string;
  enrolled_at: string;
  progress: unknown;
  completed_at: string | null;
}

interface EnrolledCourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  userName: string;
  onStartLearning: () => void;
}

export const EnrolledCourseCard = ({
  course,
  enrollment,
  userName,
  onStartLearning,
}: EnrolledCourseCardProps) => {
  const [showLessonList, setShowLessonList] = useState(false);
  const curriculum = course.curriculum as Chapter[] || [];
  
  const {
    completedLessons,
    completedCount,
    totalLessons,
    progressPercentage,
    isCompleted,
    certificateIssued,
    issueCertificate,
  } = useCourseProgress(course.id, curriculum);

  // Flatten all lessons for the list view
  const allLessons: { lesson: Lesson; chapterTitle: string; chapterIndex: number; lessonIndex: number }[] = [];
  curriculum.forEach((chapter, chapterIdx) => {
    chapter.lessons?.forEach((lesson, lessonIdx) => {
      allLessons.push({
        lesson,
        chapterTitle: chapter.title,
        chapterIndex: chapterIdx + 1,
        lessonIndex: lessonIdx + 1,
      });
    });
  });

  return (
    <Card className="bg-card border-2 border-border shadow-lg overflow-hidden">
      {/* Horizontal Split Layout: Image Left, Content Right */}
      <div className="flex flex-col md:flex-row">
        {/* Left Side: Fixed Image Box (16:9 ratio) */}
        <div className="relative w-full md:w-48 lg:w-56 flex-shrink-0">
          <div className="aspect-video md:aspect-square lg:aspect-video w-full h-full">
            <img 
              src={course.image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          {isCompleted && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                <CheckCircle className="w-3 h-3 mr-1" />
                수료
              </Badge>
            </div>
          )}
        </div>
        
        {/* Right Side: Content Area */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
          {/* Top Content: Title, Tag, Lesson Count - High Contrast */}
          <div>
            {/* Title & Tag Row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-bold text-xl leading-tight text-foreground">{course.title}</h3>
              <Badge className="bg-primary text-primary-foreground border-primary text-xs font-bold px-2 py-1 flex-shrink-0">
                수강 중
              </Badge>
            </div>
            
            {/* Meta Info: Duration & Lesson Count */}
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1.5 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{course.duration}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-foreground">{totalLessons}개 레슨</span>
            </div>

            {/* Progress Bar - High Contrast */}
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">학습 진도율</span>
                <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-3 bg-muted" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{completedCount}/{totalLessons} 레슨 완료</p>
            </div>
          </div>

          {/* Bottom: Action Buttons Side-by-Side - High Contrast */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <Button 
              size="sm"
              className="flex-1 bg-primary text-primary-foreground font-bold border-2 border-primary hover:bg-primary/90" 
              onClick={onStartLearning}
            >
              <Play className="w-4 h-4 mr-2" />
              {isCompleted ? '다시 학습하기' : '이어서 학습하기'}
            </Button>
            
            {/* Certificate Button - High Contrast */}
            {isCompleted ? (
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 border-2 border-green-500 text-green-500 font-bold hover:bg-green-500/20"
                onClick={() => certificateIssued ? onStartLearning() : issueCertificate()}
              >
                <Award className="w-4 h-4 mr-2" />
                {certificateIssued ? '수료증 보기' : '수료증 발급'}
              </Button>
            ) : (
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 border-2 border-muted-foreground/50 text-muted-foreground font-medium cursor-not-allowed"
                disabled
                title="100% 달성 시 활성화"
              >
                <Lock className="w-4 h-4 mr-2" />
                수료증 발급
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lesson List Toggle */}
      {allLessons.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowLessonList(!showLessonList)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              📚 강의 목록 ({allLessons.length}개)
            </span>
            {showLessonList ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Collapsible Lesson List */}
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            showLessonList ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="px-4 pb-4 space-y-1 max-h-[500px] overflow-y-auto">
              {allLessons.map(({ lesson, chapterTitle, chapterIndex, lessonIndex }, index) => {
                const isLessonCompleted = completedLessons.has(lesson.id);
                
                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      "hover:bg-muted/50 cursor-pointer"
                    )}
                    onClick={onStartLearning}
                  >
                    {/* Status Icon */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                      isLessonCompleted 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isLessonCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        isLessonCompleted ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Chapter {chapterIndex}: {chapterTitle}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                      {isLessonCompleted && (
                        <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                          완료
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};