import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { verifyPin, updateAdminPin, EventItem, TestimonialItem } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Admin components
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardSection } from '@/components/admin/DashboardSection';
import { GeneralSection, InstructorSection } from '@/components/admin/SettingsSections';
import { LegalSettingsSection } from '@/components/admin/LegalSettingsSection';
import { EventsSection } from '@/components/admin/EventsSection';
import { TestimonialsSection } from '@/components/admin/TestimonialsSection';
import { InquiriesSection } from '@/components/admin/InquiriesSection';
import { SecuritySection } from '@/components/admin/SecuritySection';
import { CoursesSection } from '@/components/admin/CoursesSection';
import { ReviewsSection } from '@/components/admin/ReviewsSection';
import { MaterialsSection } from '@/components/admin/MaterialsSection';
import { CustomersSection } from '@/components/admin/CustomersSection';
import { BlacklistAlertBanner } from '@/components/admin/BlacklistAlertBanner';
import { EmailSettingsSection } from '@/components/admin/EmailSettingsSection';
import { NotificationBell } from '@/components/admin/NotificationBell';

type AuthStep = 'login' | 'pin' | 'authenticated';

const Admin = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { toast } = useToast();
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  
  // Auth state
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Dashboard state
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadInquiries, setUnreadInquiries] = useState(0);

  // Local form states
  const [siteName, setSiteName] = useState('');
  const [webinarDate, setWebinarDate] = useState('');
  const [remainingSeats, setRemainingSeats] = useState(0);
  const [instructorName, setInstructorName] = useState('');
  const [instructorTitle, setInstructorTitle] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorImageUrl, setInstructorImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('');

  // Determine auth step based on user state
  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      // User is logged in, check if they passed PIN
      const pinVerified = sessionStorage.getItem('admin_pin_verified');
      if (pinVerified === 'true') {
        setAuthStep('authenticated');
      } else {
        setAuthStep('pin');
      }
    } else {
      setAuthStep('login');
      sessionStorage.removeItem('admin_pin_verified');
    }
  }, [user, authLoading]);

  // Initialize form with settings
  useEffect(() => {
    if (authStep === 'authenticated') {
      refreshSettings();
    }
  }, [authStep, refreshSettings]);

  // Sync form state when settings change
  useEffect(() => {
    if (authStep === 'authenticated' && settings) {
      setSiteName(settings.siteName || '');
      setWebinarDate(settings.webinarDate || '');
      setRemainingSeats(settings.remainingSeats || 0);
      setInstructorName(settings.instructorName || '');
      setInstructorTitle(settings.instructorTitle || '');
      setInstructorBio(settings.instructorBio || '');
      setInstructorImageUrl(settings.instructorImageUrl || '');
      setPrice(settings.price || '');
      setOriginalPrice(settings.originalPrice || '');
      setEvents(settings.events || []);
      setTestimonials(settings.testimonials || []);
      setTermsOfService(settings.termsOfService || '');
      setPrivacyPolicy(settings.privacyPolicy || '');
      setRefundPolicy(settings.refundPolicy || '');
    }
  }, [authStep, settings]);

  // Handle email/password login
  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('이메일과 비밀번호를 입력해주세요');
      return;
    }
    
    setIsLoggingIn(true);
    setAuthError('');
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message || '로그인에 실패했습니다');
      } else {
        // After login, move to PIN verification
        setAuthStep('pin');
        setEmail('');
        setPassword('');
        toast({
          title: "로그인 성공",
          description: "관리자 PIN을 입력해주세요.",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('로그인 중 오류가 발생했습니다');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle PIN verification
  const handlePinVerify = async () => {
    if (!pin.trim()) {
      setAuthError('PIN을 입력해주세요');
      return;
    }
    
    setIsLoggingIn(true);
    setAuthError('');
    
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        sessionStorage.setItem('admin_pin_verified', 'true');
        setAuthStep('authenticated');
        setPin('');
        toast({
          title: "인증 완료",
          description: "관리자 대시보드에 오신 것을 환영합니다.",
        });
      } else {
        setAuthError('잘못된 PIN입니다');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setAuthError('PIN 확인 중 오류가 발생했습니다');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    sessionStorage.removeItem('admin_pin_verified');
    await signOut();
    setAuthStep('login');
    toast({
      title: "로그아웃",
      description: "안전하게 로그아웃되었습니다.",
    });
  };

  const handleSaveGeneral = async () => {
    await updateSettings({
      siteName,
      webinarDate,
      remainingSeats,
      price,
      originalPrice,
    });
    toast({
      title: "저장 완료",
      description: "일반 설정이 저장되었습니다. 메인 사이트에 즉시 반영됩니다.",
    });
  };

  const handleSaveInstructor = async () => {
    await updateSettings({
      instructorName,
      instructorTitle,
      instructorBio,
      instructorImageUrl,
    });
    toast({
      title: "저장 완료",
      description: "강사 정보가 저장되었습니다.",
    });
  };

  const handleSaveEvents = async () => {
    await updateSettings({ events });
    toast({
      title: "저장 완료",
      description: "이벤트가 저장되었습니다.",
    });
  };

  const handleSaveTestimonials = async () => {
    await updateSettings({ testimonials });
    toast({
      title: "저장 완료",
      description: "수강생 후기가 저장되었습니다.",
    });
  };

  const handleSaveLegal = async () => {
    await updateSettings({ termsOfService, privacyPolicy, refundPolicy });
    toast({
      title: "저장 완료",
      description: "약관이 저장되었습니다. 푸터와 회원가입 페이지에 즉시 반영됩니다.",
    });
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) {
      toast({
        title: "오류",
        description: "PIN은 최소 4자리여야 합니다.",
        variant: "destructive",
      });
      return;
    }
    if (newPin !== confirmPin) {
      toast({
        title: "오류",
        description: "PIN이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await updateAdminPin(newPin);
    if (success) {
      setNewPin('');
      setConfirmPin('');
      toast({
        title: "PIN 변경 완료",
        description: "새로운 PIN으로 변경되었습니다.",
      });
    } else {
      toast({
        title: "오류",
        description: "PIN 변경에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const addEventItem = () => {
    setEvents([
      ...events,
      { id: Date.now().toString(), title: '', description: '', date: '', status: 'upcoming', spots: 50 }
    ]);
  };

  const updateEventItem = (id: string, field: keyof EventItem, value: string | number) => {
    setEvents(events.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteEventItem = (id: string) => {
    setEvents(events.filter(item => item.id !== id));
  };

  const addTestimonialItem = () => {
    setTestimonials([
      ...testimonials,
      { id: Date.now().toString(), name: '', role: '', content: '', rating: 5 }
    ]);
  };

  const updateTestimonialItem = (id: string, field: keyof TestimonialItem, value: string | number) => {
    setTestimonials(testimonials.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteTestimonialItem = (id: string) => {
    setTestimonials(testimonials.filter(item => item.id !== id));
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    setMobileSidebarOpen(false);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Step 1: Email/Password Login
  if (authStep === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-sm bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">관리자 로그인</CardTitle>
            <CardDescription className="text-gray-600">이메일과 비밀번호를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError('');
                  }}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  disabled={isLoggingIn}
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoggingIn && handleEmailLogin()}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  disabled={isLoggingIn}
                />
              </div>
            </div>
            {authError && <p className="text-sm text-destructive text-center">{authError}</p>}
            <Button 
              variant="gold" 
              className="w-full" 
              onClick={handleEmailLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? '로그인 중...' : '로그인'}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-gray-600 hover:text-gray-900" 
              onClick={() => navigate('/')}
              disabled={isLoggingIn}
            >
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: PIN Verification (after email login)
  if (authStep === 'pin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-sm bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">2단계 인증</CardTitle>
            <CardDescription className="text-gray-600">관리자 PIN을 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="PIN 입력"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setAuthError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && !isLoggingIn && handlePinVerify()}
              className="text-center text-lg tracking-widest bg-white border-gray-300 text-gray-900"
              disabled={isLoggingIn}
              autoFocus
            />
            {authError && <p className="text-sm text-destructive text-center">{authError}</p>}
            <Button 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" 
              onClick={handlePinVerify}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? '확인 중...' : '확인'}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-gray-600 hover:text-gray-900" 
              onClick={handleLogout}
              disabled={isLoggingIn}
            >
              다른 계정으로 로그인
            </Button>
            <p className="text-xs text-gray-500 text-center pt-2">
              기본 PIN: 1234
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard stats
  const dashboardStats = {
    totalMembers: 0,
    totalSales: '₩0',
    newInquiries: unreadInquiries,
    remainingSeats: settings.remainingSeats,
  };

  // Render current section
  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <DashboardSection 
            stats={dashboardStats} 
            onNavigate={handleSectionChange}
          />
        );
      case 'general':
        return (
          <GeneralSection
            siteName={siteName}
            setSiteName={setSiteName}
            webinarDate={webinarDate}
            setWebinarDate={setWebinarDate}
            remainingSeats={remainingSeats}
            setRemainingSeats={setRemainingSeats}
            price={price}
            setPrice={setPrice}
            originalPrice={originalPrice}
            setOriginalPrice={setOriginalPrice}
            onSave={handleSaveGeneral}
          />
        );
      case 'instructor':
        return (
          <InstructorSection
            instructorName={instructorName}
            setInstructorName={setInstructorName}
            instructorTitle={instructorTitle}
            setInstructorTitle={setInstructorTitle}
            instructorBio={instructorBio}
            setInstructorBio={setInstructorBio}
            instructorImageUrl={instructorImageUrl}
            setInstructorImageUrl={setInstructorImageUrl}
            onSave={handleSaveInstructor}
          />
        );
      case 'courses':
        return <CoursesSection />;
      case 'customers':
        return <CustomersSection />;
      case 'events':
        return (
          <EventsSection
            events={events}
            onAdd={addEventItem}
            onUpdate={updateEventItem}
            onDelete={deleteEventItem}
            onSave={handleSaveEvents}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSection
            testimonials={testimonials}
            onAdd={addTestimonialItem}
            onUpdate={updateTestimonialItem}
            onDelete={deleteTestimonialItem}
            onSave={handleSaveTestimonials}
          />
        );
      case 'reviews':
        return <ReviewsSection />;
      case 'materials':
        return <MaterialsSection />;
      case 'inquiries':
        return (
          <InquiriesSection onUnreadCountChange={setUnreadInquiries} />
        );
      case 'email':
        return <EmailSettingsSection />;
      case 'legal':
        return (
          <LegalSettingsSection
            termsOfService={termsOfService}
            setTermsOfService={setTermsOfService}
            privacyPolicy={privacyPolicy}
            setPrivacyPolicy={setPrivacyPolicy}
            refundPolicy={refundPolicy}
            setRefundPolicy={setRefundPolicy}
            onSave={handleSaveLegal}
          />
        );
      case 'security':
        return (
          <SecuritySection
            newPin={newPin}
            setNewPin={setNewPin}
            confirmPin={confirmPin}
            setConfirmPin={setConfirmPin}
            onChangePin={handleChangePin}
          />
        );
      default:
        return null;
    }
  };

  // Admin dashboard with sidebar
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Blacklist Alert Banner */}
      <BlacklistAlertBanner />
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-700 hover:bg-gray-100"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <span className="font-semibold text-gray-900">관리자센터</span>
        <NotificationBell />
      </header>

      {/* Desktop Header with Notification Bell */}
      <header className="hidden lg:flex fixed top-0 right-0 h-14 bg-white border-b border-gray-200 z-40 items-center justify-end px-6 shadow-sm" style={{ left: sidebarCollapsed ? '64px' : '256px' }}>
        <NotificationBell />
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "lg:block",
        mobileSidebarOpen ? "block" : "hidden"
      )}>
        <AdminSidebar
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          siteName={settings.siteName}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
          unreadInquiries={unreadInquiries}
        />
      </div>

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen pt-14 lg:pt-14 transition-all duration-300 bg-gray-50 overflow-x-hidden",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="p-4 lg:p-8 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
          </div>
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Admin;