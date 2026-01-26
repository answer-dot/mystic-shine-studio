import { MessageSquare, Plus, Trash2, Save, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TestimonialItem } from '@/lib/store';

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof TestimonialItem, value: string | number) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}

export const TestimonialsSection = ({
  testimonials,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
}: TestimonialsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">수강생 후기</h1>
          <p className="text-gray-600">수강생 후기 및 평점을 관리합니다</p>
        </div>
        <Button variant="outline" onClick={onAdd} className="border-orange-300 text-orange-600 hover:bg-orange-50">
          <Plus className="w-4 h-4 mr-2" />
          후기 추가
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 후기가 없습니다</p>
            <p className="text-sm">위의 "후기 추가" 버튼을 클릭해 시작하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testimonials.map((item) => (
            <Card key={item.id} className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-orange-600 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    수강생 후기
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">이름</label>
                    <Input
                      value={item.name}
                      onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                      placeholder="수강생 이름"
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">직업/수강기간</label>
                    <Input
                      value={item.role}
                      onChange={(e) => onUpdate(item.id, 'role', e.target.value)}
                      placeholder="예: 직장인 / 수강 6개월"
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      평점 (1-5)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.rating}
                        onChange={(e) => onUpdate(item.id, 'rating', Math.min(5, Math.max(1, Number(e.target.value))))}
                        min={1}
                        max={5}
                        className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 w-20"
                      />
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < item.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-gray-500">후기 내용</label>
                    <Textarea
                      value={item.content}
                      onChange={(e) => onUpdate(item.id, 'content', e.target.value)}
                      placeholder="수강생 후기 내용을 입력하세요"
                      rows={3}
                      className="bg-white border-gray-300 text-gray-900 resize-none focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="gold" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            저장하기
          </Button>
        </div>
      )}
    </div>
  );
};
