import { useState } from 'react';
import { Settings, Save, FileText, Shield, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { replacePlaceholders, SiteSettings } from '@/lib/store';

interface LegalSettingsSectionProps {
  termsOfService: string;
  setTermsOfService: (value: string) => void;
  privacyPolicy: string;
  setPrivacyPolicy: (value: string) => void;
  refundPolicy: string;
  setRefundPolicy: (value: string) => void;
  onSave: () => void;
  siteSettings: Partial<SiteSettings>;
}

export const LegalSettingsSection = ({
  termsOfService,
  setTermsOfService,
  privacyPolicy,
  setPrivacyPolicy,
  refundPolicy,
  setRefundPolicy,
  onSave,
  siteSettings,
}: LegalSettingsSectionProps) => {
  const [showPreview, setShowPreview] = useState(false);

  // 미리보기용 치환된 텍스트 생성
  const getPreviewText = (text: string) => {
    return replacePlaceholders(text, siteSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">약관 관리</h1>
          <p className="text-sm lg:text-base text-gray-600">이용약관, 개인정보처리방침, 환불정책을 관리합니다</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="self-start sm:self-auto"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              원본 보기
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              미리보기
            </>
          )}
        </Button>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Settings className="w-5 h-5 text-gray-500" />
            법적 문서 관리
          </CardTitle>
          <CardDescription className="text-gray-600">
            {showPreview 
              ? '사용자에게 표시될 최종 문서입니다. 플레이스홀더가 실제 값으로 치환됩니다.'
              : '회원가입 시 표시되는 약관과 푸터에 링크되는 문서를 편집합니다.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger 
                value="terms" 
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">이용약관</span>
                <span className="sm:hidden">약관</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">개인정보처리방침</span>
                <span className="sm:hidden">개인정보</span>
              </TabsTrigger>
              <TabsTrigger 
                value="refund" 
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">환불정책</span>
                <span className="sm:hidden">환불</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  이용약관 내용 {showPreview && <span className="text-primary">(미리보기)</span>}
                </label>
                {showPreview ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[400px] max-h-[500px] overflow-y-auto text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {getPreviewText(termsOfService)}
                  </div>
                ) : (
                  <Textarea
                    value={termsOfService}
                    onChange={(e) => setTermsOfService(e.target.value)}
                    placeholder="이용약관 내용을 입력하세요..."
                    rows={20}
                    className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                  />
                )}
                {!showPreview && (
                  <p className="text-xs text-gray-500">
                    회원가입 시 사용자에게 표시됩니다. {'{{SITE_NAME}}'}, {'{{CS_EMAIL}}'}, {'{{CS_PHONE}}'}, {'{{CS_ADDRESS}}'}가 자동 치환됩니다.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  개인정보처리방침 내용 {showPreview && <span className="text-primary">(미리보기)</span>}
                </label>
                {showPreview ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[400px] max-h-[500px] overflow-y-auto text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {getPreviewText(privacyPolicy)}
                  </div>
                ) : (
                  <Textarea
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    placeholder="개인정보처리방침 내용을 입력하세요..."
                    rows={20}
                    className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                  />
                )}
                {!showPreview && (
                  <p className="text-xs text-gray-500">
                    회원가입 시 사용자에게 표시됩니다. {'{{SITE_NAME}}'}, {'{{CS_EMAIL}}'}, {'{{CS_PHONE}}'}, {'{{CS_ADDRESS}}'}가 자동 치환됩니다.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="refund" className="mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  환불정책 내용 {showPreview && <span className="text-primary">(미리보기)</span>}
                </label>
                {showPreview ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[400px] max-h-[500px] overflow-y-auto text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {getPreviewText(refundPolicy)}
                  </div>
                ) : (
                  <Textarea
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    placeholder="환불정책 내용을 입력하세요..."
                    rows={20}
                    className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300 font-mono text-sm"
                  />
                )}
                {!showPreview && (
                  <p className="text-xs text-gray-500">
                    푸터에서 확인할 수 있습니다. {'{{SITE_NAME}}'}, {'{{CS_EMAIL}}'}, {'{{CS_PHONE}}'}, {'{{CS_ADDRESS}}'}가 자동 치환됩니다.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-2 flex justify-end">
            <Button 
              onClick={onSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
