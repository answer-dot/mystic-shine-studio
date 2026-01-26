import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Course {
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
  curriculum: unknown[];
  features: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: Record<string, unknown>;
  completed_at: string | null;
}

export const useCourses = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all published courses
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch featured course
  const { data: featuredCourse } = useQuery({
    queryKey: ['featured_course'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Course | null;
    },
  });

  // Fetch user's enrollments
  const { data: enrollments } = useQuery({
    queryKey: ['user_courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserCourse[];
    },
    enabled: !!user?.id,
  });

  // Enroll in a course
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_courses', user?.id] });
    },
  });

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: string) => {
    return enrollments?.some(e => e.course_id === courseId) || false;
  };

  return {
    courses,
    featuredCourse,
    enrollments,
    isLoading,
    error,
    enroll: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
    isEnrolled,
  };
};
