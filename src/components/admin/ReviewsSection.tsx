import { useState } from 'react';
import { Star, Eye, EyeOff, Check, X, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAllReviews, useUpdateReviewStatus, type Review } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const ReviewsSection = () => {
  const { data: reviews, isLoading } = useAllReviews();
  const updateStatus = useUpdateReviewStatus();
  
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const pendingReviews = reviews?.filter(r => !r.is_approved && !r.is_hidden) || [];
  const approvedReviews = reviews?.filter(r => r.is_approved) || [];
  const hiddenReviews = reviews?.filter(r => r.is_hidden) || [];

  const handleApprove = (reviewId: string, approve: boolean) => {
    updateStatus.mutate({ reviewId, isApproved: approve });
  };

  const handleHide = (reviewId: string, hide: boolean) => {
    updateStatus.mutate({ reviewId, isHidden: hide, isApproved: hide ? false : undefined });
  };

  const openDetail = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">리뷰 관리</h1>
        <p className="text-sm lg:text-base text-gray-600">수강생 후기를 승인하고 관리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{pendingReviews.length}</p>
            <p className="text-sm text-orange-700">대기 중</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{approvedReviews.length}</p>
            <p className="text-sm text-green-700">승인됨</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{hiddenReviews.length}</p>
            <p className="text-sm text-gray-600">숨김</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <Card className="bg-white border-orange-200">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                {pendingReviews.length}
              </Badge>
              승인 대기 중인 후기
            </CardTitle>
            <CardDescription>새로 등록된 후기를 검토하고 승인해주세요</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {pendingReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onOpenDetail={() => openDetail(review)}
                  onApprove={() => handleApprove(review.id, true)}
                  onHide={() => handleHide(review.id, true)}
                  isPending
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Reviews List */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">전체 후기 목록</CardTitle>
          <CardDescription>총 {reviews?.length || 0}개의 후기</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {reviews && reviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onOpenDetail={() => openDetail(review)}
                  onApprove={() => handleApprove(review.id, !review.is_approved)}
                  onHide={() => handleHide(review.id, !review.is_hidden)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>등록된 후기가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">후기 상세</DialogTitle>
            <DialogDescription>
              {selectedReview && format(new Date(selectedReview.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">사용자 ID</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{selectedReview.user_id}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < selectedReview.rating
                        ? "fill-primary text-primary"
                        : "text-gray-200"
                    )}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">{selectedReview.rating}점</span>
              </div>

              {/* Content */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.content}</p>
              </div>

              {/* Photo */}
              {selectedReview.photo_url && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={selectedReview.photo_url}
                    alt="Review photo"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedReview.is_approved}
                      onCheckedChange={(checked) => {
                        handleApprove(selectedReview.id, checked);
                        setSelectedReview({ ...selectedReview, is_approved: checked });
                      }}
                    />
                    <span className="text-sm text-gray-600">승인</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedReview.is_hidden}
                      onCheckedChange={(checked) => {
                        handleHide(selectedReview.id, checked);
                        setSelectedReview({ ...selectedReview, is_hidden: checked });
                      }}
                    />
                    <span className="text-sm text-gray-600">숨김</span>
                  </div>
                </div>
                <Badge
                  variant={selectedReview.is_approved ? 'default' : selectedReview.is_hidden ? 'secondary' : 'outline'}
                  className={cn(
                    selectedReview.is_approved && 'bg-green-500',
                    selectedReview.is_hidden && 'bg-gray-400'
                  )}
                >
                  {selectedReview.is_approved ? '승인됨' : selectedReview.is_hidden ? '숨김' : '대기 중'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Individual Review Item Component
interface ReviewItemProps {
  review: Review;
  onOpenDetail: () => void;
  onApprove: () => void;
  onHide: () => void;
  isPending?: boolean;
}

const ReviewItem = ({ review, onOpenDetail, onApprove, onHide, isPending }: ReviewItemProps) => {
  return (
    <div
      className={cn(
        "p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer",
        isPending && "bg-orange-50/50"
      )}
      onClick={onOpenDetail}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Rating */}
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < review.rating ? "fill-primary text-primary" : "text-gray-200"
                )}
              />
            ))}
          </div>
          {/* Date */}
          <span className="text-xs text-gray-400">
            {format(new Date(review.created_at), 'M.d', { locale: ko })}
          </span>
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              review.is_approved && "bg-green-50 text-green-700 border-green-200",
              review.is_hidden && "bg-gray-100 text-gray-500 border-gray-200",
              !review.is_approved && !review.is_hidden && "bg-orange-50 text-orange-700 border-orange-200"
            )}
          >
            {review.is_approved ? '승인' : review.is_hidden ? '숨김' : '대기'}
          </Badge>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">{review.content}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {isPending ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
              onClick={onApprove}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100"
              onClick={onHide}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
