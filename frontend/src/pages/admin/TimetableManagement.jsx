import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  CalendarDays,
  Clock,
  Plus,
  BookOpen,
  User,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';

const TimetableManagement = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit period modal
  const [editPeriodModal, setEditPeriodModal] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periodForm, setPeriodForm] = useState({
    periodNumber: 1,
    startTime: '08:00 AM',
    endTime: '08:45 AM',
    subjectId: '',
    teacherId: '',
    room: 'Room 101',
  });
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchMeta = async () => {
    try {
      const [resC, resS, resSub, resT] = await Promise.all([
        api.get('/classes'),
        api.get('/sections'),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      if (resC.data?.success) {
        setClasses(resC.data.data);
        if (resC.data.data.length > 0) setSelectedClass(resC.data.data[0]._id);
      }
      if (resS.data?.success) setSections(resS.data.data);
      if (resSub.data?.success) setSubjects(resSub.data.data);
      if (resT.data?.success) setTeachers(resT.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchTimetable = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await api.get('/timetable/class', {
        params: { classId: selectedClass, sectionId: selectedSection },
      });
      if (res.data?.success) {
        setTimetables(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass, selectedSection]);

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    try {
      // Find current day timetable or create periods array
      const daySchedule = timetables.find((t) => t.dayOfWeek === activeDay);
      const periods = daySchedule ? [...daySchedule.periods] : [];

      const pIdx = periods.findIndex((p) => p.periodNumber === periodForm.periodNumber);
      if (pIdx >= 0) {
        periods[pIdx] = periodForm;
      } else {
        periods.push(periodForm);
      }
      periods.sort((a, b) => a.periodNumber - b.periodNumber);

      const res = await api.post('/timetable/day', {
        classId: selectedClass,
        sectionId: selectedSection || sections.find((s) => s.classId?._id === selectedClass)?._id,
        dayOfWeek: activeDay,
        periods,
      });

      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: `Period updated for ${activeDay}` });
        setEditPeriodModal(false);
        fetchTimetable();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to update timetable' });
    }
  };

  const openPeriodModal = (day, period) => {
    setActiveDay(day);
    setSelectedPeriod(period);
    setPeriodForm({
      periodNumber: period.periodNumber,
      startTime: period.startTime,
      endTime: period.endTime,
      subjectId: period.subjectId?._id || period.subjectId || '',
      teacherId: period.teacherId?._id || period.teacherId || '',
      room: period.room || 'Room 101',
    });
    setEditPeriodModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Master Class Timetables</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define daily instructional periods, assigned faculty, and room numbers.
          </p>
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

      {/* Select Class & Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Standard</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Default Section A</option>
            {sections
              .filter((s) => s.classId?._id === selectedClass)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  Section {s.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="space-y-4">
        {days.map((day) => {
          const daySchedule = timetables.find((t) => t.dayOfWeek === day);
          const periods = daySchedule?.periods || [];

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">{day}</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">6 Periods Scheduled</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {periods.map((p) => (
                  <div
                    key={p.periodNumber}
                    onClick={() => openPeriodModal(day, p)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all text-xs space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span>Period {p.periodNumber}</span>
                      <span className="font-semibold text-slate-500">{p.room}</span>
                    </div>
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 truncate">
                      {p.subjectId?.name || 'Subject'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {p.teacherId?.fullName || 'Assigned Staff'}
                    </p>
                    <p className="text-[10px] text-indigo-600 font-semibold pt-1">
                      {p.startTime} - {p.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Period Modal */}
      <Modal
        isOpen={editPeriodModal}
        onClose={() => setEditPeriodModal(false)}
        title={`Edit Period ${periodForm.periodNumber} (${activeDay})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePeriod} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <select
              required
              value={periodForm.subjectId}
              onChange={(e) => setPeriodForm({ ...periodForm, subjectId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Subject</option>
              {subjects
                .filter((s) => !selectedClass || s.classId?._id === selectedClass)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor *</label>
            <select
              required
              value={periodForm.teacherId}
              onChange={(e) => setPeriodForm({ ...periodForm, teacherId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Faculty</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName} ({t.teacherId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                value={periodForm.startTime}
                onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                value={periodForm.endTime}
                onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom / Hall</label>
            <input
              type="text"
              value={periodForm.room}
              onChange={(e) => setPeriodForm({ ...periodForm, room: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditPeriodModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimetableManagement;
