import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Plus,
  File,
  FileArchive,
  Download,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  id: string;
  title: string;
}

interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  courses?: { title: string };
}

export const MaterialsSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
  });

  // Fetch all courses
  const { data: courses } = useQuery({
    queryKey: ['admin_courses_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch all materials
  const { data: materials, isLoading } = useQuery({
    queryKey: ['admin_course_materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*, courses(title)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CourseMaterial[];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !formData.courseId || !formData.title) {
        throw new Error('필수 항목을 입력해주세요');
      }

      setIsUploading(true);

      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      const filename = `${formData.courseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filename, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filename);

      // Insert record
      const { error } = await supabase
        .from('course_materials')
        .insert({
          course_id: formData.courseId,
          title: formData.title,
          description: formData.description || null,
          file_url: publicUrl,
          file_type: ext,
          file_size: selectedFile.size,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_course_materials'] });
      toast({ title: '자료가 업로드되었습니다' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: '업로드 실패', description: String(error), variant: 'destructive' });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (material: CourseMaterial) => {
      // Extract path from URL
      if (material.file_url) {
        try {
          const url = new URL(material.file_url);
          const path = url.pathname.split('/course-materials/')[1];
          if (path) {
            await supabase.storage.from('course-materials').remove([decodeURIComponent(path)]);
          }
        } catch (e) {
          console.error('Failed to delete file from storage:', e);
        }
      }

      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', material.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_course_materials'] });
      toast({ title: '자료가 삭제되었습니다' });
    },
    onError: (error) => {
      toast({ title: '삭제 실패', description: String(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ courseId: '', title: '', description: '' });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        // Auto-fill title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (['zip', 'rar', '7z'].includes(type)) return <FileArchive className="w-5 h-5 text-yellow-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">자료실 관리</h1>
          <p className="text-sm lg:text-base text-gray-600">강의별 다운로드 자료를 관리합니다</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsDialogOpen(true)}
          className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          자료 업로드
        </Button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">자료 업로드</DialogTitle>
            <DialogDescription className="text-gray-600">
              수강생에게 제공할 PDF, ZIP 등의 파일을 업로드합니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700">강의 선택 *</Label>
              <Select 
                value={formData.courseId} 
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="강의를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">파일 *</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    {getFileIcon(selectedFile.name.split('.').pop() || '')}
                    <span className="text-gray-700 truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-gray-400 text-sm">({formatFileSize(selectedFile.size)})</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">클릭하여 파일 선택</p>
                    <p className="text-gray-400 text-xs mt-1">PDF, ZIP, DOC 등</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">자료 제목 *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 1주차 워크북"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">설명 (선택)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="자료에 대한 간단한 설명"
                rows={2}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => { resetForm(); setIsDialogOpen(false); }}
              className="border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            >
              취소
            </Button>
            <Button 
              onClick={() => uploadMutation.mutate()}
              disabled={isUploading || !selectedFile || !formData.courseId || !formData.title}
              className="bg-gradient-to-r from-primary to-orange-400 text-black hover:shadow-lg hover:shadow-primary/30"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  업로드
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Materials List */}
      {isLoading ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="py-8 text-center text-gray-500">
            로딩 중...
          </CardContent>
        </Card>
      ) : materials && materials.length > 0 ? (
        <div className="space-y-3">
          {materials.map((material) => (
            <Card key={material.id} className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(material.file_type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{material.title}</h3>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {material.file_type?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="truncate">{material.courses?.title}</span>
                      {material.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(material.file_size)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(material.file_url, '_blank')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('이 자료를 삭제하시겠습니까?')) {
                          deleteMutation.mutate(material);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>등록된 자료가 없습니다</p>
            <p className="text-sm">위의 "자료 업로드" 버튼을 클릭해 시작하세요</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
