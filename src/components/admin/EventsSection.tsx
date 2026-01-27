import { useRef } from 'react';
import { Calendar, Plus, Trash2, Save, Image, Clock, Users, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EventItem } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Handle image upload for each event
  const handleImageUpload = async (eventId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지는 5MB 이하로 업로드해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `event-${eventId}-${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If bucket doesn't exist, use base64 fallback
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpdate(eventId, 'imageUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      onUpdate(eventId, 'imageUrl', publicUrl);
      toast({
        title: "업로드 완료",
        description: "이벤트 이미지가 업로드되었습니다.",
      });
    } catch (error) {
      // Fallback to base64 for development
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(eventId, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (eventId: string) => {
    onUpdate(eventId, 'imageUrl', '');
    if (fileInputRefs.current[eventId]) {
      fileInputRefs.current[eventId]!.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">이벤트</h1>
          <p className="text-sm lg:text-base text-gray-600">특별 이벤트 및 웨비나를 관리합니다</p>
        </div>
        <Button variant="outline" onClick={onAdd} className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto">
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
                  <CardTitle className="text-base text-gray-900">이벤트</CardTitle>
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
                      className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                    />
                  </div>
                  
                  {/* Image Upload Field - Full Width Display */}
                  <div className="space-y-3 sm:col-span-2">
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      이벤트 이미지
                    </label>
                    
                    {/* Image Preview - Full Width */}
                    {item.imageUrl && (
                      <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img 
                          src={item.imageUrl} 
                          alt="Event preview" 
                          className="w-full h-auto object-contain max-h-[400px]"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=400&fit=crop&q=80';
                          }}
                        />
                        <button
                          onClick={() => handleRemoveImage(item.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(item.id, file);
                        }}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {item.imageUrl ? '이미지 변경' : '이미지 업로드'}
                      </Button>
                      <p className="text-xs text-gray-500 flex items-center">
                        권장: 가로형 이미지 (16:9), 최대 5MB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">날짜</label>
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                    />
                  </div>
                  
                  {/* Start Time for Countdown */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      시작 시간 (카운트다운용)
                    </label>
                    <Input
                      type="datetime-local"
                      value={item.startTime?.slice(0, 16) || ''}
                      onChange={(e) => onUpdate(item.id, 'startTime', e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">상태</label>
                    <select
                      value={item.status}
                      onChange={(e) => onUpdate(item.id, 'status', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                    >
                      <option value="ongoing">진행중</option>
                      <option value="upcoming">예정</option>
                      <option value="ended">종료</option>
                    </select>
                  </div>

                  {/* Total Capacity */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      총 정원 (Total Capacity)
                    </label>
                    <Input
                      type="number"
                      value={item.totalCapacity || 50}
                      onChange={(e) => onUpdate(item.id, 'totalCapacity', Number(e.target.value))}
                      placeholder="50"
                      min={1}
                      className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">잔여 좌석 (초기값)</label>
                    <Input
                      type="number"
                      value={item.spots}
                      onChange={(e) => onUpdate(item.id, 'spots', Number(e.target.value))}
                      placeholder="잔여 좌석"
                      min={0}
                      className="bg-white border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-slate-300"
                    />
                    <p className="text-xs text-gray-400">
                      실시간 잔여석은 신청 수에 따라 자동 계산됩니다
                    </p>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-gray-500">설명</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                      placeholder="이벤트 설명"
                      rows={2}
                      className="bg-white border-gray-300 text-gray-900 resize-none focus:border-gray-400 focus:ring-slate-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button variant="gold" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              저장하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
