import { useState } from 'react';
import { Send, Mail, Phone, MessageSquare, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(100, "이름은 100자 이하로 입력해주세요"),
  email: z.string().trim().email("올바른 이메일 주소를 입력해주세요").max(255, "이메일은 255자 이하로 입력해주세요"),
  phone: z.string().trim().max(20, "전화번호는 20자 이하로 입력해주세요").optional(),
  message: z.string().trim().min(1, "문의 내용을 입력해주세요").max(1000, "문의 내용은 1000자 이하로 입력해주세요"),
});

export const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || null,
          message: result.data.message,
        });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 답변 드리겠습니다.",
      });
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="py-20 sm:py-28 bg-gradient-to-b from-black to-[#0D0D0D]">
        <div className="section-container px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">문의가 접수되었습니다!</h2>
            <p className="text-muted-foreground mb-8">
              빠른 시일 내에 이메일로 답변 드리겠습니다.<br />
              감사합니다.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitted(false)}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              새 문의하기
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 sm:py-28 bg-gradient-to-b from-black to-[#0D0D0D]">
      <div className="section-container px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            문의하기
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">궁금한 점이 있으신가요?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            강의나 수강 신청에 관해 궁금한 점이 있으시면 언제든지 문의해주세요.<br />
            빠르게 답변 드리겠습니다.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                이름 <span className="text-destructive">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="bg-[#1A1A1A] border-primary/30 focus:border-primary"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                이메일 <span className="text-destructive">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="bg-[#1A1A1A] border-primary/30 focus:border-primary"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                전화번호 <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="010-1234-5678"
                className="bg-[#1A1A1A] border-primary/30 focus:border-primary"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                문의 내용 <span className="text-destructive">*</span>
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="문의하실 내용을 자세히 적어주세요."
                rows={5}
                className="bg-[#1A1A1A] border-primary/30 focus:border-primary resize-none"
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
            </div>

            <Button 
              type="submit" 
              variant="gold" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  전송 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  문의하기
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};