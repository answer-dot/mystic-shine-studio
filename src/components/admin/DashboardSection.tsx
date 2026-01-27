import { useState } from 'react';
import { Users, DollarSign, MessageSquare, TrendingUp, Eye, Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAllReviews, useUpdateReviewStatus, type Review } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  stats: {
    totalMembers: number;
    totalSales: string;
    newInquiries: number;
    remainingSeats: number;
  };
  onNavigate: (section: string) => void;
}

export const DashboardSection = ({ stats, onNavigate }: DashboardSectionProps) => {
  const { data: reviews } = useAllReviews();
  const updateStatus = useUpdateReviewStatus();
  const recentReviews = reviews?.slice(0, 5) || [];
  const pendingReviewsCount = reviews?.filter(r => !r.is_approved && !r.is_hidden).length || 0;

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleApprove = (reviewId: string, approve: boolean) => {
    updateStatus.mutate({ reviewId, isApproved: approve });
    if (selectedReview && selectedReview.id === reviewId) {
      setSelectedReview({ ...selectedReview, is_approved: approve });
    }
  };

  const handleHide = (reviewId: string, hide: boolean) => {
    updateStatus.mutate({ reviewId, isHidden: hide, isApproved: hide ? false : undefined });
    if (selectedReview && selectedReview.id === reviewId) {
      setSelectedReview({ ...selectedReview, is_hidden: hide, is_approved: hide ? false : selectedReview.is_approved });
    }
  };

  const openDetail = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const statCards = [
    {
      title: '총 회원 수',
      value: stats.totalMembers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '총 매출',
      value: stats.totalSales,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: '신규 문의',
      value: stats.newInquiries.toString(),
      icon: MessageSquare,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      onClick: () => onNavigate('inquiries'),
    },
    {
      title: '대기 중인 리뷰',
      value: pendingReviewsCount.toString(),
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      onClick: () => onNavigate('reviews'),
    },
  ];

  // Generate anonymous display name from user_id
  const getDisplayName = (userId: string) => {
    const hash = userId.slice(0, 8);
    return `수강생 ${hash.slice(0, 4).toUpperCase()}`;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm lg:text-base text-gray-600">사이트 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={`bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow ${stat.onClick ? 'cursor-pointer' : ''}`}
              onClick={stat.onClick}
            >
              <CardContent className="p-4 lg:pt-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs lg:text-sm text-gray-500 truncate">{stat.title}</p>
                    <p className="text-xl lg:text-3xl font-bold mt-1 text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
          onClick={() => onNavigate('general')}
        >
          <CardHeader className="p-4 lg:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              일반 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 lg:pt-0">
            <p className="text-xs lg:text-sm text-gray-600">
              사이트 이름, 가격, 웨비나 날짜 등을 관리합니다
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
          onClick={() => onNavigate('courses')}
        >
          <CardHeader className="p-4 lg:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
              <Eye className="w-4 h-4 text-emerald-500" />
              커리큘럼 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 lg:pt-0">
            <p className="text-xs lg:text-sm text-gray-600">
              강의 챕터와 레슨을 추가하고 편집합니다
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
          onClick={() => onNavigate('inquiries')}
        >
          <CardHeader className="p-4 lg:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              문의 확인
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 lg:pt-0">
            <p className="text-xs lg:text-sm text-gray-600">
              고객 문의 내역을 확인하고 관리합니다
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews Section - Simplified View */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              최근 리뷰
            </CardTitle>
            <CardDescription>최근 등록된 수강생 후기</CardDescription>
          </div>
          {pendingReviewsCount > 0 && (
            <Badge 
              className="bg-orange-100 text-orange-700 border-orange-200 cursor-pointer hover:bg-orange-200"
              onClick={() => onNavigate('reviews')}
            >
              {pendingReviewsCount}개 대기 중
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {recentReviews.length > 0 ? (
            <div className="space-y-2">
              {recentReviews.map((review) => (
                <div 
                  key={review.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => openDetail(review)}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  
                  {/* Name + Stars Only */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {getDisplayName(review.user_id)}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < review.rating ? "fill-primary text-primary" : "text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs flex-shrink-0",
                      review.is_approved && "bg-green-50 text-green-700 border-green-200",
                      !review.is_approved && !review.is_hidden && "bg-orange-50 text-orange-700 border-orange-200"
                    )}
                  >
                    {review.is_approved ? '승인' : '대기'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">등록된 리뷰가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
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
                  <p className="font-medium text-gray-900">{getDisplayName(selectedReview.user_id)}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(selectedReview.created_at), 'M월 d일', { locale: ko })} 작성
                  </p>
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

              {/* Status Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedReview.is_approved}
                      onCheckedChange={(checked) => handleApprove(selectedReview.id, checked)}
                    />
                    <span className="text-sm text-gray-600">승인</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedReview.is_hidden}
                      onCheckedChange={(checked) => handleHide(selectedReview.id, checked)}
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
