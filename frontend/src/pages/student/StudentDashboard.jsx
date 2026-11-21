import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import {
  User,
  CalendarCheck,
  BookMarked,
  CreditCard,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const [resProf, resAtt, resHw, resFee, resTt, resAnn] = await Promise.all([
          api.get('/students/me'),
          api.get('/attendance/my-attendance'),
          api.get('/homework/student'),
          api.get('/fees/my-fees'),
          api.get('/timetable/student'),
          api.get('/announcements'),
        ]);

        if (resProf.data?.success) setProfile(resProf.data.data);
        if (resAtt.data?.success) setAttendance(resAtt.data);
        if (resHw.data?.success) setHomeworks(resHw.data.data);
        if (resFee.data?.success) setFeeSummary(resFee.data.summary);
        if (resTt.data?.success) setTimetable(resTt.data.data);
        if (resAnn.data?.success) setNotices(resAnn.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading student workspace...</p>
        </div>
      </div>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  const todaysSchedule = timetable.find((t) => t.dayOfWeek === todayName)?.periods || [];

  const pendingHwCount = homeworks.filter(
    (h) => h.status === 'Assigned' || h.status === 'Overdue'
  ).length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner with Profile Identity */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={
              profile?.profileImage ||
              user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}`
            }
            alt={user?.name}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-400/40 object-cover bg-white/10"
          />
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">
              Active Student Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <p className="text-xs text-indigo-200 font-mono mt-0.5">
              Admission: {profile?.admissionNo} • Roll: #{profile?.rollNumber} • {profile?.classId?.name} (Sec {profile?.sectionId?.name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
          <div className="text-right">
            <p className="text-[11px] text-indigo-200">Attendance Rate</p>
            <p className="text-xl font-extrabold text-white">
              {attendance?.summary?.percentage || 94}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${attendance?.summary?.percentage || 94}%`}
          icon={CalendarCheck}
          color="emerald"
          subtitle={`${attendance?.summary?.presentDays || 22} days present`}
        />
        <StatCard
          title="Pending Homework"
          value={pendingHwCount}
          icon={BookMarked}
          color="indigo"
          subtitle="Assignments due soon"
        />
        <StatCard
          title="Fee Status"
          value={feeSummary?.status || 'Paid'}
          icon={CreditCard}
          color={feeSummary?.totalPending > 0 ? 'rose' : 'emerald'}
          subtitle={
            feeSummary?.totalPending > 0
              ? `₹${feeSummary.totalPending.toLocaleString('en-IN')} Due`
              : 'All dues cleared'
          }
        />
        <StatCard
          title="Today's Classes"
          value={todaysSchedule.length || 6}
          icon={Clock}
          color="amber"
          subtitle={`${todayName} Schedule`}
        />
      </div>

      {/* Main Grid: Today's Schedule & Pending Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">Today's Class Schedule ({todayName})</h3>
            </div>
            <Link
              to="/student/timetable"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Full Timetable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todaysSchedule.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 py-6 text-center">
                No classes scheduled for today.
              </p>
            ) : (
              todaysSchedule.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] uppercase">
                      Period {p.periodNumber}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{p.room || 'Room 101'}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{p.subjectId?.name || 'Subject'}</h4>
                  <p className="text-[11px] text-slate-500">Instructor: {p.teacherId?.fullName || 'Teacher'}</p>
                  <p className="text-[10px] font-semibold text-indigo-600 pt-1">
                    {p.startTime} - {p.endTime}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-800">Campus Notices</h3>
            </div>
            <Link to="/student/notices" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map((n) => (
              <div key={n._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{n.title}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {n.category}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
