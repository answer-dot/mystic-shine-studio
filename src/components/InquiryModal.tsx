import React, { useState, useRef } from 'react';
import { Send, User, Mail, MessageSquare, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useSettings } from '@/hooks/useSettings';
import { useSpamProtection } from '@/hooks/useSpamProtection';

const inquirySchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(100, "이름은 100자 이하로 입력해주세요"),
  email: z.string().trim().email("올바른 이메일 주소를 입력해주세요").max(255, "이메일은 255자 이하로 입력해주세요"),
  phone: z.string().trim().max(20, "전화번호는 20자 이하로 입력해주세요").optional(),
  subject: z.string().trim().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이하로 입력해주세요"),
  message: z.string().trim().min(1, "문의 내용을 입력해주세요").max(2000, "문의 내용은 2000자 이하로 입력해주세요"),
});

interface InquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject?: string; // 문의 유형 자동 설정용
}

export const InquiryModal = ({ open, onOpenChange, defaultSubject = '' }: InquiryModalProps) => {
  const { settings } = useSettings();
  const { validateSubmission, recordSubmission } = useSpamProtection();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: defaultSubject,
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 허니팟 필드 (봇 탐지용 - 사용자에게 보이지 않음)
  const honeypotRef = useRef<HTMLInputElement>(null);

  // defaultSubject가 변경되면 formData 업데이트
  React.useEffect(() => {
    if (defaultSubject) {
      setFormData(prev => ({ ...prev, subject: defaultSubject }));
    }
  }, [defaultSubject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // 스팸 방어 체크
    const honeypotValue = honeypotRef.current?.value || '';
    const spamCheck = validateSubmission(honeypotValue, result.data.email, result.data.phone);
    
    if (spamCheck.blocked) {
      // 허니팟에 걸린 경우 조용히 성공한 척
      if (spamCheck.reason === 'honeypot') {
        setIsSubmitted(true);
        return;
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine subject and message for storage
      const fullMessage = `[제목: ${result.data.subject}]\n\n${result.data.message}`;
      
      const { error } = await supabase
        .from('inquiries')
        .insert({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || null,
          message: fullMessage,
        });

      if (error) throw error;

      // 스팸 방어: 제출 성공 기록
      recordSubmission(result.data.email, result.data.phone);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast.error('문의 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[calc(100vw-32px)] max-w-[480px] p-0 border-0 overflow-hidden max-h-[90vh]"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16161d 100%)',
        }}
        onPointerDownOutside={(e) => {
          if (isSubmitted) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitted) e.preventDefault();
        }}
      >
        {/* Success State */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              문의가 접수되었습니다! ✨
            </h3>
            <p className="text-gray-300 mb-2">
              빠른 시일 내에 답변 드리겠습니다.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              답변은 입력하신 이메일로 발송됩니다.
            </p>
            {settings.csEmail && (
              <p className="text-xs text-gray-500 mb-6">
                급한 문의: <span className="text-primary">{settings.csEmail}</span>
              </p>
            )}
            <Button
              variant="gold"
              className="w-full py-6 text-lg font-bold"
              onClick={handleClose}
            >
              확인
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-center border-b border-white/10">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                1대1 문의하기
              </h2>
              <p className="text-sm text-gray-400">
                궁금한 점을 남겨주시면 빠르게 답변해 드립니다
              </p>
              {settings.csEmail && (
                <p className="text-xs text-gray-500 mt-2">
                  이메일: <span className="text-primary">{settings.csEmail}</span>
                </p>
              )}
            </div>

            <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 허니팟 필드 - 봇 탐지용 (사용자에게 완전히 숨김) */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                  <input
                    ref={honeypotRef}
                    type="text"
                    name="company_website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                
                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    이름 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    이메일 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    전화번호 <span className="text-gray-500 text-xs">(선택)</span>
                  </Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                    className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    제목 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="문의 제목을 입력해주세요"
                    className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                  />
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    문의 내용 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="문의하실 내용을 자세히 적어주세요"
                    rows={4}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-primary resize-none"
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="gold"
                  className="w-full py-6 text-lg font-bold mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      문의하기
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
