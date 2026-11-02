import React from 'react';
import { ClipboardEdit, SearchCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Report an Issue',
      description:
        'Notice a campus problem? Select the relevant category, specify the building and room, describe the defect, and submit in seconds.',
      icon: ClipboardEdit,
      highlight: 'Simple 3-step form',
    },
    {
      number: '02',
      title: 'Administration Reviews It',
      description:
        'Campus facility managers immediately receive the alert, verify severity, prioritize safety risks, and assign the ticket to technicians.',
      icon: SearchCheck,
      highlight: 'Automated triage',
    },
    {
      number: '03',
      title: 'Issue Gets Resolved',
      description:
        'Maintenance crews fix the issue on site, log photographic evidence of completion, and close the ticket with real-time status updates.',
      icon: CheckCircle2,
      highlight: 'Verified completion',
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-16 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase mb-2">
            Workflow Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CampusCare Lite Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            A transparent 3-step pipeline bridging students, faculty, and administration to maintain high campus standards.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.number}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* Step Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-emerald-600/30 group-hover:text-emerald-600 transition-colors tabular-nums">
                      {item.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer Detail */}
                <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-emerald-800">Step {index + 1} of 3</span>
                  <span className="text-slate-400 font-medium">{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-8 text-center">
          <Link
            to="/report"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors group"
          >
            <span>Have something to report right now? Start a report</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
