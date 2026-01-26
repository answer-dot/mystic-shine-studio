import { FileText, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CurriculumItem } from '@/lib/store';

interface CurriculumSectionProps {
  curriculum: CurriculumItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof CurriculumItem, value: string) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}

export const CurriculumSection = ({
  curriculum,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
}: CurriculumSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">커리큘럼</h1>
          <p className="text-sm lg:text-base text-gray-600">강의 챕터와 내용을 관리합니다</p>
        </div>
        <Button variant="outline" onClick={onAdd} className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          챕터 추가
        </Button>
      </div>

      {curriculum.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 커리큘럼이 없습니다</p>
            <p className="text-sm">위의 "챕터 추가" 버튼을 클릭해 시작하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {curriculum.map((item, index) => (
            <Card key={item.id} className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-orange-600">챕터 {index + 1}</CardTitle>
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
                    <label className="text-xs text-gray-500">제목</label>
                    <Input
                      value={item.title}
                      onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                      placeholder="챕터 제목"
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">기간</label>
                    <Input
                      value={item.duration}
                      onChange={(e) => onUpdate(item.id, 'duration', e.target.value)}
                      placeholder="예: 4주"
                      className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-gray-500">설명</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                      placeholder="챕터 설명"
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
