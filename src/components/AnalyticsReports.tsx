import React from 'react';
import {
  Download,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { Student, AttendanceRecord } from '../types/attendance';

interface AnalyticsReportsProps {
  students: Student[];
  records: AttendanceRecord[];
  onExportCsv: () => void;
  onFlagStudent: (student: Student) => void;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  students,
  records,
  onExportCsv,
  onFlagStudent,
}) => {
  // Department aggregation
  const departmentStats = Array.from(new Set(students.map((s) => s.department))).map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept);
    const totalPossible = deptStudents.reduce((acc, s) => acc + s.totalClasses, 0);
    const totalAttended = deptStudents.reduce((acc, s) => acc + s.attendedClasses, 0);
    const avgAttendance = totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 100) : 100;
    return {
      department: dept,
      studentCount: deptStudents.length,
      avgAttendance,
    };
  });

  // Calculate At Risk Students (<75% attendance)
  const atRiskStudents = students.filter((s) => {
    const pct = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 100;
    return pct < 75;
  });

  // Method distribution
  const methodCounts = {
    RFID_TAP: records.filter((r) => r.method === 'RFID_TAP').length,
    NFC_MOBILE: records.filter((r) => r.method === 'NFC_MOBILE').length,
    BARCODE_SCAN: records.filter((r) => r.method === 'BARCODE_SCAN' || r.method === 'SMART_QR').length,
  };

  const totalScans = records.length || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Institutional Intelligence</span>
            <span>·</span>
            <span>Accreditation Compliance</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Attendance Analytics & Registrar Reports
          </h2>
        </div>

        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Generate Full Registrar CSV Report</span>
        </button>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Overall Campus Attendance</div>
          <div className="text-3xl font-bold text-slate-900 font-mono-numbers mt-1.5">
            89.4%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            +3.2% increase since smart ID card contactless turnstiles implementation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Average Morning Tap-in Time</div>
          <div className="text-3xl font-bold text-slate-900 font-mono-numbers mt-1.5">
            07:54 AM
          </div>
          <p className="text-xs text-slate-500 mt-1">
            92% of students arrive within the scheduled 15-minute ingress window.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Students Flagged &lt;75% Threshold</div>
          <div className="text-3xl font-bold text-rose-600 font-mono-numbers mt-1.5">
            {atRiskStudents.length} Students
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional minimum requirement for final exam qualification.
          </p>
        </div>
      </div>

      {/* Middle Section: Departmental Breakdown & Tap Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Attendance Ranking (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance by Academic Department</h3>
              <p className="text-xs text-slate-500">
                Calculated from contactless reader logs across lecture halls and laboratories.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{dept.department}</span>
                  <span className="font-mono-numbers font-bold text-slate-900">
                    {dept.avgAttendance}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.avgAttendance >= 85
                        ? 'bg-emerald-500'
                        : dept.avgAttendance >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${dept.avgAttendance}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{dept.studentCount} Active Students Enrolled</span>
                  <span>Target: &gt;80%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credential Verification Method Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Credential Ingress Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of hardware ID mediums used across campus readers.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Physical RFID Smart Card</span>
                  <span className="text-[11px] text-slate-500">MIFARE Classic &amp; DESFire 13.56 MHz</span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono-numbers text-slate-900">
                    {Math.round((methodCounts.RFID_TAP / totalScans) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">{methodCounts.RFID_TAP} taps</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Mobile NFC Student Pass</span>
                  <span className="text-[11px] text-slate-500">Apple Wallet &amp; Google Wallet</span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono-numbers text-slate-900">
                    {Math.round((methodCounts.NFC_MOBILE / totalScans) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">{methodCounts.NFC_MOBILE} taps</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Optical Barcode &amp; Smart QR</span>
                  <span className="text-[11px] text-slate-500">Laser scanning &amp; printed rear barcode</span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono-numbers text-slate-900">
                    {Math.round((methodCounts.BARCODE_SCAN / totalScans) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">{methodCounts.BARCODE_SCAN} taps</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Average contactless read latency: <span className="font-mono font-bold text-slate-800">180ms</span> per student tap.
          </div>
        </div>
      </div>

      {/* At-Risk Students Action Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Action Required: Attendance Deficiency Warning List
              </h3>
              <p className="text-xs text-slate-500">
                Students below statutory 75% attendance quota requiring academic counselor intervention.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Student Number</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Attendance %</th>
                <th className="py-2.5 px-3">Parent Phone</th>
                <th className="py-2.5 px-3 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    All students currently maintain above 75% attendance compliance.
                  </td>
                </tr>
              ) : (
                atRiskStudents.map((s) => {
                  const pct = Math.round((s.attendedClasses / s.totalClasses) * 100);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={s.avatarUrl}
                            alt={s.fullName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{s.studentNumber}</td>
                      <td className="py-3 px-3 text-slate-700">{s.department}</td>
                      <td className="py-3 px-3 font-mono-numbers font-bold text-rose-600">
                        {pct}% ({s.attendedClasses}/{s.totalClasses})
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{s.parentPhone}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onFlagStudent(s)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                        >
                          Send Official Notice
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
