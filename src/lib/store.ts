// Simple state management for site settings
export interface SiteSettings {
  siteName: string;
  webinarDate: string;
  remainingSeats: number;
  adminPin: string;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  price: string;
  originalPrice: string;
  curriculum: CurriculumItem[];
  events: EventItem[];
}

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  spots: number;
}

const defaultSettings: SiteSettings = {
  siteName: "Mystic Tarot Academy",
  webinarDate: "2025-02-15T19:00:00",
  remainingSeats: 23,
  adminPin: "1234",
  instructorName: "이하늘 교수",
  instructorTitle: "타로 마스터 & 심리상담사",
  instructorBio: "15년 이상의 타로 리딩 경력을 가진 전문가로, 심리학 박사 학위를 보유하고 있습니다. 수천 명의 수강생을 배출하며 타로를 통한 자기 이해와 성장을 돕고 있습니다.",
  price: "₩490,000",
  originalPrice: "₩890,000",
  curriculum: [
    {
      id: "1",
      title: "1단계: 타로의 기초",
      description: "메이저 아르카나 22장의 의미와 상징 체계를 깊이 있게 학습합니다.",
      duration: "4주"
    },
    {
      id: "2",
      title: "2단계: 마이너 아르카나",
      description: "56장의 마이너 카드와 4가지 슈트의 에너지를 이해합니다.",
      duration: "4주"
    },
    {
      id: "3",
      title: "3단계: 스프레드 실전",
      description: "다양한 스프레드 기법과 실제 리딩 연습을 진행합니다.",
      duration: "3주"
    },
    {
      id: "4",
      title: "4단계: 심화 & 비즈니스",
      description: "전문 리더로서의 역량 강화와 비즈니스 운영 방법을 배웁니다.",
      duration: "3주"
    }
  ],
  events: [
    {
      id: "1",
      title: "🔮 무료 타로 입문 웨비나",
      description: "타로의 세계로 첫 발을 내딛는 분들을 위한 무료 온라인 세션. 기초 개념과 첫 리딩 체험을 제공합니다.",
      date: "2025-02-01",
      status: "ongoing",
      spots: 50
    },
    {
      id: "2",
      title: "✨ VIP 1:1 멘토링 프로그램",
      description: "이하늘 교수와 함께하는 프라이빗 멘토링. 개인 맞춤형 피드백과 심화 학습을 경험하세요.",
      date: "2025-02-20",
      status: "upcoming",
      spots: 5
    }
  ]
};

const STORAGE_KEY = 'tarot-site-settings';

export const getSettings = (): SiteSettings => {
  if (typeof window === 'undefined') return defaultSettings;
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

export const verifyPin = (pin: string): boolean => {
  const settings = getSettings();
  return pin === settings.adminPin;
};
