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
  FolderOpen
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="section-container">
          {/* Welcome Section */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  안녕하세요, <span className="text-primary">{displayName}</span>님!
                </h1>
                <p className="text-muted-foreground">
                  나의 학습 현황과 문의 내역을 확인하세요
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          </div>

          {/* Stats Cards - White Theme, Mobile Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="py-6 px-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base text-gray-600 font-medium">수강 중</p>
                    <p className="text-3xl font-bold text-gray-900">{enrolledCourseIds.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="py-6 px-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base text-gray-600 font-medium">완료</p>
                    <p className="text-3xl font-bold text-gray-900">{enrollments?.filter(e => e.completed_at).length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="py-6 px-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                    <Star className="w-7 h-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-base text-gray-600 font-medium">내 후기</p>
                    <p className="text-3xl font-bold text-gray-900">{userReviews?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="py-6 px-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center">
                    <Ticket className="w-7 h-7 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-base text-gray-600 font-medium">쿠폰</p>
                    <p className="text-3xl font-bold text-gray-900">{validCoupons.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                내 강의
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                학습하기
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Courses Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  강의 목록
                </h2>
              </div>

              {coursesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-card border-border">
                      <CardContent className="p-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course) => {
                    const isEnrolled = enrolledCourseIds.includes(course.id);
                    
                    return (
                      <Card 
                        key={course.id} 
                        className={`bg-card border-border hover:border-primary/50 transition-colors overflow-hidden ${
                          course.is_featured ? 'ring-1 ring-primary/20' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Course Image */}
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
                          </div>
                          
                          {/* Course Info */}
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-lg">{course.title}</h3>
                              {isEnrolled ? (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                                  수강 중
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  미등록
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {course.description || course.short_description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-primary">{course.price}</span>
                              </div>
                            </div>
                            
                            {isEnrolled ? (
                              <Button 
                                className="w-full sm:w-auto" 
                                size="sm"
                                onClick={() => {
                                  setSelectedCourseId(course.id);
                                  setActiveTab('learning');
                                }}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                학습 계속하기
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="w-full sm:w-auto" 
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
                  })}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>아직 등록된 강의가 없습니다</p>
                    <Button 
                      variant="link" 
                      className="mt-2 text-primary"
                      onClick={() => navigate('/')}
                    >
                      강의 둘러보기 <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Write Review Card */}
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

              {/* Review Form */}
              {showReviewForm && (
                <ReviewForm onSuccess={() => setShowReviewForm(false)} />
              )}

              {/* My Coupons */}
              {validCoupons.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Ticket className="w-5 h-5 text-primary" />
                      내 쿠폰
                    </CardTitle>
                    <CardDescription>사용 가능한 쿠폰 {validCoupons.length}장</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {validCoupons.map((coupon) => (
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

              {/* Profile Card */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    내 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{displayName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Inquiry History */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    최근 문의 내역
                  </CardTitle>
                  <CardDescription>
                    최근 5개의 문의 내역입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {inquiriesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : inquiries && inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div 
                          key={inquiry.id} 
                          className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2"
                        >
                          <p className="text-sm line-clamp-2">{inquiry.message}</p>
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
                          
                          {/* Show response if available */}
                          {inquiry.response && (
                            <div className="mt-2 p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                                관리자 답변 {inquiry.responded_at && `(${new Date(inquiry.responded_at).toLocaleDateString('ko-KR')})`}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{inquiry.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      문의 내역이 없습니다
                    </p>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-primary"
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
            </div>
          </div>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value="learning">
              {selectedCourseId && courses ? (
                (() => {
                  const selectedCourse = courses.find(c => c.id === selectedCourseId);
                  if (!selectedCourse) return null;
                  const isEnrolled = enrolledCourseIds.includes(selectedCourse.id);
                  return (
                    <div className="space-y-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab('overview')}
                        className="mb-2"
                      >
                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                        강의 목록으로
                      </Button>
                      <CourseLearningSection
                        courseId={selectedCourse.id}
                        courseTitle={selectedCourse.title}
                        curriculum={selectedCourse.curriculum as any[] || []}
                        isEnrolled={isEnrolled}
                      />
                    </div>
                  );
                })()
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>학습할 강의를 선택해주세요</p>
                    <Button 
                      variant="link" 
                      className="mt-2 text-primary"
                      onClick={() => setActiveTab('overview')}
                    >
                      강의 목록 보기 <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
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

export default Dashboard;
