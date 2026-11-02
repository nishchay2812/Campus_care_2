import React, { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Hash,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Check,
  Copy,
  Clock,
  RotateCw,
  CheckCircle2,
  MapPin,
  Tag,
  Calendar,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { StatusBadge } from '../components/StatusBadge';
import { Link, useRouter } from '../router/RouterContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ComplaintStatus, TrackedComplaint } from '../types';

export const TrackComplaintPage: React.FC = () => {
  const { currentPath } = useRouter();
  
  // Extract initial query param 'id' if redirected from complaint submission
  const [complaintIdInput, setComplaintIdInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  
  const [errors, setErrors] = useState<{ complaintId?: string; email?: string }>({});
  const [touched, setTouched] = useState<{ complaintId?: boolean; email?: boolean }>({});
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackedRecord, setTrackedRecord] = useState<TrackedComplaint | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Read URL search parameter '?id=...' safely on mount or path change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const queryParams = new URLSearchParams(window.location.search);
        const queryId = queryParams.get('id');
        if (queryId && queryId.trim()) {
          setComplaintIdInput(queryId.trim());
        } else if (currentPath.includes('?')) {
          const queryString = currentPath.split('?')[1];
          const innerParams = new URLSearchParams(queryString);
          const innerId = innerParams.get('id');
          if (innerId && innerId.trim()) {
            setComplaintIdInput(innerId.trim());
          }
        }
      }
    } catch (e) {
      console.warn('Unable to parse URL search parameter:', e);
    }
  }, [currentPath]);

  const validate = () => {
    const newErrors: { complaintId?: string; email?: string } = {};

    if (!complaintIdInput.trim()) {
      newErrors.complaintId = 'Complaint Reference ID is required.';
    }

    if (!emailInput.trim()) {
      newErrors.email = 'Registered email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyId = async (idToCopy: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(idToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = idToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopyStatus('ID copied!');
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ complaintId: true, email: true });
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setTrackedRecord(null);

    const cleanId = complaintIdInput.trim();
    const cleanEmail = emailInput.trim();

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase configuration is not active. Please check your environment variables.');
      }

      // Execute secure database function public.track_complaint
      const { data, error } = await supabase.rpc('track_complaint', {
        p_complaint_id: cleanId,
        p_email: cleanEmail,
      });

      if (error) {
        console.error('Error invoking track_complaint RPC:', error);
        // Generic failure message that doesn't reveal whether ID or email was wrong
        setErrorMessage(
          "We couldn't find a complaint matching the details provided. Please check your Complaint ID and registered email address."
        );
        return;
      }

      // RPC returns an array of matching rows
      const records = Array.isArray(data) ? data : data ? [data] : [];

      if (!records || records.length === 0) {
        // Generic mismatch error as required
        setErrorMessage(
          "We couldn't find a complaint matching the details provided. Please check your Complaint ID and registered email address."
        );
        return;
      }

      const match = records[0] as {
        complaint_id?: string;
        category?: string;
        location?: string;
        status?: string;
        created_at?: string;
      };

      if (!match || !match.complaint_id) {
        setErrorMessage(
          "We couldn't find a complaint matching the details provided. Please check your Complaint ID and registered email address."
        );
        return;
      }

      const normalizedStatus: ComplaintStatus =
        match.status === 'In Progress' || match.status === 'Resolved' || match.status === 'Pending'
          ? (match.status as ComplaintStatus)
          : 'Pending';

      setTrackedRecord({
        complaint_id: String(match.complaint_id),
        category: String(match.category || 'General Issue'),
        location: String(match.location || 'Campus Facility'),
        status: normalizedStatus,
        created_at: match.created_at || new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.error('Track complaint error:', err);
      setErrorMessage(
        "We couldn't find a complaint matching the details provided. Please check your Complaint ID and registered email address."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTrackedRecord(null);
    setComplaintIdInput('');
    setEmailInput('');
    setErrors({});
    setTouched({});
    setErrorMessage(null);
    setCopyStatus(null);
  };

  // Helper for status guidance copy
  const getStatusGuidance = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return {
          title: 'Awaiting administrator action.',
          description:
            'Your complaint has been safely recorded in the queue and is pending review by the campus facility management team.',
          colorClass: 'bg-amber-50/80 border-amber-200 text-amber-900',
          icon: Clock,
          iconColor: 'text-amber-600',
        };
      case 'In Progress':
        return {
          title: 'Your complaint is currently being addressed.',
          description:
            'Campus technicians or maintenance personnel have been assigned and are currently addressing the issue.',
          colorClass: 'bg-blue-50/80 border-blue-200 text-blue-900',
          icon: RotateCw,
          iconColor: 'text-blue-600',
        };
      case 'Resolved':
        return {
          title: 'Your complaint has been marked as resolved.',
          description:
            'The reported issue has been inspected and remediated by the facilities maintenance staff.',
          colorClass: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
    }
  };

  return (
    <PublicLayout>
      <main className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-16rem)]">
        <div className="max-w-2xl mx-auto">
          
          {/* Back to Home Link */}
          <div className="mb-4 sm:mb-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            
            {/* Header Banner */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 to-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Live Complaint Tracking</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Check Complaint Status
              </h1>
              {!trackedRecord && (
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Enter your Complaint Reference ID and the email address used when submitting your report. No account or login is required.
                </p>
              )}
            </div>

            {/* RESULTS VIEW */}
            {trackedRecord ? (
              <div className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
                
                {/* Status Guidance Banner */}
                {(() => {
                  const guidance = getStatusGuidance(trackedRecord.status);
                  const GuidanceIcon = guidance.icon;
                  return (
                    <div className={`p-4 sm:p-5 rounded-xl border ${guidance.colorClass} shadow-2xs`}>
                      <div className="flex items-start gap-3.5">
                        <div className="p-2 rounded-lg bg-white/80 shrink-0 shadow-2xs mt-0.5">
                          <GuidanceIcon className={`w-5 h-5 ${guidance.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base sm:text-lg font-bold tracking-tight">
                            {guidance.title}
                          </h2>
                          <p className="text-xs sm:text-sm mt-1 opacity-90 leading-relaxed">
                            {guidance.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Complaint Details Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        COMPLAINT REFERENCE ID
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tracking-tight select-all">
                          {trackedRecord.complaint_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(trackedRecord.complaint_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 text-xs font-medium text-slate-700 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer"
                          title="Copy Complaint ID"
                        >
                          {copyStatus ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>{copyStatus || 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        CURRENT STATUS
                      </span>
                      <StatusBadge status={trackedRecord.status} size="md" />
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Category</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-900 block">
                        {trackedRecord.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Facility Location</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-900 block truncate" title={trackedRecord.location}>
                        {trackedRecord.location}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted On</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-900 block">
                        {new Date(trackedRecord.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy & Student Safety Note */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Personal identity details and full complaint narratives are omitted here to protect student privacy in public tracking mode. For formal escalation, visit the campus facility office with your reference ID.
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Track Another Complaint</span>
                  </button>

                  <Link
                    to="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Home</span>
                  </Link>
                </div>

              </div>
            ) : (
              /* SEARCH FORM */
              <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-7 space-y-4 sm:space-y-5">
                
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold block mb-0.5 text-red-950">
                          Complaint Not Found
                        </span>
                        <p className="text-red-800 leading-relaxed text-xs">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Field 1: Complaint Reference ID */}
                <div>
                  <label
                    htmlFor="complaintIdInput"
                    className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-slate-500" />
                      <span>Complaint Reference ID</span>
                      <span className="text-red-500" title="Required">*</span>
                    </span>
                    {touched.complaintId && errors.complaintId && (
                      <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.complaintId}
                      </span>
                    )}
                  </label>
                  <input
                    id="complaintIdInput"
                    type="text"
                    value={complaintIdInput}
                    onChange={(e) => {
                      setComplaintIdInput(e.target.value);
                      if (errors.complaintId) setErrors((prev) => ({ ...prev, complaintId: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, complaintId: true }))}
                    placeholder="e.g. CC-1001"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.complaintId && errors.complaintId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    The identifier generated when you submitted your complaint (case-insensitive).
                  </p>
                </div>

                {/* Field 2: Registered Student Email */}
                <div>
                  <label
                    htmlFor="emailInput"
                    className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Registered Email Address</span>
                      <span className="text-red-500" title="Required">*</span>
                    </span>
                    {touched.email && errors.email && (
                      <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </span>
                    )}
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    placeholder="student@college.edu"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Must match the email address originally entered in the complaint form.
                  </p>
                </div>

                {/* Guidance note */}
                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-xs text-slate-600 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Confidential Verification
                    </span>
                    <span className="text-slate-600 leading-relaxed">
                      To protect student confidentiality, status lookup strictly validates both the Reference ID and email before retrieving status updates.
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking Status...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Check Status</span>
                      </>
                    )}
                  </button>

                  <Link
                    to="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
                  >
                    <span>Cancel</span>
                  </Link>
                </div>

              </form>
            )}

          </div>

        </div>
      </main>
    </PublicLayout>
  );
};
