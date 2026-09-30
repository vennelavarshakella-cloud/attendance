import React, { useState } from 'react';
import { Wifi, RotateCw, CheckCircle2, AlertOctagon, Printer, QrCode } from 'lucide-react';
import { Student } from '../types/attendance';

interface StudentIdCardProps {
  student: Student;
  onTapCard?: (student: Student) => void;
  showActions?: boolean;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({
  student,
  onTapCard,
  showActions = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Card Container */}
      <div
        className="w-full max-w-[360px] h-[225px] relative cursor-pointer select-none perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full relative duration-500 transform-style-preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= CARD FRONT ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 shadow-xl border border-slate-700/60 backface-hidden overflow-hidden flex flex-col justify-between">
            {/* Subtle holographic foil overlay */}
            <div className="absolute inset-0 pointer-events-none badge-hologram opacity-30 mix-blend-overlay"></div>

            {/* Background geometric watermark accent */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

            {/* Header: Institution & Contactless Icon */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center tracking-tighter">
                  MU
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                    Metro University
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono tracking-widest">
                    SMART ID · CONTACTLESS PASS
                  </div>
                </div>
              </div>

              {/* RFID / NFC Contactless Signal Icon */}
              <div className="flex items-center gap-1.5 text-amber-400">
                <Wifi className="w-5 h-5 rotate-90 stroke-[2.5]" />
              </div>
            </div>

            {/* Body: Chip, Portrait, Details */}
            <div className="relative z-10 flex items-center gap-4 my-auto">
              {/* Photo Portrait */}
              <div className="relative shrink-0">
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 rounded-lg object-cover border-2 border-amber-400/80 shadow-md bg-slate-800"
                />
                {student.status === 'SUSPENDED' && (
                  <div className="absolute inset-0 bg-rose-950/80 rounded-lg flex items-center justify-center text-[9px] font-bold text-rose-300 text-center uppercase p-1">
                    Hold
                  </div>
                )}
              </div>

              {/* Data & Smart Chip */}
              <div className="flex-1 min-w-0">
                {/* Gold Smart Chip simulation */}
                <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-600 border border-amber-600/40 mb-2 relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 border border-amber-700/30 grid grid-cols-2 grid-rows-3 gap-[1px]">
                    <div className="border-r border-amber-700/40"></div>
                    <div></div>
                    <div className="border-r border-t border-amber-700/40"></div>
                    <div className="border-t border-amber-700/40"></div>
                  </div>
                </div>

                <div className="text-sm font-bold text-white tracking-tight truncate">
                  {student.fullName}
                </div>
                <div className="text-[11px] text-amber-300 font-medium truncate">
                  {student.major}
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  {student.department}
                </div>
              </div>
            </div>

            {/* Footer: ID number, Valid thru, Barcode */}
            <div className="relative z-10 pt-2 border-t border-slate-700/60 flex items-end justify-between text-[10px]">
              <div>
                <span className="text-[8px] text-slate-400 block uppercase font-mono">Student ID</span>
                <span className="font-mono text-amber-400 font-semibold tracking-wider">
                  {student.studentNumber}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[8px] text-slate-400 block uppercase font-mono">Expires</span>
                <span className="font-mono text-slate-200">{student.validThru}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 block uppercase font-mono">RFID UID</span>
                <span className="font-mono text-slate-300 text-[9px]">{student.rfidUid}</span>
              </div>
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-slate-900 text-white p-4 shadow-xl border border-slate-800 rotate-y-180 backface-hidden flex flex-col justify-between overflow-hidden">
            {/* Magnetic Stripe */}
            <div className="w-full -mx-4 h-9 bg-black border-y border-slate-800 shadow-inner"></div>

            {/* Back details */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex-1 text-[9px] text-slate-300 space-y-1 leading-snug">
                <div className="font-semibold text-slate-200">METRO UNIVERSITY ACCESS CARD</div>
                <p className="text-slate-400 text-[8px]">
                  Property of Metro University. If found, please drop into any campus mail box or contact Campus Security.
                </p>
                <div className="text-amber-400 font-mono text-[8px]">
                  HOTLINE: +1 (555) 019-9000
                </div>
              </div>

              {/* QR Code preview representation */}
              <div className="p-1.5 bg-white rounded-lg shrink-0">
                <QrCode className="w-12 h-12 text-slate-950" />
              </div>
            </div>

            {/* Barcode line strip */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center">
              {/* Synthetic Barcode lines */}
              <div className="w-full h-7 flex items-center justify-center gap-[2px] bg-white px-3 py-1 rounded">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3].map((w, idx) => (
                  <div
                    key={idx}
                    className="h-full bg-slate-900"
                    style={{ width: `${w * 2}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 mt-1">
                *{student.barcode}*
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls & Flip Hint */}
      {showActions && (
        <div className="flex items-center gap-2 mt-3 text-xs">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors font-medium"
          >
            <RotateCw className="w-3 h-3" />
            <span>{isFlipped ? 'Show Front' : 'Flip to Back'}</span>
          </button>

          {onTapCard && (
            <button
              onClick={() => onTapCard(student)}
              className="inline-flex items-center gap-1 px-3 py-1 text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors font-medium shadow-sm"
            >
              <Wifi className="w-3 h-3 text-emerald-400 rotate-90" />
              <span>Tap at Reader</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            title="Print or export card badge"
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
