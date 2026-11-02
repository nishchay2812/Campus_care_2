import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowLeft, 
  X 
} from 'lucide-react';
import { Link, useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { AdminLoginFormData, AdminLoginFormErrors } from '../types';

export const AdminLoginPage: React.FC = () => {
  const { signIn, user, isAdmin, isLoading: authLoading } = useAuth();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState<AdminLoginFormData>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<AdminLoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [helpMessage, setHelpMessage] = useState<string | null>(null);

  // If already authenticated with valid admin role, redirect directly to dashboard
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [authLoading, user, isAdmin, navigate]);

  // Check URL query parameters for unauthorized redirect notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('unauthorized') === 'true') {
        setAuthError('Unauthorized access: You must be signed in as an administrator to access the dashboard.');
      }
    }
  }, []);

  // Field validation
  const validateField = (name: keyof AdminLoginFormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid institutional email address.';
        return undefined;

      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: AdminLoginFormErrors = {};
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name as keyof AdminLoginFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: type === 'checkbox' ? checked : value,
    }));

    if (authError) setAuthError(null);
    if (helpMessage) setHelpMessage(null);

    if (touched[fieldName] && type !== 'checkbox') {
      const err = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: err,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof AdminLoginFormData;

    if (type === 'checkbox') return;

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    const err = validateField(fieldName, value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: err,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHelpMessage(null);
    setAuthError(null);

    const isValid = validateAll();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        if (el) el.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (!result.success) {
        setAuthError(result.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Successful authentication and admin role verification
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      console.error('Authentication exception:', err);
      setAuthError('An unexpected error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthError(null);
    setHelpMessage(
      'Please contact your college administrator for login assistance.'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Brand Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-3">
        <Link 
          to="/"
          className="flex items-center gap-2 text-slate-800 hover:text-emerald-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" strokeWidth={2.4} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-sm">
            CampusCare <span className="text-emerald-600 text-xs font-semibold">Lite</span>
          </span>
        </Link>

        {/* Small "Back to Student Portal" link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Student Portal</span>
        </Link>
      </div>

      {/* Centered Institutional Login Card */}
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">
          
          {/* Card Institutional Header */}
          <div className="px-6 pt-7 pb-5 sm:px-8 text-center border-b border-slate-100 bg-gradient-to-b from-emerald-50/40 to-white">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-xs ring-4 ring-emerald-50">
              <Lock className="w-5 h-5" strokeWidth={2.2} />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              CampusCare Administration
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Secure access for authorised college staff.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-7 space-y-4">
            
            {/* Authentication Error Banner */}
            {authError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5 text-red-950">
                      {authError.toLowerCase().includes('unauthorized') ? 'Unauthorized Access' : 'Authentication Failed'}
                    </span>
                    <p className="text-red-800 leading-relaxed text-xs">
                      {authError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthError(null)}
                    className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Help Information Message */}
            {helpMessage && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5 text-slate-900">Login Assistance</span>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      {helpMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHelpMessage(null)}
                    className="text-slate-500 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                    aria-label="Dismiss message"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 1. Email Address Field */}
            <div>
              <label 
                htmlFor="email" 
                className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Institutional Email</span>
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
                placeholder="staff.member@college.edu"
                autoComplete="username"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                  touched.email && errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                }`}
              />
            </div>

            {/* 2. Password Field with Show/Hide */}
            <div>
              <label 
                htmlFor="password" 
                className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Password</span>
                  <span className="text-red-500" title="Required">*</span>
                </span>
                {touched.password && errors.password && (
                  <span className="text-red-600 text-[11px] font-normal flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter staff password"
                  autoComplete="current-password"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                    touched.password && errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none focus:text-emerald-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep me signed in & Need help signing in? */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={handleHelpClick}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer text-left sm:text-right"
              >
                Need help signing in?
              </button>
            </div>

            {/* Green Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>

            {/* Subtle Security Message */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Restricted institutional system. Unauthorised access is prohibited.</span>
              </p>
            </div>

          </form>

        </div>

        {/* Small "Back to Student Portal" link underneath */}
        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Portal</span>
          </Link>
        </div>

      </div>

      {/* Institutional Footer Copyright */}
      <div className="max-w-md w-full mx-auto text-center pt-8 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} CampusCare Administration · Institutional Facility Management</p>
      </div>

    </div>
  );
};
