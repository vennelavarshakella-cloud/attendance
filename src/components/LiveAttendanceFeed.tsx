import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ArrowUpDown,
  Download,
  Check,
  Smartphone,
  CreditCard,
  Barcode
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ScanMethod } from '../types/attendance';

interface LiveAttendanceFeedProps {
  records: AttendanceRecord[];
  onUpdateRecordStatus: (recordId: string, newStatus: AttendanceStatus) => void;
  onExportCsv: () => void;
}

export const LiveAttendanceFeed: React.FC<LiveAttendanceFeedProps> = ({
  records,
  onUpdateRecordStatus,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.rfidUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    const matchesTerminal = terminalFilter === 'ALL' || rec.terminalId === terminalFilter;

    return matchesSearch && matchesStatus && matchesTerminal;
  });

  // Calculate quick metrics
  const totalScans = records.length;
  const onTimeCount = records.filter((r) => r.status === 'ON_TIME').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const deniedCount = records.filter((r) => r.status === 'DENIED' || r.status === 'PROXY_WARNING').length;
  const punctualityRate = totalScans > 0 ? Math.round((onTimeCount / totalScans) * 100) : 100;

  const getMethodIcon = (method: ScanMethod) => {
    switch (method) {
      case 'RFID_TAP':
        return <CreditCard className="w-3.5 h-3.5 text-slate-500" />;
      case 'NFC_MOBILE':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-500" />;
      case 'BARCODE_SCAN':
      case 'SMART_QR':
        return <Barcode className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getStatusDisplay = (record: AttendanceRecord) => {
    switch (record.status) {
      case 'ON_TIME':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>On Time</span>
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Late {record.lateMinutes ? `(+${record.lateMinutes}m)` : ''}</span>
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Excused</span>
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Denied / Card Hold</span>
          </span>
        );
      case 'PROXY_WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>Proxy Tap Warning</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Audit Trail</span>
            <span>·</span>
            <span>Real-Time Ingestion</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Live Attendance Feed & Tap Logs
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Daily Roll CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Ribbons (Clean typographic layout, no pills) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Badge Taps Today</div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
            {totalScans}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Synchronized across 4 readers</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Punctuality Rate</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono-numbers mt-1">
            {punctualityRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{onTimeCount} on-time arrivals</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Tardy Check-ins</div>
          <div className="text-2xl font-bold text-amber-600 font-mono-numbers mt-1">
            {lateCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Automated late warnings logged</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Flagged & Denied</div>
          <div className="text-2xl font-bold text-rose-600 font-mono-numbers mt-1">
            {deniedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Security & card holds enforced</div>
        </div>
      </div>

      {/* Filters Bar (Interactive functional buttons & search) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID number, or RFID UID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Status Filter Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs">
            {['ALL', 'ON_TIME', 'LATE', 'DENIED', 'PROXY_WARNING'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ALL'
                  ? 'All Taps'
                  : status === 'ON_TIME'
                  ? 'On Time'
                  : status === 'LATE'
                  ? 'Late'
                  : status === 'DENIED'
                  ? 'Denied'
                  : 'Proxy Warning'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student & Badge</th>
                <th className="py-3 px-4">Department / Program</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Terminal & Room</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No attendance records match your current filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.avatarUrl}
                          alt={record.studentName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">
                            {record.studentName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {record.studentNumber} · UID: {record.rfidUid}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[180px]">
                        {record.department}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {record.sessionName || 'Campus Wide Access'}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                      {record.timestamp}
                    </td>

                    {/* Terminal & Room */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block truncate max-w-[170px]">
                        {record.terminalName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Room: {record.room || 'GATE'}
                      </span>
                    </td>

                    {/* Scan Method */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        {getMethodIcon(record.method)}
                        <span>{record.method.replace('_', ' ')}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusDisplay(record)}
                    </td>

                    {/* Action: Manual Override */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {record.status !== 'EXCUSED' ? (
                          <button
                            onClick={() => onUpdateRecordStatus(record.id, 'EXCUSED')}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Mark as excused with medical or official authorization"
                          >
                            Mark Excused
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Authorized</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
