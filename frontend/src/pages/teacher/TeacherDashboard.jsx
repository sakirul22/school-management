import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  BookMarked,
  Clock,
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [resDash, resAnn] = await Promise.all([
          api.get('/teachers/dashboard'),
          api.get('/announcements'),
        ]);
        if (resDash.data?.success) setDashboardData(resDash.data.data);
        if (resAnn.data?.success) setAnnouncements(resAnn.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  const {
    totalAssignedClasses,
    totalStudents,
    todayClassesCount,
    pendingSubmissions,
    attendanceMarkedToday,
    todaysSchedule,
  } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
            Faculty Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Professor {user?.name}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            You are managing instructional sessions and academic evaluations for Demo School.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
          <CalendarCheck className="w-7 h-7 text-amber-400" />
          <div className="text-right">
            <p className="text-xs text-slate-300 font-medium">Today's Attendance</p>
            <p className="text-sm font-bold text-white">
              {attendanceMarkedToday ? 'Marked & Submitted' : 'Pending Action'}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Assigned Classes"
          value={totalAssignedClasses || 2}
          icon={BookOpen}
          color="indigo"
          subtitle="Standards allocated"
        />
        <StatCard
          title="Total Students"
          value={totalStudents || 20}
          icon={Users}
          color="blue"
          subtitle="Learners across classes"
        />
        <StatCard
          title="Today's Classes"
          value={todayClassesCount || 4}
          icon={Clock}
          color="amber"
          subtitle="Scheduled lecture periods"
        />
        <StatCard
          title="Pending Homework Reviews"
          value={pendingSubmissions || 0}
          icon={BookMarked}
          color="rose"
          subtitle="Submissions awaiting evaluation"
        />
      </div>

      {/* Main Two-Column: Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable / Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-800">Today's Instructional Schedule</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            </span>
          </div>

          <div className="space-y-3">
            {todaysSchedule?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No teaching periods scheduled for today.
              </p>
            ) : (
              todaysSchedule?.map((period, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                      P{period.periodNumber}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {period.subjectName} • {period.className} ({period.sectionName})
                      </h4>
                      <p className="text-[11px] text-slate-500">{period.room || 'Room 101'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices for Teachers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">Faculty Notices</h3>
            </div>
            <span className="text-xs text-slate-400">Circulars</span>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 4).map((ann) => (
              <div
                key={ann._id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{ann.title}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {ann.category}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
