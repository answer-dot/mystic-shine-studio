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
  Lock
} from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: {
    id: string;
    title: string;
    duration: string;
    isPreview: boolean;
    videoUrl?: string;
  }[];
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
  const curriculum = course.curriculum as Chapter[] || [];
  
  const {
    completedCount,
    totalLessons,
    progressPercentage,
    isCompleted,
    certificateIssued,
    issueCertificate,
  } = useCourseProgress(course.id, curriculum);

  return (
    <Card className="bg-card border-border overflow-hidden">
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
          {/* Top Content: Title, Tag, Lesson Count */}
          <div>
            {/* Title & Tag Row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-lg leading-tight">{course.title}</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs flex-shrink-0">
                수강 중
              </Badge>
            </div>
            
            {/* Meta Info: Duration & Lesson Count */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{course.duration}</span>
              </div>
              <span className="text-border">•</span>
              <span className="font-medium">{completedCount}/{totalLessons} 레슨</span>
            </div>

            {/* Progress Bar (within right content area, not full width) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">학습 진도율</span>
                <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Bottom: Action Buttons Side-by-Side */}
          <div className="flex flex-col sm:flex-row gap-2 mt-auto">
            <Button 
              size="sm"
              className="flex-1" 
              onClick={onStartLearning}
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isCompleted ? '다시 학습하기' : '이어서 학습하기'}
            </Button>
            
            {/* Certificate Button */}
            {isCompleted ? (
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 border-green-500/50 text-green-500 hover:bg-green-500/10"
                onClick={() => certificateIssued ? onStartLearning() : issueCertificate()}
              >
                <Award className="w-3.5 h-3.5 mr-1.5" />
                {certificateIssued ? '수료증 보기' : '수료증 발급'}
              </Button>
            ) : (
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 opacity-50 cursor-not-allowed"
                disabled
                title="100% 달성 시 활성화"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                수료증 발급
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};