import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CalendarCheck,
  Calendar,
  Save,
  CheckCheck,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchClassData = async () => {
    try {
      const [resC, resS] = await Promise.all([api.get('/classes'), api.get('/sections')]);
      if (resC.data?.success) {
        setClasses(resC.data.data);
        if (resC.data.data.length > 0) setSelectedClass(resC.data.data[0]._id);
      }
      if (resS.data?.success) setSections(resS.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchAttendanceRoster = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await api.get('/attendance/class', {
        params: { classId: selectedClass, sectionId: selectedSection, date },
      });
      if (res.data?.success) {
        setStudentList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRoster();
  }, [selectedClass, selectedSection, date]);

  const toggleStatus = (studentId, status) => {
    setStudentList((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const markAll = (status) => {
    setStudentList((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        date,
        attendanceList: studentList.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
        })),
      };
      const res = await api.post('/attendance/class', payload);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: `Attendance for ${date} submitted successfully!` });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to record attendance' });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = studentList.filter((s) => s.status === 'Present').length;
  const absentCount = studentList.filter((s) => s.status === 'Absent').length;
  const lateCount = studentList.filter((s) => s.status === 'Late').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Class Attendance Register</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Record, verify, and submit roll-call attendance for your classes.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || studentList.length === 0}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-70"
        >
          <Save className="w-4 h-4" /> {saving ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </div>

      {alertMsg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Sections</option>
            {sections
              .filter((s) => !selectedClass || s.classId?._id === selectedClass)
              .map((sec) => (
                <option key={sec._id} value={sec._id}>
                  Section {sec.name}
                </option>
              ))}
          </select>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => markAll('Present')}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
        </button>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-emerald-800">
          <span className="font-semibold">Present Today:</span>
          <strong className="text-base font-bold">{presentCount}</strong>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-rose-800">
          <span className="font-semibold">Absent Today:</span>
          <strong className="text-base font-bold">{absentCount}</strong>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-amber-800">
          <span className="font-semibold">Late Arrivals:</span>
          <strong className="text-base font-bold">{lateCount}</strong>
        </div>
      </div>

      {/* Student List Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Loading attendance roster...
                  </td>
                </tr>
              ) : studentList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No students in this class.
                  </td>
                </tr>
              ) : (
                studentList.map((stu) => (
                  <tr key={stu.studentId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700">#{stu.rollNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            stu.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.fullName}`
                          }
                          alt={stu.fullName}
                          className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-800">{stu.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{stu.admissionNo}</td>
                    <td className="py-3 px-4 text-slate-600">Section {stu.sectionName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {['Present', 'Absent', 'Late'].map((st) => {
                          const active = stu.status === st;
                          const btnColor =
                            st === 'Present'
                              ? active
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                              : st === 'Absent'
                              ? active
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                              : active
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50';

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => toggleStatus(stu.studentId, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${btnColor}`}
                            >
                              {st}
                            </button>
                          );
                        })}
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

export default MarkAttendance;
