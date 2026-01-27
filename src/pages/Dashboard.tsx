import { useEffect, useState, useMemo } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/ReviewForm';
import { useUserReviews, useUserCoupons } from '@/hooks/useReviews';
import { CourseLearningSection } from '@/components/dashboard/CourseLearningSection';
import { 
  BookOpen, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  GraduationCap,
  User,
  Mail,
  Calendar,
  Play,
  Lock,
  Star,
  Gift,
  Ticket,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  curriculum: any[];
  features: string[];
}

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

interface UserProgress {
  completedLessons: string[];
  lastWatchedLessonId?: string;
  lastWatchedChapterId?: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

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

  // Calculate progress for enrolled course
  const courseProgress = useMemo(() => {
    if (!courses || !enrollments || enrollments.length === 0) {
      return null;
    }

    const enrolledCourse = courses.find(c => 
      enrollments.some(e => e.course_id === c.id)
    );

    if (!enrolledCourse) return null;

    const enrollment = enrollments.find(e => e.course_id === enrolledCourse.id);
    const curriculum = enrolledCourse.curriculum as Chapter[] || [];
    
    // Calculate total lessons
    const totalLessons = curriculum.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
    
    // Get completed lessons from progress - handle Json type safely
    const progressData = enrollment?.progress as unknown as UserProgress | null;
    
    const progress = progressData || { completedLessons: [] };
    const completedLessons = progress.completedLessons || [];
    const completedCount = completedLessons.length;
    
    // Calculate percentage
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Find last watched lesson info
    let lastWatchedLesson: { chapterId: string; lessonId: string; lessonTitle: string; chapterTitle: string } | null = null;
    if (progress.lastWatchedLessonId) {
      for (const chapter of curriculum) {
        const lesson = chapter.lessons?.find(l => l.id === progress.lastWatchedLessonId);
        if (lesson) {
          lastWatchedLesson = {
            chapterId: chapter.id,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            chapterTitle: chapter.title
          };
          break;
        }
      }
    }

    // If no last watched, find first incomplete lesson
    if (!lastWatchedLesson && curriculum.length > 0) {
      for (const chapter of curriculum) {
        for (const lesson of (chapter.lessons || [])) {
          if (!completedLessons.includes(lesson.id)) {
            lastWatchedLesson = {
              chapterId: chapter.id,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              chapterTitle: chapter.title
            };
            break;
          }
        }
        if (lastWatchedLesson) break;
      }
    }

    return {
      course: enrolledCourse,
      totalLessons,
      completedCount,
      percentage,
      lastWatchedLesson,
      isCompleted: enrollment?.completed_at != null
    };
  }, [courses, enrollments]);

  // Show loading state with timeout protection
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

  // Redirect handled in useEffect - just return null while redirecting
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
  const isEnrolled = enrolledCourseIds.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="section-container">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  안녕하세요, <span className="text-emerald-600">{displayName}</span>님!
                </h1>
                <p className="text-gray-600">
                  나의 학습 현황을 확인하세요
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-gray-300">
                로그아웃
              </Button>
            </div>
          </div>

