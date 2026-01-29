import { useState, useRef } from 'react';
import { Image, Plus, Trash2, Upload, X, ZoomIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TestimonialItem } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { optimizeImage } from '@/lib/imageUtils';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    try {
      const optimizedFile = await optimizeImage(file);
      setSelectedFile(optimizedFile);
      const url = URL.createObjectURL(optimizedFile);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Image optimization error:', error);
      toast.error('이미지 처리 중 오류가 발생했습니다');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('이미지를 선택해주세요');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `testimonial-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(filePath);

      // Create new testimonial with unique ID
      const newId = `testimonial-${Date.now()}`;
      const newTestimonial: TestimonialItem = {
        id: newId,
        name: '',
        role: '',
        content: '',
        rating: 5,
        image: publicUrl,
      };

      // Update testimonials array with new item including image
      const updatedTestimonials = [...testimonials, newTestimonial];
      
      // Save to site_settings via Supabase
      const { error: saveError } = await supabase
        .from('site_settings')
        .upsert([{
          key: 'testimonials',
          value: JSON.parse(JSON.stringify(updatedTestimonials)),
        }], { onConflict: 'key' });

      if (saveError) throw saveError;

      toast.success('이미지가 업로드되었습니다');
      handleCloseModal();
      
      // Trigger parent refresh
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('업로드 중 오류가 발생했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (id: string, imageUrl?: string) => {
    if (imageUrl) {
      try {
        // Extract file name from URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('review-images')
          .remove([fileName]);
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }
    onDelete(id);
    onSave();
  };

  // Filter testimonials that have images
  const testimonialsWithImages = testimonials.filter(t => t.image);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">수강생 후기</h1>
          <p className="text-sm lg:text-base text-gray-600">수강생 후기 캡처 이미지를 관리합니다</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsModalOpen(true)} 
          className="border-orange-300 text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          후기 추가
        </Button>
      </div>

      {testimonialsWithImages.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 후기 이미지가 없습니다</p>
            <p className="text-sm">위의 "후기 추가" 버튼을 클릭해 이미지를 업로드하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {testimonialsWithImages.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={item.image}
                  alt="수강생 후기"
                  className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setLightboxImage(item.image || null)}
                />
              </div>
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setLightboxImage(item.image || null)}
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-red-500/80 hover:bg-red-600 text-white"
                  onClick={() => handleDeleteImage(item.id, item.image)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100vw-48px)] max-w-md p-0">
          <div className="p-5 sm:p-6 space-y-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-gray-900 text-lg">후기 이미지 업로드</DialogTitle>
            </DialogHeader>
          
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[400px] object-contain rounded-lg border border-gray-200"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">클릭하여 이미지를 선택하세요</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP 지원</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="border-gray-300 text-gray-700"
              >
                취소
              </Button>
              <Button
                variant="gold"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage}
          alt="수강생 후기"
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
