-- ============================================================================
-- Supabase Migration: Secure Public Aggregate Complaint Status Counts RPC
-- File: supabase/migrations/get_complaint_status_counts.sql
-- ============================================================================
-- Purpose:
-- Provides public, aggregated statistics for the "Campus Issue Updates" section
-- on the CampusCare Lite homepage.
--
-- Security & Privacy Guarantees:
-- 1. SECURITY DEFINER: Executes with function definer privileges so anonymous
--    and authenticated public visitors do NOT need direct SELECT access to
--    the sensitive public.complaints table.
-- 2. SET search_path = '': Protects against search-path injection attacks.
-- 3. Strict Aggregate Only: Returns ONLY aggregate counts (pending_count,
--    in_progress_count, resolved_count). Absolutely zero student names,
--    emails, locations, descriptions, or individual records are exposed.
-- 4. No Public SELECT Policy: Keeps public.complaints strictly protected by RLS;
--    public users cannot read records from public.complaints.
-- 5. Explicit Permissions: Revokes EXECUTE from PUBLIC role, and explicitly
--    grants EXECUTE only to anon and authenticated roles.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_complaint_status_counts()
RETURNS TABLE (
  pending_count BIGINT,
  in_progress_count BIGINT,
  resolved_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE LOWER(TRIM(c.status)) = 'pending'), 0)::BIGINT AS pending_count,
    COALESCE(COUNT(*) FILTER (WHERE LOWER(TRIM(c.status)) = 'in progress'), 0)::BIGINT AS in_progress_count,
    COALESCE(COUNT(*) FILTER (WHERE LOWER(TRIM(c.status)) = 'resolved'), 0)::BIGINT AS resolved_count
  FROM public.complaints c;
END;
$$;

-- Revoke execute from public role to prevent unintended privilege escalation
REVOKE EXECUTE ON FUNCTION public.get_complaint_status_counts() FROM PUBLIC;

-- Explicitly grant execute permission to anon (public visitors) and authenticated users
GRANT EXECUTE ON FUNCTION public.get_complaint_status_counts() TO anon, authenticated;