          {/* Main Focus Cards - Mobile Full Width */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Progress Card - Takes 2 columns on desktop */}
            <Card className="bg-white border-gray-200 shadow-sm lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  수강 진도율
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {courseProgress ? (
                  <>
                    {/* Course Title */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {courseProgress.course.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {courseProgress.course.duration} · {courseProgress.totalLessons}개 레슨
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-emerald-600">
                          {courseProgress.percentage}%
                        </span>
                        <span className="text-gray-600">
                          {courseProgress.completedCount}/{courseProgress.totalLessons}강 수강 완료
                        </span>
                      </div>
                      <Progress 
                        value={courseProgress.percentage} 
                        className="h-4 bg-gray-100"
                      />
                      {courseProgress.isCompleted && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          수강 완료!
                        </Badge>
                      )}
                    </div>

                    {/* Continue Learning Button */}
                    <Button 
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 text-lg font-semibold"
                      onClick={() => {
                        setSelectedCourseId(courseProgress.course.id);
                        setActiveTab('learning');
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      이어서 학습하기
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    {courseProgress.lastWatchedLesson && (
                      <p className="text-sm text-gray-500 text-center">
                        다음 수업: {courseProgress.lastWatchedLesson.chapterTitle} - {courseProgress.lastWatchedLesson.lessonTitle}
                      </p>
                    )}
                  </>
                ) : isEnrolled ? (
                  <div className="text-center py-8">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">아직 수강 중인 강의가 없습니다</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')}
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      강의 둘러보기
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Column */}
            <div className="space-y-4">
              {/* My Inquiries Card */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="py-5 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-600">1:1 문의 내역</p>
                        <p className="text-2xl font-bold text-gray-900">{inquiries?.length || 0}건</p>
                      </div>
                    </div>
                    {(inquiries?.length || 0) > 0 && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          inquiries?.some(i => i.response) 
                            ? "border-emerald-500 text-emerald-600" 
                            : "border-amber-500 text-amber-600"
                        )}
                      >
                        {inquiries?.filter(i => i.response).length || 0}건 답변완료
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* My Reviews Card */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="py-5 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                        <Star className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-600">나의 수강후기</p>
                        <p className="text-2xl font-bold text-gray-900">{userReviews?.length || 0}개</p>
                      </div>
                    </div>
                    {(userReviews?.length || 0) === 0 && isEnrolled && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-500 text-amber-600 hover:bg-amber-50"
                        onClick={() => setShowReviewForm(true)}
                      >
                        작성하기
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Coupons - Only show if has valid coupons */}
              {validCoupons.length > 0 && (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="py-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-600">보유 쿠폰</p>
                        <p className="text-2xl font-bold text-gray-900">{validCoupons.length}장</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Tabs for Learning */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white">
                <BookOpen className="w-4 h-4" />
                강의 정보
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Play className="w-4 h-4" />
                학습하기
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Info */}
                <div className="lg:col-span-2 space-y-6">
                  {coursesLoading ? (
                    <Card className="bg-white border-gray-200">
                      <CardContent className="p-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ) : courses && courses.length > 0 ? (
                    courses.map((course) => {
                      const enrolled = enrolledCourseIds.includes(course.id);
                      
                      return (
                        <Card key={course.id} className="bg-white border-gray-200 shadow-sm overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            {/* Course Image */}
                            <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
                              <img 
                                src={course.image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop'}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                              {course.is_featured && (
                                <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">
                                  메인 강의
                                </Badge>
                              )}
                            </div>
                            
                            {/* Course Info */}
                            <div className="flex-1 p-5">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                                {enrolled ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    수강 중
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500">
                                    미등록
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {course.description || course.short_description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-emerald-600">{course.price}</span>
                                </div>
                              </div>
                              
                              {enrolled ? (
                                <Button 
                                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCourseId(course.id);
                                    setActiveTab('learning');
                                  }}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  학습하기
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="w-full sm:w-auto border-gray-300" 
                                  size="sm"
                                  onClick={() => navigate('/')}
                                >
                                  <Lock className="w-4 h-4 mr-2" />
                                  수강 신청
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="bg-white border-gray-200">
                      <CardContent className="py-12 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>아직 등록된 강의가 없습니다</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Write Review Card */}
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-6 text-center">
                      <Gift className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">후기 작성하고 쿠폰 받기!</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        솔직한 후기를 남기시면 10% 할인 쿠폰을 드려요
                      </p>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {showReviewForm ? '닫기' : '후기 작성하기'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Review Form */}
                  {showReviewForm && (
                    <ReviewForm onSuccess={() => setShowReviewForm(false)} />
                  )}

                  {/* My Coupons */}
                  {validCoupons.length > 0 && (
                    <Card className="bg-white border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                          <Ticket className="w-5 h-5 text-violet-600" />
                          내 쿠폰
                        </CardTitle>
                        <CardDescription>사용 가능한 쿠폰 {validCoupons.length}장</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {validCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="p-3 rounded-lg bg-violet-50 border border-violet-200"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-violet-700">
                                {coupon.discount_type === 'percentage' 
                                  ? `${coupon.discount_value}% 할인`
                                  : `₩${coupon.discount_value.toLocaleString()} 할인`
                                }
                              </span>
                              <Badge variant="outline" className="text-xs border-violet-300 text-violet-600">
                                {coupon.reason === 'review_reward' ? '후기 보상' : coupon.reason}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 font-mono">{coupon.code}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(coupon.expires_at), 'yyyy.M.d', { locale: ko })}까지
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Profile Card */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <User className="w-5 h-5 text-gray-600" />
                        내 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          {profile?.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{displayName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Inquiries */}
                  {inquiries && inquiries.length > 0 && (
                    <Card className="bg-white border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          최근 문의
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {inquiries.slice(0, 3).map((inquiry) => (
                          <div
                            key={inquiry.id}
                            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                          >
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                              {inquiry.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {format(new Date(inquiry.created_at), 'M.d', { locale: ko })}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  inquiry.response 
                                    ? "border-emerald-500 text-emerald-600" 
                                    : "border-gray-300 text-gray-500"
                                )}
                              >
                                {inquiry.response ? '답변완료' : '대기중'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value="learning">
              {courses && courses.length > 0 ? (
                (() => {
                  const courseToShow = selectedCourseId 
                    ? courses.find(c => c.id === selectedCourseId)
                    : courses.find(c => enrolledCourseIds.includes(c.id)) || courses[0];
                  
                  if (!courseToShow) return null;
                  
                  return (
                    <CourseLearningSection
                      courseId={courseToShow.id}
                      courseTitle={courseToShow.title}
                      curriculum={(courseToShow.curriculum as Chapter[]) || []}
                      isEnrolled={enrolledCourseIds.includes(courseToShow.id)}
                    />
                  );
                })()
              ) : (
                <Card className="bg-white border-gray-200">
                  <CardContent className="py-12 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>수강 가능한 강의가 없습니다</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Missing import
import { CheckCircle } from 'lucide-react';

export default Dashboard;
