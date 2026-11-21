const Timetable = require('../models/Timetable');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// @desc Get Timetable for a class and section
exports.getClassTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required' });
    }

    const query = { classId };
    if (sectionId) query.sectionId = sectionId;

    const timetables = await Timetable.find(query)
      .populate('periods.subjectId', 'name code')
      .populate('periods.teacherId', 'fullName teacherId')
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    next(error);
  }
};

// @desc Save / Update Timetable for a day
exports.saveDayTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId, dayOfWeek, periods } = req.body;

    const timetable = await Timetable.findOneAndUpdate(
      { classId, sectionId, dayOfWeek },
      { classId, sectionId, dayOfWeek, periods },
      { new: true, upsert: true, runValidators: true }
    )
      .populate('periods.subjectId', 'name code')
      .populate('periods.teacherId', 'fullName teacherId');

    res.status(200).json({
      success: true,
      message: `Timetable for ${dayOfWeek} updated successfully`,
      data: timetable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Teacher Timetable (weekly)
exports.getTeacherTimetable = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    const timetables = await Timetable.find({
      'periods.teacherId': teacher._id,
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('periods.subjectId', 'name code');

    // Filter only periods assigned to this teacher
    const weeklySchedule = timetables.map((tt) => {
      const teacherPeriods = tt.periods.filter(
        (p) => p.teacherId && p.teacherId.toString() === teacher._id.toString()
      );
      return {
        dayOfWeek: tt.dayOfWeek,
        className: tt.classId?.name || '',
        sectionName: tt.sectionId?.name || '',
        periods: teacherPeriods,
      };
    });

    res.status(200).json({ success: true, data: weeklySchedule });
  } catch (error) {
    next(error);
  }
};

// @desc Student Timetable (weekly)
exports.getStudentTimetable = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const timetables = await Timetable.find({
      classId: student.classId,
      sectionId: student.sectionId,
    })
      .populate('periods.subjectId', 'name code')
      .populate('periods.teacherId', 'fullName teacherId')
      .sort({ dayOfWeek: 1 });

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    next(error);
  }
};
