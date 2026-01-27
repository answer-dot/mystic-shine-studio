import { useState, useCallback } from "react";
import { Upload, X, Star, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { compressImage, generateImageFilename, formatFileSize } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface AdminReviewGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminReviewGallery = ({ open, onOpenChange }: AdminReviewGalleryProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    addImages(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const newImages = [...images, ...files].slice(0, 5); // Max 5 images
    setImages(newImages);

    // Generate previews
    const newPreviews: string[] = [];
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newImages.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCustomerName("");
    setDescription("");
    setRating(5);
    setImages([]);
    setPreviews([]);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast({
        title: "고객명을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0 && !description.trim()) {
      toast({
        title: "이미지나 설명을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("로그인이 필요합니다");
      }

      // Upload and compress images
      const uploadedUrls: string[] = [];
      for (const image of images) {
        const compressedBlob = await compressImage(image);
        const filename = generateImageFilename(image.name);
        
        const { data, error } = await supabase.storage
          .from("review-images")
          .upload(`admin/${filename}`, compressedBlob, {
            contentType: "image/jpeg",
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("review-images")
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      // Create review record
      const { error: reviewError } = await supabase.from("reviews").insert({
        user_id: user.id,
        rating,
        content: description || `${customerName}님의 후기`,
        photo_url: uploadedUrls[0] || null,
        is_admin_uploaded: true,
        is_approved: true, // Admin uploads are auto-approved
        customer_name: customerName,
      });

      if (reviewError) throw reviewError;

      toast({
        title: "후기가 등록되었습니다",
        description: `${customerName}님의 후기가 성공적으로 등록되었습니다.`,
      });

      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["approved-reviews"] });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "업로드 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            갤러리 후기 등록
          </DialogTitle>
          <DialogDescription>
            카카오톡 캡처 등 고객 후기 이미지를 직접 등록합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-gray-700">고객명 *</Label>
            <Input
              id="customerName"
              placeholder="예: 김OO님"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-gray-700">평점</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      i < rating
                        ? "fill-primary text-primary"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">{rating}점</span>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <Label className="text-gray-700">이미지 (최대 5장)</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="gallery-upload"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="gallery-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  이미지를 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WEBP (자동 압축 적용)
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1 rounded">
                      {formatFileSize(images[index]?.size || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700">간단 설명</Label>
            <Textarea
              id="description"
              placeholder="후기 내용이나 메모를 입력하세요 (선택사항)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white border-gray-300"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isUploading}
            className="border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              "등록하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
