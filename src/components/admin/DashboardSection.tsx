import { Users, DollarSign, MessageSquare, Ticket, TrendingUp, Eye, Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllReviews } from '@/hooks/useReviews';
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
  const recentReviews = reviews?.slice(0, 5) || [];
  const pendingReviewsCount = reviews?.filter(r => !r.is_approved && !r.is_hidden).length || 0;

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
          className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-300 transition-all"
          onClick={() => onNavigate('general')}
        >
          <CardHeader className="p-4 lg:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-4 h-4 text-orange-500" />
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
          className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-300 transition-all"
          onClick={() => onNavigate('curriculum')}
        >
          <CardHeader className="p-4 lg:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
              <Eye className="w-4 h-4 text-orange-500" />
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
          className="bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-300 transition-all"
          onClick={() => onNavigate('inquiries')}
        >
          <CardHeader className="p-4 lg:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-900">
              <MessageSquare className="w-4 h-4 text-orange-500" />
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

      {/* Recent Reviews Section */}
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
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div 
                  key={review.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onNavigate('reviews')}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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
                      <span className="text-xs text-gray-400">
                        {format(new Date(review.created_at), 'M.d', { locale: ko })}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          review.is_approved && "bg-green-50 text-green-700 border-green-200",
                          !review.is_approved && !review.is_hidden && "bg-orange-50 text-orange-700 border-orange-200"
                        )}
                      >
                        {review.is_approved ? '승인' : '대기'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-1">{review.content}</p>
                  </div>
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
    </div>
  );
};
