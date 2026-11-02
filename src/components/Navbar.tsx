import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowRight, Lock } from 'lucide-react';
import { Link, useRouter } from '../router/RouterContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath } = useRouter();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">
          
          {/* LEFT: CampusCare Lite Logo */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2.5 text-slate-900 group whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  CampusCare <span className="text-emerald-600 font-semibold text-sm">Lite</span>
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className={`transition-colors whitespace-nowrap hover:text-emerald-700 ${
                currentPath === '/' ? 'text-emerald-700 font-semibold' : 'text-slate-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/#campus-updates"
              className="text-slate-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
            >
              Issue Updates
            </Link>
            <Link
              to="/#how-it-works"
              className="text-slate-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
            >
              How It Works
            </Link>
            <Link
              to="/#categories"
              className="text-slate-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
            >
              Categories
            </Link>
            <Link
              to="/track-complaint"
              className={`transition-colors whitespace-nowrap hover:text-emerald-700 ${
                currentPath.startsWith('/track-complaint') ? 'text-emerald-700 font-semibold' : 'text-slate-600'
              }`}
            >
              Track Complaint
            </Link>
          </nav>

          {/* RIGHT: Primary Report CTA Button & Subtle Staff Login Link */}
          <div className="hidden md:flex items-center gap-3.5 lg:gap-4 shrink-0">
            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap px-2 py-1.5 rounded-lg hover:bg-slate-100"
              title="Staff & Administrator Login"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Staff Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-2 shadow-lg animate-in fade-in duration-150">
          <Link
            to="/"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
              currentPath === '/' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/#campus-updates"
            onClick={closeMenu}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Issue Updates
          </Link>
          <Link
            to="/#how-it-works"
            onClick={closeMenu}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/#categories"
            onClick={closeMenu}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Complaint Categories
          </Link>
          <Link
            to="/track-complaint"
            onClick={closeMenu}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
              currentPath.startsWith('/track-complaint')
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Track Complaint
          </Link>

          <Link
            to="/admin/login"
            onClick={closeMenu}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentPath === '/admin/login' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Staff Login</span>
          </Link>

          <div className="pt-2">
            <Link
              to="/report"
              onClick={closeMenu}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
