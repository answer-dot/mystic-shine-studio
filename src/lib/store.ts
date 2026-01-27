// Simple state management for site settings
export interface SiteSettings {
  siteName: string;
  webinarDate: string;
  remainingSeats: number;
  adminPin: string;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  instructorImageUrl: string;
  price: string;
  originalPrice: string;
  curriculum: CurriculumItem[];
  events: EventItem[];
  testimonials: TestimonialItem[];
  resendApiKey: string;
  termsOfService: string;
  privacyPolicy: string;
  csEmail: string;
  csPhone: string;
  csAddress: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface LessonItem {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoUrl?: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPreview?: boolean;
  previewVideoUrl?: string;
  lessons: LessonItem[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  spots: number;
  imageUrl?: string;
  totalCapacity?: number;  // Total seats available
  startTime?: string;      // ISO datetime for countdown (e.g., "2025-02-01T19:00:00")
}

const defaultSettings: SiteSettings = {
  siteName: "Mystic Tarot Academy",
  webinarDate: "2025-02-15T19:00:00",
  remainingSeats: 23,
  adminPin: "1234",
  instructorName: "이하늘 교수",
  instructorTitle: "타로 마스터 & 심리상담사",
  instructorBio: "15년 이상의 타로 리딩 경력을 가진 전문가로, 심리학 박사 학위를 보유하고 있습니다. 수천 명의 수강생을 배출하며 타로를 통한 자기 이해와 성장을 돕고 있습니다.",
  instructorImageUrl: "",
  price: "₩490,000",
  originalPrice: "₩890,000",
  resendApiKey: "",
  termsOfService: `제1조 (목적)
본 약관은 [사이트명](이하 "사이트")가 제공하는 온라인 교육 서비스의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "서비스"란 사이트가 제공하는 온라인 강의, 자료 다운로드, 커뮤니티 이용 등 모든 서비스를 말합니다.
2. "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.
3. "강의"란 사이트에서 제공하는 유료 또는 무료 온라인 교육 콘텐츠를 말합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스를 이용하고자 하는 모든 회원에게 효력이 있습니다.
2. 사이트는 필요시 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다.

제4조 (서비스 이용)
1. 회원은 결제 완료 후 강의를 이용할 수 있습니다.
2. 강의 영상의 저작권은 사이트에 있으며, 무단 복제 및 배포를 금지합니다.
3. 회원은 타인에게 계정을 공유하거나 양도할 수 없습니다.

제5조 (환불 정책)
1. 결제 후 7일 이내, 강의 진도율 10% 미만일 경우 전액 환불이 가능합니다.
2. 위 조건을 초과할 경우 환불이 제한될 수 있습니다.
3. 환불 요청은 고객센터를 통해 접수해주세요.

제6조 (면책조항)
1. 사이트는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.
2. 회원의 귀책사유로 인한 손해에 대해 사이트는 책임을 지지 않습니다.

제7조 (분쟁 해결)
본 약관과 관련된 분쟁은 대한민국 법률에 따라 해결하며, 관할 법원은 서울중앙지방법원으로 합니다.

[부칙]
본 약관은 2025년 1월 1일부터 시행합니다.

문의: 고객센터 이메일로 연락주세요.`,
  privacyPolicy: `[개인정보처리방침]

1. 개인정보의 수집 및 이용 목적
당사는 다음의 목적을 위해 개인정보를 수집합니다:
- 회원 가입 및 관리
- 서비스 제공 및 결제 처리
- 고객 상담 및 불만 처리
- 마케팅 및 이벤트 정보 제공 (선택 동의 시)

2. 수집하는 개인정보 항목
- 필수: 이름, 이메일 주소, 비밀번호
- 선택: 전화번호, 프로필 사진

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.
- 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
  · 계약 또는 청약철회 기록: 5년
  · 결제 및 재화 공급 기록: 5년
  · 소비자 불만 처리 기록: 3년

4. 개인정보의 제3자 제공
당사는 원칙적으로 개인정보를 제3자에게 제공하지 않습니다.
단, 다음의 경우에는 예외로 합니다:
- 이용자가 사전에 동의한 경우
- 법령에 따른 요청이 있는 경우

5. 개인정보의 처리 위탁
서비스 향상을 위해 다음과 같이 개인정보 처리를 위탁합니다:
- 결제 처리: 토스페이먼츠 등 결제 대행사
- 이메일 발송: 메일 발송 서비스 제공업체

6. 이용자의 권리
이용자는 언제든지 다음 권리를 행사할 수 있습니다:
- 개인정보 열람, 수정, 삭제 요청
- 개인정보 처리 정지 요청
- 회원 탈퇴 요청

7. 개인정보의 파기
개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우, 해당 정보를 지체 없이 파기합니다.

8. 개인정보 보호책임자
- 성명: 개인정보관리담당자
- 이메일: 고객센터 이메일 참조
- 개인정보 관련 문의사항은 위 연락처로 문의해주세요.

9. 개인정보처리방침 변경
본 방침은 시행일로부터 적용되며, 변경 시 7일 전에 공지합니다.

시행일: 2025년 1월 1일`,
  csEmail: "support@mystictarot.kr",
  csPhone: "02-1234-5678",
  csAddress: "서울시 강남구",
  curriculum: [
    {
      id: "1",
      title: "1단계: 타로의 기초",
      description: "메이저 아르카나 22장의 의미와 상징 체계를 깊이 있게 학습합니다.",
      duration: "4주",
      isPreview: true,
      previewVideoUrl: "",
      lessons: [
        { id: "1-1", title: "타로 카드의 역사와 구성", duration: "15분", isPreview: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { id: "1-2", title: "메이저 아르카나 개요", duration: "20분", isPreview: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { id: "1-3", title: "0번 바보~10번 운명의 수레바퀴", duration: "45분", isPreview: false },
        { id: "1-4", title: "11번 정의~21번 세계", duration: "45분", isPreview: false },
      ]
    },
    {
      id: "2",
      title: "2단계: 마이너 아르카나",
      description: "56장의 마이너 카드와 4가지 슈트의 에너지를 이해합니다.",
      duration: "4주",
      isPreview: false,
      lessons: [
        { id: "2-1", title: "슈트의 이해: 완드, 컵, 소드, 펜타클", duration: "30분", isPreview: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { id: "2-2", title: "숫자 카드 1~10 해석법", duration: "40분", isPreview: false },
        { id: "2-3", title: "코트 카드: 페이지, 나이트, 퀸, 킹", duration: "35분", isPreview: false },
      ]
    },
    {
      id: "3",
      title: "3단계: 스프레드 실전",
      description: "다양한 스프레드 기법과 실제 리딩 연습을 진행합니다.",
      duration: "3주",
      isPreview: false,
      lessons: [
        { id: "3-1", title: "원카드 & 쓰리카드 스프레드", duration: "25분", isPreview: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { id: "3-2", title: "켈틱 크로스 스프레드", duration: "40분", isPreview: false },
        { id: "3-3", title: "실전 리딩 연습", duration: "50분", isPreview: false },
      ]
    },
    {
      id: "4",
      title: "4단계: 심화 & 비즈니스",
      description: "전문 리더로서의 역량 강화와 비즈니스 운영 방법을 배웁니다.",
      duration: "3주",
      isPreview: false,
      lessons: [
        { id: "4-1", title: "직관력 강화 훈련", duration: "30분", isPreview: false },
        { id: "4-2", title: "상담 윤리와 커뮤니케이션", duration: "25분", isPreview: false },
        { id: "4-3", title: "타로 비즈니스 운영 전략", duration: "35분", isPreview: false },
      ]
    }
  ],
  events: [
    {
      id: "1",
      title: "🔮 무료 타로 입문 웨비나",
      description: "타로의 세계로 첫 발을 내딛는 분들을 위한 무료 온라인 세션. 기초 개념과 첫 리딩 체험을 제공합니다.",
      date: "2025-02-01",
      status: "ongoing",
      spots: 50,
      imageUrl: "",
      totalCapacity: 50,
      startTime: "2026-02-01T19:00:00"
    },
    {
      id: "2",
      title: "✨ VIP 1:1 멘토링 프로그램",
      description: "이하늘 교수와 함께하는 프라이빗 멘토링. 개인 맞춤형 피드백과 심화 학습을 경험하세요.",
      date: "2025-02-20",
      status: "upcoming",
      spots: 5,
      imageUrl: "",
      totalCapacity: 10,
      startTime: "2026-02-20T14:00:00"
    }
  ],
  testimonials: [
    {
      id: "1",
      name: "박지현",
      role: "직장인 / 수강 6개월",
      content: "이 강의를 듣고 제 삶이 정말 많이 바뀌었어요. 타로를 통해 저 자신을 더 깊이 이해하게 되었고, 지금은 부업으로 리딩도 하고 있어요. 정말 감사합니다!",
      rating: 5,
    },
    {
      id: "2",
      name: "김민수",
      role: "프리랜서 / 수강 1년",
      content: "체계적인 커리큘럼과 이하늘 교수님의 따뜻한 피드백 덕분에 전문 리더로 성장할 수 있었습니다. 월 수입이 300만원을 넘었어요!",
      rating: 5,
    },
    {
      id: "3",
      name: "이서연",
      role: "주부 / 수강 3개월",
      content: "처음에는 반신반의했는데, 지금은 친구들에게 리딩해주는 게 제 취미가 됐어요. 이렇게 쉽게 배울 수 있을 줄 몰랐습니다.",
      rating: 5,
    },
  ]
};

const STORAGE_KEY = 'tarot-site-settings';
const STORAGE_VERSION = 'v3'; // Increment to reset localStorage with new defaults (v3: added legal docs)
const VERSION_KEY = 'tarot-site-version';

export const getSettings = (): SiteSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  // Check version - if outdated, clear and use defaults
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== STORAGE_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    return defaultSettings;
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Partial<SiteSettings>): void => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

import { supabase } from '@/integrations/supabase/client';

export const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_pin')
      .maybeSingle();
    
    console.log('PIN verification - Data:', data, 'Error:', error);
    
    if (error) {
      console.error('PIN verification error:', error);
      // Fallback to default PIN if database fails
      return pin === '1234';
    }
    
    if (!data) {
      // No PIN in database, use default
      return pin === '1234';
    }
    
    return pin === data.value;
  } catch (err) {
    console.error('PIN verification exception:', err);
    // Fallback to default PIN on any error
    return pin === '1234';
  }
};

export const updateAdminPin = async (newPin: string): Promise<boolean> => {
  const { error } = await supabase
    .from('admin_settings')
    .update({ value: newPin })
    .eq('key', 'admin_pin');
  
  if (error) {
    console.error('Failed to update PIN:', error);
    return false;
  }
  
  return true;
};
