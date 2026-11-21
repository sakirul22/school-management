import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Calendar, BookOpen, Layers } from 'lucide-react';

const TeacherTimetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const res = await api.get('/timetable/teacher');
        if (res.data?.success) {
          setSchedule(res.data.data);
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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Faculty Instructional Timetable</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Your weekly teaching periods, room allocations, and curriculum schedules.
        </p>
      </div>

      <div className="space-y-4">
        {days.map((day) => {
          const dayMatches = schedule.filter((s) => s.dayOfWeek === day);
          const allPeriodsForDay = [];
          dayMatches.forEach((m) => {
            m.periods?.forEach((p) => {
              allPeriodsForDay.push({
                ...p,
                className: m.className,
                sectionName: m.sectionName,
              });
            });
          });
          allPeriodsForDay.sort((a, b) => a.periodNumber - b.periodNumber);

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">{day}</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {allPeriodsForDay.length} Periods Scheduled
                </span>
              </div>

              {allPeriodsForDay.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 italic">
                  No assigned teaching periods for {day}.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {allPeriodsForDay.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">
                          Period {p.periodNumber}
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">{p.room || 'Room 101'}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{p.subjectId?.name || 'Curriculum'}</p>
                      <p className="text-slate-600 font-medium">
                        {p.className} - Section {p.sectionName}
                      </p>
                      <p className="text-[11px] font-semibold text-indigo-600 pt-1 border-t border-slate-200">
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

export default TeacherTimetable;
