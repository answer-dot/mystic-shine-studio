import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
}

interface ProgressData {
  completedLessons: string[];
  lastWatchedLessonId?: string;
  certificateIssued?: boolean;
  certificateIssuedAt?: string;
}

export const useCourseProgress = (courseId: string, curriculum: Chapter[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Calculate total lessons from curriculum
  const totalLessons = curriculum.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);

  // Fetch progress from database
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['course_progress', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id || !courseId) return null;
      
      const { data, error } = await supabase
        .from('user_courses')
        .select('progress, completed_at')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!courseId,
  });

  // Parse progress data safely
  const rawProgress = progressData?.progress;
  const progress: ProgressData = rawProgress && typeof rawProgress === 'object' && !Array.isArray(rawProgress)
    ? {
        completedLessons: Array.isArray((rawProgress as Record<string, unknown>).completedLessons) 
          ? ((rawProgress as Record<string, unknown>).completedLessons as string[]) 
          : [],
        lastWatchedLessonId: (rawProgress as Record<string, unknown>).lastWatchedLessonId as string | undefined,
        certificateIssued: (rawProgress as Record<string, unknown>).certificateIssued as boolean | undefined,
        certificateIssuedAt: (rawProgress as Record<string, unknown>).certificateIssuedAt as string | undefined,
      }
    : { completedLessons: [] };
  const completedLessons = new Set<string>(progress.completedLessons || []);
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = progressPercentage === 100;
  const certificateIssued = progress.certificateIssued || false;
  const certificateIssuedAt = progress.certificateIssuedAt;

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: ProgressData) => {
      if (!user?.id || !courseId) throw new Error('User or course not found');
      
      const isNowCompleted = totalLessons > 0 && newProgress.completedLessons.length === totalLessons;
      
      // Convert to JSON-compatible format
      const progressJson = {
        completedLessons: newProgress.completedLessons,
        lastWatchedLessonId: newProgress.lastWatchedLessonId,
        certificateIssued: newProgress.certificateIssued,
        certificateIssuedAt: newProgress.certificateIssuedAt,
      };
      
      const { error } = await supabase
        .from('user_courses')
        .update({
          progress: progressJson,
          completed_at: isNowCompleted ? new Date().toISOString() : null,
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_progress', user?.id, courseId] });
      queryClient.invalidateQueries({ queryKey: ['user_courses', user?.id] });
    },
  });

  // Mark lesson as complete
  const markLessonComplete = useCallback((lessonId: string) => {
    const newCompletedLessons = [...(progress.completedLessons || [])];
    if (!newCompletedLessons.includes(lessonId)) {
      newCompletedLessons.push(lessonId);
    }
    
    updateProgressMutation.mutate({
      ...progress,
      completedLessons: newCompletedLessons,
      lastWatchedLessonId: lessonId,
    });
  }, [progress, updateProgressMutation]);

  // Toggle lesson completion
  const toggleLessonComplete = useCallback((lessonId: string) => {
    const newCompletedLessons = [...(progress.completedLessons || [])];
    const index = newCompletedLessons.indexOf(lessonId);
    
    if (index > -1) {
      newCompletedLessons.splice(index, 1);
    } else {
      newCompletedLessons.push(lessonId);
    }
    
    updateProgressMutation.mutate({
      ...progress,
      completedLessons: newCompletedLessons,
      lastWatchedLessonId: lessonId,
    });
  }, [progress, updateProgressMutation]);

  // Issue certificate
  const issueCertificate = useCallback(() => {
    if (!isCompleted) return;
    
    updateProgressMutation.mutate({
      ...progress,
      certificateIssued: true,
      certificateIssuedAt: new Date().toISOString(),
    });
  }, [progress, isCompleted, updateProgressMutation]);

  // Get first incomplete lesson (for "Continue Learning" button)
  const getNextLesson = useCallback(() => {
    for (const chapter of curriculum) {
      for (const lesson of chapter.lessons || []) {
        if (!completedLessons.has(lesson.id)) {
          return { chapterId: chapter.id, lessonId: lesson.id, lessonTitle: lesson.title };
        }
      }
    }
    return null;
  }, [curriculum, completedLessons]);

  return {
    completedLessons,
    completedCount,
    totalLessons,
    progressPercentage,
    isCompleted,
    certificateIssued,
    certificateIssuedAt,
    isLoading,
    markLessonComplete,
    toggleLessonComplete,
    issueCertificate,
    getNextLesson,
    lastWatchedLessonId: progress.lastWatchedLessonId,
  };
};

// Admin hook to manage student progress
export const useAdminCourseProgress = () => {
  const queryClient = useQueryClient();

  // Reset student progress
  const resetProgressMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { error } = await supabase
        .from('user_courses')
        .update({
          progress: { completedLessons: [], certificateIssued: false },
          completed_at: null,
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_courses'] });
      queryClient.invalidateQueries({ queryKey: ['course_progress'] });
    },
  });

  return {
    resetProgress: resetProgressMutation.mutate,
    isResetting: resetProgressMutation.isPending,
  };
};
