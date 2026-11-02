import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * Supabase Client Integration — CampusCare Lite
 * ============================================================================
 * Reads public client credentials from Vite environment variables:
 *  - VITE_SUPABASE_URL: Your project URL (e.g. https://xyzcompany.supabase.co)
 *  - VITE_SUPABASE_PUBLISHABLE_KEY: Your project publishable/anon public API key
 *
 * NOTE: Never expose your service_role or secret keys in client-side code.
 */

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Automatically sanitize URL to ensure clean root project URL without /rest/v1 or trailing slashes
const envUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const envKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

/**
 * Verifies whether the required Supabase environment variables are present
 * and do not contain sample placeholder values.
 */
export const isSupabaseConfigured: boolean = Boolean(
  envUrl &&
  envKey &&
  envUrl !== 'https://your-project-id.supabase.co' &&
  envKey !== 'your-publishable-or-anon-key'
);

/**
 * Returns configuration diagnostics for runtime inspection and error reporting.
 */
export const getSupabaseConfigStatus = (): {
  configured: boolean;
  missingVariables: string[];
} => {
  const missing: string[] = [];

  if (!envUrl || envUrl === 'https://your-project-id.supabase.co') {
    missing.push('VITE_SUPABASE_URL');
  }

  if (!envKey || envKey === 'your-publishable-or-anon-key') {
    missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  return {
    configured: missing.length === 0,
    missingVariables: missing,
  };
};

// Helpful console warning during development when variables are not yet populated
if (!isSupabaseConfigured) {
  const { missingVariables } = getSupabaseConfigStatus();
  console.warn(
    `[CampusCare Lite] Supabase environment variables are missing or set to defaults: ${missingVariables.join(', ')}.\n` +
    `To connect to your database, create a local .env or .env.local file with your credentials:\n` +
    `  VITE_SUPABASE_URL=https://your-project.supabase.co\n` +
    `  VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key`
  );
}

/**
 * Reusable Supabase client instance.
 * If credentials are not yet configured in .env, falls back to a non-crashing
 * placeholder URL so module imports and production builds succeed cleanly.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(envUrl!, envKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder-project.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
