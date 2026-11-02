-- ============================================================================
-- Supabase Migration: Restricted Admin Complaint Deletion Policy
-- File: supabase/migrations/restricted_complaint_deletion.sql
-- ============================================================================
-- Purpose:
-- Enforces the security rule that an administrator can permanently delete a
-- complaint record ONLY when its status is exactly 'Resolved'.
--
-- Security Guarantees:
-- 1. Dual Requirement:
--    - Requester must be an authenticated admin: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
--    - The target complaint's status must be 'Resolved'
-- 2. Deletion Blocked for Active Issues:
--    - Any complaint with status 'Pending' or 'In Progress' CANNOT be deleted.
-- 3. Anonymous/Public Blocked:
--    - Public (anon) users have zero DELETE privileges.
-- 4. Safe Replacement of Existing DELETE Policies:
--    - Dynamically queries pg_policies to safely drop all prior DELETE policies
--      on public.complaints regardless of past naming conventions, preventing any
--      permissive residual policy from remaining active.
-- 5. Non-Destructive to Other Policies:
--    - Does NOT touch or weaken existing INSERT, SELECT, or UPDATE policies.
-- ============================================================================

-- Step 1: Ensure Row Level Security is enabled on public.complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Step 2: Dynamically inspect and safely drop all existing DELETE policies
-- on public.complaints so no permissive policies remain.
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'complaints'
          AND cmd = 'DELETE'
    ) LOOP
        RAISE NOTICE 'Dropping existing DELETE policy: %', pol.policyname;
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.complaints;', pol.policyname);
    END LOOP;
END $$;

-- Explicitly drop known convention names as fallback safety
DROP POLICY IF EXISTS "Admins can delete complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can only delete resolved complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow admin delete" ON public.complaints;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.complaints;

-- Step 3: Create the single, authoritative restricted DELETE policy
CREATE POLICY "Admins can only delete resolved complaints"
ON public.complaints
FOR DELETE
TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  AND status = 'Resolved'
);

-- Step 4: Verification Queries
-- Run these queries in the Supabase SQL Editor to verify the policy is active:
--
-- 1. Inspect all active policies on public.complaints:
-- SELECT
--   policyname,
--   cmd,
--   roles,
--   qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename = 'complaints'
-- ORDER BY cmd, policyname;
--
-- Expected for DELETE:
-- policyname: "Admins can only delete resolved complaints"
-- cmd: DELETE
-- roles: {authenticated}
-- qual: (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text) AND (status = 'Resolved'::text)
