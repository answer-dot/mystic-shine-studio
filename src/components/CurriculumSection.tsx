import { Clock, BookOpen, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSettings } from '@/hooks/useSettings';

export const CurriculumSection = () => {
  const { settings } = useSettings();

  return (
    <section id="curriculum" className="py-20 sm:py-28">
      <div className="section-container">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 커리큘럼
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">체계적인 단계별 학습</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            처음 시작하는 분도 전문 리더가 될 수 있도록 설계된 커리큘럼
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {settings.curriculum.map((item, index) => (
              <AccordionItem 
                key={item.id} 
                value={item.id}
                className="glass-card rounded-xl border-border overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <div className="pl-14 text-muted-foreground">
                    {item.description}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
