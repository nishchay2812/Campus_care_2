# Implementation Plan: Resolve Authentication and Admin Access Issues

## 1. Problem Diagnosis & Root Causes
Based on code inspection of `AuthContext.tsx`, `supabase.ts`, and `AdminLoginPage.tsx`, the authentication problems stem from four key factors:

1. **Strict and Inflexible Role Verification (`app_metadata.role === 'admin'`)**:
   - In Supabase Auth, when accounts are registered or created in the Supabase Dashboard, custom claims are placed in `user_metadata` or omitted by default. `app_metadata` can only be populated via backend service-role API or direct SQL manipulation.
   - If a valid college staff member logs in without `app_metadata.role = 'admin'`, the app immediately signs them out and throws `"Unauthorized access: This account does not possess administrator privileges"`.
   - The app should inspect both `app_metadata.role` and `user_metadata.role` (including string and array formats), while providing a SQL migration to promote any registered user.

2. **Unconfigured Environment Variables in Preview / Development**:
   - In preview or local environments where `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are not yet set or remain placeholders, `isSupabaseConfigured` is `false`.
   - Attempting to log in throws `"Supabase authentication is not configured. Please check your environment variables."`, blocking testing of the admin dashboard.
   - Needs a smooth fallback allowing seamless demonstration/preview staff login when Supabase is not connected, without compromising live Supabase production authentication.

3. **`onAuthStateChange` and `signIn` Race Condition**:
   - When signing in, `signInWithPassword` returns a session and updates state. Simultaneously, `onAuthStateChange` fires and calls `handleSession`. If role checking is rigid or asynchronous claims lag, an unintended `signOut()` cascade occurs, causing an infinite redirect loop back to `/admin/login?unauthorized=true`.

4. **Actionable Feedback on Admin Login Screen**:
   - When unauthorized access occurs, the user receives no instructions on how to grant their account the admin role in Supabase.
   - Needs a clear, dismissible guide and an SQL migration snippet.

---

## 2. Proposed Changes

### A. Authentication Context (`src/context/AuthContext.tsx`)
1. **Flexible Role Verification**:
   - Check `app_metadata.role === 'admin'`, `user_metadata.role === 'admin'`, or role arrays (`['admin']`).
2. **Safe Sign-Out / Session Handling**:
   - Avoid race conditions during `signIn` and `onAuthStateChange`.
   - Preserve error messages accurately if credentials or permissions fail.
3. **Development / Demo Fallback Mode**:
   - If `!isSupabaseConfigured`, allow demo staff authentication (`admin@college.edu` / `admin123` or quick demo button) so the admin dashboard can be tested even before connecting remote Supabase credentials.
   - When `isSupabaseConfigured` is true, use authentic Supabase Auth with full session persistence.

### B. Admin Login UI (`src/pages/AdminLoginPage.tsx`)
1. **Environment & Role Diagnostics**:
   - Show a helpful, non-intrusive status badge if Supabase is connected or running in local preview mode.
   - If `!isSupabaseConfigured`, offer a convenient "Use Demo Admin Credentials" quick-fill button.
2. **Help & Role Grant Modal / Guidance**:
   - Expand "Need help signing in?" to provide the exact 1-line SQL snippet to run in the Supabase SQL Editor:
     ```sql
     UPDATE auth.users 
     SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb 
     WHERE email = '<your-email>';
     ```

### C. Supabase Admin Role Migration (`supabase/migrations/grant_admin_role.sql`)
1. Create a turnkey SQL migration file with:
   - Safe SQL function or query to promote any user email to `role = 'admin'` in `auth.users.raw_app_meta_data`.
   - Instructions for verifying the role in Supabase Auth.

---

## 3. Verification Plan
1. **Code Validation**:
   - Run `npx tsc --noEmit` to verify all TypeScript types and imports.
   - Run `npm run build` to confirm production Vite compilation.
2. **Functional Tests**:
   - Test login with valid admin role credentials.
   - Test login without credentials when Supabase is not configured (demo fallback).
   - Test sign-out and protected route redirect from `/admin/dashboard`.
   - Verify non-admin account rejection message and diagnostic instructions.
