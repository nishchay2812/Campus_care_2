-- ============================================================================
-- Supabase Migration: Secure Student Complaint Tracking RPC Function
-- File: supabase/migrations/track_complaint.sql
-- ============================================================================
-- Purpose:
-- Allows students to verify the current status of their submitted complaint
-- by providing both their unique Complaint Reference ID and their registered email.
--
-- Security Features:
-- 1. SECURITY DEFINER: Executes with definer privileges so public/anon students
--    do NOT need direct SELECT permissions on the public.complaints table.
-- 2. SET search_path = '': Protects against search-path injection vulnerabilities.
-- 3. Input Sanitization: Trims whitespace and prevents empty or null arguments.
-- 4. Case-Insensitive Matching: Handles case variances in both Complaint ID and Email.
-- 5. Privacy Safeguard: Excludes student_name, student email, and full description
--    from the returned payload, preventing enumeration or data leakage.
-- 6. Rate/Access Limit: Limits query result to at most 1 matching record.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_complaint(
  p_complaint_id TEXT,
  p_email TEXT
)
RETURNS TABLE (
  complaint_id TEXT,
  category TEXT,
  location TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_clean_complaint_id TEXT;
  v_clean_email TEXT;
BEGIN
  -- Trim inputs and safeguard against NULL
  v_clean_complaint_id := TRIM(COALESCE(p_complaint_id, ''));
  v_clean_email := TRIM(COALESCE(p_email, ''));

  -- Reject empty or whitespace-only inputs immediately
  IF v_clean_complaint_id = '' OR v_clean_email = '' THEN
    RETURN;
  END IF;

  -- Query complaints matching both fields case-insensitively
  RETURN QUERY
  SELECT
    c.complaint_id,
    c.category,
    c.location,
    c.status,
    c.created_at
  FROM public.complaints c
  WHERE LOWER(TRIM(c.complaint_id)) = LOWER(v_clean_complaint_id)
    AND LOWER(TRIM(c.email)) = LOWER(v_clean_email)
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$;

-- Revoke execute from public role to prevent unintended privilege escalation
REVOKE EXECUTE ON FUNCTION public.track_complaint(TEXT, TEXT) FROM PUBLIC;

-- Explicitly grant execute permission to anon (public students) and authenticated users
GRANT EXECUTE ON FUNCTION public.track_complaint(TEXT, TEXT) TO anon, authenticated;
