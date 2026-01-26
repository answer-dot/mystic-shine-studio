import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Save, LogOut, Calendar, Users, FileText, 
  Shield, HelpCircle, Plus, Trash2, Sparkles, Upload, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="w-full max-w-sm border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">관리자 로그인</CardTitle>
            <CardDescription>PIN을 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <p className="text-xs text-muted-foreground text-center pt-2">
              기본 PIN: 1234
            </p>
          </CardContent>
        </Card>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1 bg-secondary/50 rounded-xl">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <Settings className="w-4 h-4 mr-2" />
              일반
            </TabsTrigger>
            <TabsTrigger 
              value="instructor" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              강사
            </TabsTrigger>
            <TabsTrigger 
              value="curriculum" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <FileText className="w-4 h-4 mr-2" />
              커리큘럼
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <Calendar className="w-4 h-4 mr-2" />
              이벤트
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
            >
              <Shield className="w-4 h-4 mr-2" />
              보안
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  사이트 설정
                </CardTitle>
                <CardDescription>사이트 기본 정보를 관리합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">사이트 이름</label>
                    <Input
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="사이트 이름"
                      className="border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">헤더에 표시되는 사이트 이름입니다</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">웨비나 날짜</label>
                    <Input
                      type="datetime-local"
                      value={webinarDate.slice(0, 16)}
                      onChange={(e) => setWebinarDate(e.target.value)}
                      className="border-border/50"
                    />
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">잔여 좌석</label>
                    <Input
                      type="number"
                      value={remainingSeats}
                      onChange={(e) => setRemainingSeats(Number(e.target.value))}
                      min={0}
                      className="border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">판매가</label>
                    <Input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="₩490,000"
                      className="border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">정가</label>
                    <Input
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="₩890,000"
                      className="border-border/50"
                    />
                  </div>
                </div>
                <Button variant="gold" onClick={handleSaveGeneral}>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    도메인 연결
                  </CardTitle>
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
                <CardDescription>
                  커스텀 도메인을 연결하면 자신만의 브랜드 URL로 사이트를 운영할 수 있습니다
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Instructor Settings */}
          <TabsContent value="instructor" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  강사 정보
                </CardTitle>
                <CardDescription>강사 프로필 정보를 관리합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">프로필 이미지</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30 bg-secondary flex-shrink-0">
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
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-border/50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        이미지 업로드
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        권장: 정사각형 이미지, 최대 5MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">강사 이름</label>
                    <Input
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      placeholder="이름"
                      className="border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">직함</label>
                    <Input
                      value={instructorTitle}
                      onChange={(e) => setInstructorTitle(e.target.value)}
                      placeholder="직함"
                      className="border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">소개</label>
                  <Textarea
                    value={instructorBio}
                    onChange={(e) => setInstructorBio(e.target.value)}
                    placeholder="강사 소개를 입력해주세요"
                    rows={5}
                    className="border-border/50 resize-none"
                  />
                </div>

                <Button variant="gold" onClick={handleSaveInstructor}>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Curriculum Settings */}
          <TabsContent value="curriculum" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      커리큘럼 관리
                    </CardTitle>
                    <CardDescription>강의 커리큘럼을 관리합니다</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addCurriculumItem} className="border-primary/30">
                    <Plus className="w-4 h-4 mr-2" />
                    챕터 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {curriculum.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>아직 커리큘럼이 없습니다</p>
                    <p className="text-sm">위의 "챕터 추가" 버튼을 클릭해 시작하세요</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {curriculum.map((item, index) => (
                      <Card key={item.id} className="border-border/30 bg-secondary/30">
                        <CardContent className="pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">챕터 {index + 1}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteCurriculumItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">제목</label>
                              <Input
                                value={item.title}
                                onChange={(e) => updateCurriculumItem(item.id, 'title', e.target.value)}
                                placeholder="챕터 제목"
                                className="border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">기간</label>
                              <Input
                                value={item.duration}
                                onChange={(e) => updateCurriculumItem(item.id, 'duration', e.target.value)}
                                placeholder="예: 4주"
                                className="border-border/50"
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-xs text-muted-foreground">설명</label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateCurriculumItem(item.id, 'description', e.target.value)}
                                placeholder="챕터 설명"
                                rows={2}
                                className="border-border/50 resize-none"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {curriculum.length > 0 && (
                  <Button variant="gold" onClick={handleSaveCurriculum}>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Settings */}
          <TabsContent value="events" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      이벤트 관리
                    </CardTitle>
                    <CardDescription>특별 이벤트 및 웨비나를 관리합니다</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addEventItem} className="border-primary/30">
                    <Plus className="w-4 h-4 mr-2" />
                    이벤트 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>아직 이벤트가 없습니다</p>
                    <p className="text-sm">위의 "이벤트 추가" 버튼을 클릭해 시작하세요</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((item) => (
                      <Card key={item.id} className="border-border/30 bg-secondary/30">
                        <CardContent className="pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">이벤트</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteEventItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-xs text-muted-foreground">이벤트 제목</label>
                              <Input
                                value={item.title}
                                onChange={(e) => updateEventItem(item.id, 'title', e.target.value)}
                                placeholder="이벤트 제목"
                                className="border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">날짜</label>
                              <Input
                                type="date"
                                value={item.date}
                                onChange={(e) => updateEventItem(item.id, 'date', e.target.value)}
                                className="border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">상태</label>
                              <select
                                value={item.status}
                                onChange={(e) => updateEventItem(item.id, 'status', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              >
                                <option value="ongoing">진행중</option>
                                <option value="upcoming">예정</option>
                                <option value="ended">종료</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">잔여 좌석</label>
                              <Input
                                type="number"
                                value={item.spots}
                                onChange={(e) => updateEventItem(item.id, 'spots', Number(e.target.value))}
                                placeholder="잔여 좌석"
                                min={0}
                                className="border-border/50"
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-xs text-muted-foreground">설명</label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateEventItem(item.id, 'description', e.target.value)}
                                placeholder="이벤트 설명"
                                rows={2}
                                className="border-border/50 resize-none"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {events.length > 0 && (
                  <Button variant="gold" onClick={handleSaveEvents}>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  PIN 변경
                </CardTitle>
                <CardDescription>관리자 로그인 PIN을 변경합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 PIN</label>
                    <Input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="새 PIN 입력"
                      className="border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">최소 4자리 이상 입력해주세요</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PIN 확인</label>
                    <Input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="PIN 다시 입력"
                      className="border-border/50"
                    />
                  </div>
                  <Button variant="gold" onClick={handleChangePin}>
                    <Shield className="w-4 h-4 mr-2" />
                    PIN 변경
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
