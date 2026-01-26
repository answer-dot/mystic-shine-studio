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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">커리큘럼</h1>
          <p className="text-muted-foreground">강의 챕터와 내용을 관리합니다</p>
        </div>
        <Button variant="outline" onClick={onAdd} className="border-primary/30">
          <Plus className="w-4 h-4 mr-2" />
          챕터 추가
        </Button>
      </div>

      {curriculum.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 커리큘럼이 없습니다</p>
            <p className="text-sm">위의 "챕터 추가" 버튼을 클릭해 시작하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {curriculum.map((item, index) => (
            <Card key={item.id} className="border-border/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-primary">챕터 {index + 1}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">제목</label>
                    <Input
                      value={item.title}
                      onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                      placeholder="챕터 제목"
                      className="border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">기간</label>
                    <Input
                      value={item.duration}
                      onChange={(e) => onUpdate(item.id, 'duration', e.target.value)}
                      placeholder="예: 4주"
                      className="border-border/50"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">설명</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                      placeholder="챕터 설명"
                      rows={2}
                      className="border-border/50 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="gold" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      )}
    </div>
  );
};
