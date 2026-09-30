import React, { useState } from 'react';
import {
  Send,
  Smartphone,
  CheckCheck,
  Bell,
  Clock,
  MessageSquare,
  ShieldAlert,
  Settings,
  Filter
} from 'lucide-react';
import { ParentNotification, Student } from '../types/attendance';

interface ParentAlertsPanelProps {
  notifications: ParentNotification[];
  students: Student[];
  onSendCustomNotification: (notif: ParentNotification) => void;
}

export const ParentAlertsPanel: React.FC<ParentAlertsPanelProps> = ({
  notifications,
  students,
  onSendCustomNotification,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [alertType, setAlertType] = useState<'ENTRY_GATE' | 'CLASSROOM_ON_TIME' | 'LATE_ARRIVAL' | 'ABSENCE_ALERT'>('LATE_ARRIVAL');
  const [customMessage, setCustomMessage] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let msg = customMessage;
    if (!msg) {
      if (alertType === 'ENTRY_GATE') {
        msg = `Metro University Notice: ${selectedStudent.fullName} safely checked in through North Turnstile 01 at ${timeStr}.`;
      } else if (alertType === 'CLASSROOM_ON_TIME') {
        msg = `Metro University: ${selectedStudent.fullName} marked present on-time via Smart ID card for morning lecture.`;
      } else if (alertType === 'LATE_ARRIVAL') {
        msg = `Metro University Alert: ${selectedStudent.fullName} arrived 15 minutes late for lecture at ${timeStr}.`;
      } else {
        msg = `Metro University Urgent: ${selectedStudent.fullName} is unrecorded for morning lecture (Cutoff 09:15 AM). Please verify attendance.`;
      }
    }

    const newNotif: ParentNotification = {
      id: `notif-${Date.now()}`,
      timestamp: timeStr,
      studentName: selectedStudent.fullName,
      studentNumber: selectedStudent.studentNumber,
      parentPhone: selectedStudent.parentPhone,
      type: alertType,
      message: msg,
      channel,
      status: 'DELIVERED',
    };

    onSendCustomNotification(newNotif);
    setCustomMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Automated Messaging Gateway</span>
            <span>·</span>
            <span>Instant Parent SMS & WhatsApp</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Automated Parent & Guardian Notifications
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Gateway Active (Twilio / WhatsApp Business API Synced)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Simulator & Alert Rules (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispatch Simulator Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Trigger Instant Parent Notification
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Simulate the automated trigger that fires when a student taps their RFID ID card or fails to check in.
            </p>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Trigger Event</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as unknown as typeof alertType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  >
                    <option value="ENTRY_GATE">Gate Tap Entry (Campus Arrival)</option>
                    <option value="CLASSROOM_ON_TIME">Classroom Tap (On-Time Roll)</option>
                    <option value="LATE_ARRIVAL">Tardy Tap (Late Arrival Alert)</option>
                    <option value="ABSENCE_ALERT">Absence Trigger (Cut-off Missed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Recipient Parent Phone</label>
                  <input
                    type="text"
                    value={selectedStudent?.parentPhone || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-600 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Channel Delivery</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel('SMS')}
                      className={`flex-1 py-2 font-medium rounded-lg transition-colors border ${
                        channel === 'SMS'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-300'
                      }`}
                    >
                      Cellular SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('WHATSAPP')}
                      className={`flex-1 py-2 font-medium rounded-lg transition-colors border ${
                        channel === 'WHATSAPP'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-300'
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Custom Alert Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Leave empty to use institutional automated template..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Immediate Dispatch</span>
              </button>
            </form>
          </div>

          {/* Institutional Automated Rules Setting */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Configured Attendance Notification Triggers</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Gate Ingress Notification</span>
                  <span className="text-slate-500 text-[11px]">
                    Dispatches instant arrival SMS when student card taps turnstile reader.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Enabled</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Tardiness Threshold Notice</span>
                  <span className="text-slate-500 text-[11px]">
                    Sends alert if card swipe is &gt;10 minutes past class start time.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Enabled (10m)</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Daily Absence Cut-Off Sweep</span>
                  <span className="text-slate-500 text-[11px]">
                    Dispatches automated notification at 09:15 AM for zero recorded badge taps.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">09:15 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Realistic Parent Smartphone Simulator (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 text-slate-900 relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2"></div>
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Screen Content */}
            <div className="bg-slate-100 rounded-[34px] p-3.5 h-[520px] flex flex-col justify-between overflow-hidden">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono px-2 pt-1 border-b border-slate-200 pb-2">
                <span>08:24 AM</span>
                <span className="font-bold">METRO-ALERT (SMS)</span>
                <span>100% ⚡</span>
              </div>

              {/* Message Chat Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1">
                <div className="text-center text-[10px] text-slate-400 font-mono">
                  Today · Metro University Gateway
                </div>

                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex flex-col items-start space-y-1">
                    <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-sm p-3 shadow-xs border border-slate-200/80 text-[11px] text-slate-800 leading-relaxed">
                      <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 mb-1">
                        <span className="text-indigo-600 font-mono">
                          {notif.channel} ALERT
                        </span>
                        <span className="font-mono tabular-nums">{notif.timestamp}</span>
                      </div>
                      <p>{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 pl-1 font-mono">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span>Delivered to {notif.parentPhone}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phone Bottom Pill bar */}
              <div className="pt-2 text-center border-t border-slate-200">
                <div className="w-24 h-1 bg-slate-400 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
