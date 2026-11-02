import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Loader2, 
  RotateCcw, 
  Info,
  MapPin,
  Tag,
  User,
  Mail,
  FileText,
  ShieldCheck,
  X,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Link } from '../router/RouterContext';
import { ComplaintCategory, ComplaintFormData, ComplaintFormErrors } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SubmittedDetails {
  complaintId: string;
  status: string;
  studentName: string;
  email: string;
  category: ComplaintCategory;
  location: string;
  description: string;
}

const CATEGORIES: ComplaintCategory[] = [
  'Electrical',
  'IT / Computers',
  'Classroom Equipment',
  'Water / Plumbing',
  'Cleanliness',
  'Other',
];

export const ReportPage: React.FC = () => {
  const [formData, setFormData] = useState<ComplaintFormData>({
    studentName: '',
    email: '',
    category: '',
    location: '',
    description: '',
  });

  const [errors, setErrors] = useState<ComplaintFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedDetails, setSubmittedDetails] = useState<SubmittedDetails | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Check URL query parameters for category preselection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const catParam = searchParams.get('category');
      if (catParam && CATEGORIES.includes(catParam as ComplaintCategory)) {
        setFormData((prev) => ({
          ...prev,
          category: catParam as ComplaintCategory,
        }));
      }
    }
  }, []);

  // Field validation logic
  const validateField = (name: keyof ComplaintFormData, value: string): string | undefined => {
    switch (name) {
      case 'studentName':
        if (!value.trim()) return 'Student name is required.';
        if (value.trim().length < 2) return 'Please enter a valid full name.';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email address is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address (e.g. name@college.edu).';
        return undefined;

      case 'category':
        if (!value) return 'Please select a complaint category.';
        return undefined;

      case 'location':
        if (!value.trim()) return 'Campus location is required.';
        if (value.trim().length < 3) return 'Please provide specific location details (e.g. Block A, Room 204).';
        return undefined;

      case 'description':
        if (!value.trim()) return 'Issue description is required.';
        if (value.trim().length < 10) {
          const remaining = 10 - value.trim().length;
          return `Please provide more detail (${remaining} more character${remaining > 1 ? 's' : ''} needed).`;
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: ComplaintFormErrors = {};
    (Object.keys(formData) as Array<keyof ComplaintFormData>).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched({
      studentName: true,
      email: true,
      category: true,
      location: true,
      description: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ComplaintFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // If field has already been touched, validate dynamically on change
    if (touched[fieldName]) {
      const fieldError = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldError,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ComplaintFormData;

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    const fieldError = validateField(fieldName, value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const isValid = validateAll();
    if (!isValid) {
      // Focus first error field if any
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        if (el) el.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase configuration is not active. Please check your environment variables.');
      }

      // Execute the secure Supabase database function public.submit_complaint
      const { data, error } = await supabase.rpc('submit_complaint', {
        p_student_name: formData.studentName.trim(),
        p_email: formData.email.trim(),
        p_category: formData.category,
        p_location: formData.location.trim(),
        p_description: formData.description.trim(),
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit complaint to the database.');
      }

      // Handle the RPC response. Supabase returns table results as an array, so retrieve the first record.
      interface SubmitComplaintRecord {
        complaint_id?: string | number | null;
        status?: string | null;
        [key: string]: unknown;
      }

      const returnedRecord: SubmitComplaintRecord | null = Array.isArray(data)
        ? (data[0] as SubmitComplaintRecord) || null
        : (data as SubmitComplaintRecord) || null;

      if (!returnedRecord) {
        throw new Error(
          'The complaint was registered, but the database function returned an empty response. Please verify public.submit_complaint.'
        );
      }

      const rawComplaintId = returnedRecord.complaint_id;
      const actualComplaintId =
        rawComplaintId !== undefined && rawComplaintId !== null
          ? String(rawComplaintId).trim()
          : '';

      // Validate that the database returned a real complaint_id (never allow empty or placeholder "Submitted")
      if (!actualComplaintId || actualComplaintId.toLowerCase() === 'submitted') {
        throw new Error(
          'The complaint was registered, but the database function did not return a valid Complaint Reference ID (complaint_id).'
        );
      }

      const rawStatus = returnedRecord.status;
      const actualStatus =
        rawStatus !== undefined && rawStatus !== null && String(rawStatus).trim().length > 0
          ? String(rawStatus).trim()
          : 'Pending';

      // Store submitted details for the confirmation card
      setSubmittedDetails({
        complaintId: actualComplaintId,
        status: actualStatus,
        studentName: formData.studentName.trim(),
        email: formData.email.trim(),
        category: formData.category as ComplaintCategory,
        location: formData.location.trim(),
        description: formData.description.trim(),
      });

      // Clear the form fields per requirement 6
      setFormData({
        studentName: '',
        email: '',
        category: '',
        location: '',
        description: '',
      });
      setErrors({});
      setTouched({});
      setIsSubmitted(true);

      // Scroll to top of form smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Error submitting complaint to Supabase:', err);
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit complaint to the database. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyComplaintId = async () => {
    if (!submittedDetails?.complaintId) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(submittedDetails.complaintId);
      } else {
        // Fallback for non-secure contexts or restricted iframe environments
        const textArea = document.createElement('textarea');
        textArea.value = submittedDetails.complaintId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopyStatus('Complaint ID copied successfully!');
      setTimeout(() => setCopyStatus(null), 3500);
    } catch (err) {
      console.error('Failed to copy complaint ID:', err);
      setCopyStatus('Unable to copy to clipboard.');
      setTimeout(() => setCopyStatus(null), 3500);
    }
  };

  const handleReset = () => {
    setFormData({
      studentName: '',
      email: '',
      category: '',
      location: '',
      description: '',
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setSubmittedDetails(null);
    setSubmitError(null);
    setCopyStatus(null);
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

          {/* Form Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            
            {/* Header Banner */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 to-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Student Support Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Report a Campus Issue
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Found a facility or equipment problem? Fill out the details below to notify the campus administration and maintenance department.
              </p>
            </div>

            {/* Successful Database Submission State */}
            {isSubmitted && submittedDetails ? (
              <div className="p-5 sm:p-7 space-y-5">
                
                {/* Confirmation Header Card */}
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-5 sm:p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Complaint Successfully Submitted
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                        Your complaint has been registered successfully. Our campus team will review it and take the necessary action.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Complaint Reference ID & Status Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    {/* Reference Section */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        COMPLAINT REFERENCE ID
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-slate-900 tracking-tight select-all break-all">
                          {submittedDetails.complaintId}
                        </span>
                        {submittedDetails.complaintId && (
                          <button
                            type="button"
                            onClick={handleCopyComplaintId}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer w-full sm:w-fit"
                            title="Copy Complaint ID to clipboard"
                          >
                            {copyStatus === 'Complaint ID copied successfully!' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>Copy Complaint ID</span>
                          </button>
                        )}
                      </div>

                      {/* Copy feedback alert */}
                      {copyStatus && (
                        <div className={`mt-2 text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-150 ${
                          copyStatus.includes('successfully') ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {copyStatus.includes('successfully') ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{copyStatus}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Section */}
                    <div className="sm:border-l sm:border-slate-100 sm:pl-6 flex flex-col justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        CURRENT STATUS
                      </span>
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{submittedDetails.status || 'Pending'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Please save your reference ID for future communication.</span>
                  </div>
                </div>

                {/* Submitted Preview Summary */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
                    Logged Complaint Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Student Name</span>
                      <span className="text-sm font-semibold text-slate-900">{submittedDetails.studentName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Email Address</span>
                      <span className="text-sm font-semibold text-slate-900">{submittedDetails.email}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Category</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3" />
                        {submittedDetails.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Location</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {submittedDetails.location}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 block mb-1">Issue Description</span>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200/80">
                      {submittedDetails.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Link
                    to={`/track-complaint?id=${encodeURIComponent(submittedDetails.complaintId)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-colors"
                  >
                    <Search className="w-4 h-4 text-emerald-700" />
                    <span>Track Complaint Status</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Submit Another Issue</span>
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
              /* Active Complaint Form */
              <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-7 space-y-4 sm:space-y-5">
                
                {/* Error Banner */}
                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold block mb-0.5 text-red-950">Submission Failed</span>
                        <p className="text-red-800 leading-relaxed text-xs">
                          {submitError}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                        aria-label="Dismiss error"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 1. Student Name */}
                <div>
                  <label htmlFor="studentName" className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Student Name</span>
                      <span className="text-red-500" title="Required">*</span>
                    </span>
                    {touched.studentName && errors.studentName && (
                      <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.studentName}
                      </span>
                    )}
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    value={formData.studentName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.studentName && errors.studentName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  />
                </div>

                {/* 2. Email Address */}
                <div>
                  <label htmlFor="email" className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Email Address</span>
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
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="student@college.edu"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used for follow-up questions and resolution updates.
                  </p>
                </div>

                {/* 3. Complaint Category */}
                <div>
                  <label htmlFor="category" className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <span>Complaint Category</span>
                      <span className="text-red-500" title="Required">*</span>
                    </span>
                    {touched.category && errors.category && (
                      <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.category}
                      </span>
                    )}
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white transition-colors focus:outline-none focus:ring-2 ${
                      !formData.category ? 'text-slate-400' : 'text-slate-900 font-medium'
                    } ${
                      touched.category && errors.category
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  >
                    <option value="" disabled>
                      Select an issue category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="text-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Campus Location */}
                <div>
                  <label htmlFor="location" className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Campus Location</span>
                      <span className="text-red-500" title="Required">*</span>
                    </span>
                    {touched.location && errors.location && (
                      <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.location}
                      </span>
                    )}
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Block A, Room 204"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                      touched.location && errors.location
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Provide building name, floor number, room or landmark.
                  </p>
                </div>

                {/* 5. Issue Description */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <label htmlFor="description" className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Issue Description</span>
                      <span className="text-red-500" title="Required">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {touched.description && errors.description ? (
                        <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.description}
                        </span>
                      ) : (
                        <span className={`text-[11px] tabular-nums ${formData.description.trim().length >= 10 ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                          {formData.description.trim().length} / min 10 chars
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Describe what is broken, abnormal sounds/smells, or hazard conditions..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 resize-y min-h-[100px] ${
                      touched.description && errors.description
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                    }`}
                  />
                </div>

                {/* Complaint Submission Information Notice */}
                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-xs text-slate-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Complaint Submission Information</span>
                    <span className="text-slate-600 leading-relaxed">
                      Please provide accurate details about the issue. Once your complaint is submitted successfully, you will receive a unique reference ID for your records.
                    </span>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validating Submission...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Complaint</span>
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
