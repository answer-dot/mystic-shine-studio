import { useState } from 'react';
import { Star, Send, Gift, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmitReview } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  courseId?: string;
  courseName?: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ courseId, courseName, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const submitReview = useSubmitReview();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (content.trim().length < 10) {
      return;
    }

    const result = await submitReview.mutateAsync({
      userId: user.id,
      courseId,
      rating,
      content: content.trim(),
      photoUrl: photoPreview || undefined,
    });

    if (result.coupon) {
      setCouponCode(result.coupon.code);
      setShowCouponModal(true);
    }

    // Reset form
    setRating(5);
    setContent('');
    setPhotoPreview(null);
    onSuccess?.();
  };

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">후기를 작성하려면 로그인이 필요합니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/auth?mode=login'}>
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Star className="w-5 h-5 text-primary" />
            후기 작성
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            수강 후기를 남겨주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-gray-700">평점</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-primary text-primary"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-600 self-center">
                {rating}점
              </span>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content" className="text-gray-700">후기 내용</Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="강의에 대한 솔직한 후기를 작성해주세요. (최소 10자)"
              rows={4}
              className="resize-none bg-white border-gray-300 text-gray-900"
            />
            <p className="text-xs text-gray-500 text-right">
              {content.length}자 / 최소 10자
            </p>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700">사진 첨부 (선택)</Label>
            {photoPreview ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">사진 추가</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Reward Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
            <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">후기 작성 보상</p>
              <p className="text-xs text-gray-600">
                후기를 작성하시면 10% 할인 쿠폰을 즉시 발급해드립니다!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={content.trim().length < 10 || submitReview.isPending}
          >
            {submitReview.isPending ? (
              '등록 중...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                후기 등록하기
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Coupon Reward Modal */}
      <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Gift className="w-6 h-6" />
              축하합니다! 🎉
            </DialogTitle>
            <DialogDescription>
              후기 작성 감사 쿠폰이 발급되었습니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">10% 할인 쿠폰</p>
              <p className="text-2xl font-bold text-primary tracking-wider">
                {couponCode}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                30일 이내 사용 가능
              </p>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              쿠폰은 마이페이지에서 다시 확인하실 수 있습니다.
            </p>
          </div>
          <Button onClick={() => setShowCouponModal(false)} className="w-full">
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
