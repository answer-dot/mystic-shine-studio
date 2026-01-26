import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Save, LogOut, Calendar, Users, FileText, 
  Shield, HelpCircle, Plus, Trash2, Sparkles, Upload, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/hooks/useSettings';
import { verifyPin, CurriculumItem, EventItem } from '@/lib/store';
import defaultInstructorImage from '@/assets/instructor-profile.jpg';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Admin = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

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
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  }, [isAuthenticated, settings]);

  const handleLogin = () => {
    if (verifyPin(pin)) {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "이미지는 5MB 이하로 업로드해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setInstructorImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setInstructorImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleChangePin = () => {
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
    updateSettings({ adminPin: newPin });
    setNewPin('');
    setConfirmPin('');
    toast({
      title: "PIN 변경 완료",
      description: "새로운 PIN으로 변경되었습니다.",
    });
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

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">관리자 로그인</h1>
            <p className="text-sm text-muted-foreground mt-2">PIN을 입력해주세요</p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="PIN 입력"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="text-center text-lg tracking-widest"
            />
            {pinError && <p className="text-sm text-destructive text-center">{pinError}</p>}
            <Button variant="gold" className="w-full" onClick={handleLogin}>
              로그인
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            기본 PIN: 1234
          </p>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold">관리자 대시보드</h1>
                <p className="text-xs text-muted-foreground">{settings.siteName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                사이트 보기
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsAuthenticated(false)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="section-container py-8">
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 bg-transparent h-auto p-0">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              일반
            </TabsTrigger>
            <TabsTrigger value="instructor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              강사
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              커리큘럼
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              이벤트
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              보안
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">사이트 설정</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">사이트 이름</label>
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="사이트 이름"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">웨비나 날짜</label>
                  <Input
                    type="datetime-local"
                    value={webinarDate.slice(0, 16)}
                    onChange={(e) => setWebinarDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">잔여 좌석</label>
                  <Input
                    type="number"
                    value={remainingSeats}
                    onChange={(e) => setRemainingSeats(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">판매가</label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₩490,000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">정가</label>
                  <Input
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="₩890,000"
                  />
                </div>
              </div>
              <Button variant="gold" className="mt-6" onClick={handleSaveGeneral}>
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>

            {/* Domain help */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">도메인 연결</h2>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>커스텀 도메인을 연결하려면 Lovable 프로젝트 설정 → Domains에서 설정할 수 있습니다. 
                    A 레코드를 185.158.133.1로 설정하세요.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                커스텀 도메인을 연결하면 자신만의 브랜드 URL로 사이트를 운영할 수 있습니다.
                자세한 설정 방법은 물음표 아이콘을 클릭해주세요.
              </p>
            </div>
          </TabsContent>

          {/* Instructor Settings */}
          <TabsContent value="instructor" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">강사 정보</h2>
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">프로필 이미지</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 bg-secondary flex-shrink-0">
                      <img 
                        src={instructorImageUrl || defaultInstructorImage}
                        alt="강사 프로필"
                        className="w-full h-full object-cover"
                      />
                      {instructorImageUrl && (
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                        >
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        이미지 업로드
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        권장: 정사각형, 최대 5MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">강사 이름</label>
                  <Input
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="이름"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">직함</label>
                  <Input
                    value={instructorTitle}
                    onChange={(e) => setInstructorTitle(e.target.value)}
                    placeholder="직함"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">소개</label>
                  <Textarea
                    value={instructorBio}
                    onChange={(e) => setInstructorBio(e.target.value)}
                    placeholder="강사 소개"
                    rows={4}
                  />
                </div>
              </div>
              <Button variant="gold" className="mt-6" onClick={handleSaveInstructor}>
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </TabsContent>

          {/* Curriculum Settings */}
          <TabsContent value="curriculum" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">커리큘럼 관리</h2>
                <Button variant="outline" size="sm" onClick={addCurriculumItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  추가
                </Button>
              </div>

              <div className="space-y-4">
                {curriculum.map((item, index) => (
                  <div key={item.id} className="p-4 rounded-lg bg-secondary/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">단계 {index + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteCurriculumItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input
                        value={item.title}
                        onChange={(e) => updateCurriculumItem(item.id, 'title', e.target.value)}
                        placeholder="제목"
                      />
                      <Input
                        value={item.duration}
                        onChange={(e) => updateCurriculumItem(item.id, 'duration', e.target.value)}
                        placeholder="기간 (예: 4주)"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => updateCurriculumItem(item.id, 'description', e.target.value)}
                        placeholder="설명"
                        className="sm:col-span-3"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="gold" className="mt-6" onClick={handleSaveCurriculum}>
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </TabsContent>

          {/* Events Settings */}
          <TabsContent value="events" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">이벤트 관리</h2>
                <Button variant="outline" size="sm" onClick={addEventItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  추가
                </Button>
              </div>

              <div className="space-y-4">
                {events.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg bg-secondary/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">이벤트</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteEventItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        value={item.title}
                        onChange={(e) => updateEventItem(item.id, 'title', e.target.value)}
                        placeholder="이벤트 제목"
                        className="sm:col-span-2"
                      />
                      <Input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateEventItem(item.id, 'date', e.target.value)}
                      />
                      <select
                        value={item.status}
                        onChange={(e) => updateEventItem(item.id, 'status', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="ongoing">진행중</option>
                        <option value="upcoming">예정</option>
                        <option value="ended">종료</option>
                      </select>
                      <Input
                        type="number"
                        value={item.spots}
                        onChange={(e) => updateEventItem(item.id, 'spots', Number(e.target.value))}
                        placeholder="잔여 좌석"
                        min={0}
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateEventItem(item.id, 'description', e.target.value)}
                        placeholder="이벤트 설명"
                        rows={2}
                        className="sm:col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="gold" className="mt-6" onClick={handleSaveEvents}>
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">PIN 변경</h2>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-sm font-medium mb-2 block">새 PIN</label>
                  <Input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="새 PIN 입력"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">PIN 확인</label>
                  <Input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="PIN 다시 입력"
                  />
                </div>
              </div>
              <Button variant="gold" className="mt-6" onClick={handleChangePin}>
                <Shield className="w-4 h-4 mr-2" />
                PIN 변경
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
