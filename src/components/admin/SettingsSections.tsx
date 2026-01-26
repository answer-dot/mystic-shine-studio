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
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">일반 설정</h1>
        <p className="text-sm lg:text-base text-gray-600">사이트 기본 정보를 관리합니다</p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Settings className="w-5 h-5 text-orange-500" />
            사이트 정보
          </CardTitle>
          <CardDescription className="text-gray-600">사이트 이름과 웨비나 정보를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Vertical layout on mobile, horizontal on desktop */}
          <div className="grid gap-4">
            <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">사이트 이름</label>
              <div className="flex-1">
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="사이트 이름"
                  className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">헤더에 표시되는 사이트 이름입니다</p>
              </div>
            </div>
            <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">웨비나 날짜</label>
              <Input
                type="datetime-local"
                value={webinarDate.slice(0, 16)}
                onChange={(e) => setWebinarDate(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 lg:flex-1"
              />
            </div>
            <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">잔여 좌석</label>
              <Input
                type="number"
                value={remainingSeats}
                onChange={(e) => setRemainingSeats(Number(e.target.value))}
                min={0}
                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 w-full lg:w-32"
              />
            </div>
            <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">판매가</label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₩490,000"
                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 w-full lg:w-40"
              />
            </div>
            <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
              <label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">정가</label>
              <Input
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="₩890,000"
                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 w-full lg:w-40"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button variant="gold" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
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
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">강사 관리</h1>
        <p className="text-sm lg:text-base text-gray-600">강사 프로필 정보를 관리합니다</p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Settings className="w-5 h-5 text-orange-500" />
            프로필 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 lg:space-y-8">
          {/* Image Upload - Vertical layout on mobile */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">프로필 이미지</label>
            <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-orange-300 bg-gray-100">
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
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">강사 이름</label>
              <Input
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="이름"
                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">직함</label>
              <Input
                value={instructorTitle}
                onChange={(e) => setInstructorTitle(e.target.value)}
                placeholder="직함"
                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
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
              className="bg-white border-gray-300 text-gray-900 resize-none focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <Button variant="gold" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            저장하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
