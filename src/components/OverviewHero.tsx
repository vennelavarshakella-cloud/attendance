import React from 'react';
import {
  Radio,
  CreditCard,
  ShieldCheck,
  Send,
  Zap,
  Cpu,
  ArrowRight,
  Sparkles,
  Wifi,
  QrCode
} from 'lucide-react';

interface OverviewHeroProps {
  onStartTap: () => void;
  onViewBadges: () => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ onStartTap, onViewBadges }) => {
  return (
    <div className="space-y-12">
      {/* Hero Showcase Container */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* Left Hero Copy (7 Cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between z-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Next-Gen Contactless Campus Access</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Smart Attendance Powered by Student ID Cards.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Transform student PVC cards into high-speed digital presence keys. Seamlessly record classroom roll calls, turnstile gate entries, and laboratory access in under 200ms—with automated real-time SMS alerts to parents.
              </p>
            </div>

            {/* Direct CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartTap}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Launch Interactive Reader Terminal</span>
              </button>

              <button
                onClick={onViewBadges}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-slate-800/90 hover:bg-slate-800 rounded-xl transition-all border border-slate-700"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Inspect Student Smart Badges</span>
              </button>
            </div>

            {/* Architecture Indicators */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-400 rotate-90" />
                <span>13.56 MHz MIFARE &amp; NFC</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Anti-Proxy Double Tap Shield</span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Instant Parent SMS Gateway</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image (5 Cols) */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_smart_terminal_1790762236725.jpg"
              alt="Student tapping contactless ID card at reader terminal"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Scrim gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* 4-Pillar Integration Architecture Section */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            End-To-End Infrastructure
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            How Smart ID Card Integration Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A battle-tested architecture that unifies physical plastic badges, edge IoT readers, and institutional software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              1. Multi-Credential PVC ID Card
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every student carries an ISO/IEC 14443-A smart card featuring an encrypted 7-byte UID chip, fallback 1D Code 128 barcode, and Apple/Google Wallet NFC pass.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              2. Sub-200ms Contactless Terminals
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wall-mounted tablet kiosks and door podiums read card frequencies instantly. Includes offline caching so roll call continues even during campus Wi-Fi drops.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              3. Anti-Passback &amp; Proxy Defense
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algorithmic verification halts proxy taps. If a card is scanned twice within 30 seconds or in two distant lecture halls simultaneously, security is notified.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-rose-400 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              4. Instant Parent &amp; SIS Sync
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated Twilio/WhatsApp triggers notify parents the minute a student arrives or is flagged absent, syncing real-time rosters with Canvas and Ellucian Banner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
