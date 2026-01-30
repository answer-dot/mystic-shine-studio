import { forwardRef, useState, useEffect } from 'react';
import { Shield, Save, UserPlus, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecuritySectionProps {
  newPin: string;
  setNewPin: (value: string) => void;
  confirmPin: string;
  setConfirmPin: (value: string) => void;
  onChangePin: () => void;
}

export const SecuritySection = forwardRef<HTMLDivElement, SecuritySectionProps>(({
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  onChangePin,
}, ref) => {
  const [signupDisabled, setSignupDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSignupSetting();
  }, []);

  const fetchSignupSetting = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'signupDisabled')
        .maybeSingle();

      setSignupDisabled(data?.value === true || data?.value === 'true');
    } catch (error) {
      console.error('Error fetching signup setting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSignup = async (disabled: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'signupDisabled', 
          value: disabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      setSignupDisabled(disabled);
      toast.success(disabled ? '회원가입이 비활성화되었습니다' : '회원가입이 활성화되었습니다');
    } catch (error) {
      console.error('Error updating signup setting:', error);
      toast.error('설정 변경에 실패했습니다');
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">보안</h1>
        <p className="text-sm lg:text-base text-gray-600">관리자 접근 보안을 관리합니다</p>
      </div>

      {/* Signup Control Card */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <UserPlus className="w-5 h-5 text-blue-500" />
            회원가입 제어
          </CardTitle>
          <CardDescription className="text-gray-600">외부 사용자의 회원가입을 허용하거나 차단합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="space-y-1">
              <Label htmlFor="signup-toggle" className="text-sm font-medium text-gray-900">
                회원가입 {signupDisabled ? '비활성화됨' : '활성화됨'}
              </Label>
              <p className="text-xs text-gray-500">
                {signupDisabled 
                  ? '새로운 사용자가 가입할 수 없습니다' 
                  : '누구나 /auth 페이지에서 가입할 수 있습니다'}
              </p>
            </div>
            <Switch
              id="signup-toggle"
              checked={!signupDisabled}
              onCheckedChange={(checked) => handleToggleSignup(!checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {!signupDisabled && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                회원가입이 열려 있으면 누구나 계정을 만들 수 있습니다. 
                관리자 설정이 완료되면 비활성화를 권장합니다.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* PIN Change Card - 임시 비활성화 */}
      <Card className="bg-white border-gray-200 shadow-sm opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Shield className="w-5 h-5 text-orange-500" />
            PIN 변경
          </CardTitle>
          <CardDescription className="text-gray-600">관리자 로그인 PIN을 변경합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">새 PIN</label>
              <Input
                type="password"
                value=""
                disabled
                placeholder="새 PIN 입력"
                className="bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">최소 4자리 이상 입력해주세요</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">PIN 확인</label>
              <Input
                type="password"
                value=""
                disabled
                placeholder="PIN 다시 입력"
                className="bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
              />
            </div>
            <Button 
              variant="gold" 
              onClick={() => toast.info('관리자 요청으로 변경 가능합니다')}
              className="opacity-70"
            >
              <Shield className="w-4 h-4 mr-2" />
              PIN 변경
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SecuritySection.displayName = 'SecuritySection';
