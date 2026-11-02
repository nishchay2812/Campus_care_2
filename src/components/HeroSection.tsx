import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Wrench, Building2, Sparkles, MapPin } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const HeroSection: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-10 pb-16 lg:pt-16 lg:pb-22">
      {/* Subtle structural grid background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #047857 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Campus Initiative Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Campus Facility & Maintenance Initiative</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal normal-case">Student & Staff Portal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4 text-balance">
              A Better Campus <br className="hidden sm:inline" />
              <span className="text-emerald-700">Starts With You.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 max-w-xl">
              Spotted a broken projector, flickering lab light, or plumbing leak? Report campus problems in seconds and help the administration keep classrooms, dorms, and grounds in top condition.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/track-complaint"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span>Track an Issue</span>
              </Link>
            </div>

            {/* Value Indicators / Key Highlights */}
            <div className="pt-5 border-t border-slate-200/80 w-full grid grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">24h</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Average Triage</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">100%</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Direct Routing</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">6 Areas</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Campus Coverage</div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Element / Campus Maintenance Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative card frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 bg-white">
                
                {/* Visual Campus Image or Styled Fallback */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-slate-100 overflow-hidden">
                  {!imageError ? (
                    <img
                      src="/src/assets/images/campus_hero_1793514766012.jpg"
                      alt="Modern university campus grounds with well-maintained facilities and collaborative student spaces"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    /* Stylized SVG Maintenance Fallback Container */
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100/50 via-slate-100 to-emerald-50 p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-3 border border-emerald-100">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-semibold text-slate-800">Campus Facility System</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Active facility monitoring and resolution services across university halls and labs.
                      </p>
                    </div>
                  )}

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Campus Operations Live</span>
                  </div>
                </div>

                {/* Live Campus Issue Resolution Showcase Card */}
                <div className="p-5 bg-white border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Resolution Flow</span>
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Resolved Today
                    </span>
                  </div>

                  {/* Simulated Maintenance Card Snippet */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Lab 204 Overhead Projector</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              CS Block
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Replaced bulb & recalibrated</span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Water Dispenser Filter Blockage</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              Library 1F
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Technician dispatched</span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
