import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  BookOpen,
  Star,
  X,
  FileText,
  Video,
  GripVertical
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

interface CurriculumLesson {
  id: string;
  title: string;
  videoUrl?: string;
  duration?: string;
  isPreview?: boolean;
}

interface CurriculumChapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: CurriculumLesson[];
}

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
  curriculum: CurriculumChapter[];
  features: string[];
  order_index: number;
}

export const CoursesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
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
    curriculum: [] as CurriculumChapter[],
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
      return (data || []).map(course => ({
        ...course,
        curriculum: (course.curriculum as unknown as CurriculumChapter[]) || [],
        features: (course.features as unknown as string[]) || [],
      })) as Course[];
    },
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: data.title,
          slug: data.slug,
          description: data.description,
          short_description: data.short_description,
          image_url: data.image_url,
          price: data.price,
          original_price: data.original_price,
          duration: data.duration,
          is_featured: data.is_featured,
          is_published: data.is_published,
          features: data.features as unknown as any,
          curriculum: data.curriculum as unknown as any,
          order_index: (courses?.length || 0),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
      queryClient.invalidateQueries({ queryKey: ['primary_course'] });
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
      const updateData: Record<string, any> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.short_description !== undefined) updateData.short_description = data.short_description;
      if (data.image_url !== undefined) updateData.image_url = data.image_url;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.original_price !== undefined) updateData.original_price = data.original_price;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
      if (data.is_published !== undefined) updateData.is_published = data.is_published;
      if (data.features !== undefined) updateData.features = data.features;
      if (data.curriculum !== undefined) updateData.curriculum = data.curriculum;
      
      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
      queryClient.invalidateQueries({ queryKey: ['primary_course'] });
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
      queryClient.invalidateQueries({ queryKey: ['primary_course'] });
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
      curriculum: [],
    });
    setNewFeature('');
    setActiveTab('general');
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
      curriculum: course.curriculum || [],
    });
    setActiveTab('general');
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

  // Curriculum management functions
  const addChapter = () => {
    const newChapter: CurriculumChapter = {
      id: Date.now().toString(),
      title: '',
      description: '',
      duration: '',
      lessons: [],
    };
    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, newChapter],
    }));
  };

  const updateChapter = (chapterId: string, field: keyof CurriculumChapter, value: string) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(ch =>
        ch.id === chapterId ? { ...ch, [field]: value } : ch
      ),
    }));
  };

  const deleteChapter = (chapterId: string) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter(ch => ch.id !== chapterId),
    }));
  };

  const addLesson = (chapterId: string) => {
    const newLesson: CurriculumLesson = {
      id: Date.now().toString(),
      title: '',
      videoUrl: '',
      duration: '',
      isPreview: false,
    };
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(ch =>
        ch.id === chapterId
          ? { ...ch, lessons: [...ch.lessons, newLesson] }
          : ch
      ),
    }));
  };

  const updateLesson = (chapterId: string, lessonId: string, field: keyof CurriculumLesson, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(ch =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map(l =>
                l.id === lessonId ? { ...l, [field]: value } : l
              ),
            }
          : ch
      ),
    }));
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map(ch =>
        ch.id === chapterId
          ? { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) }
          : ch
      ),
    }));
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
            강의 정보와 커리큘럼을 통합 관리합니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              onClick={openCreateDialog}
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 강의 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-xl">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-gray-900 text-xl font-bold">
                {editingCourse ? '강의 수정' : '새 강의 추가'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                일반 정보와 커리큘럼을 탭에서 관리하세요
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="general" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  일반 정보
                </TabsTrigger>
                <TabsTrigger 
                  value="curriculum"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  커리큘럼
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="mt-4 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">강의 제목 *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="타로 마스터 과정"
                      className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">슬러그 (URL) *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="tarot-master"
                      className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">짧은 설명</Label>
                  <Input
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="타로의 신비로운 세계에 입문하세요"
                    className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">상세 설명</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="강의에 대한 자세한 설명..."
                    rows={3}
                    className="bg-white border-gray-300 text-gray-900 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">이미지 URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">가격</Label>
                    <Input
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="₩490,000"
                      className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">원래 가격</Label>
                    <Input
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="₩890,000"
                      className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">기간</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="14주"
                      className="bg-white border-gray-300 text-gray-900 rounded-lg h-11"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">포함 항목</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="예: 평생 무제한 영상 시청"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="bg-white border-gray-300 text-gray-900 rounded-lg"
                    />
                    <Button type="button" variant="outline" onClick={addFeature} className="border-gray-300 text-gray-700 rounded-lg">
                      추가
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 py-1.5 px-3 text-sm rounded-lg"
                      >
                        {feature}
                        <button 
                          onClick={() => removeFeature(index)}
                          className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                          aria-label="항목 삭제"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Primary Course Toggle */}
                <div className={`p-4 rounded-xl border-2 transition-all ${formData.is_featured ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.is_featured ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <Label className="text-gray-900 font-semibold text-base">메인 강의</Label>
                        <p className="text-xs text-gray-500 mt-0.5">홈페이지에 표시될 대표 강의</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                  </div>
                  {formData.is_featured && (
                    <p className="text-sm text-emerald-700 mt-3">
                      이 강의가 홈페이지 메인에 표시됩니다
                    </p>
                  )}
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <div>
                    <Label className="text-gray-700 font-medium">공개 설정</Label>
                    <p className="text-xs text-gray-500">비공개 시 관리자만 볼 수 있습니다</p>
                  </div>
                </div>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">챕터와 레슨을 추가하여 커리큘럼을 구성하세요</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addChapter}
                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    챕터 추가
                  </Button>
                </div>

                {formData.curriculum.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>아직 커리큘럼이 없습니다</p>
                    <p className="text-sm mt-1">위의 "챕터 추가" 버튼을 클릭해 시작하세요</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {formData.curriculum.map((chapter, chapterIndex) => (
                      <div key={chapter.id} className="border border-gray-200 rounded-lg bg-white">
                        {/* Chapter Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                            <span className="text-sm font-semibold text-emerald-600">챕터 {chapterIndex + 1}</span>
                            <div className="flex-1" />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteChapter(chapter.id)}
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <Input
                              value={chapter.title}
                              onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                              placeholder="챕터 제목"
                              className="bg-white border-gray-200 text-sm h-9"
                            />
                            <Input
                              value={chapter.duration}
                              onChange={(e) => updateChapter(chapter.id, 'duration', e.target.value)}
                              placeholder="기간 (예: 2주)"
                              className="bg-white border-gray-200 text-sm h-9"
                            />
                          </div>
                          <Textarea
                            value={chapter.description}
                            onChange={(e) => updateChapter(chapter.id, 'description', e.target.value)}
                            placeholder="챕터 설명"
                            rows={2}
                            className="mt-3 bg-white border-gray-200 text-sm resize-none"
                          />
                        </div>

                        {/* Lessons */}
                        <div className="p-4 space-y-2">
                          {chapter.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                                placeholder={`레슨 ${lessonIndex + 1} 제목`}
                                className="flex-1 bg-white border-gray-200 text-sm h-8"
                              />
                              <Input
                                value={lesson.videoUrl || ''}
                                onChange={(e) => updateLesson(chapter.id, lesson.id, 'videoUrl', e.target.value)}
                                placeholder="영상 URL"
                                className="w-32 bg-white border-gray-200 text-sm h-8"
                              />
                              <div className="flex items-center gap-1.5">
                                <Switch
                                  checked={lesson.isPreview || false}
                                  onCheckedChange={(checked) => updateLesson(chapter.id, lesson.id, 'isPreview', checked)}
                                  className="scale-75"
                                />
                                <span className="text-xs text-gray-500 whitespace-nowrap">미리보기</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteLesson(chapter.id, lesson.id)}
                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addLesson(chapter.id)}
                            className="w-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-dashed border-gray-300 mt-2"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            레슨 추가
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Footer */}
            <div className="flex justify-between items-center pt-5 mt-4 border-t border-gray-200">
              {editingCourse ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                      deleteMutation.mutate(editingCourse.id);
                      setIsDialogOpen(false);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-10 w-10"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-5 rounded-lg font-medium h-10"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-lg font-medium h-10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCourse ? '저장' : '추가'}
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

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className={course.is_published ? 'text-emerald-600' : 'text-gray-400'}>
                        {course.is_published ? '공개' : '비공개'}
                      </span>
                      {course.is_featured && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <Star className="w-3 h-3" />
                            메인 강의
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{course.curriculum?.length || 0}개 챕터</span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(course)}
                    className="flex-shrink-0 h-9 w-9 lg:h-10 lg:w-10 border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
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
