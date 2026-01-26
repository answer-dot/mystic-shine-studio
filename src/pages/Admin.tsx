import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { verifyPin, updateAdminPin, CurriculumItem, EventItem, TestimonialItem } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Admin components
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardSection } from '@/components/admin/DashboardSection';
import { GeneralSection, InstructorSection } from '@/components/admin/SettingsSections';
import { CurriculumSection } from '@/components/admin/CurriculumSection';
import { EventsSection } from '@/components/admin/EventsSection';
import { TestimonialsSection } from '@/components/admin/TestimonialsSection';
import { InquiriesSection } from '@/components/admin/InquiriesSection';
import { SecuritySection } from '@/components/admin/SecuritySection';

const Admin = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
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
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Initialize form with settings
  useEffect(() => {
    if (isAuthenticated) {
      refreshSettings();
      setSiteName(settings.siteName);
      setWebinarDate(settings.webinarDate);
      setRemainingSeats(settings.remainingSeats);
      setInstructorName(settings.instructorName);
      setInstructorTitle(settings.instructorTitle);
      setInstructorBio(settings.instructorBio);
      setInstructorImageUrl(settings.instructorImageUrl);
      setPrice(settings.price);
      setOriginalPrice(settings.originalPrice);
      setCurriculum(settings.curriculum);
      setEvents(settings.events);
      setTestimonials(settings.testimonials || []);
    }
  }, [isAuthenticated, settings]);

  const handleLogin = async () => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('잘못된 PIN입니다');
    }
  };

  const handleSaveGeneral = () => {
    updateSettings({
      siteName,
      webinarDate,
      remainingSeats,
      price,
      originalPrice,
    });
    toast({
      title: "저장 완료",
      description: "일반 설정이 저장되었습니다.",
    });
  };

  const handleSaveInstructor = () => {
    updateSettings({
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

  const handleSaveCurriculum = () => {
    updateSettings({ curriculum });
    toast({
      title: "저장 완료",
      description: "커리큘럼이 저장되었습니다.",
    });
  };

  const handleSaveEvents = () => {
    updateSettings({ events });
    toast({
      title: "저장 완료",
      description: "이벤트가 저장되었습니다.",
    });
  };

  const handleSaveTestimonials = () => {
    updateSettings({ testimonials });
    toast({
      title: "저장 완료",
      description: "수강생 후기가 저장되었습니다.",
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

  const addCurriculumItem = () => {
    setCurriculum([
      ...curriculum,
      { id: Date.now().toString(), title: '', description: '', duration: '', lessons: [] }
    ]);
  };

  const updateCurriculumItem = (id: string, field: keyof CurriculumItem, value: string) => {
    setCurriculum(curriculum.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteCurriculumItem = (id: string) => {
    setCurriculum(curriculum.filter(item => item.id !== id));
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

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-sm bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">관리자 로그인</CardTitle>
            <CardDescription className="text-gray-600">PIN을 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="PIN 입력"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="text-center text-lg tracking-widest bg-white border-gray-300 text-gray-900"
            />
            {pinError && <p className="text-sm text-destructive text-center">{pinError}</p>}
            <Button variant="gold" className="w-full" onClick={handleLogin}>
              로그인
            </Button>
            <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900" onClick={() => navigate('/')}>
              홈으로 돌아가기
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
    totalMembers: 0, // TODO: Connect to real data
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
      case 'curriculum':
        return (
          <CurriculumSection
            curriculum={curriculum}
            onAdd={addCurriculumItem}
            onUpdate={updateCurriculumItem}
            onDelete={deleteCurriculumItem}
            onSave={handleSaveCurriculum}
          />
        );
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
      case 'inquiries':
        return (
          <InquiriesSection onUnreadCountChange={setUnreadInquiries} />
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
    <div className="min-h-screen bg-gray-50">
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
        <span className="font-semibold text-gray-900">{settings.siteName}</span>
        <Button variant="gold" size="sm" onClick={() => navigate('/')}>
          사이트 보기
        </Button>
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
          onLogout={() => setIsAuthenticated(false)}
          unreadInquiries={unreadInquiries}
        />
      </div>

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen pt-14 lg:pt-0 transition-all duration-300 bg-gray-50",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="p-6 lg:p-8 max-w-6xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
