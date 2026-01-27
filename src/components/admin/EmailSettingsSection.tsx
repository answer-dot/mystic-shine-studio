import { useState, useEffect } from 'react';
import { Mail, Save, ExternalLink, Info, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EmailSettingsSection = () => {
  const { toast } = useToast();
  const [resendApiKey, setResendApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load API key from database
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'resendApiKey')
          .maybeSingle();

        if (!error && data) {
          setResendApiKey((data.value as string) || '');
        }
      } catch (error) {
        console.error('Failed to load API key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: 'resendApiKey', value: resendApiKey },
          { onConflict: 'key' }
        );

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "이메일 설정이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast({
        title: "저장 실패",
        description: "API 키 저장에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = resendApiKey.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">이메일 설정</h1>
        <p className="text-sm lg:text-base text-gray-600">
          문의 답변 시 고객에게 자동 이메일 알림을 보내려면 Resend API를 설정하세요
        </p>
      </div>

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
            {isConfigured && (
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
                  disabled={isLoading}
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
            <Button variant="gold" onClick={handleSave} disabled={isSaving || isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Info */}
      {!isConfigured && (
        <Alert className="bg-gray-50 border-gray-200">
          <Info className="h-4 w-4 text-gray-500" />
          <AlertDescription className="text-gray-600">
            현재 이메일 알림이 비활성화되어 있습니다. 
            위 가이드를 따라 Resend API 키를 설정하면 문의 답변 시 고객에게 자동으로 알림이 발송됩니다.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
