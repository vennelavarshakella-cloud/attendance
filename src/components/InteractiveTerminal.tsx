import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Radio,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ScanLine,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  Smartphone,
  ChevronRight,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  CreditCard
} from 'lucide-react';
import { Student, TerminalReader, LectureSession, ScanMethod, AttendanceRecord } from '../types/attendance';
import { soundController } from '../utils/audio';

interface InteractiveTerminalProps {
  students: Student[];
  terminals: TerminalReader[];
  lectures: LectureSession[];
  selectedTerminalId: string;
  setSelectedTerminalId: (id: string) => void;
  onRecordAttendance: (record: AttendanceRecord, student: Student) => void;
  recentRecords: AttendanceRecord[];
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  students,
  terminals,
  lectures,
  selectedTerminalId,
  setSelectedTerminalId,
  onRecordAttendance,
  recentRecords,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMethod, setScanMethod] = useState<ScanMethod>('RFID_TAP');
  const [manualUidInput, setManualUidInput] = useState<string>('');
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'IDLE';
    title: string;
    subtitle: string;
    student?: Student;
    timestamp?: string;
    smsAlertSent?: boolean;
    proxyWarning?: boolean;
  }>({
    type: 'IDLE',
    title: 'Ready to Read Card',
    subtitle: 'Hold contactless Student ID Card against the reader target.',
  });

  // Track recent taps to detect duplicate / proxy tap
  const lastTapRef = useRef<{ [studentId: string]: number }>({});

  const terminal = terminals.find((t) => t.id === selectedTerminalId) || terminals[0];
  const activeLecture = lectures.find((l) => l.terminalId === terminal.id) || lectures[0];

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Process Card Tap
  const handleCardTap = (student: Student, overrideMethod?: ScanMethod) => {
    const methodToUse = overrideMethod || scanMethod;
    setIsScanning(true);

    const now = new Date();
    const timestampStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const nowMs = Date.now();
    const lastTapTime = lastTapRef.current[student.id];
    const isRapidDuplicate = lastTapTime && nowMs - lastTapTime < 25000; // 25s threshold
    lastTapRef.current[student.id] = nowMs;

    setTimeout(() => {
      setIsScanning(false);

      // Check 1: Suspended student card
      if (student.status === 'SUSPENDED') {
        soundController.playErrorBeep();
        setFeedback({
          type: 'ERROR',
          title: 'ACCESS DENIED: CARD SUSPENDED',
          subtitle: `Card ID ${student.rfidUid} flagged by University Registrar. Please report to Student Affairs.`,
          student,
          timestamp: timestampStr,
          smsAlertSent: true,
        });

        const record: AttendanceRecord = {
          id: `att-${Date.now()}`,
          studentId: student.id,
          studentName: student.fullName,
          studentNumber: student.studentNumber,
          department: student.department,
          avatarUrl: student.avatarUrl,
          rfidUid: student.rfidUid,
          timestamp: timestampStr,
          terminalId: terminal.id,
          terminalName: terminal.name,
          location: terminal.location,
          method: methodToUse,
          status: 'DENIED',
          sessionCode: activeLecture?.courseCode,
          sessionName: activeLecture?.courseName,
          room: terminal.roomCode,
          alertDispatched: true,
          notes: 'Access denied: Card status suspended.',
        };
        onRecordAttendance(record, student);
        return;
      }

      // Check 2: Proxy / Duplicate Tap detection
      if (isRapidDuplicate) {
        soundController.playErrorBeep();
        setFeedback({
          type: 'WARNING',
          title: 'DUPLICATE TAP / PROXY WARNING',
          subtitle: `Card was just scanned ${Math.round((nowMs - lastTapTime) / 1000)}s ago. Potential attendance proxy attempt logged.`,
          student,
          timestamp: timestampStr,
          proxyWarning: true,
        });

        const record: AttendanceRecord = {
          id: `att-${Date.now()}`,
          studentId: student.id,
          studentName: student.fullName,
          studentNumber: student.studentNumber,
          department: student.department,
          avatarUrl: student.avatarUrl,
          rfidUid: student.rfidUid,
          timestamp: timestampStr,
          terminalId: terminal.id,
          terminalName: terminal.name,
          location: terminal.location,
          method: methodToUse,
          status: 'PROXY_WARNING',
          sessionCode: activeLecture?.courseCode,
          sessionName: activeLecture?.courseName,
          room: terminal.roomCode,
          alertDispatched: false,
          notes: 'Flagged: Rapid consecutive tap within anti-passback window.',
        };
        onRecordAttendance(record, student);
        return;
      }

      // Check 3: Punctuality check (simulate late if past 8:10 AM or random demo variation)
      const isLateCheck = student.id === 'stu-04' || (student.lateArrivals > 5 && Math.random() > 0.4);

      if (isLateCheck) {
        soundController.playWarningBeep();
        const lateMins = 12 + Math.floor(Math.random() * 8);
        setFeedback({
          type: 'WARNING',
          title: `RECORDED: LATE ARRIVAL (+${lateMins}m)`,
          subtitle: `Class: ${activeLecture?.courseCode || 'Scheduled Session'} · Turing Hall · Parent SMS dispatched`,
          student,
          timestamp: timestampStr,
          smsAlertSent: true,
        });

        const record: AttendanceRecord = {
          id: `att-${Date.now()}`,
          studentId: student.id,
          studentName: student.fullName,
          studentNumber: student.studentNumber,
          department: student.department,
          avatarUrl: student.avatarUrl,
          rfidUid: student.rfidUid,
          timestamp: timestampStr,
          terminalId: terminal.id,
          terminalName: terminal.name,
          location: terminal.location,
          method: methodToUse,
          status: 'LATE',
          lateMinutes: lateMins,
          sessionCode: activeLecture?.courseCode,
          sessionName: activeLecture?.courseName,
          room: terminal.roomCode,
          alertDispatched: true,
          notes: `Late check-in (+${lateMins} mins past lecture commencement).`,
        };
        onRecordAttendance(record, student);
      } else {
        // Success: On Time
        soundController.playSuccessBeep();
        setFeedback({
          type: 'SUCCESS',
          title: 'VERIFIED: ATTENDANCE RECORDED',
          subtitle: `On Time · ${activeLecture?.courseCode || 'General Entry'} · Verified via ${methodToUse.replace('_', ' ')}`,
          student,
          timestamp: timestampStr,
          smsAlertSent: true,
        });

        const record: AttendanceRecord = {
          id: `att-${Date.now()}`,
          studentId: student.id,
          studentName: student.fullName,
          studentNumber: student.studentNumber,
          department: student.department,
          avatarUrl: student.avatarUrl,
          rfidUid: student.rfidUid,
          timestamp: timestampStr,
          terminalId: terminal.id,
          terminalName: terminal.name,
          location: terminal.location,
          method: methodToUse,
          status: 'ON_TIME',
          sessionCode: activeLecture?.courseCode,
          sessionName: activeLecture?.courseName,
          room: terminal.roomCode,
          alertDispatched: true,
          notes: 'Standard authorized contactless swipe.',
        };
        onRecordAttendance(record, student);
      }
    }, 450);
  };

  // Manual UID / Student ID search & tap
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUidInput.trim()) return;

    const query = manualUidInput.trim().toLowerCase();
    const found = students.find(
      (s) =>
        s.studentNumber.toLowerCase().includes(query) ||
        s.rfidUid.toLowerCase().includes(query) ||
        s.barcode.toLowerCase().includes(query) ||
        s.fullName.toLowerCase().includes(query)
    );

    if (found) {
      handleCardTap(found, 'RFID_TAP');
      setManualUidInput('');
    } else {
      soundController.playErrorBeep();
      setFeedback({
        type: 'ERROR',
        title: 'UNRECOGNIZED CARD OR UID',
        subtitle: `No enrolled student matched badge UID "${manualUidInput}". Check database sync.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  return (
    <div className={`transition-all ${isKioskMode ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto' : 'space-y-6'}`}>
      {/* Top Header & Terminal Selector (Hidden in kiosk mode or minimized) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Hardware Interface</span>
            <span>·</span>
            <span>NFC & RFID Reader</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Smart ID Card Attendance Terminal
          </h2>
        </div>

        {/* Terminal and Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reader Location Switcher */}
          <div className="relative">
            <select
              value={selectedTerminalId}
              onChange={(e) => setSelectedTerminalId(e.target.value)}
              className="text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-2 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              {terminals.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.roomCode})
                </option>
              ))}
            </select>
          </div>

          {/* Kiosk Fullscreen Switch */}
          <button
            onClick={() => setIsKioskMode(!isKioskMode)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            title="Toggle wall-mounted classroom tablet mode"
          >
            {isKioskMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isKioskMode ? 'Exit Kiosk' : 'Kiosk Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Rig & Tap Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Physical Reader Hardware Emulation (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-xl bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Terminal Top Hardware Bezel */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide uppercase">
                    {terminal.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {terminal.frequency} · IP: {terminal.ipAddress}
                  </div>
                </div>
              </div>

              {/* Hardware Digital Clock */}
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-emerald-400 tabular-nums tracking-widest flex items-center gap-1.5 justify-end">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>{currentTime || '08:00:00 AM'}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ROOM: {terminal.roomCode}
                </div>
              </div>
            </div>

            {/* Current Course Context Banner */}
            <div className="my-4 py-2 px-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
              <div className="min-w-0">
                <div className="text-slate-400 text-[10px] uppercase font-mono">Current Lecture</div>
                <div className="text-white font-semibold truncate">
                  {activeLecture ? `${activeLecture.courseCode} · ${activeLecture.courseName}` : 'Open Campus Access'}
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="text-[10px] font-mono text-amber-400 font-medium">
                  {activeLecture?.timeSlot || 'Continuous Gate Check'}
                </span>
              </div>
            </div>

            {/* Glowing Interactive Tap Target (The Physical NFC / RFID Sensor Zone) */}
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center relative">
              {/* Radiating Radar rings when ready */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center">
                {/* Visual pulse glow */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    feedback.type === 'SUCCESS'
                      ? 'bg-emerald-500/20 border-2 border-emerald-500'
                      : feedback.type === 'WARNING'
                      ? 'bg-amber-500/20 border-2 border-amber-500'
                      : feedback.type === 'ERROR'
                      ? 'bg-rose-500/20 border-2 border-rose-500'
                      : 'bg-indigo-600/10 border border-indigo-500/30'
                  }`}
                ></div>

                {isScanning && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-75"></div>
                )}

                {/* Inner target plate */}
                <div
                  className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center text-center p-4 border transition-colors shadow-inner ${
                    feedback.type === 'SUCCESS'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : feedback.type === 'WARNING'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : feedback.type === 'ERROR'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <Wifi className="w-10 h-10 rotate-90 stroke-[2.5] mb-2" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    {isScanning ? 'Reading RFID...' : 'Tap Card Here'}
                  </span>
                  <span className="text-[9px] opacity-75 font-mono mt-0.5">
                    13.56 MHz NFC / RFID
                  </span>
                </div>

                {/* Optical Laser line when barcode scanner mode is selected */}
                {scanMethod === 'BARCODE_SCAN' && (
                  <div className="absolute inset-x-4 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-scan-sweep pointer-events-none"></div>
                )}
              </div>

              {/* Method Switcher Pills (Interactive Tab controls) */}
              <div className="mt-5 flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setScanMethod('RFID_TAP')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    scanMethod === 'RFID_TAP' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Physical RFID Card
                </button>
                <button
                  onClick={() => setScanMethod('NFC_MOBILE')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    scanMethod === 'NFC_MOBILE' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mobile Apple/Google Wallet
                </button>
                <button
                  onClick={() => setScanMethod('BARCODE_SCAN')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    scanMethod === 'BARCODE_SCAN' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Optical Barcode
                </button>
              </div>
            </div>

            {/* Live Terminal Feedback HUD Readout */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                feedback.type === 'SUCCESS'
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-white'
                  : feedback.type === 'WARNING'
                  ? 'bg-amber-950/70 border-amber-500/80 text-white'
                  : feedback.type === 'ERROR'
                  ? 'bg-rose-950/70 border-rose-500/80 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Result Icon */}
                <div className="shrink-0 mt-0.5">
                  {feedback.type === 'SUCCESS' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                  {feedback.type === 'WARNING' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                  {feedback.type === 'ERROR' && <XCircle className="w-6 h-6 text-rose-400" />}
                  {feedback.type === 'IDLE' && <Radio className="w-6 h-6 text-slate-400" />}
                </div>

                {/* Readout Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold tracking-tight uppercase truncate">
                      {feedback.title}
                    </h4>
                    {feedback.timestamp && (
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {feedback.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">{feedback.subtitle}</p>

                  {/* Student badge details if verified */}
                  {feedback.student && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={feedback.student.avatarUrl}
                          alt={feedback.student.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <span className="font-semibold text-white block">
                            {feedback.student.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-300">
                            ID: {feedback.student.studentNumber} · UID: {feedback.student.rfidUid}
                          </span>
                        </div>
                      </div>

                      {feedback.smsAlertSent && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                          <Send className="w-3 h-3" />
                          <span>Parent SMS Sent</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Hardware Terminal Diagnostics */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>FIRMWARE: {terminal.firmware}</span>
              <span>SCANS TODAY: {terminal.totalScansToday}</span>
              <span>ANTENNA: ISO/IEC 14443-A READY</span>
            </div>
          </div>
        </div>

        {/* Interactive Student Card Deck & Simulator Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Card Tap Palette */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student ID Card Simulator</h3>
                <p className="text-xs text-slate-500">
                  Click any student smart card to simulate tapping the reader.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {students.length} Badges
              </span>
            </div>

            {/* Grid of Student Cards ready for instant tap */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {students.map((student) => {
                const isSuspended = student.status === 'SUSPENDED';
                return (
                  <button
                    key={student.id}
                    onClick={() => handleCardTap(student)}
                    disabled={isScanning}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isSuspended
                        ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/60'
                        : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-300 shadow-xs"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center">
                          <Wifi className="w-2.5 h-2.5 rotate-90" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {student.fullName}
                          </span>
                          {isSuspended && (
                            <span className="text-[9px] font-bold text-rose-600 uppercase tracking-tight">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {student.studentNumber} · {student.major}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          UID: {student.rfidUid}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2 text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 group-hover:text-white bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors shadow-xs">
                        <span>Tap</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual UID or Barcode Reader Input */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <ScanLine className="w-3.5 h-3.5 text-slate-500" />
              <span>Manual Card Reader / Optical Barcode Entry</span>
            </h4>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualUidInput}
                onChange={(e) => setManualUidInput(e.target.value)}
                placeholder="Scan barcode or type UID (e.g. 04:A2:8F or 8841)..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Scan Input
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-2">
              Tip: Supports external USB RFID card readers (acts as keyboard HID wedge input).
            </p>
          </div>

          {/* Quick Real-Time Feed Preview */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-bold text-slate-800">Terminal Tap History</span>
              <span className="text-[11px] font-mono text-slate-500">Live Synced</span>
            </div>
            <div className="space-y-1.5">
              {recentRecords.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-slate-200/70"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        rec.status === 'ON_TIME'
                          ? 'bg-emerald-500'
                          : rec.status === 'LATE'
                          ? 'bg-amber-500'
                          : rec.status === 'PROXY_WARNING'
                          ? 'bg-purple-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-medium text-slate-900 truncate">{rec.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] tabular-nums shrink-0">
                    <span>{rec.timestamp}</span>
                    <span className="font-semibold text-slate-700">{rec.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
