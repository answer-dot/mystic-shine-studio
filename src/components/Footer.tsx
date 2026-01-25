import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export const Footer = () => {
  const { settings } = useSettings();

  return (
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
              <li><a href="#" className="hover:text-foreground transition-colors">이용약관</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">환불 정책</a></li>
              <li><Link to="/admin" className="hover:text-foreground transition-colors">관리자</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">문의하기</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@mystictarot.kr</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>02-1234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>서울시 강남구</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
