import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, Calendar, Tag, AlertCircle } from 'lucide-react';

const TeacherNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/announcements');
        if (res.data?.success) {
          setNotices(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Faculty Notices & Announcements</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Official communications, staff meetings, and campus academic notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No notices posted.</div>
        ) : (
          notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {n.category}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(n.publishDate || n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {n.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherNotices;
