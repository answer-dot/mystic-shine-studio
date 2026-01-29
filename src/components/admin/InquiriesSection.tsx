import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Check, Trash2, RefreshCw, Send, StickyNote, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  response: string | null;
  responded_at: string | null;
  responded_by: string | null;
  user_id: string | null;
}

interface InquiriesSectionProps {
  onUnreadCountChange: (count: number) => void;
}

export const InquiriesSection = ({ onUnreadCountChange }: InquiriesSectionProps) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [addToNotes, setAddToNotes] = useState(false);
  const [responding, setResponding] = useState(false);
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
      setInquiries((data || []) as Inquiry[]);
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

  const openResponseDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseText(inquiry.response || '');
    setAddToNotes(false);
    setResponseDialogOpen(true);
  };

  const handleSendResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) return;

    setResponding(true);
    try {
      // Update inquiry with response
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({
          response: responseText.trim(),
          responded_at: new Date().toISOString(),
          is_read: true,
        })
        .eq('id', selectedInquiry.id);

      if (updateError) throw updateError;

      // Create notification for user about the reply
      await supabase.from('notifications').insert({
        type: 'inquiry_reply',
        title: '문의 답변이 도착했습니다',
        message: `${selectedInquiry.name}님, 문의하신 내용에 대한 답변이 등록되었습니다.`,
        data: {
          inquiry_id: selectedInquiry.id,
          user_email: selectedInquiry.email,
          user_id: selectedInquiry.user_id,
        },
      });

      // If addToNotes is checked and user_id exists, add to customer notes
      if (addToNotes && selectedInquiry.user_id) {
        const noteContent = `[문의 답변] ${selectedInquiry.name} - ${responseText.trim()}`;
        await supabase.from('customer_notes').insert({
          user_id: selectedInquiry.user_id,
          note: noteContent,
          created_by: selectedInquiry.user_id, // Using user_id as placeholder
        });
      }

      toast({
        title: '답변 완료',
        description: '문의에 대한 답변이 저장되었습니다. 회원에게 알림이 전송됩니다.',
      });

      setResponseDialogOpen(false);
      fetchInquiries();
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: '오류',
        description: '답변 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setResponding(false);
    }
  };

  const getStatusBadge = (inquiry: Inquiry) => {
    if (inquiry.response) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="w-3 h-3 mr-1" />
          답변 완료
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        대기중
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">문의 내역</h1>
          <p className="text-sm lg:text-base text-gray-600">고객 문의를 확인하고 답변합니다</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInquiries} disabled={loading} className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto">
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
              className={`bg-white border-gray-200 shadow-sm ${!inquiry.is_read ? 'border-l-4 border-l-emerald-500' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base flex flex-wrap items-center gap-2 text-gray-900">
                      {inquiry.name}
                      {!inquiry.is_read && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded font-medium">NEW</span>
                      )}
                      {getStatusBadge(inquiry)}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 mt-1 text-gray-600">
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
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{inquiry.message}</p>
                </div>

                {inquiry.response && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-medium mb-1">
                      답변 ({inquiry.responded_at && format(new Date(inquiry.responded_at), 'yyyy.MM.dd HH:mm', { locale: ko })})
                    </p>
                    <p className="text-sm whitespace-pre-wrap text-gray-700">{inquiry.response}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => openResponseDialog(inquiry)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {inquiry.response ? '답변 수정' : '답변하기'}
                  </Button>
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

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="w-[calc(100vw-48px)] max-w-lg p-0">
          <div className="p-5 sm:p-6 max-h-[calc(100vh-120px)] sm:max-h-[80vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-gray-900 text-lg pr-8">문의 답변</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedInquiry?.name}님의 문의에 답변합니다
              </DialogDescription>
            </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Original message */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">원본 문의</p>
              <p className="text-sm text-gray-700">{selectedInquiry?.message}</p>
            </div>

            {/* Response textarea */}
            <div className="space-y-2">
              <Label className="text-gray-700">답변 내용</Label>
              <Textarea
                placeholder="답변을 입력하세요..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Add to notes option */}
            {selectedInquiry?.user_id && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <Checkbox
                  id="addToNotes"
                  checked={addToNotes}
                  onCheckedChange={(checked) => setAddToNotes(checked as boolean)}
                />
                <Label htmlFor="addToNotes" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-yellow-600" />
                  이 답변을 고객 메모에 자동 저장
                </Label>
              </div>
            )}

            {!selectedInquiry?.user_id && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-gray-400" />
                <span>비회원 문의입니다. 고객 메모 연결이 불가합니다.</span>
              </div>
            )}
          </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setResponseDialogOpen(false)}
                className="border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 w-full sm:w-auto"
              >
                취소
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!responseText.trim() || responding}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              >
                {responding ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                답변 저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
