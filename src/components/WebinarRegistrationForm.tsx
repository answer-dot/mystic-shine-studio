import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Validation schema
const registrationSchema = z.object({
  name: z.string().trim().min(2, '이름을 2자 이상 입력해주세요').max(50, '이름은 50자 이하여야 합니다'),
  email: z.string().trim().email('올바른 이메일을 입력해주세요').max(100, '이메일은 100자 이하여야 합니다'),
  phone: z.string().trim().min(10, '전화번호를 정확히 입력해주세요').max(20, '전화번호는 20자 이하여야 합니다'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface WebinarRegistrationFormProps {
  onSuccess?: () => void;
  isExpired: boolean;  // 타이머가 0이 됨
}

export const WebinarRegistrationForm = ({ onSuccess, isExpired }: WebinarRegistrationFormProps) => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Check if registration is closed (seats = 0 OR time expired)
  const isClosed = settings.remainingSeats <= 0 || isExpired;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    // Double-check closure status
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
      // Check for duplicate registration by email
      const { data: existing, error: checkError } = await supabase
        .from('inquiries')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .ilike('message', '[웨비나 신청]%')
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

      // Submit registration as inquiry with [웨비나 신청] prefix
      const { error: insertError } = await supabase
        .from('inquiries')
        .insert({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone.trim(),
          message: `[웨비나 신청] ${settings.siteName || 'Webinar'} - ${new Date().toLocaleDateString('ko-KR')}`,
          user_id: null, // Anonymous submission
        });

      if (insertError) {
        console.error('Registration error:', insertError);
        toast({
          title: '신청 실패',
          description: '잠시 후 다시 시도해주세요.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Decrement remaining seats
      const newSeats = Math.max(0, settings.remainingSeats - 1);
      await updateSettings({ remainingSeats: newSeats });

      setIsRegistered(true);
      reset();
      
      toast({
        title: '🎉 신청 완료!',
        description: '웨비나 시작 전 이메일로 안내드리겠습니다.',
      });

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

  // Already registered success state
  if (isRegistered) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-foreground mb-2">신청 완료!</h4>
        <p className="text-sm text-muted-foreground">
          웨비나 시작 전 입력하신 이메일로<br />안내 메일을 보내드립니다.
        </p>
      </div>
    );
  }

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="홍길동"
          {...register('name')}
          disabled={isSubmitting}
          className="bg-background border-border text-foreground"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          이메일 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          {...register('email')}
          disabled={isSubmitting}
          className="bg-background border-border text-foreground"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-foreground">
          전화번호 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="010-1234-5678"
          {...register('phone')}
          disabled={isSubmitting}
          className="bg-background border-border text-foreground"
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            신청 중...
          </>
        ) : (
          <>🔮 무료 웨비나 신청하기</>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        신청 시 개인정보 수집에 동의하는 것으로 간주됩니다.
      </p>
    </form>
  );
};
