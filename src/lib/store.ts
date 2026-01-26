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
      duration: "4주",
      isPreview: true,
      previewVideoUrl: "",
      lessons: [
        { id: "1-1", title: "타로 카드의 역사와 구성", duration: "15분", isPreview: true, videoUrl: "" },
        { id: "1-2", title: "메이저 아르카나 개요", duration: "20분", isPreview: true, videoUrl: "" },
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
        { id: "2-1", title: "슈트의 이해: 완드, 컵, 소드, 펜타클", duration: "30분", isPreview: true, videoUrl: "" },
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
        { id: "3-1", title: "원카드 & 쓰리카드 스프레드", duration: "25분", isPreview: true, videoUrl: "" },
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
