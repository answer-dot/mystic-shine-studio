import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useCourseMaterials = (courseId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch materials for a specific course
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['course_materials', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as CourseMaterial[];
    },
    enabled: !!courseId && !!user,
  });

  // Upload material mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      courseId,
      title,
      description,
      file,
    }: {
      courseId: string;
      title: string;
      description?: string;
      file: File;
    }) => {
      // Generate unique filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const filename = `${courseId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filename);

      // Insert record into course_materials table
      const { data, error } = await supabase
        .from('course_materials')
        .insert({
          course_id: courseId,
          title,
          description: description || null,
          file_url: publicUrl,
          file_type: ext,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_materials'] });
      queryClient.invalidateQueries({ queryKey: ['admin_course_materials'] });
    },
  });

  // Delete material mutation
  const deleteMutation = useMutation({
    mutationFn: async (materialId: string) => {
      // First get the material to find the file path
      const { data: material, error: fetchError } = await supabase
        .from('course_materials')
        .select('file_url')
        .eq('id', materialId)
        .single();

      if (fetchError) throw fetchError;

      // Extract the path from the URL
      if (material?.file_url) {
        const url = new URL(material.file_url);
        const path = url.pathname.split('/course-materials/')[1];
        if (path) {
          await supabase.storage.from('course-materials').remove([path]);
        }
      }

      // Delete the record
      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_materials'] });
      queryClient.invalidateQueries({ queryKey: ['admin_course_materials'] });
    },
  });

  // Update material mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
    }: {
      id: string;
      title: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('course_materials')
        .update({ title, description: description || null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_materials'] });
      queryClient.invalidateQueries({ queryKey: ['admin_course_materials'] });
    },
  });

  return {
    materials,
    isLoading,
    error,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteMaterial: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateMaterial: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

// Admin hook to fetch all materials
export const useAdminCourseMaterials = () => {
  return useQuery({
    queryKey: ['admin_course_materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*, courses(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
