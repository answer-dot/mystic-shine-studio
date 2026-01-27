import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Lock, User, Sparkles, FileText, Shield, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { replacePlaceholders } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'signup');
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('로그인 성공!');
          navigate('/dashboard');
        }
      } else {
        if (!displayName.trim()) {
          toast.error('이름을 입력해주세요');
          setIsSubmitting(false);
          return;
        }
        if (!agreedAge) {
          toast.error('만 14세 이상임을 확인해주세요');
          setIsSubmitting(false);
          return;
        }
        if (!agreedTerms || !agreedPrivacy) {
          toast.error('이용약관과 개인정보처리방침에 동의해주세요');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('회원가입 성공! 로그인해주세요.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast.error('오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply placeholders to legal documents
  const termsContent = replacePlaceholders(
    settings.termsOfService || '이용약관 내용이 등록되지 않았습니다.',
    settings
  );
  const privacyContent = replacePlaceholders(
    settings.privacyPolicy || '개인정보처리방침 내용이 등록되지 않았습니다.',
    settings
  );

  const canSubmitSignup = agreedAge && agreedTerms && agreedPrivacy;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>돌아가기</span>
        </button>

        {/* Auth card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{settings.siteName || 'Mystic Tarot Academy'}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? '로그인' : '회원가입'}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin ? '계정에 로그인하세요' : '새 계정을 만들어보세요'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">이름</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="홍길동"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
            </div>

            {/* Agreement Checkboxes - Only for signup */}
            {!isLogin && (
              <div className="space-y-3 pt-2 border-t border-border/50 mt-4">
                <p className="text-xs text-muted-foreground pt-2">필수 동의 사항</p>
                
                {/* Age Verification - MANDATORY */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Checkbox
                    id="age"
                    checked={agreedAge}
                    onCheckedChange={(checked) => setAgreedAge(checked === true)}
                    className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="age" className="text-sm text-amber-900 cursor-pointer font-medium flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-destructive">*</span> 만 14세 이상입니다 (필수)
                    </label>
                    <p className="text-xs text-amber-700 mt-1">
                      만 14세 미만의 아동은 법정대리인의 동의가 필요합니다.
                    </p>
                  </div>
                </div>

                {/* Terms of Service */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedTerms}
                    onCheckedChange={(checked) => setAgreedTerms(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                      <span className="text-destructive">*</span>{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsDialog(true)}
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        이용약관
                      </button>
                      에 동의합니다
                    </label>
                  </div>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy"
                    checked={agreedPrivacy}
                    onCheckedChange={(checked) => setAgreedPrivacy(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="privacy" className="text-sm text-foreground cursor-pointer">
                      <span className="text-destructive">*</span>{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyDialog(true)}
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        개인정보처리방침
                      </button>
                      에 동의합니다
                    </label>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full mt-6"
              disabled={isSubmitting || (!isLogin && !canSubmitSignup)}
            >
              {isSubmitting ? '처리중...' : isLogin ? '로그인' : '회원가입'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium ml-1 hover:underline"
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="bg-white max-w-2xl max-h-[80vh]" aria-describedby="terms-description">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              이용약관
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div id="terms-description" className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {termsContent}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="bg-white max-w-2xl max-h-[80vh]" aria-describedby="privacy-description">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              개인정보처리방침
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div id="privacy-description" className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {privacyContent}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
