import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  UserX,
  AlertCircle,
  Radio,
  Send
} from 'lucide-react';
import { LectureSession, Student, AttendanceRecord } from '../types/attendance';

interface ClassSessionsProps {
  lectures: LectureSession[];
  students: Student[];
  records: AttendanceRecord[];
  onTriggerTerminalForLecture: (lecture: LectureSession) => void;
  onSendAbsenceAlert: (absentStudents: Student[], lecture: LectureSession) => void;
}

export const ClassSessions: React.FC<ClassSessionsProps> = ({
  lectures,
  students,
  records,
  onTriggerTerminalForLecture,
  onSendAbsenceAlert,
}) => {
  const [selectedLectureId, setSelectedLectureId] = useState<string>(lectures[0]?.id || '');

  const activeLecture = lectures.find((l) => l.id === selectedLectureId) || lectures[0];

  // Calculate enrolled students for this lecture
  const enrolledStudents = students.filter((s) =>
    activeLecture?.enrolledStudentIds.includes(s.id)
  );

  // Cross reference with today's attendance logs
  const verifiedTaps = records.filter(
    (r) =>
      r.sessionCode === activeLecture?.courseCode &&
      (r.status === 'ON_TIME' || r.status === 'LATE' || r.status === 'EXCUSED')
  );

  const presentStudentIds = new Set(verifiedTaps.map((t) => t.studentId));
  const absentStudents = enrolledStudents.filter((s) => !presentStudentIds.has(s.id));

  const attendancePercent =
    enrolledStudents.length > 0
      ? Math.round((presentStudentIds.size / enrolledStudents.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Academic Schedule</span>
            <span>·</span>
            <span>Period & Lecture Rosters</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Classroom Sessions & Roll Call Roster
          </h2>
        </div>

        <button
          onClick={() => onSendAbsenceAlert(absentStudents, activeLecture)}
          disabled={absentStudents.length === 0}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
            absentStudents.length > 0
              ? 'text-white bg-slate-900 hover:bg-slate-800'
              : 'text-slate-400 bg-slate-100 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Absence SMS to Parents ({absentStudents.length})</span>
        </button>
      </div>

      {/* Course Session Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {lectures.map((lecture) => {
          const isSelected = lecture.id === selectedLectureId;
          const lectureTaps = records.filter(
            (r) =>
              r.sessionCode === lecture.courseCode &&
              (r.status === 'ON_TIME' || r.status === 'LATE' || r.status === 'EXCUSED')
          );
          const pct =
            lecture.enrolledStudentIds.length > 0
              ? Math.round((lectureTaps.length / lecture.enrolledStudentIds.length) * 100)
              : 0;

          return (
            <button
              key={lecture.id}
              onClick={() => setSelectedLectureId(lecture.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className={isSelected ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {lecture.courseCode}
                </span>
                <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
                  {lecture.room}
                </span>
              </div>
              <h4 className="font-bold text-sm tracking-tight line-clamp-1">
                {lecture.courseName}
              </h4>
              <div
                className={`text-xs mt-1 truncate ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {lecture.instructor}
              </div>

              {/* Attendance Mini Bar */}
              <div className="mt-3 pt-3 border-t border-slate-200/20 flex items-center justify-between text-xs font-mono tabular-nums">
                <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                  {lectureTaps.length} / {lecture.enrolledStudentIds.length} Verified
                </span>
                <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Lecture Details & Enrolled Roster */}
      {activeLecture && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="font-semibold text-slate-800">{activeLecture.courseCode}</span>
                <span>·</span>
                <span>{activeLecture.timeSlot}</span>
                <span>·</span>
                <span>{activeLecture.room}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {activeLecture.courseName}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Lead Lecturer: {activeLecture.instructor}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTriggerTerminalForLecture(activeLecture)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assign Door Terminal</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">ID Number</th>
                  <th className="py-2.5 px-3">RFID UID Badge</th>
                  <th className="py-2.5 px-3">Parent Phone</th>
                  <th className="py-2.5 px-3">Today&apos;s Status</th>
                  <th className="py-2.5 px-3">Verification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledStudents.map((student) => {
                  const tapRecord = verifiedTaps.find((t) => t.studentId === student.id);
                  const isPresent = Boolean(tapRecord);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatarUrl}
                            alt={student.fullName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{student.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {student.studentNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {student.rfidUid}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {student.parentPhone}
                      </td>
                      <td className="py-3 px-3">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Present ({tapRecord?.status.replace('_', ' ')})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Unrecorded / Absent</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {isPresent ? (
                          <span className="font-mono tabular-nums text-[11px]">
                            Tapped at {tapRecord?.timestamp} via {tapRecord?.method.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Pending terminal swipe
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
