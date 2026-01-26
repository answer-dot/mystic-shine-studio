import { Users, DollarSign, MessageSquare, Ticket, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      title: '잔여 좌석',
      value: stats.remainingSeats.toString(),
      icon: Ticket,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
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
    </div>
  );
};
