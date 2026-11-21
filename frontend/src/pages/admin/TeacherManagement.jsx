import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  GraduationCap,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  DollarSign,
  Award,
} from 'lucide-react';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form State
  const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female',
    qualification: 'M.Sc, B.Ed',
    experience: '5 Years',
    salary: 50000,
    address: '',
    profileImage: '',
    password: 'Teacher@123',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Class assignment state
  const [assignment, setAssignment] = useState({ classId: '', sectionId: '', subjectId: '' });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/teachers', { params });
      if (res.data?.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      const resC = await api.get('/classes');
      if (resC.data?.success) setClasses(resC.data.data);
      const resS = await api.get('/subjects');
      if (resS.data?.success) setSubjects(resS.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [search, statusFilter]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/teachers', formData);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Faculty member registered successfully!' });
        setAddModalOpen(false);
        setFormData(initialForm);
        fetchTeachers();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create teacher' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      setSubmitting(true);
      const res = await api.put(`/teachers/${selectedTeacher._id}`, formData);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Teacher details updated!' });
        setEditModalOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tch) => {
    try {
      const res = await api.delete(`/teachers/${tch._id}`);
      if (res.data?.success) {
        fetchTeachers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignClass = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !assignment.classId || !assignment.subjectId) return;

    try {
      setSubmitting(true);
      const currentAssigned = selectedTeacher.assignedClasses || [];
      const updated = [...currentAssigned, assignment];

      const res = await api.put(`/teachers/${selectedTeacher._id}`, {
        assignedClasses: updated,
      });

      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Class and subject assigned to teacher successfully!' });
        setAssignModalOpen(false);
        setAssignment({ classId: '', sectionId: '', subjectId: '' });
        fetchTeachers();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to assign class' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Faculty & Teacher Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage instructional staff, subject allocations, and faculty payroll profiles.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(initialForm);
            setAddModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Teacher
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by teacher name, ID, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">All Employment Statuses</option>
          <option value="active">Active Staff</option>
          <option value="inactive">Inactive Staff</option>
          <option value="on_leave">On Sabbatical / Leave</option>
        </select>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Teacher ID</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Qualification</th>
                <th className="py-3 px-4">Assigned Subjects</th>
                <th className="py-3 px-4">Salary (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading faculty directory...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                teachers.map((tch) => (
                  <tr key={tch._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            tch.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${tch.fullName}`
                          }
                          alt={tch.fullName}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{tch.fullName}</p>
                          <p className="text-[11px] text-slate-400">{tch.gender} • {tch.experience}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {tch.teacherId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{tch.email}</p>
                      <p className="text-[11px] text-slate-500">{tch.phone}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {tch.qualification}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {tch.assignedClasses?.length > 0 ? (
                          tch.assignedClasses.slice(0, 3).map((ac, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {ac.subjectId?.name || 'Sub'} ({ac.classId?.name || 'Class'})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                        {tch.assignedClasses?.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            +{tch.assignedClasses.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ₹{tch.salary?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tch.employmentStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {tch.employmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedTeacher(tch);
                            setProfileModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(tch);
                            setAssignModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Assign Subject & Class"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(tch);
                            setFormData({
                              fullName: tch.fullName,
                              email: tch.email,
                              phone: tch.phone,
                              gender: tch.gender || 'Female',
                              qualification: tch.qualification,
                              experience: tch.experience,
                              salary: tch.salary,
                              address: tch.address || '',
                              profileImage: tch.profileImage || '',
                            });
                            setEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Teacher"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tch)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            tch.employmentStatus === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={tch.employmentStatus === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {tch.employmentStatus === 'active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Faculty Member"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification *</label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. M.Sc. Physics, B.Ed"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teaching Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 6 Years"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Registering...' : 'Add Faculty Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Teacher Information"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateTeacher} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary (₹)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Class & Subject Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Subject to ${selectedTeacher?.fullName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignClass} className="space-y-4">
          <p className="text-xs text-slate-600">
            Select the standard and subject to assign to this faculty member.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
            <select
              required
              value={assignment.classId}
              onChange={(e) => setAssignment({ ...assignment, classId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              required
              value={assignment.subjectId}
              onChange={(e) => setAssignment({ ...assignment, subjectId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Subject</option>
              {subjects
                .filter((s) => !assignment.classId || s.classId?._id === assignment.classId)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teacher Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Teacher Profile"
        maxWidth="max-w-lg"
      >
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <img
                src={
                  selectedTeacher.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher.fullName}`
                }
                alt={selectedTeacher.fullName}
                className="w-14 h-14 rounded-full border-2 border-amber-500/30 object-cover bg-white"
              />
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedTeacher.fullName}</h3>
                <p className="text-xs text-amber-700 font-mono font-semibold">
                  Teacher ID: {selectedTeacher.teacherId}
                </p>
                <p className="text-xs text-slate-500">{selectedTeacher.qualification}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-semibold text-slate-700">{selectedTeacher.email}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-700">{selectedTeacher.phone}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-400 block mb-0.5">Experience</span>
                <span className="font-semibold text-slate-700">{selectedTeacher.experience}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <span className="text-slate-400 block mb-0.5">Monthly Salary</span>
                <span className="font-semibold text-slate-700">₹{selectedTeacher.salary?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
              <span className="text-slate-600 font-bold block mb-1">Assigned Classes & Subjects:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedTeacher.assignedClasses?.map((ac, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                  >
                    {ac.subjectId?.name || 'Subject'} - {ac.classId?.name || 'Class'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherManagement;
