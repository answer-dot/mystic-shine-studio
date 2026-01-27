import { Settings, Save, FileText, Shield, RefreshCcw, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LegalSettingsSectionProps {
  termsOfService: string;
  setTermsOfService: (value: string) => void;
  privacyPolicy: string;
  setPrivacyPolicy: (value: string) => void;
  refundPolicy: string;
  setRefundPolicy: (value: string) => void;
  onSave: () => void;
}

export const LegalSettingsSection = ({
  termsOfService,
  setTermsOfService,
  privacyPolicy,
  setPrivacyPolicy,
  refundPolicy,
  setRefundPolicy,
  onSave,
}: LegalSettingsSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">약관 관리</h1>
        <p className="text-sm lg:text-base text-gray-600">이용약관, 개인정보처리방침, 환불정책을 관리합니다</p>
      </div>

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
            <Settings className="w-5 h-5 text-gray-500" />
            법적 문서 관리
          </CardTitle>
          <CardDescription className="text-gray-600">
            회원가입 시 표시되는 약관과 푸터에 링크되는 문서를 편집합니다. 전자상거래법에 따른 필수 조항이 포함되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="terms" className="w-full">
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
                  rows={20}
                  className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  회원가입 시 사용자에게 표시됩니다. 전자상거래법 필수 조항이 포함된 기본 템플릿입니다.
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
                  rows={20}
                  className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  회원가입 시 사용자에게 표시됩니다. 개인정보보호법 필수 조항이 포함된 기본 템플릿입니다.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="refund" className="mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">환불정책 내용</label>
                <Textarea
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value)}
                  placeholder="환불정책 내용을 입력하세요..."
                  rows={20}
                  className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  푸터에서 확인할 수 있습니다. 전자상거래법에 따른 청약철회 규정이 포함된 기본 템플릿입니다.
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
