import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  BookOpen,
  Plus,
  Users,
  Layers,
  GraduationCap,
  Trash2,
  Edit2,
  ChevronRight,
  School,
} from 'lucide-react';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Modals
  const [addClassModal, setAddClassModal] = useState(false);
  const [addSectionModal, setAddSectionModal] = useState(false);
  const [addSubjectModal, setAddSubjectModal] = useState(false);

  // Form states
  const [classForm, setClassForm] = useState({ name: '', numericGrade: 1, classTeacher: '', description: '' });
  const [sectionForm, setSectionForm] = useState({ name: 'C', classId: '', roomNumber: 'Room 105', capacity: 40 });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '', teacherId: '', weeklyPeriods: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resC, resT] = await Promise.all([api.get('/classes'), api.get('/teachers')]);
      if (resC.data?.success) {
        setClasses(resC.data.data);
        if (resC.data.data.length > 0 && !selectedClass) {
          setSelectedClass(resC.data.data[0]);
        }
      }
      if (resT.data?.success) setTeachers(resT.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsForClass = async () => {
        try {
          setStudentsLoading(true);
          const res = await api.get('/students', { params: { classId: selectedClass._id } });
          if (res.data?.success) {
            setClassStudents(res.data.data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setStudentsLoading(false);
        }
      };
      fetchStudentsForClass();
    }
  }, [selectedClass]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/classes', classForm);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Class created successfully!' });
        setAddClassModal(false);
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create class' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/sections', {
        ...sectionForm,
        classId: selectedClass?._id,
      });
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Section added!' });
        setAddSectionModal(false);
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add section' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/subjects', {
        ...subjectForm,
        classId: selectedClass?._id,
      });
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Subject created!' });
        setAddSubjectModal(false);
        setSubjectForm({ name: '', code: '', classId: '', teacherId: '', weeklyPeriods: 5 });
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add subject' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Class & Subject Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define standards, manage class teachers, sections, curriculum subjects, and student rosters.
          </p>
        </div>
        <button
          onClick={() => setAddClassModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Class
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Classes List Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            School Standards ({classes.length})
          </h3>
          <div className="space-y-2">
            {classes.map((cls) => {
              const isSelected = selectedClass?._id === cls._id;
              return (
                <div
                  key={cls._id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold">{cls.name}</h4>
                      <p className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-500'} mt-0.5`}>
                        Grade Level: {cls.numericGrade} • {cls.sections?.length || 0} Sections
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {cls.studentCount || 0} Students
                      </span>
                    </div>
                  </div>
                  <div className={`mt-3 pt-2.5 border-t text-xs flex items-center justify-between ${isSelected ? 'border-white/20 text-indigo-100' : 'border-slate-100 text-slate-500'}`}>
                    <span>
                      Teacher:{' '}
                      <strong className={isSelected ? 'text-white' : 'text-slate-700'}>
                        {cls.classTeacher?.fullName || 'Not Assigned'}
                      </strong>
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View of Selected Class */}
        <div className="lg:col-span-2 space-y-6">
          {selectedClass && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                    Detailed Curriculum & Roster
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-0.5">
                    {selectedClass.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Class Teacher: {selectedClass.classTeacher?.fullName || 'Anita Desai'} • Standard Room: Room 101
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddSectionModal(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                  <button
                    onClick={() => setAddSubjectModal(true)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Subject
                  </button>
                </div>
              </div>

              {/* Sections & Subjects Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Sections */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" /> Sections
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {selectedClass.sections?.length || 0} active
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedClass.sections?.map((sec) => (
                      <div
                        key={sec._id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">Section {sec.name}</p>
                          <p className="text-[11px] text-slate-400">{sec.roomNumber || 'Room 101'}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Capacity: {sec.capacity || 40}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Taught Subjects */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Subjects
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {selectedClass.subjects?.length || 0} subjects
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedClass.subjects?.map((sub) => (
                      <div
                        key={sub._id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{sub.name}</p>
                          <p className="text-[11px] text-indigo-600 font-mono">{sub.code}</p>
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {sub.teacherId?.fullName || 'Assigned'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enrolled Students Roster */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Enrolled Students ({classStudents.length})
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">Class Roster</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="py-2.5 px-3">Roll</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Admission No</th>
                        <th className="py-2.5 px-3">Section</th>
                        <th className="py-2.5 px-3">Parent Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentsLoading ? (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-400">
                            Loading class roster...
                          </td>
                        </tr>
                      ) : classStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-400">
                            No students enrolled in this class yet.
                          </td>
                        </tr>
                      ) : (
                        classStudents.map((stu) => (
                          <tr key={stu._id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-700">#{stu.rollNumber}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {stu.firstName} {stu.lastName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{stu.admissionNo}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                                Sec {stu.sectionId?.name || 'A'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{stu.parentPhone}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={addClassModal} onClose={() => setAddClassModal(false)} title="Create Class Standard" maxWidth="max-w-md">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Class 11"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Numeric Grade (1 - 12) *</label>
            <input
              type="number"
              required
              value={classForm.numericGrade}
              onChange={(e) => setClassForm({ ...classForm, numericGrade: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Class Teacher</label>
            <select
              value={classForm.classTeacher}
              onChange={(e) => setClassForm({ ...classForm, classTeacher: e.target.value })}
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
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAddClassModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={addSectionModal} onClose={() => setAddSectionModal(false)} title={`Add Section to ${selectedClass?.name}`} maxWidth="max-w-md">
        <form onSubmit={handleCreateSection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section Name (e.g. C, D) *</label>
            <input
              type="text"
              required
              value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              value={sectionForm.roomNumber}
              onChange={(e) => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Capacity</label>
            <input
              type="number"
              value={sectionForm.capacity}
              onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAddSectionModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Adding...' : 'Add Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={addSubjectModal} onClose={() => setAddSubjectModal(false)} title={`Add Subject to ${selectedClass?.name}`} maxWidth="max-w-md">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Environmental Science"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. EVS-10"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Subject Teacher</label>
            <select
              value={subjectForm.teacherId}
              onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Faculty</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAddSubjectModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Adding...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassManagement;
