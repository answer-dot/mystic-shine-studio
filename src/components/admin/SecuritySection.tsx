import { Shield, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SecuritySectionProps {
  newPin: string;
  setNewPin: (value: string) => void;
  confirmPin: string;
  setConfirmPin: (value: string) => void;
  onChangePin: () => void;
}

export const SecuritySection = ({
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  onChangePin,
}: SecuritySectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">보안</h1>
        <p className="text-muted-foreground">관리자 접근 보안을 관리합니다</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            PIN 변경
          </CardTitle>
          <CardDescription>관리자 로그인 PIN을 변경합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium">새 PIN</label>
              <Input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="새 PIN 입력"
                className="border-border/50"
              />
              <p className="text-xs text-muted-foreground">최소 4자리 이상 입력해주세요</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PIN 확인</label>
              <Input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="PIN 다시 입력"
                className="border-border/50"
              />
            </div>
            <Button variant="gold" onClick={onChangePin}>
              <Shield className="w-4 h-4 mr-2" />
              PIN 변경
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
