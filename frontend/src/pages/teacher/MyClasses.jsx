import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Users,
  Search,
  BookOpen,
  Eye,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

const MyClasses = () => {
  const [data, setData] = useState({ assignedClasses: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Profile modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileModal, setProfileModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers/my-classes');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = (data.students || []).filter((stu) => {
    const matchesSearch =
      `${stu.firstName} ${stu.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      stu.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
      stu.rollNumber?.includes(search);
    const matchesClass = !selectedClassId || stu.classId?._id === selectedClassId;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Assigned Classes & Learners</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          View enrolled learners, subject allocations, and student academic profiles.
        </p>
      </div>

      {/* Assigned Classes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.assignedClasses?.map((ac, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedClassId(ac.classId?._id === selectedClassId ? '' : ac.classId?._id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedClassId === ac.classId?._id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                {ac.classId?.name} ({ac.sectionId?.name || 'A'})
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedClassId === ac.classId?._id
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                Subject: {ac.subjectId?.name}
              </span>
            </div>
            <p className={`text-xs mt-1.5 ${selectedClassId === ac.classId?._id ? 'text-indigo-100' : 'text-slate-500'}`}>
              Subject Code: <span className="font-mono">{ac.subjectId?.code}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Student Roster Filter & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students by name, roll no, or admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        {selectedClassId && (
          <button
            onClick={() => setSelectedClassId('')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Clear Class Filter
          </button>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading student list...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No students match your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700">#{stu.rollNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            stu.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.firstName}`
                          }
                          alt={stu.firstName}
                          className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-800">
                          {stu.firstName} {stu.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {stu.admissionNo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {stu.classId?.name} ({stu.sectionId?.name})
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{stu.parentName}</p>
                      <p className="text-[11px] text-slate-500">{stu.parentPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(stu);
                          setProfileModal(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="Student Profile Details" maxWidth="max-w-lg">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <img
                src={
                  selectedStudent.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.firstName}`
                }
                alt={selectedStudent.firstName}
                className="w-12 h-12 rounded-full object-cover bg-white border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h4>
                <p className="text-xs text-indigo-600 font-mono font-semibold">
                  {selectedStudent.admissionNo} • Roll: #{selectedStudent.rollNumber}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedStudent.classId?.name} - Section {selectedStudent.sectionId?.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Gender</span>
                <span className="font-semibold text-slate-800">{selectedStudent.gender}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Blood Group</span>
                <span className="font-semibold text-slate-800">{selectedStudent.bloodGroup || 'B+'}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Guardian</span>
                <span className="font-semibold text-slate-800">{selectedStudent.parentName}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Parent Contact</span>
                <span className="font-semibold text-slate-800">{selectedStudent.parentPhone}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyClasses;
