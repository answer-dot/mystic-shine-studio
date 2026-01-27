import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  BookOpen,
  Star,
  Eye,
  EyeOff,
  GripVertical,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  price: string;
  original_price: string | null;
  duration: string;
  is_featured: boolean;
  is_published: boolean;
  curriculum: unknown[];
  features: string[];
  order_index: number;
}

export const CoursesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    image_url: '',
    price: '₩0',
    original_price: '',
    duration: '1주',
    is_featured: false,
    is_published: false,
    features: [] as string[],
  });
  const [newFeature, setNewFeature] = useState('');

  // Fetch all courses (including unpublished for admin)
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin_courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('courses')
        .insert({
          ...data,
          features: data.features,
          curriculum: [],
          order_index: (courses?.length || 0),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
      toast({ title: '강의가 추가되었습니다' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: '오류 발생', description: String(error), variant: 'destructive' });
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
      toast({ title: '강의가 수정되었습니다' });
      resetForm();
      setEditingCourse(null);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: '오류 발생', description: String(error), variant: 'destructive' });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
      toast({ title: '강의가 삭제되었습니다' });
    },
    onError: (error) => {
      toast({ title: '삭제 실패', description: String(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      image_url: '',
      price: '₩0',
      original_price: '',
      duration: '1주',
      is_featured: false,
      is_published: false,
      features: [],
    });
    setNewFeature('');
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      short_description: course.short_description || '',
      image_url: course.image_url || '',
      price: course.price,
      original_price: course.original_price || '',
      duration: course.duration,
      is_featured: course.is_featured,
      is_published: course.is_published,
      features: course.features || [],
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      toast({ title: '제목과 슬러그는 필수입니다', variant: 'destructive' });
      return;
    }

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const togglePublished = async (course: Course) => {
    updateMutation.mutate({ 
      id: course.id, 
      data: { is_published: !course.is_published } 
    });
  };

  const toggleFeatured = async (course: Course) => {
    updateMutation.mutate({ 
      id: course.id, 
      data: { is_featured: !course.is_featured } 
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">강의 관리</h1>
          <p className="text-sm lg:text-base text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">강의 관리</h1>
          <p className="text-sm lg:text-base text-gray-600">
            ⭐ '메인 강의'로 설정된 코스가 홈페이지에 표시됩니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              onClick={openCreateDialog}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 강의 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{editingCourse ? '강의 수정' : '새 강의 추가'}</DialogTitle>
              <DialogDescription className="text-gray-600">
                강의 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">강의 제목 *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="타로 마스터 과정"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">슬러그 (URL) *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="tarot-master"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">짧은 설명</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="타로의 신비로운 세계에 입문하세요"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">상세 설명</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="강의에 대한 자세한 설명..."
                  rows={3}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">이미지 URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">가격</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="₩490,000"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">원래 가격</Label>
                  <Input
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="₩890,000"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">기간</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="14주"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">포함 항목</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="예: 평생 무제한 영상 시청"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                  <Button type="button" variant="outline" onClick={addFeature} className="border-gray-300 text-gray-700">
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-700">
                      {feature}
                      <button onClick={() => removeFeature(index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <Label className="text-gray-700">공개</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label className="text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4 text-orange-500" />
                      메인 강의
                    </Label>
                  </div>
                </div>
                {formData.is_featured && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                    ⭐ 이 강의가 홈페이지 메인에 표시됩니다
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              {editingCourse ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                      deleteMutation.mutate(editingCourse.id);
                      setIsDialogOpen(false);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingCourse ? '수정' : '추가'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {courses && courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-3 lg:gap-4">
                  {/* Course Image */}
                  <div className="w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Course Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">{course.title}</h3>
                    {/* Show status indicators as small text on mobile */}
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className={course.is_published ? 'text-green-600' : 'text-gray-400'}>
                        {course.is_published ? '공개' : '비공개'}
                      </span>
                      {course.is_featured && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600 flex items-center gap-0.5">
                            <Star className="w-3 h-3" />
                            메인 강의
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit Button Only */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(course)}
                    className="flex-shrink-0 h-9 w-9 lg:h-10 lg:w-10 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                  >
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>등록된 강의가 없습니다</p>
            <p className="text-sm">위의 "새 강의 추가" 버튼을 클릭해 시작하세요</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
