import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  DollarSign,
  AlertCircle,
  CalendarCheck,
  BookMarked,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading admin analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
        {error}
      </div>
    );
  }

  const { summary, charts, recentActivities, upcomingEvents } = data || {};

  const admissionPieColors = ['#F59E0B', '#10B981', '#EF4444'];
  const admissionPieData = (charts?.admissionStats || []).map((item) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">
            Academic Year 2026-2027
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
            Live operations monitor for Demo School. Manage students, teachers, fee collections, and school-wide attendance in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <CalendarCheck className="w-8 h-8 text-indigo-300" />
          <div className="text-right">
            <p className="text-xs text-indigo-200 font-medium">Today's Attendance</p>
            <p className="text-xl font-bold text-white">{summary?.todayAttendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* 8 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          icon={Users}
          color="indigo"
          trend={+4.5}
          subtitle="Enrolled active learners"
        />
        <StatCard
          title="Total Teachers"
          value={summary?.totalTeachers || 0}
          icon={GraduationCap}
          color="amber"
          subtitle="Qualified faculty members"
        />
        <StatCard
          title="Total Classes"
          value={summary?.totalClasses || 0}
          icon={BookOpen}
          color="blue"
          subtitle="Grade 6 through Grade 10"
        />
        <StatCard
          title="Total Admissions"
          value={summary?.totalAdmissions || 0}
          icon={UserCheck}
          color="purple"
          trend={+12}
          subtitle="Current term applications"
        />
        <StatCard
          title="Fees Collected"
          value={`₹${(summary?.totalFeesCollected || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="emerald"
          trend={+8.2}
          subtitle="Total realized revenue"
        />
        <StatCard
          title="Pending Fees"
          value={`₹${(summary?.pendingFees || 0).toLocaleString('en-IN')}`}
          icon={AlertCircle}
          color="rose"
          subtitle="Outstanding invoices"
        />
        <StatCard
          title="Today's Attendance"
          value={`${summary?.todayAttendanceRate || 92}%`}
          icon={CalendarCheck}
          color="emerald"
          subtitle="Student presence rate"
        />
        <StatCard
          title="Active Homework"
          value={summary?.pendingHomework || 0}
          icon={BookMarked}
          color="indigo"
          subtitle="Assignments currently due"
        />
      </div>

      {/* Row 1 Charts: Monthly Fee Collection & Student Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Fee Collection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Fee Collection</h3>
              <p className="text-xs text-slate-500">Collected vs Outstanding (in ₹ INR)</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-lg border border-emerald-100 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Recovery
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthlyFeeData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="collected" fill="#4F46E5" name="Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F87171" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Attendance Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Student Attendance Trend</h3>
              <p className="text-xs text-slate-500">Weekly present vs absent attendance percentages</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-100">
              Avg: 93%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.attendanceOverview || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Present %"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Absent %"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Class-wise Student Distribution & Admission Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class-wise Student Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Class-wise Student Distribution</h3>
              <p className="text-xs text-slate-500">Enrolled student counts across active standards</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">5 Standards</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.classDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="className" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366F1" name="Students Enrolled" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admission Statistics Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Admission Applications</h3>
            <p className="text-xs text-slate-500">Application status breakdown</p>
          </div>
          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={admissionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {admissionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={admissionPieColors[index % admissionPieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around border-t border-slate-100 pt-3 text-xs">
            {admissionPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: admissionPieColors[idx % admissionPieColors.length] }}
                ></span>
                <span className="text-slate-600 font-medium">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">Recent Campus Activities</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Live Feed</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities?.map((act) => (
              <div key={act.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800">{act.text}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {act.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events & Notices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">Upcoming Events & Notices</h3>
            </div>
            <span className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">
              View All Notices
            </span>
          </div>

          <div className="space-y-3">
            {upcomingEvents?.map((evt) => (
              <div
                key={evt._id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{evt.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {evt.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{evt.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
