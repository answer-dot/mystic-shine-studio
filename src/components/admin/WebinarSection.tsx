import { forwardRef } from 'react';
import { Calendar, Save, Users, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebinarSectionProps {
  webinarDate: string;
  setWebinarDate: (value: string) => void;
  remainingSeats: number;
  setRemainingSeats: (value: number) => void;
  onSave: () => void;
}

export const WebinarSection = forwardRef<HTMLDivElement, WebinarSectionProps>(({
  webinarDate,
  setWebinarDate,
  remainingSeats,
  setRemainingSeats,
  onSave,
}, ref) => {
  // Calculate if webinar is in the past
  const webinarDateTime = webinarDate ? new Date(webinarDate) : null;
  const now = new Date();
  const isPastWebinar = webinarDateTime && webinarDateTime < now;
  const isLowSeats = remainingSeats > 0 && remainingSeats <= 5;

  return (
    <div ref={ref} className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">웨비나 설정</h1>
        <p className="text-sm lg:text-base text-gray-600">웨비나 날짜와 좌석을 관리합니다</p>
      </div>

      {/* 웨비나 일정 카드 */}
      <Card className="bg-white border-2 border-purple-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="w-5 h-5 text-purple-500" />
            웨비나 일정
          </CardTitle>
          <CardDescription className="text-gray-600">
            메인 페이지의 카운트다운 타이머에 표시되는 웨비나 날짜를 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
            <Label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">
              웨비나 날짜
            </Label>
            <div className="flex-1 space-y-2">
              <Input
                type="datetime-local"
                value={webinarDate.slice(0, 16)}
                onChange={(e) => setWebinarDate(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
              />
              {webinarDateTime && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  설정된 날짜: {webinarDateTime.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {isPastWebinar && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                설정된 웨비나 날짜가 이미 지났습니다. 새로운 날짜를 설정해주세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 좌석 관리 카드 */}
      <Card className="bg-white border-2 border-emerald-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Users className="w-5 h-5 text-emerald-500" />
            좌석 관리
          </CardTitle>
          <CardDescription className="text-gray-600">
            웨비나 잔여 좌석 수를 설정합니다. 신청이 들어오면 자동으로 차감됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
            <Label className="text-sm font-medium text-gray-700 lg:w-24 lg:flex-shrink-0">
              잔여 좌석
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={remainingSeats}
                onChange={(e) => setRemainingSeats(Number(e.target.value))}
                min={0}
                className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300 w-32"
              />
              <span className="text-sm text-gray-500">석</span>
            </div>
          </div>

          {isLowSeats && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 text-sm">
                잔여 좌석이 5석 이하입니다! "마감임박" 배지가 표시됩니다.
              </AlertDescription>
            </Alert>
          )}

          {remainingSeats === 0 && (
            <Alert className="bg-gray-100 border-gray-300">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700 text-sm">
                좌석이 모두 마감되었습니다. 신청 버튼이 "마감"으로 표시됩니다.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button variant="gold" onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          저장하기
        </Button>
      </div>
    </div>
  );
});

WebinarSection.displayName = 'WebinarSection';
