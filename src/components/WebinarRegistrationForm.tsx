import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, CheckCircle, XCircle, PartyPopper } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

  const onSubmit = async (data: RegistrationFormData) => {
    if (isClosed) {
      toast({
        title: '신청이 마감되었습니다',
        description: '다음 웨비나 일정을 확인해주세요.',
        variant: 'destructive',
      });
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

      reset();
      
      // Show success dialog popup instead of toast
      setShowSuccessDialog(true);

      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: '오류 발생',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
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

        {/* Terms & Privacy Checkboxes */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreedTerms"
              checked={agreedTerms}
              onCheckedChange={(checked) => setValue('agreedTerms', checked === true)}
              disabled={isSubmitting}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="agreedTerms" className="text-xs text-gray-300 cursor-pointer leading-relaxed">
              (필수) 만 14세 이상이며 <span className="underline text-primary">이용약관</span>에 동의합니다
            </label>
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
            <label htmlFor="agreedPrivacy" className="text-xs text-gray-300 cursor-pointer leading-relaxed">
              (필수) <span className="underline text-primary">개인정보 처리방침</span>에 동의합니다
            </label>
          </div>
          {errors.agreedPrivacy && (
            <p className="text-xs text-red-400 ml-7">{errors.agreedPrivacy.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full h-14 text-base font-bold mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              신청 중...
            </>
          ) : (
            <>🔮 무료 웨비나 신청하기</>
          )}
        </Button>
      </form>

      {/* Success Confirmation Popup */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-center text-gray-900">
              신청이 완료되었습니다! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-gray-600">
              웨비나 시작 전 입력하신 연락처로<br />
              <strong className="text-gray-900">안내 문자</strong>를 보내드립니다.
            </p>
            <p className="text-sm text-gray-500">
              문자 수신을 위해 연락처를 확인해주세요.
            </p>
          </div>
          <Button 
            onClick={() => setShowSuccessDialog(false)} 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};