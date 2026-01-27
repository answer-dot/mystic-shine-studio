import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Download, 
  Lock, 
  CheckCircle,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface CertificateDownloadProps {
  progressPercentage: number;
  isCompleted: boolean;
  certificateIssued: boolean;
  certificateIssuedAt?: string;
  onIssueCertificate: () => void;
  userName: string;
  courseTitle: string;
  completedAt?: string | null;
}

export const CertificateDownload = ({
  progressPercentage,
  isCompleted,
  certificateIssued,
  certificateIssuedAt,
  onIssueCertificate,
  userName,
  courseTitle,
  completedAt,
}: CertificateDownloadProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleIssueCertificate = () => {
    onIssueCertificate();
    toast({
      title: '수료증 발급 완료',
      description: '수료증이 성공적으로 발급되었습니다.',
    });
  };

  const handleDownloadCertificate = async () => {
    setIsGenerating(true);
    
    try {
      // Generate certificate HTML
      const certificateDate = certificateIssuedAt 
        ? format(new Date(certificateIssuedAt), 'yyyy년 MM월 dd일', { locale: ko })
        : format(new Date(), 'yyyy년 MM월 dd일', { locale: ko });
      
      const completionDate = completedAt
        ? format(new Date(completedAt), 'yyyy년 MM월 dd일', { locale: ko })
        : certificateDate;

      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>수료증 - ${userName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
              font-family: 'Noto Serif KR', serif;
              background: #f5f5f5;
              padding: 40px;
            }
            
            .certificate {
              width: 800px;
              height: 566px;
              margin: 0 auto;
              background: linear-gradient(135deg, #fdfbf7 0%, #f8f4ed 100%);
              border: 8px double #d4af37;
              padding: 50px;
              position: relative;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            
            .certificate::before {
              content: '';
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              bottom: 20px;
              border: 2px solid #d4af37;
              pointer-events: none;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            
            .header h1 {
              font-size: 42px;
              color: #1a1a1a;
              letter-spacing: 8px;
              margin-bottom: 10px;
            }
            
            .header .subtitle {
              font-size: 16px;
              color: #666;
              letter-spacing: 4px;
            }
            
            .content {
              text-align: center;
              padding: 20px 0;
            }
            
            .name {
              font-size: 36px;
              color: #1a1a1a;
              font-weight: 700;
              margin: 20px 0;
              border-bottom: 2px solid #d4af37;
              display: inline-block;
              padding: 0 30px 10px;
            }
            
            .course {
              font-size: 20px;
              color: #333;
              margin: 20px 0;
              line-height: 1.6;
            }
            
            .course strong {
              color: #1a1a1a;
              font-weight: 700;
            }
            
            .message {
              font-size: 16px;
              color: #555;
              margin: 25px 0;
              line-height: 1.8;
            }
            
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              padding-top: 20px;
            }
            
            .date {
              font-size: 14px;
              color: #666;
            }
            
            .seal {
              width: 100px;
              height: 100px;
              border: 3px solid #d4af37;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #d4af37;
              text-align: center;
              line-height: 1.3;
            }
            
            @media print {
              body { padding: 0; background: white; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <h1>수 료 증</h1>
              <div class="subtitle">CERTIFICATE OF COMPLETION</div>
            </div>
            
            <div class="content">
              <div class="name">${userName}</div>
              
              <div class="course">
                위 사람은<br>
                <strong>「${courseTitle}」</strong> 과정을<br>
                성실히 이수하였기에 이 증서를 수여합니다.
              </div>
              
              <div class="message">
                수료일: ${completionDate}
              </div>
            </div>
            
            <div class="footer">
              <div class="date">
                발급일: ${certificateDate}
              </div>
              <div class="seal">
                수료<br>인증
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(certificateHTML);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Certificate generation failed:', error);
      toast({
        title: '오류',
        description: '수료증 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-card border-2 border-border shadow-lg">
      <CardContent className="p-5">
        {/* Progress Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              학습 진도율
            </h3>
            <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
          </div>
          
          <Progress value={progressPercentage} className="h-3 bg-muted" />
          
          <p className="text-sm text-muted-foreground">
            {isCompleted 
              ? '🎉 모든 강의를 완료했습니다!' 
              : `${100 - progressPercentage}% 더 학습하면 수료증을 받을 수 있습니다.`
            }
          </p>
        </div>

        {/* Certificate Section */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">수료증 발급</span>
                {certificateIssued ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    발급 완료
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                    발급 가능
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    <Lock className="w-3 h-3 mr-1" />
                    100% 달성 필요
                  </span>
                )}
              </div>
              {certificateIssuedAt && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(certificateIssuedAt), 'yyyy.MM.dd 발급', { locale: ko })}
                </span>
              )}
            </div>

            {/* Action Buttons - HIGH CONTRAST */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!certificateIssued && isCompleted && (
                <Button 
                  onClick={handleIssueCertificate}
                  className="flex-1 bg-primary text-primary-foreground font-bold border-2 border-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Award className="w-5 h-5 mr-2" />
                  수료증 발급
                </Button>
              )}
              
              {certificateIssued && (
                <Button 
                  onClick={handleDownloadCertificate}
                  disabled={isGenerating}
                  className="flex-1 bg-green-600 text-white font-bold border-2 border-green-500 hover:bg-green-700"
                  size="lg"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  {isGenerating ? '생성 중...' : '수료증 인쇄/다운로드'}
                </Button>
              )}
              
              {!isCompleted && (
                <Button 
                  disabled 
                  variant="outline"
                  size="lg"
                  className="flex-1 border-2 border-muted-foreground/50 text-muted-foreground bg-muted/30 font-semibold"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  수료증 발급 (100% 달성 시 활성화)
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
