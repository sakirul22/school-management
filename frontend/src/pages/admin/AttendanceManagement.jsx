import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CalendarCheck,
  Calendar,
  Filter,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  CheckCheck,
} from 'lucide-react';

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student', 'teacher'
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Records
  const [studentList, setStudentList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data?.success) {
        setClasses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedClass(res.data.data[0]._id);
        }
      }
      const resS = await api.get('/sections');
      if (resS.data?.success) setSections(resS.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchAttendance = async () => {
    if (activeTab === 'student') {
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
    } else {
      // Teacher tab
      try {
        setLoading(true);
        const res = await api.get('/attendance/teacher', { params: { date } });
        if (res.data?.success) {
          setTeacherList(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [activeTab, selectedClass, selectedSection, date]);

  const toggleStudentStatus = (studentId, status) => {
    setStudentList((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const toggleTeacherStatus = (teacherId, status) => {
    setTeacherList((prev) =>
      prev.map((t) => (t.teacherId === teacherId ? { ...t, status } : t))
    );
  };

  const markAllStudents = (status) => {
    setStudentList((prev) => prev.map((s) => ({ ...s, status })));
  };

  const markAllTeachers = (status) => {
    setTeacherList((prev) => prev.map((t) => ({ ...t, status })));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      if (activeTab === 'student') {
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
          setAlertMsg({ type: 'success', text: `Student attendance saved for ${date}!` });
        }
      } else {
        const payload = {
          date,
          attendanceList: teacherList.map((t) => ({
            teacherId: t.teacherId,
            status: t.status,
            remarks: t.remarks,
          })),
        };
        const res = await api.post('/attendance/teacher', payload);
        if (res.data?.success) {
          setAlertMsg({ type: 'success', text: `Faculty attendance recorded for ${date}!` });
        }
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to submit attendance' });
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const list = activeTab === 'student' ? studentList : teacherList;
    const headers = ['ID,Name,Date,Status,Remarks'];
    const rows = list.map((item) =>
      `"${item.admissionNo || item.code}","${item.fullName}","${date}","${item.status}","${item.remarks || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab}_attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = studentList.filter((s) => s.status === 'Present').length;
  const absentCount = studentList.filter((s) => s.status === 'Absent').length;
  const lateCount = studentList.filter((s) => s.status === 'Late').length;
  const total = studentList.length;
  const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Attendance Monitoring</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track daily attendance registers, mark absent lists, and export monthly records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Register'}
          </button>
        </div>
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

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('student')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'student'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> Student Attendance Register
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'teacher'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Faculty Attendance Register
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'student' && (
            <>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">All Sections</option>
                {sections
                  .filter((sec) => !selectedClass || sec.classId?._id === selectedClass)
                  .map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      Section {sec.name}
                    </option>
                  ))}
              </select>
            </>
          )}

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => (activeTab === 'student' ? markAllStudents('Present') : markAllTeachers('Present'))}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
          </button>
        </div>
      </div>

      {/* Stats Summary Strip for Students */}
      {activeTab === 'student' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
            <span className="text-slate-500 font-medium">Total Enrolled:</span>
            <strong className="text-slate-800 text-sm font-bold">{total}</strong>
          </div>
          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 flex justify-between items-center shadow-sm">
            <span className="text-emerald-700 font-medium">Present Count:</span>
            <strong className="text-emerald-700 text-sm font-bold">{presentCount}</strong>
          </div>
          <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 flex justify-between items-center shadow-sm">
            <span className="text-rose-700 font-medium">Absent Count:</span>
            <strong className="text-rose-700 text-sm font-bold">{absentCount}</strong>
          </div>
          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 flex justify-between items-center shadow-sm">
            <span className="text-indigo-700 font-medium">Attendance Rate:</span>
            <strong className="text-indigo-700 text-sm font-bold">{rate}%</strong>
          </div>
        </div>
      )}

      {/* Attendance Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">
                  {activeTab === 'student' ? 'Roll & Name' : 'Faculty Member'}
                </th>
                <th className="py-3 px-4">
                  {activeTab === 'student' ? 'Admission No' : 'Teacher ID'}
                </th>
                <th className="py-3 px-4">Section / Subject</th>
                <th className="py-3 px-4 text-center">Mark Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading attendance register...
                  </td>
                </tr>
              ) : activeTab === 'student' ? (
                studentList.map((stu) => (
                  <tr key={stu.studentId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-700">#{stu.rollNumber}</span>
                        <span className="font-semibold text-slate-800">{stu.fullName}</span>
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
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                              : st === 'Absent'
                              ? active
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                              : active
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50';

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => toggleStudentStatus(stu.studentId, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${btnColor}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic">
                      {stu.status === 'Absent' ? 'Unexcused' : 'On record'}
                    </td>
                  </tr>
                ))
              ) : (
                teacherList.map((tch) => (
                  <tr key={tch.teacherId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">{tch.fullName}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{tch.code}</td>
                    <td className="py-3 px-4 text-slate-600">{tch.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {['Present', 'Absent', 'Late'].map((st) => {
                          const active = tch.status === st;
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
                              onClick={() => toggleTeacherStatus(tch.teacherId, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${btnColor}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic">Verified</td>
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

export default AttendanceManagement;
