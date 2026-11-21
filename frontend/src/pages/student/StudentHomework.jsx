import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  BookMarked,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  ExternalLink,
  UploadCloud,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const StudentHomework = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');

  // Submit Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeHomework, setActiveHomework] = useState(null);
  const [solutionContent, setSolutionContent] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/homework/student');
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
    fetchHomeworks();
  }, []);

  const subjects = Array.from(new Set(homeworks.map((h) => h.subject))).filter(Boolean);

  const filteredHomeworks = homeworks.filter(
    (h) => !selectedSubject || h.subject === selectedSubject
  );

  const openSubmitModal = (hw) => {
    setActiveHomework(hw);
    setSolutionContent(hw.submission?.content || '');
    setSolutionUrl(hw.submission?.attachments?.[0]?.url || '');
    setSubmitModalOpen(true);
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!activeHomework) return;
    try {
      setSubmitting(true);
      const payload = {
        homeworkId: activeHomework._id,
        content: solutionContent,
        attachments: solutionUrl ? [{ name: 'Completed_Solution.pdf', url: solutionUrl }] : [],
      };
      const res = await api.post('/homework/student/submit', payload);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: res.data.message });
        setSubmitModalOpen(false);
        fetchHomeworks();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Homework & Assignments</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit coursework answers, inspect teacher evaluations, and track deadlines.
          </p>
        </div>

        {/* Filter by subject */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
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
            Loading coursework...
          </div>
        ) : filteredHomeworks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No homework assignments found for this filter.
          </div>
        ) : (
          filteredHomeworks.map((hw) => {
            const hasSubmitted = !!hw.submission;
            const isReviewed = hw.status === 'Reviewed';

            return (
              <div
                key={hw._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {hw.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isReviewed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : hasSubmitted
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : hw.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {hw.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm mb-1">{hw.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                    {hw.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {new Date(hw.deadline).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400">Teacher: {hw.teacherName}</p>
                  </div>

                  {/* Attachment if any */}
                  {hw.attachments?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <a
                        href={hw.attachments[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-semibold text-xs hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Reference Material / Worksheet
                      </a>
                    </div>
                  )}

                  {/* If Reviewed, show Grade and Feedback */}
                  {isReviewed && hw.submission && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-emerald-600" /> Grade:
                        </span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {hw.submission.marksObtained} / {hw.submission.totalMarks}
                        </span>
                      </div>
                      {hw.submission.feedback && (
                        <p className="text-[11px] text-emerald-800 italic">
                          "{hw.submission.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openSubmitModal(hw)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      hasSubmitted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    {hasSubmitted ? 'Update Submission' : 'Submit Homework'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Homework Submission Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit: ${activeHomework?.title}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitHomework} className="space-y-4">
          <p className="text-xs text-slate-600">
            Write your solution text or provide a link to your completed document/PDF.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Solution Notes / Written Work *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Type your answer, methodology, or notes here..."
              value={solutionContent}
              onChange={(e) => setSolutionContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document URL (PDF / Google Docs / Image)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={solutionUrl}
              onChange={(e) => setSolutionUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentHomework;
