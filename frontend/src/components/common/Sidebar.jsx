import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  DollarSign,
  CalendarCheck,
  CalendarDays,
  Bell,
  FileBarChart,
  BookMarked,
  Clock,
  User,
  CreditCard,
  School,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Admissions', path: '/admin/admissions', icon: UserCheck },
    { name: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { name: 'Classes & Subjects', path: '/admin/classes', icon: BookOpen },
    { name: 'Fee Management', path: '/admin/fees', icon: DollarSign },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Timetable', path: '/admin/timetable', icon: CalendarDays },
    { name: 'Notices', path: '/admin/notices', icon: Bell },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', path: '/teacher/classes', icon: Users },
    { name: 'Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Homework', path: '/teacher/homework', icon: BookMarked },
    { name: 'Timetable', path: '/teacher/timetable', icon: Clock },
    { name: 'Notices', path: '/teacher/notices', icon: Bell },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Homework', path: '/student/homework', icon: BookMarked },
    { name: 'Fees & Payments', path: '/student/fees', icon: CreditCard },
    { name: 'Timetable', path: '/student/timetable', icon: Clock },
    { name: 'Notices', path: '/student/notices', icon: Bell },
  ];

  let links = adminLinks;
  let roleTitle = 'Admin Portal';
  let badgeColor = 'bg-rose-100 text-rose-700';

  if (role === 'teacher') {
    links = teacherLinks;
    roleTitle = 'Teacher Portal';
    badgeColor = 'bg-amber-100 text-amber-700';
  } else if (role === 'student') {
    links = studentLinks;
    roleTitle = 'Student Portal';
    badgeColor = 'bg-indigo-100 text-indigo-700';
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - Fixed and persistent on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full lg:shrink-0 border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                Demo School
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Smart School OS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Portal Badge */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-400">NAVIGATION</span>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {roleTitle}
          </span>
        </div>

        {/* Links Navigation (only this list scrolls internally if needed) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Card & Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2 shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase">{user?.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 transition-all shadow-sm group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400 group-hover:text-white transition-colors" />
            <span>Sign Out</span>
          </button>

          <p className="text-[10px] text-slate-500 text-center font-medium pt-0.5">
            Academic Session 2026-2027
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
