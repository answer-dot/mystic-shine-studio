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
    <Card className="bg-card border border-border shadow-md overflow-hidden">
      {/* Compact Horizontal Split Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Left: Compact Image */}
        <div className="relative w-full md:w-36 lg:w-44 flex-shrink-0">
          <div className="aspect-video md:aspect-[4/3] w-full h-full">
            <img 
              src={course.image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          {isCompleted && (
            <div className="absolute top-1 right-1">
              <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">
                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                수료
              </Badge>
            </div>
          )}
        </div>
        
        {/* Right: Compact Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-bold text-base leading-tight text-foreground truncate">{course.title}</h3>
            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 flex-shrink-0">
              수강중
            </Badge>
          </div>
          
          {/* Compact Meta + Progress Side-by-Side */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1 text-xs text-foreground">
              <Clock className="w-3 h-3 text-primary" />
              <span>{course.duration}</span>
            </div>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs font-medium text-foreground">{completedCount}/{totalLessons} 완료</span>
          </div>

          {/* Compact Progress Bar */}
          <div className="mb-2 p-2 rounded bg-muted/20 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">진도율</span>
              <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-muted" />
          </div>

          {/* Compact Buttons - HIGH CONTRAST */}
          <div className="flex gap-2">
            <Button 
              size="sm"
              className="flex-1 h-8 text-xs bg-primary text-primary-foreground font-bold border-2 border-primary hover:bg-primary/90" 
              onClick={onStartLearning}
            >
              <Play className="w-3 h-3 mr-1" />
              {isCompleted ? '다시 학습' : '이어서 학습'}
            </Button>
            
            {isCompleted ? (
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-2 border-green-500 text-green-400 font-bold hover:bg-green-500/20"
                onClick={() => certificateIssued ? onStartLearning() : issueCertificate()}
              >
                <Award className="w-3 h-3 mr-1" />
                {certificateIssued ? '수료증 보기' : '수료증 발급'}
              </Button>
            ) : (
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border border-white/30 text-white/60 font-medium cursor-not-allowed"
                disabled
                title="100% 달성 시 활성화"
              >
                <Lock className="w-3 h-3 mr-1" />
                수료증 발급
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Compact Lesson List Toggle */}
      {allLessons.length > 0 && (
        <div className="border-t border-border/50">
          <button
            onClick={() => setShowLessonList(!showLessonList)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <span>📚 강의 목록 ({allLessons.length}개)</span>
            {showLessonList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Compact Collapsible List */}
          <div className={cn(
            "overflow-hidden transition-all duration-200",
            showLessonList ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="px-3 pb-2 space-y-0.5 max-h-[350px] overflow-y-auto">
              {allLessons.map(({ lesson, chapterTitle, chapterIndex }, index) => {
                const isLessonCompleted = completedLessons.has(lesson.id);
                
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted/30 cursor-pointer"
                    onClick={onStartLearning}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium",
                      isLessonCompleted ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                    )}>
                      {isLessonCompleted ? <CheckCircle className="w-3 h-3" /> : <span>{index + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0 truncate">
                      <span className={isLessonCompleted ? "text-muted-foreground" : "text-foreground"}>
                        {lesson.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{lesson.duration}</span>
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