import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { replacePlaceholders } from '@/lib/store';
import { useSpamProtection } from '@/hooks/useSpamProtection';
import { Loader2, CheckCircle, XCircle, PartyPopper, FileText, Shield } from 'lucide-react';

// Validation schema - only name, email, phone (NO password)
const registrationSchema = z.object({
  name: z.string().trim().min(2, '이름을 2자 이상 입력해주세요').max(50, '이름은 50자 이하여야 합니다'),
  email: z.string().trim().email('올바른 이메일을 입력해주세요').max(100, '이메일은 100자 이하여야 합니다'),
  phone: z.string().trim().min(10, '전화번호를 정확히 입력해주세요').max(20, '전화번호는 20자 이하여야 합니다'),
  agreedTerms: z.boolean().refine(val => val === true, { message: '필수 동의 항목입니다' }),
  agreedPrivacy: z.boolean().refine(val => val === true, { message: '필수 동의 항목입니다' }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface WebinarRegistrationFormProps {
  onSuccess?: () => void;
  isExpired: boolean;
}

export const WebinarRegistrationForm = ({ onSuccess, isExpired }: WebinarRegistrationFormProps) => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const { validateSubmission, recordSubmission } = useSpamProtection();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // Prevent duplicate submissions
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  
  // 허니팟 필드 (봇 탐지용 - 사용자에게 보이지 않음)
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Apply placeholders to legal documents
  const termsContent = replacePlaceholders(
    settings.termsOfService || '이용약관 내용이 등록되지 않았습니다.',
    settings
  );
  const privacyContent = replacePlaceholders(
    settings.privacyPolicy || '개인정보처리방침 내용이 등록되지 않았습니다.',
    settings
  );

  // Check if registration is closed (seats = 0 OR time expired)
  const isClosed = settings.remainingSeats <= 0 || isExpired;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      agreedTerms: false,
      agreedPrivacy: false,
    },
  });

  const agreedTerms = watch('agreedTerms');
  const agreedPrivacy = watch('agreedPrivacy');

  // Handle closing success dialog - only then trigger parent callback
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Only call onSuccess AFTER user clicks 확인 button
    onSuccess?.();
  };

  const onSubmit = async (data: RegistrationFormData) => {
    // Prevent duplicate submissions
    if (isClosed || isSubmitting || isCompleted) {
      return;
    }

    // 스팸 방어 체크
    const honeypotValue = honeypotRef.current?.value || '';
    const spamCheck = validateSubmission(honeypotValue, data.email, data.phone);
    
    if (spamCheck.blocked) {
      // 허니팟에 걸린 경우 조용히 성공한 척
      if (spamCheck.reason === 'honeypot') {
        setIsCompleted(true);
        setShowSuccessDialog(true);
        return;
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for duplicate registration by email in webinar_registrations table
      const { data: existing, error: checkError } = await supabase
        .from('webinar_registrations')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error('Duplicate check error:', checkError);
      }

      if (existing) {
        toast({
          title: '이미 신청하셨습니다',
          description: '같은 이메일로 중복 신청은 불가합니다.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Parse webinar date for storage
      let webinarDate: string | null = null;
      if (settings.webinarDate) {
        webinarDate = new Date(settings.webinarDate).toISOString();
      }

      // Submit to dedicated webinar_registrations table (NOT users table)
      const { error: insertError } = await supabase
        .from('webinar_registrations')
        .insert({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone.trim(),
          agreed_terms: data.agreedTerms,
          agreed_privacy: data.agreedPrivacy,
          webinar_date: webinarDate,
        });

      if (insertError) {
        console.error('Registration error:', insertError);
        
        // Check if it's a duplicate error
        if (insertError.code === '23505') {
          toast({
            title: '이미 신청하셨습니다',
            description: '같은 이메일로 중복 신청은 불가합니다.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: '신청 실패',
            description: '잠시 후 다시 시도해주세요.',
            variant: 'destructive',
          });
        }
        setIsSubmitting(false);
        return;
      }

      // Decrement remaining seats
      const newSeats = Math.max(0, settings.remainingSeats - 1);
      await updateSettings({ remainingSeats: newSeats });

      // 스팸 방어: 제출 성공 기록
      recordSubmission(data.email, data.phone);
      
      reset();
      
      // Mark as completed to prevent duplicate submissions
      setIsCompleted(true);
      
      // Show success dialog popup - DO NOT call onSuccess here!
      // onSuccess will be called when user clicks 확인 button
      setShowSuccessDialog(true);
      
      // Keep isSubmitting true to prevent button re-enabling
      // It will stay disabled because isCompleted is now true

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: '오류 발생',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  // Closed state (seats = 0 or time expired)
  if (isClosed) {
    return (
      <div className="text-center py-6">
        <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h4 className="text-lg font-bold text-foreground mb-2">마감되었습니다</h4>
        <p className="text-sm text-muted-foreground">
          {isExpired 
            ? '웨비나가 시작되어 신청이 종료되었습니다.' 
            : '모든 좌석이 마감되었습니다.'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          다음 웨비나 일정은 곧 공지됩니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* 허니팟 필드 - 봇 탐지용 (사용자에게 완전히 숨김) */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
          <input
            ref={honeypotRef}
            type="text"
            name="website_url"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-white">
            이름 <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            placeholder="홍길동"
            {...register('name')}
            disabled={isSubmitting}
            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-white">
            이메일 <span className="text-red-400">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            {...register('email')}
            disabled={isSubmitting}
            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-white">
            전화번호 <span className="text-red-400">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="010-1234-5678"
            {...register('phone')}
            disabled={isSubmitting}
            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
          />
          {errors.phone && (
            <p className="text-xs text-red-400">{errors.phone.message}</p>
          )}
        </div>

        {/* Terms & Privacy Checkboxes with View Buttons */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreedTerms"
              checked={agreedTerms}
              onCheckedChange={(checked) => setValue('agreedTerms', checked === true)}
              disabled={isSubmitting}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1 flex items-center justify-between gap-2">
              <label htmlFor="agreedTerms" className="text-xs text-gray-300 cursor-pointer leading-relaxed">
                (필수) 만 14세 이상이며 이용약관에 동의합니다
              </label>
              <button
                type="button"
                onClick={() => setShowTermsDialog(true)}
                className="text-xs text-primary underline hover:text-primary/80 whitespace-nowrap flex-shrink-0"
              >
                [약관 보기]
              </button>
            </div>
          </div>
          {errors.agreedTerms && (
            <p className="text-xs text-red-400 ml-7">{errors.agreedTerms.message}</p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="agreedPrivacy"
              checked={agreedPrivacy}
              onCheckedChange={(checked) => setValue('agreedPrivacy', checked === true)}
              disabled={isSubmitting}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1 flex items-center justify-between gap-2">
              <label htmlFor="agreedPrivacy" className="text-xs text-gray-300 cursor-pointer leading-relaxed">
                (필수) 개인정보 처리방침에 동의합니다
              </label>
              <button
                type="button"
                onClick={() => setShowPrivacyDialog(true)}
                className="text-xs text-primary underline hover:text-primary/80 whitespace-nowrap flex-shrink-0"
              >
                [보기]
              </button>
            </div>
          </div>
          {errors.agreedPrivacy && (
            <p className="text-xs text-red-400 ml-7">{errors.agreedPrivacy.message}</p>
          )}
        </div>

        {/* Submit Button - Disabled if submitting OR already completed */}
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full h-14 text-base font-bold mt-4"
          disabled={isSubmitting || isCompleted}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              처리 중...
            </>
          ) : isCompleted ? (
            <>✓ 신청 완료</>
          ) : (
            <>🔮 무료 웨비나 신청하기</>
          )}
        </Button>
      </form>

      {/* Success Confirmation Popup - Only closes when user clicks 확인 */}
      <Dialog 
        open={showSuccessDialog} 
        onOpenChange={(open) => {
          // Only allow closing via the 확인 button, not by clicking outside or pressing Escape
          if (!open) {
            handleCloseSuccessDialog();
          }
        }}
      >
        <DialogContent 
          className="w-[calc(100vw-32px)] max-w-[400px] p-0 border-0 overflow-hidden"
          style={{ background: '#ffffff' }}
          onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing by clicking outside
          onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing by Escape key
        >
          {/* Success Content - No close X button, only 확인 button */}
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              신청이 완료되었습니다! 🎉
            </h2>
            
            {/* Description */}
            <div className="space-y-3 mb-8">
              <p className="text-gray-600 text-base">
                웨비나 시작 전 입력하신 연락처로<br />
                <strong className="text-gray-900">안내 문자</strong>를 보내드립니다.
              </p>
              <p className="text-sm text-gray-500">
                문자 수신을 위해 연락처를 확인해주세요.
              </p>
            </div>
            
            {/* Confirm Button - This is the ONLY way to close the popup */}
            <Button 
              onClick={handleCloseSuccessDialog}
              className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog - Same as Footer */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent 
          className="bg-white w-[90vw] max-w-2xl p-0 z-[60] !overflow-visible" 
          aria-describedby="webinar-terms-description"
          style={{ maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100 pt-8">
            <DialogTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              이용약관
            </DialogTitle>
          </DialogHeader>
          <div 
            id="webinar-terms-description" 
            className="p-4 sm:p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 200px)', minHeight: 0 }}
          >
            {termsContent}
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog - Same as Footer */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent 
          className="bg-white w-[90vw] max-w-2xl p-0 z-[60] !overflow-visible" 
          aria-describedby="webinar-privacy-description"
          style={{ maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100 pt-8">
            <DialogTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              개인정보처리방침
            </DialogTitle>
          </DialogHeader>
          <div 
            id="webinar-privacy-description" 
            className="p-4 sm:p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 200px)', minHeight: 0 }}
          >
            {privacyContent}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};