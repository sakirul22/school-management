import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const AdmissionManagement = () => {
  const [admissions, setAdmissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [assignedSection, setAssignedSection] = useState('');
  const [approvalResult, setApprovalResult] = useState(null);

  // New Admission Form State
  const initialForm = {
    studentFirstName: '',
    studentLastName: '',
    dob: '2012-08-15',
    gender: 'Male',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    appliedClass: '',
    previousSchool: '',
    bloodGroup: 'B+',
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/admissions', { params });
      if (res.data?.success) {
        setAdmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassData = async () => {
    try {
      const resC = await api.get('/classes');
      if (resC.data?.success) setClasses(resC.data.data);
      const resS = await api.get('/sections');
      if (resS.data?.success) setSections(resS.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter, search]);

  const handleCreateAdmission = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/admissions', formData);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Admission application recorded successfully!' });
        setNewModalOpen(false);
        setFormData(initialForm);
        fetchAdmissions();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit application' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAdmission) return;
    try {
      setSubmitting(true);
      const res = await api.put(`/admissions/${selectedAdmission._id}/approve`, {
        assignedSection,
      });
      if (res.data?.success) {
        setApprovalResult(res.data.data);
        fetchAdmissions();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Approval failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (admission) => {
    const reason = window.prompt('Enter reason for application rejection:', 'Incomplete documentation');
    if (reason === null) return;
    try {
      const res = await api.put(`/admissions/${admission._id}/reject`, { remarks: reason });
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Application marked as Rejected' });
        fetchAdmissions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Student Admissions</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Review incoming admissions, approve seats, and auto-enroll students.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...initialForm, appliedClass: classes[0]?._id || '' });
            setNewModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Admission Form
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
            placeholder="Search by student or parent name, app no..."
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
          <option value="">All Application Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">App No</th>
                <th className="py-3 px-4">Applicant Student</th>
                <th className="py-3 px-4">Applied Class</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading admission records...
                  </td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No admission applications found.
                  </td>
                </tr>
              ) : (
                admissions.map((adm) => (
                  <tr key={adm._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {adm.applicationNo}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">
                        {adm.studentFirstName} {adm.studentLastName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {adm.gender} • DOB: {new Date(adm.dob).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {adm.appliedClass?.name || 'Class 6'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{adm.parentName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {adm.parentPhone}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(adm.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          adm.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : adm.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {adm.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                        {adm.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {adm.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {adm.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAdmission(adm);
                              setApproveModalOpen(true);
                              setApprovalResult(null);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(adm)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Admission Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Submit New Admission Application"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateAdmission} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student First Name *</label>
              <input
                type="text"
                required
                value={formData.studentFirstName}
                onChange={(e) => setFormData({ ...formData, studentFirstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Last Name *</label>
              <input
                type="text"
                required
                value={formData.studentLastName}
                onChange={(e) => setFormData({ ...formData, studentLastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Applied Standard *</label>
              <select
                required
                value={formData.appliedClass}
                onChange={(e) => setFormData({ ...formData, appliedClass: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Standard</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone *</label>
              <input
                type="text"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
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
              onClick={() => setNewModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Register Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Approve Admission Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Admission & Allocate Seat"
        maxWidth="max-w-md"
      >
        {approvalResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Admission Approved & Enrolled!
              </div>
              <p className="mt-1">
                Student has been successfully registered into the database with active credentials.
              </p>
              <div className="mt-3 bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                <p>
                  <strong>Admission No:</strong> {approvalResult.student?.admissionNo}
                </p>
                <p>
                  <strong>Login Email:</strong> {approvalResult.tempCredentials?.email}
                </p>
                <p>
                  <strong>Default Password:</strong> {approvalResult.tempCredentials?.password}
                </p>
              </div>
            </div>
            <button
              onClick={() => setApproveModalOpen(false)}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Approving this admission will automatically generate a unique Admission Number, allocate the student to their class, and create a portal login account.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <p>
                <strong>Applicant:</strong> {selectedAdmission?.studentFirstName} {selectedAdmission?.studentLastName}
              </p>
              <p className="mt-0.5">
                <strong>Standard:</strong> {selectedAdmission?.appliedClass?.name}
              </p>
              <p className="mt-0.5">
                <strong>Parent Phone:</strong> {selectedAdmission?.parentPhone}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Section
              </label>
              <select
                value={assignedSection}
                onChange={(e) => setAssignedSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Default Section A</option>
                {sections
                  .filter((s) => s.classId?._id === selectedAdmission?.appliedClass?._id)
                  .map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      Section {sec.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm"
              >
                {submitting ? 'Allocating...' : 'Confirm Approval & Enroll'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionManagement;
