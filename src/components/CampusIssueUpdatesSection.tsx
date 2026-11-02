import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from '../router/RouterContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface StatusCounts {
  pending: number;
  inProgress: number;
  resolved: number;
}

export const CampusIssueUpdatesSection: React.FC = () => {
  const [counts, setCounts] = useState<StatusCounts>({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatusCounts = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // Safe fallback when Supabase credentials are not populated in environment
        setCounts({ pending: 0, inProgress: 0, resolved: 0 });
        setLastUpdated(new Date());
        return;
      }

      // Invoke secure database function public.get_complaint_status_counts
      // SECURITY DEFINER returns only aggregate numbers, strictly zero PII
      const { data, error: rpcError } = await supabase.rpc('get_complaint_status_counts');

      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to fetch campus issue statistics.');
      }

      // Handle table/record return structure from Supabase RPC
      interface StatusCountRow {
        pending_count?: number | string | null;
        in_progress_count?: number | string | null;
        resolved_count?: number | string | null;
        pending?: number | string | null;
        in_progress?: number | string | null;
        resolved?: number | string | null;
      }

      const row: StatusCountRow | undefined = Array.isArray(data) ? data[0] : (data as StatusCountRow | undefined);

      const parsedPending = Math.max(0, Number(row?.pending_count ?? row?.pending ?? 0) || 0);
      const parsedInProgress = Math.max(0, Number(row?.in_progress_count ?? row?.in_progress ?? 0) || 0);
      const parsedResolved = Math.max(0, Number(row?.resolved_count ?? row?.resolved ?? 0) || 0);

      setCounts({
        pending: parsedPending,
        inProgress: parsedInProgress,
        resolved: parsedResolved,
      });
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('Error fetching campus issue updates:', err);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Unable to retrieve live complaint updates from the database.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatusCounts(false);
  }, [fetchStatusCounts]);

  const totalComplaints = counts.pending + counts.inProgress + counts.resolved;
  const isZeroData = !isLoading && !error && totalComplaints === 0;

  return (
    <section id="campus-updates" className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            {/* Live Indicator Kicker */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Live Campus Transparency</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Issue Updates
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real-time aggregated counts from our campus complaints desk. See how maintenance teams are responding to reports across all facilities.
            </p>
          </div>

          {/* Quick Refresh & Last Updated Timestamp */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            {lastUpdated && !isLoading && (
              <span className="text-[11px] text-slate-500 font-medium">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            
            <button
              type="button"
              onClick={() => fetchStatusCounts(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Refresh live campus metrics"
              aria-label="Refresh complaint statistics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            STATE 1: ERROR STATE
            ========================================================================= */}
        {error && !isLoading && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 text-red-900">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-red-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold">Unable to load live issue counts</p>
                <p className="text-xs text-red-700/90 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchStatusCounts(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 2: ZERO-DATA STATE BANNER
            ========================================================================= */}
        {isZeroData && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-4.5 flex items-center gap-3 text-emerald-900 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">All campus facilities operational</p>
              <p className="text-xs text-emerald-700/90 mt-0.5">
                No active complaints have been logged in the system yet. If you spot a maintenance defect, submit a report to alert the administration.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: LOADING SKELETONS
            ========================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                  </div>
                  <div className="h-9 w-20 bg-slate-200 rounded my-2" />
                  <div className="h-3.5 w-3/4 bg-slate-100 rounded mt-2" />
                  <div className="h-3.5 w-1/2 bg-slate-100 rounded mt-1.5" />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* =========================================================================
              STATE 4: THREE LIVE STATISTIC CARDS (Pending, In Progress, Resolved)
              ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* 1. Pending Complaints Card */}
            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/50 via-white to-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Pending Complaints
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-amber-950 tracking-tight tabular-nums mt-1">
                  {counts.pending}
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Issues submitted and currently awaiting verification, prioritization, and technician assignment.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-100/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Queue Status
                </span>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <span>Submit report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. In Progress Complaints Card */}
            <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/50 via-white to-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    In Progress Complaints
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <RotateCw className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight tabular-nums mt-1">
                  {counts.inProgress}
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tickets dispatched to campus technicians and currently undergoing repair on site.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-100/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-800 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Active Repairs
                </span>
                <Link
                  to="/track-complaint"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <span>Track status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Resolved Complaints Card */}
            <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 via-white to-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Resolved Complaints
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight tabular-nums mt-1">
                  {counts.resolved}
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Campus facility issues successfully inspected, repaired, and closed by maintenance teams.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-100/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Verified Fixed
                </span>
                <span className="text-[11px] text-slate-400">All campus blocks</span>
              </div>
            </div>

          </div>
        )}

        {/* Privacy & Aggregation Assurance Footer Notice */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-500 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Public aggregate counts only · Student identity and complaint descriptions remain strictly private.</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium shrink-0">
            <Link to="/track-complaint" className="text-slate-600 hover:text-emerald-700 transition-colors">
              Track your complaint
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/report" className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors">
              Report an Issue
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
