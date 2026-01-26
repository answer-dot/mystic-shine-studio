import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Check, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface InquiriesSectionProps {
  onUnreadCountChange: (count: number) => void;
}

export const InquiriesSection = ({ onUnreadCountChange }: InquiriesSectionProps) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: '오류',
        description: '문의 내역을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } else {
      setInquiries(data || []);
      const unreadCount = (data || []).filter(i => !i.is_read).length;
      onUnreadCountChange(unreadCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setInquiries(inquiries.map(i => 
        i.id === id ? { ...i, is_read: true } : i
      ));
      const unreadCount = inquiries.filter(i => !i.is_read && i.id !== id).length;
      onUnreadCountChange(unreadCount);
      toast({ title: '읽음 처리되었습니다' });
    }
  };

  const deleteInquiry = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (!error) {
      const updatedInquiries = inquiries.filter(i => i.id !== id);
      setInquiries(updatedInquiries);
      const unreadCount = updatedInquiries.filter(i => !i.is_read).length;
      onUnreadCountChange(unreadCount);
      toast({ title: '문의가 삭제되었습니다' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문의 내역</h1>
          <p className="text-gray-600">고객 문의를 확인하고 관리합니다</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={loading} className="border-gray-300 text-gray-700 hover:bg-gray-100">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>문의 내역을 불러오는 중...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>아직 문의 내역이 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card 
              key={inquiry.id} 
              className={`bg-white border-gray-200 shadow-sm ${!inquiry.is_read ? 'border-l-4 border-l-orange-500' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                      {inquiry.name}
                      {!inquiry.is_read && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded font-medium">NEW</span>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {inquiry.email}
                      </span>
                      {inquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {inquiry.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(inquiry.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap mb-4 text-gray-700">{inquiry.message}</p>
                <div className="flex gap-2">
                  {!inquiry.is_read && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markAsRead(inquiry.id)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      읽음
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deleteInquiry(inquiry.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
