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
    <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col">
        {/* Course Header with Image */}
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
            <img 
              src={course.image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.is_featured && (
              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                추천
              </Badge>
            )}
            {isCompleted && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  수료 완료
                </Badge>
              </div>
            )}
          </div>
          
          {/* Course Info */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                수강 중
              </Badge>
            </div>
            
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
              {course.description || course.short_description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{completedCount}/{totalLessons} 레슨 완료</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-5 pb-5 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">학습 진도율</span>
              <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Action Buttons - Full Width on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              className="w-full" 
              onClick={onStartLearning}
            >
              <Play className="w-4 h-4 mr-2" />
              {isCompleted ? '다시 학습하기' : '이어서 학습하기'}
            </Button>
            
            {/* Certificate Button */}
            {isCompleted ? (
              certificateIssued ? (
                <Button 
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  onClick={onStartLearning}
                >
                  <Award className="w-4 h-4 mr-2" />
                  수료증 보기
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                  onClick={() => issueCertificate()}
                >
                  <Award className="w-4 h-4 mr-2" />
                  수료증 발급
                </Button>
              )
            ) : (
              <Button 
                variant="outline"
                className="w-full opacity-50 cursor-not-allowed"
                disabled
              >
                <Lock className="w-4 h-4 mr-2" />
                수료증 발급 (100% 달성 시)
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};