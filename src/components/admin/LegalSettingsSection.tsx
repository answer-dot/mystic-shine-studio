import { Settings, Save, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LegalSettingsSectionProps {
  termsOfService: string;
  setTermsOfService: (value: string) => void;
  privacyPolicy: string;
  setPrivacyPolicy: (value: string) => void;
  onSave: () => void;
}

export const LegalSettingsSection = ({
  termsOfService,
  setTermsOfService,
  privacyPolicy,
  setPrivacyPolicy,
  onSave,
}: LegalSettingsSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">약관 관리</h1>
        <p className="text-sm lg:text-base text-gray-600">이용약관 및 개인정보처리방침을 관리합니다</p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Settings className="w-5 h-5 text-gray-500" />
            법적 문서 관리
          </CardTitle>
          <CardDescription className="text-gray-600">
            회원가입 시 표시되는 약관과 푸터에 링크되는 문서를 편집합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger 
                value="terms" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900"
              >
                <FileText className="w-4 h-4" />
                이용약관
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900"
              >
                <Shield className="w-4 h-4" />
                개인정보처리방침
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이용약관 내용</label>
                <Textarea
                  value={termsOfService}
                  onChange={(e) => setTermsOfService(e.target.value)}
                  placeholder="이용약관 내용을 입력하세요..."
                  rows={15}
                  className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  회원가입 시 사용자에게 표시됩니다. 줄바꿈은 그대로 유지됩니다.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">개인정보처리방침 내용</label>
                <Textarea
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  placeholder="개인정보처리방침 내용을 입력하세요..."
                  rows={15}
                  className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  회원가입 시 사용자에게 표시됩니다. 줄바꿈은 그대로 유지됩니다.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-2 flex justify-end">
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