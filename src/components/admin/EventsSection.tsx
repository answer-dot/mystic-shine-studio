import { Calendar, Plus, Trash2, Save, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EventItem } from '@/lib/store';

interface EventsSectionProps {
  events: EventItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof EventItem, value: string | number) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}

export const EventsSection = ({
  events,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
}: EventsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">이벤트</h1>
          <p className="text-sm lg:text-base text-gray-600">특별 이벤트 및 웨비나를 관리합니다</p>
        </div>
        <Button variant="outline" onClick={onAdd} className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          이벤트 추가
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 이벤트가 없습니다</p>
            <p className="text-sm">위의 "이벤트 추가" 버튼을 클릭해 시작하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((item) => (
            <Card key={item.id} className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-orange-600">이벤트</CardTitle>
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
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-gray-500">이벤트 제목</label>
                    <Input
                      value={item.title}
                      onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                      placeholder="이벤트 제목"
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  
                  {/* Image URL Field */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      이벤트 이미지 URL
                    </label>
                    <Input
                      value={item.imageUrl || ''}
                      onChange={(e) => onUpdate(item.id, 'imageUrl', e.target.value)}
                      placeholder="https://example.com/event-image.jpg"
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                    {item.imageUrl && (
                      <div className="mt-2 relative w-full max-w-xs aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={item.imageUrl} 
                          alt="Event preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=200&fit=crop&q=80';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">날짜</label>
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">상태</label>
                    <select
                      value={item.status}
                      onChange={(e) => onUpdate(item.id, 'status', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <option value="ongoing">진행중</option>
                      <option value="upcoming">예정</option>
                      <option value="ended">종료</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">잔여 좌석</label>
                    <Input
                      type="number"
                      value={item.spots}
                      onChange={(e) => onUpdate(item.id, 'spots', Number(e.target.value))}
                      placeholder="잔여 좌석"
                      min={0}
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-gray-500">설명</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                      placeholder="이벤트 설명"
                      rows={2}
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
