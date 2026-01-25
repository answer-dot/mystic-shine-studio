import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "박지현",
    role: "직장인 / 수강 6개월",
    content: "이 강의를 듣고 제 삶이 정말 많이 바뀌었어요. 타로를 통해 저 자신을 더 깊이 이해하게 되었고, 지금은 부업으로 리딩도 하고 있어요. 정말 감사합니다!",
    rating: 5,
  },
  {
    name: "김민수",
    role: "프리랜서 / 수강 1년",
    content: "체계적인 커리큘럼과 이하늘 교수님의 따뜻한 피드백 덕분에 전문 리더로 성장할 수 있었습니다. 월 수입이 300만원을 넘었어요!",
    rating: 5,
  },
  {
    name: "이서연",
    role: "주부 / 수강 3개월",
    content: "처음에는 반신반의했는데, 지금은 친구들에게 리딩해주는 게 제 취미가 됐어요. 이렇게 쉽게 배울 수 있을 줄 몰랐습니다.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 수강생 후기
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">수강생들의 생생한 이야기</h2>
          <p className="text-muted-foreground">이미 수천 명이 변화를 경험했습니다</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
