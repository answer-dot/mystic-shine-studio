import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: "타로를 처음 접하는 초보자도 수강할 수 있나요?",
    answer: "네, 물론입니다! 본 강의는 완전 초보자를 위해 설계되었습니다. 타로에 대한 사전 지식이 없어도 체계적인 커리큘럼을 통해 전문 리더로 성장할 수 있습니다."
  },
  {
    question: "강의 수강 기간은 얼마나 되나요?",
    answer: "전체 과정은 14주로 구성되어 있습니다. 하지만 강의 영상은 평생 무제한으로 시청 가능하며, 본인의 페이스에 맞춰 학습하실 수 있습니다."
  },
  {
    question: "환불 정책은 어떻게 되나요?",
    answer: "수강 시작 후 7일 이내에는 100% 환불이 가능합니다. 8일 이후에는 수강 진행률에 따라 부분 환불이 적용됩니다. 자세한 내용은 이용약관을 확인해주세요."
  },
  {
    question: "질문이 있을 때 어떻게 하나요?",
    answer: "수강생 전용 커뮤니티를 통해 언제든지 질문하실 수 있습니다. 이하늘 교수가 직접 답변해드리며, 주 2회 라이브 Q&A 세션도 진행됩니다."
  },
  {
    question: "수료 후 자격증이나 인증서를 받을 수 있나요?",
    answer: "전 과정을 이수하시면 Mystic Tarot Academy 공인 수료증을 발급해드립니다. 이는 전문 리더로서의 자격을 증명하는 데 활용하실 수 있습니다."
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">궁금한 점이 있으신가요?</h2>
          <p className="text-muted-foreground">자주 묻는 질문들을 정리했습니다</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="glass-card rounded-xl border-border overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 transition-colors text-left">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <p className="pl-9 text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">더 궁금한 점이 있으신가요?</p>
            <Button variant="outline">📩 1:1 문의하기</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
