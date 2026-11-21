import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  BookMarked,
  Plus,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Award,
  Trash2,
  Edit2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

const HomeworkManagement = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [submissionsModal, setSubmissionsModal] = useState(false);
  const [evaluateModal, setEvaluateModal] = useState(false);

  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionsData, setSubmissionsData] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  };
  const [formData, setFormData] = useState(initialForm);

  // Evaluation Form
  const [evaluation, setEvaluation] = useState({ marksObtained: 85, totalMarks: 100, feedback: 'Well done! Clear answers.' });
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchMeta = async () => {
    try {
      const [resC, resS, resSub] = await Promise.all([
        api.get('/classes'),
        api.get('/sections'),
        api.get('/subjects'),
      ]);
      if (resC.data?.success) setClasses(resC.data.data);
      if (resS.data?.success) setSections(resS.data.data);
      if (resSub.data?.success) setSubjects(resSub.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/homework');
      if (res.data?.success) {
        setHomeworks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchHomeworks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        attachments: formData.attachmentUrl ? [{ name: 'Worksheet_Assignment.pdf', url: formData.attachmentUrl }] : [],
      };
      const res = await api.post('/homework', payload);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Homework assignment created and published to students!' });
        setCreateModal(false);
        setFormData(initialForm);
        fetchHomeworks();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create homework' });
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmissions = async (hw) => {
    setSelectedHomework(hw);
    try {
      const res = await api.get(`/homework/${hw._id}/submissions`);
      if (res.data?.success) {
        setSubmissionsData(res.data.data);
        setSubmissionsModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEvaluate = (sub) => {
    setSelectedSubmission(sub);
    setEvaluation({
      marksObtained: sub.marksObtained || 85,
      totalMarks: sub.totalMarks || 100,
      feedback: sub.feedback || 'Well analyzed and properly formatted.',
    });
    setEvaluateModal(true);
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission?.submissionId) return;
    try {
      setSubmitting(true);
      const res = await api.put(`/homework/submissions/${selectedSubmission.submissionId}/evaluate`, evaluation);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Grade and feedback saved successfully!' });
        setEvaluateModal(false);
        // Refresh submissions
        openSubmissions(selectedHomework);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Evaluation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this homework assignment?')) return;
    try {
      const res = await api.delete(`/homework/${id}`);
      if (res.data?.success) {
        fetchHomeworks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Homework & Assignment Hub</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish tasks, set deadlines, inspect student answers, and assign grading feedback.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              ...initialForm,
              classId: classes[0]?._id || '',
              sectionId: sections[0]?._id || '',
              subjectId: subjects[0]?._id || '',
            });
            setCreateModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Assignment
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

      {/* Homework Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading assignments...
          </div>
        ) : homeworks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No homework assignments found. Create your first assignment above!
          </div>
        ) : (
          homeworks.map((hw) => (
            <div
              key={hw._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {hw.subjectId?.name || 'General'}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {hw.classId?.name} ({hw.sectionId?.name || 'A'})
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{hw.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {hw.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {new Date(hw.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Submission Status Bar & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Submissions:</span>{' '}
                  <strong className="text-indigo-600 font-bold">
                    {hw.submittedCount || 0} / {hw.totalStudents || 10}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openSubmissions(hw)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Review ({hw.pendingReviewCount || 0})
                  </button>
                  <button
                    onClick={() => handleDelete(hw._id)}
                    className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Homework Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Homework Assignment" maxWidth="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Homework Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4: Linear Equations Practice Set"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
              <select
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
              <select
                required
                value={formData.sectionId}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Section</option>
                {sections
                  .filter((s) => !formData.classId || s.classId?._id === formData.classId)
                  .map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      Section {sec.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Subject</option>
                {subjects
                  .filter((s) => !formData.classId || s.classId?._id === formData.classId)
                  .map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Deadline *</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment Worksheet URL</label>
              <input
                type="text"
                value={formData.attachmentUrl}
                onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description & Instructions *</label>
            <textarea
              rows={4}
              required
              placeholder="Specify questions, page numbers, or submission guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Publishing...' : 'Assign to Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions Review Modal */}
      <Modal
        isOpen={submissionsModal}
        onClose={() => setSubmissionsModal(false)}
        title={`Submissions: ${selectedHomework?.title}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Roll & Student</th>
                  <th className="py-2.5 px-3">Submitted Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Marks</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissionsData.map((sub) => (
                  <tr key={sub.studentId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-800">
                        #{sub.rollNumber} {sub.fullName}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">{sub.admissionNo}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString() : 'Not Submitted'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'Reviewed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.status === 'Submitted'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : sub.status === 'Late Submitted'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {sub.marksObtained !== null ? `${sub.marksObtained} / ${sub.totalMarks}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {sub.hasSubmitted ? (
                        <button
                          onClick={() => openEvaluate(sub)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          {sub.status === 'Reviewed' ? 'Edit Grade' : 'Grade & Feedback'}
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending submission</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Evaluate & Grade Submission Modal */}
      <Modal
        isOpen={evaluateModal}
        onClose={() => setEvaluateModal(false)}
        title={`Evaluate: ${selectedSubmission?.fullName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleEvaluateSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <p>
              <strong>Student Content:</strong> {selectedSubmission?.content || 'Solution attached below.'}
            </p>
            {selectedSubmission?.attachments?.length > 0 && (
              <a
                href={selectedSubmission.attachments[0].url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Submitted Document
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Obtained *</label>
              <input
                type="number"
                required
                value={evaluation.marksObtained}
                onChange={(e) => setEvaluation({ ...evaluation, marksObtained: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Maximum Marks</label>
              <input
                type="number"
                value={evaluation.totalMarks}
                onChange={(e) => setEvaluation({ ...evaluation, totalMarks: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher Feedback</label>
            <textarea
              rows={3}
              value={evaluation.feedback}
              onChange={(e) => setEvaluation({ ...evaluation, feedback: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEvaluateModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeworkManagement;
