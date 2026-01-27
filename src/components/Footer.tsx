import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, FileText, Shield, RefreshCcw } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { replacePlaceholders } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Footer = () => {
  const { settings } = useSettings();
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  // Apply placeholders to legal documents
  const termsContent = replacePlaceholders(
    settings.termsOfService || '이용약관 내용이 등록되지 않았습니다.',
    settings
  );
  const privacyContent = replacePlaceholders(
    settings.privacyPolicy || '개인정보처리방침 내용이 등록되지 않았습니다.',
    settings
  );
  const refundContent = replacePlaceholders(
    settings.refundPolicy || '환불정책 내용이 등록되지 않았습니다.',
    settings
  );

  return (
    <>
      <footer className="py-16 border-t border-border">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">{settings.siteName}</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                타로의 신비로운 세계로 안내하는 최고의 온라인 교육 플랫폼
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">빠른 메뉴</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#curriculum" className="hover:text-foreground transition-colors">커리큘럼</a></li>
                <li><a href="#instructor" className="hover:text-foreground transition-colors">강사 소개</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">수강생 후기</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">자주 묻는 질문</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">고객 지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => setShowTermsDialog(true)} 
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    이용약관
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowPrivacyDialog(true)} 
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    개인정보처리방침
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowRefundDialog(true)} 
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    환불 정책
                  </button>
                </li>
                <li><Link to="/admin" className="hover:text-foreground transition-colors">관리자</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">문의하기</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href={`mailto:${settings.csEmail || 'support@mystictarot.kr'}`} className="hover:text-foreground transition-colors">
                    {settings.csEmail || 'support@mystictarot.kr'}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${settings.csPhone || '02-1234-5678'}`} className="hover:text-foreground transition-colors">
                    {settings.csPhone || '02-1234-5678'}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{settings.csAddress || '서울시 강남구'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Terms Dialog - Fixed mobile/web layout */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="bg-white w-[90vw] max-w-2xl h-auto max-h-[85vh] p-0 flex flex-col overflow-hidden" aria-describedby="terms-description">
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
            <DialogTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              이용약관
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div id="terms-description" className="p-4 sm:p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
              {termsContent}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog - Fixed mobile/web layout */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="bg-white w-[90vw] max-w-2xl h-auto max-h-[85vh] p-0 flex flex-col overflow-hidden" aria-describedby="privacy-description">
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
            <DialogTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              개인정보처리방침
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div id="privacy-description" className="p-4 sm:p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
              {privacyContent}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Refund Policy Dialog - Fixed mobile/web layout */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="bg-white w-[90vw] max-w-2xl h-auto max-h-[85vh] p-0 flex flex-col overflow-hidden" aria-describedby="refund-description">
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
            <DialogTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <RefreshCcw className="w-5 h-5 text-primary flex-shrink-0" />
              환불 정책
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div id="refund-description" className="p-4 sm:p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
              {refundContent}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
