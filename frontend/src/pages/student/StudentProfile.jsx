import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  User,
  School,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students/me');
        if (res.data?.success) {
          setStudent(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Student Profile & Academic Record</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Official enrollment details on record with Demo School administration.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 relative">
          <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Learner
          </div>
        </div>

        {/* Content with Avatar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-12 mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={
                  student?.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.firstName}`
                }
                alt={student?.firstName}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
              />
              <div className="mb-1">
                <h3 className="text-xl font-extrabold text-slate-800">
                  {student?.firstName} {student?.lastName}
                </h3>
                <p className="text-xs text-indigo-600 font-mono font-bold">
                  Admission No: {student?.admissionNo} • Roll: #{student?.rollNumber}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 uppercase tracking-wider">
              Status: {student?.status || 'Active'}
            </span>
          </div>

          {/* Academic Details Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Academic Allocation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Enrolled Class</span>
                <span className="font-bold text-slate-800 text-sm">{student?.classId?.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Section</span>
                <span className="font-bold text-slate-800 text-sm">Section {student?.sectionId?.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Roll Number</span>
                <span className="font-bold text-slate-800 text-sm">#{student?.rollNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Enrollment Date</span>
                <span className="font-bold text-slate-800 text-sm">
                  {new Date(student?.admissionDate || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Personal Particulars */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 pt-2">
              Personal Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-800">
                  {student?.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Gender</span>
                <span className="font-semibold text-slate-800">{student?.gender}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Blood Group</span>
                <span className="font-semibold text-slate-800">{student?.bloodGroup || 'B+'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Student Email</span>
                <span className="font-semibold text-slate-800 truncate block">{student?.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Primary Contact</span>
                <span className="font-semibold text-slate-800">{student?.phone || student?.parentPhone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Previous School</span>
                <span className="font-semibold text-slate-800">{student?.previousSchool || 'None'}</span>
              </div>
            </div>

            {/* Parent / Guardian Information */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 pt-2">
              Parent & Guardian Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Parent / Guardian Full Name</span>
                <span className="font-semibold text-slate-800 text-sm">{student?.parentName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Emergency Parent Phone</span>
                <span className="font-semibold text-slate-800 text-sm">{student?.parentPhone}</span>
              </div>
            </div>

            {student?.address && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block mb-0.5">Registered Residential Address</span>
                <span className="font-semibold text-slate-800">{student?.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
