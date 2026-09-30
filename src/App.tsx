/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewHero } from './components/OverviewHero';
import { InteractiveTerminal } from './components/InteractiveTerminal';
import { LiveAttendanceFeed } from './components/LiveAttendanceFeed';
import { StudentDirectory } from './components/StudentDirectory';
import { ClassSessions } from './components/ClassSessions';
import { ParentAlertsPanel } from './components/ParentAlertsPanel';
import { AnalyticsReports } from './components/AnalyticsReports';
import {
  INITIAL_STUDENTS,
  INITIAL_TERMINALS,
  INITIAL_LECTURES,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import {
  Student,
  AttendanceRecord,
  ParentNotification,
  AttendanceStatus,
  LectureSession,
} from './types/attendance';
import { CheckCircle2, Bell, Radio, CreditCard, BarChart3, Users, Send } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('terminal');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [terminals, setTerminals] = useState(INITIAL_TERMINALS);
  const [lectures, setLectures] = useState(INITIAL_LECTURES);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [notifications, setNotifications] = useState<ParentNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>(INITIAL_TERMINALS[1].id);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper: show brief floating toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handler: Attendance recorded from terminal tap
  const handleRecordAttendance = (record: AttendanceRecord, student: Student) => {
    // Add to records feed
    setRecords((prev) => [record, ...prev]);

    // Update student's metrics
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === student.id) {
          const isAttended = record.status === 'ON_TIME' || record.status === 'LATE' || record.status === 'EXCUSED';
          const isLate = record.status === 'LATE';
          return {
            ...s,
            totalClasses: s.totalClasses + (isAttended ? 1 : 0),
            attendedClasses: s.attendedClasses + (isAttended ? 1 : 0),
            lateArrivals: s.lateArrivals + (isLate ? 1 : 0),
          };
        }
        return s;
      })
    );

    // If alert dispatched, log parent notification
    if (record.alertDispatched) {
      const nowStr = record.timestamp;
      let notifType: ParentNotification['type'] = 'CLASSROOM_ON_TIME';
      let notifMsg = `Metro University: ${student.fullName} marked present for lecture in ${record.room || 'Hall'}.`;

      if (record.status === 'LATE') {
        notifType = 'LATE_ARRIVAL';
        notifMsg = `Metro University Alert: ${student.fullName} arrived ${record.lateMinutes || 12} mins late at ${record.timestamp}.`;
      } else if (record.status === 'DENIED') {
        notifType = 'UNAUTHORIZED_ACCESS';
        notifMsg = `Metro Security Notice: Card hold flagged for ${student.fullName} at ${record.terminalName}.`;
      }

      const notif: ParentNotification = {
        id: `notif-${Date.now()}`,
        timestamp: nowStr,
        studentName: student.fullName,
        studentNumber: student.studentNumber,
        parentPhone: student.parentPhone,
        type: notifType,
        message: notifMsg,
        channel: 'SMS',
        status: 'DELIVERED',
      };
      setNotifications((prev) => [notif, ...prev]);
      triggerToast(`Attendance logged for ${student.fullName} · Parent SMS dispatched`);
    }
  };

  // Handler: Manual status update
  const handleUpdateRecordStatus = (recordId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
    );
    triggerToast(`Record status updated to ${newStatus}`);
  };

  // Handler: Update student profile
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    triggerToast(`Student credentials updated for ${updatedStudent.fullName}`);
  };

  // Handler: Add new student
  const handleAddNewStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    triggerToast(`Smart ID Card provisioned for ${newStudent.fullName}`);
  };

  // Handler: Tap student card from directory
  const handleTapStudentFromDirectory = (student: Student) => {
    setActiveTab('terminal');
    // We will simulate quick tap in the terminal
    triggerToast(`Switched to terminal with ${student.fullName}'s ID card loaded`);
  };

  // Handler: Bulk Absence alert dispatched from classroom roster
  const handleSendAbsenceAlert = (absentStudents: Student[], lecture: LectureSession) => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newAlerts: ParentNotification[] = absentStudents.map((stu) => ({
      id: `notif-absent-${stu.id}-${Date.now()}`,
      timestamp: timeStr,
      studentName: stu.fullName,
      studentNumber: stu.studentNumber,
      parentPhone: stu.parentPhone,
      type: 'ABSENCE_ALERT',
      message: `Metro University Official Notice: ${stu.fullName} was unrecorded for ${lecture.courseCode} (${lecture.courseName}) in ${lecture.room}.`,
      channel: 'SMS',
      status: 'DELIVERED',
    }));

    setNotifications((prev) => [...newAlerts, ...prev]);
    triggerToast(`Dispatched absence SMS alerts to ${absentStudents.length} parents`);
  };

  // Handler: Direct custom notification
  const handleSendCustomNotification = (notif: ParentNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    triggerToast(`Direct message delivered to ${notif.parentPhone}`);
  };

  // Handler: Flag student notice
  const handleFlagStudent = (student: Student) => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const notif: ParentNotification = {
      id: `notif-warn-${student.id}-${Date.now()}`,
      timestamp: timeStr,
      studentName: student.fullName,
      studentNumber: student.studentNumber,
      parentPhone: student.parentPhone,
      type: 'ABSENCE_ALERT',
      message: `Metro Registrar Alert: ${student.fullName}'s attendance is below statutory 75% requirement. Parent counseling conference requested.`,
      channel: 'SMS',
      status: 'DELIVERED',
    };
    setNotifications((prev) => [notif, ...prev]);
    triggerToast(`Official academic deficiency notice sent to ${student.parentPhone}`);
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Student Name',
      'Student Number',
      'Department',
      'RFID UID',
      'Timestamp',
      'Terminal',
      'Room',
      'Method',
      'Status',
      'Late Minutes',
      'Notes',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.studentName}"`,
      `"${r.studentNumber}"`,
      `"${r.department}"`,
      `"${r.rfidUid}"`,
      `"${r.timestamp}"`,
      `"${r.terminalName}"`,
      `"${r.room || 'N/A'}"`,
      `"${r.method}"`,
      `"${r.status}"`,
      `"${r.lateMinutes || 0}"`,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CampusTap_Attendance_Roll_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast('Daily roll call CSV downloaded successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onExportCsv={handleExportCsv}
        onlineTerminalsCount={terminals.filter((t) => t.status === 'ONLINE').length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Quick Hero Banner available or switchable */}
        {activeTab === 'terminal' && (
          <div className="mb-8">
            <OverviewHero
              onStartTap={() => {
                const el = document.getElementById('terminal-rig');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewBadges={() => setActiveTab('students')}
            />
          </div>
        )}

        {/* Tab 1: Interactive Terminal */}
        {activeTab === 'terminal' && (
          <div id="terminal-rig">
            <InteractiveTerminal
              students={students}
              terminals={terminals}
              lectures={lectures}
              selectedTerminalId={selectedTerminalId}
              setSelectedTerminalId={setSelectedTerminalId}
              onRecordAttendance={handleRecordAttendance}
              recentRecords={records}
            />
          </div>
        )}

        {/* Tab 2: Live Feed */}
        {activeTab === 'live-feed' && (
          <LiveAttendanceFeed
            records={records}
            onUpdateRecordStatus={handleUpdateRecordStatus}
            onExportCsv={handleExportCsv}
          />
        )}

        {/* Tab 3: Student Directory & ID Cards */}
        {activeTab === 'students' && (
          <StudentDirectory
            students={students}
            onTapCard={handleTapStudentFromDirectory}
            onUpdateStudent={handleUpdateStudent}
            onAddNewStudent={handleAddNewStudent}
          />
        )}

        {/* Tab 4: Classroom Sessions */}
        {activeTab === 'lectures' && (
          <ClassSessions
            lectures={lectures}
            students={students}
            records={records}
            onTriggerTerminalForLecture={(lecture) => {
              setSelectedTerminalId(lecture.terminalId);
              setActiveTab('terminal');
              triggerToast(`Terminal linked to ${lecture.courseCode}`);
            }}
            onSendAbsenceAlert={handleSendAbsenceAlert}
          />
        )}

        {/* Tab 5: Parent Alerts */}
        {activeTab === 'alerts' && (
          <ParentAlertsPanel
            notifications={notifications}
            students={students}
            onSendCustomNotification={handleSendCustomNotification}
          />
        )}

        {/* Tab 6: Analytics & Registrar Reports */}
        {activeTab === 'analytics' && (
          <AnalyticsReports
            students={students}
            records={records}
            onExportCsv={handleExportCsv}
            onFlagStudent={handleFlagStudent}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CampusTap™</span>
            <span>·</span>
            <span>Smart Student ID Attendance &amp; Access Control Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>ISO/IEC 14443 Type A</span>
            <span>·</span>
            <span>DESFire EV3 13.56MHz</span>
            <span>·</span>
            <span>REST API Synced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
