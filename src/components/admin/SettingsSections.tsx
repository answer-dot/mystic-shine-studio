import { useRef } from 'react';
import { Settings, Save, HelpCircle, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import defaultInstructorImage from '@/assets/instructor-profile.jpg';

interface GeneralSectionProps {
  siteName: string;
  setSiteName: (value: string) => void;
  webinarDate: string;
  setWebinarDate: (value: string) => void;
  remainingSeats: number;
  setRemainingSeats: (value: number) => void;
  price: string;
  setPrice: (value: string) => void;
  originalPrice: string;
  setOriginalPrice: (value: string) => void;
  onSave: () => void;
}

export const GeneralSection = ({
  siteName,
  setSiteName,
  webinarDate,
  setWebinarDate,
  remainingSeats,
  setRemainingSeats,
  price,
  setPrice,
  originalPrice,
  setOriginalPrice,
  onSave,
}: GeneralSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">일반 설정</h1>
        <p className="text-muted-foreground">사이트 기본 정보를 관리합니다</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            사이트 정보
          </CardTitle>
          <CardDescription>사이트 이름과 웨비나 정보를 설정합니다</CardDescription>
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
          <Button variant="gold" onClick={onSave}>
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
              도메인 연결 가이드
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>커스텀 도메인을 연결하려면 Lovable 프로젝트 설정 → Domains에서 설정할 수 있습니다.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            커스텀 도메인을 연결하면 자신만의 브랜드 URL로 사이트를 운영할 수 있습니다.
          </p>
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium">설정 방법:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Lovable 프로젝트 설정 → Domains 메뉴로 이동</li>
              <li>Connect Domain 클릭 후 도메인 입력</li>
              <li>도메인 등록업체에서 A 레코드를 185.158.133.1로 설정</li>
              <li>DNS 전파 완료 대기 (최대 72시간)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface InstructorSectionProps {
  instructorName: string;
  setInstructorName: (value: string) => void;
  instructorTitle: string;
  setInstructorTitle: (value: string) => void;
  instructorBio: string;
  setInstructorBio: (value: string) => void;
  instructorImageUrl: string;
  setInstructorImageUrl: (value: string) => void;
  onSave: () => void;
}

export const InstructorSection = ({
  instructorName,
  setInstructorName,
  instructorTitle,
  setInstructorTitle,
  instructorBio,
  setInstructorBio,
  instructorImageUrl,
  setInstructorImageUrl,
  onSave,
}: InstructorSectionProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">강사 관리</h1>
        <p className="text-muted-foreground">강사 프로필 정보를 관리합니다</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            프로필 정보
          </CardTitle>
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

          <Button variant="gold" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
