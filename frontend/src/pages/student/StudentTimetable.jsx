import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Calendar, BookOpen, Layers } from 'lucide-react';

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const res = await api.get('/timetable/student');
        if (res.data?.success) {
          setTimetables(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Weekly Class Timetable</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Daily academic period timings, subject schedule, and assigned instructors.
        </p>
      </div>

      <div className="space-y-4">
        {days.map((day) => {
          const daySchedule = timetables.find((t) => t.dayOfWeek === day);
          const periods = daySchedule?.periods || [];

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">{day}</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">6 Periods</span>
              </div>

              {periods.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 italic">No periods scheduled for {day}.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {periods.map((p) => (
                    <div
                      key={p.periodNumber}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Period {p.periodNumber}
                        </span>
                        <span className="font-mono">{p.room || 'Room 101'}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm truncate">{p.subjectId?.name || 'Subject'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.teacherId?.fullName || 'Teacher'}</p>
                      <p className="text-[10px] text-indigo-600 font-semibold pt-1">
                        {p.startTime} - {p.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentTimetable;
