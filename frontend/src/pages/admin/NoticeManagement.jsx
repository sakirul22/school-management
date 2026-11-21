import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Tag,
  Users,
  CheckCircle,
} from 'lucide-react';

const NoticeManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'all',
    targetClassId: '',
    priority: 'Medium',
    category: 'General',
  });
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resA, resC] = await Promise.all([api.get('/announcements'), api.get('/classes')]);
      if (resA.data?.success) setAnnouncements(resA.data.data);
      if (resC.data?.success) setClasses(resC.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/announcements', formData);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Announcement published successfully!' });
        setCreateModal(false);
        setFormData({
          title: '',
          content: '',
          targetRole: 'all',
          targetClassId: '',
          priority: 'Medium',
          category: 'General',
        });
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to publish notice' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Notice deleted!' });
        fetchData();
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Notice & Announcement Board</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish circulars, holiday notifications, and exam schedules to campus stakeholders.
          </p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Publish New Notice
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

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No notices currently published.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ann.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ann.priority} Priority
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {ann.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="capitalize font-medium text-slate-600">
                    Audience: {ann.targetRole} {ann.targetClassId ? `(${ann.targetClassId?.name})` : ''}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(ann._id)}
                  className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove Circular"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Notice Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Publish Official School Notice" maxWidth="max-w-lg">
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule for Pre-Board Examinations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All School (Staff & Students)</option>
                <option value="teacher">Faculty Only</option>
                <option value="student">Students & Parents Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Exam">Examinations</option>
                <option value="Holiday">Holidays & Vacations</option>
                <option value="Sports">Sports & Co-curricular</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High / Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Class (Optional)</label>
              <select
                value={formData.targetClassId}
                onChange={(e) => setFormData({ ...formData, targetClassId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Content *</label>
            <textarea
              rows={4}
              required
              placeholder="Write the full circular announcement here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NoticeManagement;
