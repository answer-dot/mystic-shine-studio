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

export const usePrimaryCourse = () => {
  const { data: primaryCourse, isLoading, error, refetch } = useQuery({
    queryKey: ['primary_course'],
    queryFn: async () => {
      // Fetch the course marked as featured (primary)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Fallback: get the first published course if no featured one exists
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        if (fallbackError) throw fallbackError;
        
        if (!fallbackData) return null;
        
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
    },
  });

  return {
    primaryCourse,
    isLoading,
    error,
    refetch,
  };
};
