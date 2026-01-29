import { useState, useRef } from 'react';
import { Settings, User, Mail, FileText, Save, Upload, X, BookOpen, Eye, EyeOff, Calendar, Shield, RefreshCcw, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import defaultInstructorImage from '@/assets/instructor-profile.jpg';

interface SiteSettingsTabsProps {
  // General settings
  siteName: string;
  setSiteName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  originalPrice: string;
  setOriginalPrice: (value: string) => void;
  courseVisible: boolean;
  setCourseVisible: (value: boolean) => void;
  eventsVisible: boolean;
  setEventsVisible: (value: boolean) => void;
  onSaveGeneral: () => void;
  
  // Instructor settings
  instructorName: string;
  setInstructorName: (value: string) => void;
  instructorTitle: string;
  setInstructorTitle: (value: string) => void;
  instructorBio: string;
  setInstructorBio: (value: string) => void;
  instructorImageUrl: string;
  setInstructorImageUrl: (value: string) => void;
  onSaveInstructor: () => void;
  
  // Email settings
  resendApiKey: string;
  setResendApiKey: (value: string) => void;
  onSaveEmail: () => void;
  isEmailLoading: boolean;
  isEmailSaving: boolean;
  
  // Legal settings
  termsOfService: string;
  setTermsOfService: (value: string) => void;
  privacyPolicy: string;
  setPrivacyPolicy: (value: string) => void;
  refundPolicy: string;
  setRefundPolicy: (value: string) => void;
  onSaveLegal: () => void;
}

export const SiteSettingsTabs = ({
  // General
  siteName, setSiteName,
  price, setPrice,
  originalPrice, setOriginalPrice,
  courseVisible, setCourseVisible,
  eventsVisible, setEventsVisible,
  onSaveGeneral,
  // Instructor
  instructorName, setInstructorName,
  instructorTitle, setInstructorTitle,
  instructorBio, setInstructorBio,
  instructorImageUrl, setInstructorImageUrl,
  onSaveInstructor,
  // Email
  resendApiKey, setResendApiKey,
  onSaveEmail,
  isEmailLoading,
  isEmailSaving,
  // Legal
  termsOfService, setTermsOfService,
  privacyPolicy, setPrivacyPolicy,
  refundPolicy, setRefundPolicy,
  onSaveLegal,
}: SiteSettingsTabsProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [legalTab, setLegalTab] = useState('terms');

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

  const isEmailConfigured = resendApiKey.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">사이트 설정</h1>
        <p className="text-sm lg:text-base text-gray-600">사이트 정보, 강사, 이메일, 약관을 관리합니다</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 h-auto p-1 gap-1">
          <TabsTrigger 
            value="general" 
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm font-medium text-gray-600 
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=active]:border-b-2 data-[state=active]:border-orange-500
              transition-all duration-200"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">일반 설정</span>
            <span className="sm:hidden">일반</span>
          </TabsTrigger>
          <TabsTrigger 
            value="instructor" 
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm font-medium text-gray-600 
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=active]:border-b-2 data-[state=active]:border-orange-500
              transition-all duration-200"
          >
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">강사 관리</span>
            <span className="sm:hidden">강사</span>
          </TabsTrigger>
          <TabsTrigger 
            value="email" 
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm font-medium text-gray-600 
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=active]:border-b-2 data-[state=active]:border-orange-500
              transition-all duration-200"
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">이메일 설정</span>
            <span className="sm:hidden">이메일</span>
          </TabsTrigger>
          <TabsTrigger 
            value="legal" 
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm font-medium text-gray-600 
              data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
              data-[state=active]:border-b-2 data-[state=active]:border-orange-500
              transition-all duration-200"
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">약관 관리</span>
            <span className="sm:hidden">약관</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== 일반 설정 탭 ===== */}
        <TabsContent value="general" className="mt-6 space-y-6">
          {/* 강의 노출 제어 카드 */}
          <Card className="bg-white border-2 border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                강의 노출 제어
              </CardTitle>
              <CardDescription className="text-gray-600">
                강의 콘텐츠(커리큘럼, 맛보기, 가격)를 사이트에 표시할지 선택합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="space-y-1">
                  <Label htmlFor="course-toggle" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {courseVisible ? (
                      <>
                        <Eye className="w-4 h-4 text-emerald-500" />
                        강의 노출됨
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-gray-400" />
                        강의 숨김
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {courseVisible 
                      ? '커리큘럼, 맛보기 영상, 가격 섹션이 사이트에 표시됩니다' 
                      : '강의 준비가 완료되면 스위치를 켜서 공개하세요'}
                  </p>
                </div>
                <Switch
                  id="course-toggle"
                  checked={courseVisible}
                  onCheckedChange={setCourseVisible}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              {!courseVisible && (
                <Alert className="bg-amber-50 border-amber-200">
                  <EyeOff className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    현재 강의 섹션이 숨겨져 있습니다. 영상/PDF 준비 후 스위치를 켜면 사이트에 즉시 반영됩니다.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 이벤트 섹션 노출 제어 카드 */}
          <Card className="bg-white border-2 border-blue-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-blue-500" />
                이벤트 섹션 노출 제어
              </CardTitle>
              <CardDescription className="text-gray-600">
                이벤트/웨비나 리스트 섹션을 사이트에 표시할지 선택합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="space-y-1">
                  <Label htmlFor="events-toggle" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {eventsVisible ? (
                      <>
                        <Eye className="w-4 h-4 text-blue-500" />
                        이벤트 섹션 노출됨
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-gray-400" />
                        이벤트 섹션 숨김
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {eventsVisible 
                      ? '이벤트/웨비나 목록이 메인 페이지에 표시됩니다' 
                      : '웨비나 올인 전략: 이벤트 섹션 숨김 상태'}
                  </p>
                </div>
                <Switch
                  id="events-toggle"
                  checked={eventsVisible}
                  onCheckedChange={setEventsVisible}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              {!eventsVisible && (
                <Alert className="bg-blue-50 border-blue-200">
                  <EyeOff className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-sm">
                    현재 이벤트 섹션이 숨겨져 있습니다. 히어로 배너의 웨비나 타이머만 표시됩니다.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 사이트 정보 카드 */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Settings className="w-5 h-5 text-gray-500" />
                사이트 정보
              </CardTitle>
              <CardDescription className="text-gray-600">사이트 이름과 가격 정보를 설정합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4">
                <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                  <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">사이트 이름</label>
                  <div className="flex-1">
                    <Input
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="사이트 이름"
                      className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">헤더, 푸터, 법적 문서에 즉시 반영됩니다</p>
                  </div>
                </div>
                <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                  <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">판매가</label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₩490,000"
                    className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300 w-full lg:w-40"
                  />
                </div>
                <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                  <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">정가</label>
                  <Input
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="₩890,000"
                    className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300 w-full lg:w-40"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button variant="gold" onClick={onSaveGeneral}>
                  <Save className="w-4 h-4 mr-2" />
                  저장하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== 강사 관리 탭 ===== */}
        <TabsContent value="instructor" className="mt-6 space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5 text-gray-500" />
                프로필 정보
              </CardTitle>
              <CardDescription className="text-gray-600">강사 프로필 정보를 관리합니다. 타로 강의 페이지에 표시됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 lg:space-y-8">
              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">프로필 이미지</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-orange-300 bg-gray-100 flex-shrink-0">
                    <img 
                      src={instructorImageUrl || defaultInstructorImage}
                      alt="강사 프로필"
                      className="w-full h-full object-cover"
                    />
                    {instructorImageUrl && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      이미지 업로드
                    </Button>
                    <p className="text-xs text-gray-500">
                      권장: 정사각형 이미지, 최대 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">강사 이름</label>
                  <Input
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="이름"
                    className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">직함</label>
                  <Input
                    value={instructorTitle}
                    onChange={(e) => setInstructorTitle(e.target.value)}
                    placeholder="직함"
                    className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">소개</label>
                <Textarea
                  value={instructorBio}
                  onChange={(e) => setInstructorBio(e.target.value)}
                  placeholder="강사 소개를 입력해주세요"
                  rows={5}
                  className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="gold" onClick={onSaveInstructor}>
                  <Save className="w-4 h-4 mr-2" />
                  저장하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== 이메일 설정 탭 ===== */}
        <TabsContent value="email" className="mt-6 space-y-6">
          {/* Setup Guide */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-3">
                <p className="font-medium">이메일 알림 활성화 방법</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <a 
                      href="https://resend.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Resend.com에서 계정 생성
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://resend.com/domains" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      도메인 인증 완료
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-gray-600 ml-1">(필수)</span>
                  </li>
                  <li>
                    <a 
                      href="https://resend.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      API 키 발급
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-gray-600 ml-1">후 아래에 입력</span>
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          {/* API Key Input */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Mail className="w-5 h-5 text-gray-500" />
                Resend API 설정
                {isEmailConfigured && (
                  <span className="ml-2 inline-flex items-center gap-1 text-sm font-normal text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    설정됨
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-gray-600">
                API 키가 설정되면 문의 답변 시 고객에게 자동으로 알림 이메일이 발송됩니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Resend API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="bg-white border-gray-300 text-gray-900 pr-10"
                      disabled={isEmailLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  API 키는 안전하게 암호화되어 저장됩니다. 빈 값으로 저장하면 이메일 알림이 비활성화됩니다.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="gold" onClick={onSaveEmail} disabled={isEmailSaving || isEmailLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isEmailSaving ? '저장 중...' : '저장하기'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Info */}
          {!isEmailConfigured && (
            <Alert className="bg-gray-50 border-gray-200">
              <Info className="h-4 w-4 text-gray-500" />
              <AlertDescription className="text-gray-600">
                현재 이메일 알림이 비활성화되어 있습니다. 
                위 가이드를 따라 Resend API 키를 설정하면 문의 답변 시 고객에게 자동으로 알림이 발송됩니다.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ===== 약관 관리 탭 ===== */}
        <TabsContent value="legal" className="mt-6 space-y-6">
          {/* Placeholder Guide */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>동적 플레이스홀더 안내:</strong> 아래 플레이스홀더를 사용하면 사이트 설정에 따라 자동으로 변경됩니다.
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li><code className="bg-blue-100 px-1 rounded">{'{{SITE_NAME}}'}</code> → 사이트 이름</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{CS_EMAIL}}'}</code> → 고객센터 이메일</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{CS_PHONE}}'}</code> → 고객센터 전화번호</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{CS_ADDRESS}}'}</code> → 사업장 주소</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-gray-500" />
                법적 문서 관리
              </CardTitle>
              <CardDescription className="text-gray-600">
                회원가입 시 표시되는 약관과 푸터에 링크되는 문서를 편집합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={legalTab} onValueChange={setLegalTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger 
                    value="terms" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">이용약관</span>
                    <span className="sm:hidden">약관</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="privacy" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">개인정보처리방침</span>
                    <span className="sm:hidden">개인정보</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="refund" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">환불정책</span>
                    <span className="sm:hidden">환불</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="terms" className="mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이용약관 내용</label>
                    <Textarea
                      value={termsOfService}
                      onChange={(e) => setTermsOfService(e.target.value)}
                      placeholder="이용약관 내용을 입력하세요..."
                      rows={16}
                      className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy" className="mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">개인정보처리방침 내용</label>
                    <Textarea
                      value={privacyPolicy}
                      onChange={(e) => setPrivacyPolicy(e.target.value)}
                      placeholder="개인정보처리방침 내용을 입력하세요..."
                      rows={16}
                      className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="refund" className="mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">환불정책 내용</label>
                    <Textarea
                      value={refundPolicy}
                      onChange={(e) => setRefundPolicy(e.target.value)}
                      placeholder="환불정책 내용을 입력하세요..."
                      rows={16}
                      className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-2 flex justify-end">
                <Button variant="gold" onClick={onSaveLegal}>
                  <Save className="w-4 h-4 mr-2" />
                  저장하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
