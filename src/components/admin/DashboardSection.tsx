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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">사이트 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={`border-border/50 ${stat.onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
              onClick={stat.onClick}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigate('general')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              일반 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              사이트 이름, 가격, 웨비나 날짜 등을 관리합니다
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigate('curriculum')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              커리큘럼 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              강의 챕터와 레슨을 추가하고 편집합니다
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigate('inquiries')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              문의 확인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              고객 문의 내역을 확인하고 관리합니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
