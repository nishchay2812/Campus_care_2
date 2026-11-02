import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-slate-800">
          
          {/* Brand & Project Summary */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="flex items-center gap-2.5 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                CampusCare <span className="text-emerald-400 text-sm font-semibold">Lite</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              A modern Campus Issue Reporting and Resolution System designed for colleges. Empowering students, faculty, and administration to maintain clean, safe, and fully operational campus facilities.
            </p>

            <div className="text-xs text-slate-500">
              Developed as a College Capstone Initiative · Campus Facility Operations
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#categories" className="hover:text-emerald-400 transition-colors">
                  Complaint Categories
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-emerald-400 transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/track-complaint" className="hover:text-emerald-400 transition-colors">
                  Track Complaint
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Emergency / Facilities info */}
          <div className="md:col-span-3 lg:col-span-4">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Campus Guidelines
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              For life-threatening or fire emergencies, please contact campus security or emergency dispatch directly before submitting digital maintenance reports.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400 block mb-1">Standard Operating Hours:</span>
              Monday – Saturday: 08:00 AM – 06:00 PM IST
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusCare Lite. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built for higher education campus communities</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
