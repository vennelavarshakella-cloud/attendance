import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Wifi,
  CreditCard,
  Phone,
  ShieldCheck,
  ShieldAlert,
  X,
  RotateCw,
  Printer,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Student } from '../types/attendance';
import { StudentIdCard } from './StudentIdCard';

interface StudentDirectoryProps {
  students: Student[];
  onTapCard: (student: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddNewStudent: (newStudent: Student) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  onTapCard,
  onUpdateStudent,
  onAddNewStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);

  // New Student Form State
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    studentNumber: `STU-2024-${8840 + students.length + 1}`,
    email: '',
    department: 'Computer Science & AI',
    major: 'B.S. Artificial Intelligence',
    yearLevel: '1st Year (Freshman)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    parentName: '',
    parentPhone: '+1 (555) 789-0199',
    emergencyContact: '+1 (555) 789-0198',
    bloodGroup: 'O+',
    status: 'ACTIVE' as const,
  });

  const departments = ['ALL', ...Array.from(new Set(students.map((s) => s.department)))];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rfidUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.major.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const toggleStudentStatus = (student: Student) => {
    const newStatus: Student['status'] = student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated: Student = { ...student, status: newStatus };
    onUpdateStudent(updated);
    if (selectedStudentForModal && selectedStudentForModal.id === student.id) {
      setSelectedStudentForModal(updated);
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.fullName) return;

    // Generate random 7-byte hex RFID UID
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    const generatedUid = `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
    const generatedBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    const created: Student = {
      id: `stu-${Date.now()}`,
      studentNumber: newStudentForm.studentNumber,
      fullName: newStudentForm.fullName,
      email: newStudentForm.email || `${newStudentForm.fullName.toLowerCase().replace(/\s+/g, '.')}@metro.edu`,
      department: newStudentForm.department,
      major: newStudentForm.major,
      yearLevel: newStudentForm.yearLevel,
      avatarUrl: newStudentForm.avatarUrl,
      rfidUid: generatedUid,
      barcode: generatedBarcode,
      smartQrData: `CAMPUS-ID:${newStudentForm.studentNumber};UID:${generatedUid.replace(/:/g, '')};SEC:VERIFIED-2026`,
      parentName: newStudentForm.parentName || 'Parent / Guardian',
      parentPhone: newStudentForm.parentPhone,
      emergencyContact: newStudentForm.emergencyContact,
      bloodGroup: newStudentForm.bloodGroup,
      validThru: '06/2028',
      status: newStudentForm.status,
      totalClasses: 30,
      attendedClasses: 29,
      lateArrivals: 1,
    };

    onAddNewStudent(created);
    setIsNewStudentModalOpen(false);
    setSelectedStudentForModal(created);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Identity Provisioning</span>
            <span>·</span>
            <span>NFC & RFID Credentials</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
            Student ID Cards & Credential Directory
          </h2>
        </div>

        <button
          onClick={() => setIsNewStudentModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Student ID Card</span>
        </button>
      </div>

      {/* Search & Department Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name, ID number, or RFID UID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map((student) => {
          const attendancePercent =
            student.totalClasses > 0
              ? Math.round((student.attendedClasses / student.totalClasses) * 100)
              : 100;
          const isAtRisk = attendancePercent < 75;
          const isSuspended = student.status === 'SUSPENDED';

          return (
            <div
              key={student.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                isSuspended
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Photo & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center">
                      <Wifi className="w-2.5 h-2.5 rotate-90" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isSuspended ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isSuspended ? 'Card On Hold' : 'Card Active'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Exp: {student.validThru}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                    {student.fullName}
                  </h3>
                  <div className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                    {student.major}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {student.department}
                  </div>
                </div>

                {/* RFID UID & Student ID */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">ID Number</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {student.studentNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">RFID UID</span>
                    <span className="font-mono text-slate-600 text-[10px]">
                      {student.rfidUid}
                    </span>
                  </div>
                </div>

                {/* Attendance Metric */}
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Attendance Rate</span>
                    <span
                      className={`font-bold font-mono-numbers text-sm ${
                        isAtRisk ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {attendancePercent}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Late Scans</span>
                    <span className="font-mono-numbers font-medium text-slate-700">
                      {student.lateArrivals} arrivals
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedStudentForModal(student)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Card</span>
                </button>

                <button
                  onClick={() => onTapCard(student)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                  title="Simulate tapping this card at attendance terminal"
                >
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
                  <span>Tap</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student 3D ID Card Inspection Modal */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Credential Inspection
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedStudentForModal.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Physical 3D Card */}
            <div className="py-2 flex justify-center">
              <StudentIdCard
                student={selectedStudentForModal}
                onTapCard={(s) => {
                  onTapCard(s);
                  setSelectedStudentForModal(null);
                }}
              />
            </div>

            {/* Detailed Security & NFC Metadata */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">
                    Contactless Standard
                  </span>
                  <span className="font-semibold text-slate-800">
                    ISO/IEC 14443 Type A (MIFARE DESFire)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">
                    Hardware Hex UID
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedStudentForModal.rfidUid}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">
                    Parent / Guardian Contact
                  </span>
                  <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{selectedStudentForModal.parentPhone}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">
                    Optical 1D Barcode
                  </span>
                  <span className="font-mono text-slate-800">
                    {selectedStudentForModal.barcode}
                  </span>
                </div>
              </div>

              {/* Status Toggle (To test suspended card rejection) */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Access Permission</span>
                  <span className="text-[11px] text-slate-500">
                    Toggle to test terminal denial / suspension response.
                  </span>
                </div>
                <button
                  onClick={() => toggleStudentStatus(selectedStudentForModal)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedStudentForModal.status === 'ACTIVE'
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {selectedStudentForModal.status === 'ACTIVE' ? 'Suspend Card' : 'Reactivate Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Student ID Card Issuance Modal */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Provisioning
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Issue New Student Smart ID Card
                </h3>
              </div>
              <button
                onClick={() => setIsNewStudentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Daniel Evans"
                  value={newStudentForm.fullName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Student ID Number</label>
                  <input
                    type="text"
                    value={newStudentForm.studentNumber}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-600 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Department</label>
                  <select
                    value={newStudentForm.department}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  >
                    <option value="Computer Science & AI">Computer Science & AI</option>
                    <option value="Electrical & Computer Eng.">Electrical & Computer Eng.</option>
                    <option value="Biomedical Engineering">Biomedical Engineering</option>
                    <option value="Data Science & Analytics">Data Science & Analytics</option>
                    <option value="Design & Interaction Media">Design & Interaction Media</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Parent Phone (for SMS)</label>
                  <input
                    type="text"
                    value={newStudentForm.parentPhone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Blood Group</label>
                  <select
                    value={newStudentForm.bloodGroup}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                A unique cryptographic 13.56 MHz RFID UID and Code 128 barcode will be automatically provisioned and burned to this card upon creation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  Provision & Burn Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
