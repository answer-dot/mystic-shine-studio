import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

const COOLDOWN_MS = 30 * 1000; // 30초 쿨다운
const DUPLICATE_BLOCK_MS = 10 * 60 * 1000; // 10분 중복 차단

interface SpamCheckResult {
  blocked: boolean;
  reason?: string;
}

interface SubmissionRecord {
  email: string;
  phone?: string;
  timestamp: number;
}

// localStorage 키
const LAST_SUBMIT_KEY = 'spam_last_submit';
const SUBMISSIONS_KEY = 'spam_submissions';

export const useSpamProtection = () => {
  const lastSubmitRef = useRef<number>(0);

  // 허니팟 체크: hidden 필드에 값이 있으면 봇으로 간주
  const checkHoneypot = useCallback((honeypotValue: string): boolean => {
    return honeypotValue.trim().length > 0;
  }, []);

  // 쿨다운 체크: 30초 내 연속 제출 차단
  const checkCooldown = useCallback((): boolean => {
    const now = Date.now();
    const lastSubmit = parseInt(localStorage.getItem(LAST_SUBMIT_KEY) || '0', 10);
    
    if (now - lastSubmit < COOLDOWN_MS) {
      return true; // 쿨다운 중
    }
    return false;
  }, []);

  // 중복 체크: 동일 이메일/전화로 10분 내 중복 제출 차단
  const checkDuplicate = useCallback((email: string, phone?: string): boolean => {
    const now = Date.now();
    const submissions: SubmissionRecord[] = JSON.parse(
      localStorage.getItem(SUBMISSIONS_KEY) || '[]'
    );

    // 10분 이내 제출 기록만 유지
    const recentSubmissions = submissions.filter(
      (s) => now - s.timestamp < DUPLICATE_BLOCK_MS
    );

    // 동일 이메일 또는 전화번호 체크
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone?.replace(/[^0-9]/g, '') || '';

    const isDuplicate = recentSubmissions.some((s) => {
      const matchEmail = s.email.toLowerCase().trim() === normalizedEmail;
      const matchPhone = normalizedPhone && s.phone?.replace(/[^0-9]/g, '') === normalizedPhone;
      return matchEmail || matchPhone;
    });

    return isDuplicate;
  }, []);

  // 제출 성공 시 기록 저장
  const recordSubmission = useCallback((email: string, phone?: string) => {
    const now = Date.now();
    
    // 마지막 제출 시간 저장
    localStorage.setItem(LAST_SUBMIT_KEY, now.toString());

    // 제출 기록 저장 (10분 이내 기록만 유지)
    const submissions: SubmissionRecord[] = JSON.parse(
      localStorage.getItem(SUBMISSIONS_KEY) || '[]'
    );
    
    const recentSubmissions = submissions.filter(
      (s) => now - s.timestamp < DUPLICATE_BLOCK_MS
    );
    
    recentSubmissions.push({
      email: email.toLowerCase().trim(),
      phone: phone?.replace(/[^0-9]/g, '') || undefined,
      timestamp: now,
    });

    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(recentSubmissions));
  }, []);

  // 통합 스팸 체크
  const validateSubmission = useCallback((
    honeypotValue: string,
    email: string,
    phone?: string
  ): SpamCheckResult => {
    // 1. 허니팟 체크
    if (checkHoneypot(honeypotValue)) {
      // 봇에게는 조용히 성공한 척
      return { blocked: true, reason: 'honeypot' };
    }

    // 2. 쿨다운 체크
    if (checkCooldown()) {
      toast.error('잠시 후 다시 시도해주세요.');
      return { blocked: true, reason: 'cooldown' };
    }

    // 3. 중복 체크
    if (checkDuplicate(email, phone)) {
      toast.error('이미 신청하셨습니다. 잠시 후 다시 시도해주세요.');
      return { blocked: true, reason: 'duplicate' };
    }

    return { blocked: false };
  }, [checkHoneypot, checkCooldown, checkDuplicate]);

  return {
    validateSubmission,
    recordSubmission,
  };
};
