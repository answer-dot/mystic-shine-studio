import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CurriculumLesson {
  id: string;
  title: string;
  duration: string;
  isPreview?: boolean;
  videoUrl?: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPreview?: boolean;
  lessons?: CurriculumLesson[];
}

export interface PrimaryCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  price: string;
  original_price: string | null;
  duration: string;
  is_featured: boolean;
  is_published: boolean;
  curriculum: CurriculumItem[];
  features: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Default course data for fallback
const DEFAULT_COURSE: PrimaryCourse = {
  id: 'default',
  title: '타로 마스터 과정',
  slug: 'tarot-master',
  description: '타로의 신비로운 세계에 입문하세요. 15년 경력의 마스터가 직접 전수하는 체계적인 커리큘럼으로 전문 리더로 성장하세요.',
  short_description: '14주 만에 전문 타로 리더가 되세요',
  image_url: null,
  price: '₩490,000',
  original_price: '₩890,000',
  duration: '14주',
  is_featured: true,
  is_published: true,
  curriculum: [],
  features: [],
  order_index: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const usePrimaryCourse = () => {
  const { data: primaryCourse, isLoading, error, refetch } = useQuery({
    queryKey: ['primary_course'],
    queryFn: async (): Promise<PrimaryCourse> => {
      try {
        // Fetch the course marked as featured (primary)
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .eq('is_featured', true)
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching primary course:', error);
          return DEFAULT_COURSE;
        }
        
        if (!data) {
          // Fallback: get the first published course if no featured one exists
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('order_index', { ascending: true })
            .limit(1)
            .maybeSingle();
          
          if (fallbackError) {
            console.error('Error fetching fallback course:', fallbackError);
            return DEFAULT_COURSE;
          }
          
          if (!fallbackData) {
            return DEFAULT_COURSE;
          }
          
          return {
            ...fallbackData,
            curriculum: (fallbackData.curriculum || []) as unknown as CurriculumItem[],
            features: (fallbackData.features || []) as unknown as string[],
          } as PrimaryCourse;
        }
        
        return {
          ...data,
          curriculum: (data.curriculum || []) as unknown as CurriculumItem[],
          features: (data.features || []) as unknown as string[],
        } as PrimaryCourse;
      } catch (error) {
        console.error('Unexpected error in usePrimaryCourse:', error);
        return DEFAULT_COURSE;
      }
    },
    // Never throw - always return a valid course object
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    // Always return a valid course object to prevent null reference errors
    primaryCourse: primaryCourse || DEFAULT_COURSE,
    isLoading,
    error,
    refetch,
  };
};
