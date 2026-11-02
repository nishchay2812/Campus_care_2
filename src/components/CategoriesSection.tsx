import React from 'react';
import { 
  Zap, 
  Monitor, 
  Presentation, 
  Droplets, 
  Sparkles, 
  MoreHorizontal, 
  ArrowRight 
} from 'lucide-react';
import { Link } from '../router/RouterContext';

export const CategoriesSection: React.FC = () => {
  const categories = [
    {
      id: 'electrical',
      name: 'Electrical',
      description: 'Issues regarding power outlets, faulty wiring, lighting, switchboards, or power distribution.',
      examples: ['Flickering fluorescent lights', 'Non-functional plug points', 'Short circuit or spark risks', 'Corridor lighting'],
      icon: Zap,
      accent: 'emerald',
    },
    {
      id: 'it-computers',
      name: 'IT / Computers',
      description: 'Campus network instability, lab desktop errors, lab peripheral defects, and server issues.',
      examples: ['Lab PC operating system errors', 'Ethernet/Wi-Fi access point drops', 'Network printer jams', 'Monitor cable faults'],
      icon: Monitor,
      accent: 'emerald',
    },
    {
      id: 'classroom-equipment',
      name: 'Classroom Equipment',
      description: 'Audio-visual hardware, overhead projectors, smart boards, microphones, and lecterns.',
      examples: ['Ceiling projector lamp dead', 'Smart podium audio hum', 'Motorized screen stuck', 'Damaged faculty whiteboard'],
      icon: Presentation,
      accent: 'emerald',
    },
    {
      id: 'water-plumbing',
      name: 'Water / Plumbing',
      description: 'Drinking water coolers, washroom taps, drainage blockages, and pipe leaks across campus.',
      examples: ['RO water filter dripping', 'Restroom faucet valve loose', 'Clogged sink drainage', 'Low water pressure'],
      icon: Droplets,
      accent: 'emerald',
    },
    {
      id: 'cleanliness',
      name: 'Cleanliness',
      description: 'Sanitary maintenance, overflowing dustbins, spill cleanup, and waste management services.',
      examples: ['Classroom dustbin full', 'Cafeteria floor spill', 'Restroom hygiene inspection', 'Auditorium litter collection'],
      icon: Sparkles,
      accent: 'emerald',
    },
    {
      id: 'other',
      name: 'Other',
      description: 'Structural repairs, campus benches, damaged doors/windows, locks, and general facility issues.',
      examples: ['Broken study table / chair', 'Door latch jammed', 'Campus pathway railing', 'Notice board glass crack'],
      icon: MoreHorizontal,
      accent: 'emerald',
    },
  ];

  return (
    <section id="categories" className="py-14 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
          <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase mb-2">
            Service Coverage
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complaint Categories
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Categorized issue routing ensures your report immediately reaches the specialized campus technician squad.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-700 transition-colors">
                      Active Queue
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-emerald-800 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  {/* Common examples */}
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Frequently Handled:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {cat.examples.slice(0, 3).map((eg, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-600" />
                          <span>{eg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Report link button */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={`/report?category=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Report {cat.name} Issue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner card */}
        <div className="mt-16 bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              Unsure which category your issue belongs to?
            </h3>
            <p className="text-sm sm:text-base text-emerald-100/90">
              Submit your report under "Other" with photographs and location notes. Campus coordinators will triage it automatically.
            </p>
          </div>
          <Link
            to="/report"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 active:bg-slate-100 font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <span>Open Report Form</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
