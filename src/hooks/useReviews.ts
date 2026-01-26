import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  course_id: string | null;
  rating: number;
  content: string;
  photo_url: string | null;
  is_approved: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
  course_title?: string;
}

export interface Coupon {
  id: string;
  user_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  reason: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

// Generate a unique coupon code
const generateCouponCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REVIEW-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Hook for fetching approved reviews (for front-end display)
export const useApprovedReviews = () => {
  return useQuery({
    queryKey: ['approved-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });
};

// Hook for fetching all reviews (for admin)
export const useAllReviews = () => {
  return useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });
};

// Hook for fetching user's own reviews
export const useUserReviews = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!userId,
  });
};

// Hook for fetching user's coupons
export const useUserCoupons = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-coupons', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!userId,
  });
};

// Hook for submitting a new review
export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      courseId,
      rating,
      content,
      photoUrl,
    }: {
      userId: string;
      courseId?: string;
      rating: number;
      content: string;
      photoUrl?: string;
    }) => {
      // Insert the review
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          course_id: courseId || null,
          rating,
          content,
          photo_url: photoUrl || null,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Create a reward coupon for the user
      const couponCode = generateCouponCode();
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .insert({
          user_id: userId,
          code: couponCode,
          discount_type: 'percentage',
          discount_value: 10,
          reason: 'review_reward',
        })
        .select()
        .single();

      if (couponError) {
        console.error('Failed to create coupon:', couponError);
        // Don't throw - review was still created
      }

      return { review, coupon };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['approved-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-coupons'] });
      
      toast({
        title: '후기가 등록되었습니다!',
        description: data.coupon 
          ? `감사 쿠폰이 발급되었습니다: ${data.coupon.code}` 
          : '관리자 승인 후 공개됩니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '후기 등록 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
      console.error('Review submission error:', error);
    },
  });
};

// Hook for admin to update review status
export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      reviewId,
      isApproved,
      isHidden,
    }: {
      reviewId: string;
      isApproved?: boolean;
      isHidden?: boolean;
    }) => {
      const updates: Partial<Review> = {};
      if (isApproved !== undefined) updates.is_approved = isApproved;
      if (isHidden !== undefined) updates.is_hidden = isHidden;

      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['approved-reviews'] });
      toast({
        title: '상태가 변경되었습니다',
      });
    },
    onError: (error) => {
      toast({
        title: '상태 변경 실패',
        variant: 'destructive',
      });
      console.error('Review status update error:', error);
    },
  });
};

// Hook for counting new (unapproved) reviews
export const useNewReviewsCount = () => {
  return useQuery({
    queryKey: ['new-reviews-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .eq('is_hidden', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
