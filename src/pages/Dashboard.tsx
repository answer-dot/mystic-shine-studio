import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewForm } from '@/components/ReviewForm';
import { useUserReviews, useUserCoupons } from '@/hooks/useReviews';
import { CourseLearningSection } from '@/components/dashboard/CourseLearningSection';
import { EnrolledCourseCard } from '@/components/dashboard/EnrolledCourseCard';
import { CourseMaterialsDownload } from '@/components/dashboard/CourseMaterialsDownload';
import { Progress } from '@/components/ui/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { 
  BookOpen, 
  MessageSquare, 
  ChevronRight, 
  User,
  Mail,
  Calendar,
  Play,
  Star,
  Gift,
  Ticket,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
  response: string | null;
  responded_at: string | null;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

// Overall Progress Component
const OverallProgressBar = ({ 
  enrolledCourses, 
  courses 
}: { 
  enrolledCourses: { course_id: string }[];
  courses: Course[] | undefined;
}) => {
  // Calculate overall progress from all enrolled courses
  const [totalProgress, setTotalProgress] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    if (!courses || enrolledCourses.length === 0) {
      setTotalProgress(0);
      return;
    }

    let completed = 0;
    let total = 0;

    enrolledCourses.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      if (course) {
        const curriculum = course.curriculum as Chapter[] || [];
        curriculum.forEach(chapter => {
          total += chapter.lessons?.length || 0;
        });
      }
    });

    setTotalLessons(total);
    setTotalCompleted(completed);
    setTotalProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  }, [enrolledCourses, courses]);

  if (enrolledCourses.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-semibold text-sm">전체 학습 진도율</h3>
          <span className="text-lg font-bold text-primary">{totalProgress}%</span>
        </div>
        <Progress value={totalProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {enrolledCourses.length}개 강의 수강 중
        </p>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isLearningMode, setIsLearningMode] = useState(false);

  // Fetch user reviews
  const { data: userReviews } = useUserReviews(user?.id);
  
  // Fetch user coupons
  const { data: userCoupons } = useUserCoupons(user?.id);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch available courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch user's enrolled courses
  const { data: enrollments } = useQuery({
    queryKey: ['user_courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_courses')
        .select('course_id, enrolled_at, progress, completed_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user's inquiries
  const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['my_inquiries', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as Inquiry[];
    },
    enabled: !!user?.email,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
  const displayName = profile?.display_name || user.email?.split('@')[0] || '회원';
  const validCoupons = userCoupons?.filter(c => !c.is_used && new Date(c.expires_at) > new Date()) || [];
  const firstEnrolledCourse = courses?.find(c => enrolledCourseIds.includes(c.id));

  // Learning Mode - Full Width
  if (isLearningMode && selectedCourseId && courses) {
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (selectedCourse) {
      const isEnrolled = enrolledCourseIds.includes(selectedCourse.id);
      const enrollment = enrollments?.find(e => e.course_id === selectedCourse.id);
      
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-20 pb-16">
            <div className="section-container">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsLearningMode(false);
                  setSelectedCourseId(null);
                }}
                className="mb-4"
              >
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                마이페이지로 돌아가기
              </Button>
              <CourseLearningSection
                courseId={selectedCourse.id}
                courseTitle={selectedCourse.title}
                curriculum={selectedCourse.curriculum as any[] || []}
                isEnrolled={isEnrolled}
                userName={displayName}
                completedAt={enrollment?.completed_at}
              />
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="section-container">
          {/* Two-Column Layout (70:30) - Stack on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            
            {/* ===== LEFT SECTION (Main Content - 70%) ===== */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* Welcome Message */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    안녕하세요, <span className="text-primary">{displayName}</span>님!
                  </h1>
                  <p className="text-muted-foreground">
                    나의 학습 현황을 확인하세요
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout} className="flex-shrink-0">
                  로그아웃
                </Button>
              </div>

              {/* Overall Progress Bar - Only show if enrolled */}
              {enrolledCourseIds.length > 0 && (
                <OverallProgressBar 
                  enrolledCourses={enrollments || []} 
                  courses={courses} 
                />
              )}

              {/* Course Section */}
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {enrolledCourseIds.length > 0 ? '내 강의' : '강의 목록'}
                </h2>

                {coursesLoading ? (
                  <Card className="bg-card border-border">
                    <CardContent className="p-3">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ) : enrolledCourseIds.length === 0 ? (
                  /* No Course Enrolled - Compact Empty State */
                  <Card className="bg-card border-border">
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-bold mb-1">신청한 강의가 없습니다!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        지금 바로 강의를 신청하고 학습을 시작해보세요.
                      </p>
                      <Button 
                        size="sm"
                        className="px-6"
                        onClick={() => navigate('/')}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        강의 보러가기
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  /* Enrolled Courses - Show Progress Cards */
                  <div className="space-y-4">
                    {courses?.filter(course => enrolledCourseIds.includes(course.id)).map((course) => {
                      const enrollment = enrollments?.find(e => e.course_id === course.id);
                      
                      return (
                        <EnrolledCourseCard
                          key={course.id}
                          course={course}
                          enrollment={enrollment}
                          userName={displayName}
                          onStartLearning={() => {
                            setSelectedCourseId(course.id);
                            setIsLearningMode(true);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT SECTION (Sidebar - 30%) ===== */}
            <div className="lg:col-span-3 space-y-3">
              
              {/* Compact Profile Summary Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    내 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      가입일
                    </span>
                    <span>{new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">수강 강의</span>
                    <span className="font-semibold text-primary">{enrolledCourseIds.length}개</span>
                  </div>
                </CardContent>
              </Card>

              {/* Download Materials - Only show if enrolled */}
              {firstEnrolledCourse && (
                <CourseMaterialsDownload 
                  courseId={firstEnrolledCourse.id} 
                  courseName={firstEnrolledCourse.title}
                />
              )}

              {/* My Coupons */}
              {validCoupons.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Ticket className="w-5 h-5 text-primary" />
                      내 쿠폰
                      <Badge variant="secondary" className="ml-auto">{validCoupons.length}장</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {validCoupons.slice(0, 3).map((coupon) => (
                      <div
                        key={coupon.id}
                        className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-orange-500/5 border border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-primary">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}% 할인`
                              : `₩${coupon.discount_value.toLocaleString()} 할인`
                            }
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {coupon.reason === 'review_reward' ? '후기 보상' : coupon.reason}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{coupon.code}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(coupon.expires_at), 'yyyy.M.d', { locale: ko })}까지
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 1:1 Inquiry Section */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    1:1 문의
                  </CardTitle>
                  <CardDescription>
                    최근 문의 내역
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {inquiriesLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : inquiries && inquiries.length > 0 ? (
                    <div className="space-y-3">
                      {inquiries.slice(0, 3).map((inquiry) => (
                        <div 
                          key={inquiry.id} 
                          className="p-3 rounded-lg bg-muted/50 border border-border space-y-2"
                        >
                          <p className="text-sm line-clamp-1">{inquiry.message}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(inquiry.created_at).toLocaleDateString('ko-KR')}</span>
                            <Badge 
                              variant={inquiry.response ? 'default' : 'secondary'} 
                              className={cn(
                                "text-xs",
                                inquiry.response && "bg-green-500 hover:bg-green-600"
                              )}
                            >
                              {inquiry.response ? '답변 완료' : '대기 중'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      문의 내역이 없습니다
                    </p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      navigate('/');
                      setTimeout(() => {
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    새 문의하기 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* My Reviews Section */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-primary" />
                    내 후기
                    {userReviews && userReviews.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">{userReviews.length}개</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userReviews && userReviews.length > 0 ? (
                    <div className="space-y-3">
                      {userReviews.slice(0, 2).map((review) => (
                        <div 
                          key={review.id}
                          className="p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "w-3 h-3",
                                  i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                                )}
                              />
                            ))}
                            <Badge 
                              variant={review.is_approved ? "default" : "secondary"}
                              className="ml-2 text-xs"
                            >
                              {review.is_approved ? '승인됨' : '검토 중'}
                            </Badge>
                          </div>
                          <p className="text-sm line-clamp-2">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      작성한 후기가 없습니다
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Write Review CTA */}
              <Card className="bg-gradient-to-br from-primary/10 to-orange-500/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Gift className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">후기 작성하고 쿠폰 받기!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    솔직한 후기를 남기시면 10% 할인 쿠폰을 드려요
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {showReviewForm ? '닫기' : '후기 작성하기'}
                  </Button>
                </CardContent>
              </Card>

              {/* Review Form - Full Width on Mobile */}
              {showReviewForm && (
                <ReviewForm onSuccess={() => setShowReviewForm(false)} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
