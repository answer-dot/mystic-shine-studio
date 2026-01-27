import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  AlertTriangle,
  Ban,
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  StickyNote,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  blacklisted_at: string | null;
  created_at: string;
}

interface CustomerNote {
  id: string;
  user_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UserCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  refund_status: string;
  refund_requested_at: string | null;
  refund_processed_at: string | null;
  refund_reason: string | null;
  course?: {
    title: string;
  };
}

export const CustomersSection = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [customerInquiries, setCustomerInquiries] = useState<Inquiry[]>([]);
  const [customerCourses, setCustomerCourses] = useState<UserCourse[]>([]);
  const [newNote, setNewNote] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles((data || []) as Profile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: '오류',
        description: '고객 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (profile: Profile) => {
    setSelectedCustomer(profile);
    setBlacklistReason(profile.blacklist_reason || '');
    setDetailDialogOpen(true);

    // Fetch notes
    const { data: notes } = await supabase
      .from('customer_notes')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false });
    setCustomerNotes((notes || []) as CustomerNote[]);

    // Fetch inquiries by matching email from auth.users metadata
    // Since we can't access auth.users directly, we'll skip email matching for now
    // In production, you'd use an edge function for this
    setCustomerInquiries([]);

    // Fetch user courses with refund info
    const { data: courses } = await supabase
      .from('user_courses')
      .select(`
        *,
        course:courses(title)
      `)
      .eq('user_id', profile.user_id);
    setCustomerCourses((courses || []) as UserCourse[]);
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.trim()) return;

    try {
      const { error } = await supabase.from('customer_notes').insert({
        user_id: selectedCustomer.user_id,
        note: newNote.trim(),
        created_by: selectedCustomer.user_id, // In real app, use current admin's ID
      });

      if (error) throw error;

      toast({
        title: '저장 완료',
        description: '메모가 추가되었습니다.',
      });

      setNewNote('');
      fetchCustomerDetails(selectedCustomer);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: '오류',
        description: '메모 추가에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('customer_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: '삭제 완료',
        description: '메모가 삭제되었습니다.',
      });

      if (selectedCustomer) {
        fetchCustomerDetails(selectedCustomer);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: '오류',
        description: '메모 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleBlacklist = async (isBlacklisted: boolean) => {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_blacklisted: isBlacklisted,
          blacklist_reason: isBlacklisted ? blacklistReason : null,
          blacklisted_at: isBlacklisted ? new Date().toISOString() : null,
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      toast({
        title: isBlacklisted ? '블랙리스트 등록' : '블랙리스트 해제',
        description: isBlacklisted
          ? '해당 고객이 블랙리스트에 등록되었습니다.'
          : '해당 고객이 블랙리스트에서 해제되었습니다.',
      });

      setSelectedCustomer({
        ...selectedCustomer,
        is_blacklisted: isBlacklisted,
        blacklist_reason: isBlacklisted ? blacklistReason : null,
        blacklisted_at: isBlacklisted ? new Date().toISOString() : null,
      });
      fetchProfiles();
    } catch (error) {
      console.error('Error updating blacklist:', error);
      toast({
        title: '오류',
        description: '블랙리스트 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRefundStatus = async (
    courseId: string,
    status: string
  ) => {
    try {
      const { error } = await supabase
        .from('user_courses')
        .update({
          refund_status: status,
          refund_processed_at: status !== 'pending' ? new Date().toISOString() : null,
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: '저장 완료',
        description: '환불 상태가 업데이트되었습니다.',
      });

      if (selectedCustomer) {
        fetchCustomerDetails(selectedCustomer);
      }
    } catch (error) {
      console.error('Error updating refund status:', error);
      toast({
        title: '오류',
        description: '환불 상태 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getRefundAlertLevel = (courses: UserCourse[]) => {
    const rejectedCount = courses.filter(
      (c) => c.refund_status === 'rejected' || c.refund_status === 'approved'
    ).length;
    if (rejectedCount >= 3) return 'high';
    if (rejectedCount >= 2) return 'medium';
    return 'none';
  };

  const filteredProfiles = profiles.filter((p) =>
    (p.display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RefundStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            승인
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            거절
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            없음
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고객 관리</h2>
          <p className="text-gray-500 text-sm mt-1">
            고객 정보, 메모, 블랙리스트를 관리합니다
          </p>
        </div>
        <Button variant="outline" onClick={fetchProfiles}>
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="고객 이름으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Customer List - Simplified */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 고객이 없습니다</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">고객명</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                          {(profile.display_name || '?')[0]}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {profile.display_name || '이름 없음'}
                          </span>
                          {profile.is_blacklisted && (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <Ban className="w-3 h-3" />
                              블랙리스트
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCustomerDetails(profile)}
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 font-medium"
                      >
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
                {(selectedCustomer?.display_name || '?')[0]}
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {selectedCustomer?.display_name || '이름 없음'}
                </span>
                {selectedCustomer?.is_blacklisted && (
                  <Badge variant="destructive" className="ml-3">
                    블랙리스트
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              가입일:{' '}
              {selectedCustomer &&
                format(new Date(selectedCustomer.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-6">
              {/* Blacklist Section */}
              <Card className="border border-red-200 bg-red-50/30 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700 font-semibold">
                    <Ban className="w-4 h-4" />
                    블랙리스트 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <Label className="text-gray-800 font-medium">접근 제한</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        활성화 시 해당 고객의 예약/구매가 차단됩니다
                      </p>
                    </div>
                    <Switch
                      checked={selectedCustomer?.is_blacklisted || false}
                      onCheckedChange={handleToggleBlacklist}
                    />
                  </div>
                  {(selectedCustomer?.is_blacklisted || blacklistReason) && (
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-medium">제한 사유</Label>
                      <Textarea
                        placeholder="블랙리스트 등록 사유를 입력하세요"
                        value={blacklistReason}
                        onChange={(e) => setBlacklistReason(e.target.value)}
                        className="min-h-[80px] bg-white border-gray-300 text-gray-900"
                      />
                      {selectedCustomer?.is_blacklisted && (
                        <Button
                          size="sm"
                          onClick={() => handleToggleBlacklist(true)}
                          className="mt-2 bg-gray-900 text-white hover:bg-gray-800"
                        >
                          사유 저장
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Notes Section */}
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-900 font-semibold">
                    <StickyNote className="w-4 h-4" />
                    관리자 메모
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    이 고객에 대한 내부 메모를 작성합니다 (고객에게 보이지 않음)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="메모를 입력하세요..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] bg-white border-gray-300 text-gray-900"
                    />
                    <Button onClick={handleAddNote} className="shrink-0 bg-gray-900 text-white hover:bg-gray-800">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {customerNotes.length > 0 && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {customerNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 bg-gray-50 rounded-lg text-sm group relative border border-gray-100"
                        >
                          <p className="text-gray-800 pr-8">{note.note}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(note.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Refund History Section */}
              {customerCourses.length > 0 && (
                <Card className="border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-gray-900 font-semibold">
                        <RefreshCw className="w-4 h-4" />
                        수강/환불 내역
                      </CardTitle>
                      {getRefundAlertLevel(customerCourses) !== 'none' && (
                        <Badge
                          variant={
                            getRefundAlertLevel(customerCourses) === 'high'
                              ? 'destructive'
                              : 'outline'
                          }
                          className={
                            getRefundAlertLevel(customerCourses) === 'medium'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : ''
                          }
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          환불 빈도 높음
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customerCourses.map((course) => (
                        <div
                          key={course.id}
                          className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/50"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {course.course?.title || '강의'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              등록일:{' '}
                              {format(new Date(course.enrolled_at), 'yyyy.MM.dd', { locale: ko })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <RefundStatusBadge status={course.refund_status} />
                            {course.refund_status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100 font-medium"
                                  onClick={() =>
                                    handleUpdateRefundStatus(course.id, 'approved')
                                  }
                                >
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-700 border-red-300 bg-red-50 hover:bg-red-100 font-medium"
                                  onClick={() =>
                                    handleUpdateRefundStatus(course.id, 'rejected')
                                  }
                                >
                                  거절
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inquiry History Section */}
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-900 font-semibold">
                    <History className="w-4 h-4" />
                    문의 이력
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerInquiries.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                      문의 이력이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customerInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                          <p className="text-sm text-gray-800">{inquiry.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(inquiry.created_at), 'yyyy.MM.dd HH:mm', {
                              locale: ko,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
