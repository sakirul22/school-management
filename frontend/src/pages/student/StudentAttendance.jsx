import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
} from 'lucide-react';

const StudentAttendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/attendance/my-attendance');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, records } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Attendance Record</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Monthly roll-call summary, daily presence log, and compliance percentage.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Overall Attendance</p>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{summary?.percentage}%</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">High Compliance</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase">Present Days</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{summary?.presentDays}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Full Sessions Attended</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-rose-500 uppercase">Absent Days</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{summary?.absentDays}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Sessions Missed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase">Late Arrivals</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{summary?.lateDays}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Excused & Recorded</p>
        </div>
      </div>

      {/* Daily Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">30-Day Attendance Log</h3>
          <span className="text-xs text-slate-400 font-medium">{records?.length || 0} Total Working Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day of Week</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                records?.map((rec) => {
                  const dayName = new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'long' });
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{rec.date}</td>
                      <td className="py-3 px-4 text-slate-600">{dayName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.status === 'Absent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rec.status === 'Present' && <CheckCircle className="w-3 h-3" />}
                          {rec.status === 'Absent' && <XCircle className="w-3 h-3" />}
                          {rec.status === 'Late' && <Clock className="w-3 h-3" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic">Faculty Verified</td>
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

export default StudentAttendance;
