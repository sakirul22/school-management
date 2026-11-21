const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Student = require('../models/Student');
const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');

// @desc Get all teachers with search/filters
exports.getTeachers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) query.employmentStatus = status;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const teachers = await Teacher.find(query)
      .populate('assignedClasses.classId', 'name')
      .populate('assignedClasses.sectionId', 'name')
      .populate('assignedClasses.subjectId', 'name code')
      .populate('user', 'email isActive avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single teacher by ID
exports.getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedClasses.classId', 'name numericGrade')
      .populate('assignedClasses.sectionId', 'name roomNumber')
      .populate('assignedClasses.subjectId', 'name code')
      .populate('user', 'email isActive avatar');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc Create new teacher
exports.createTeacher = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      dob,
      address,
      qualification,
      experience,
      joiningDate,
      salary,
      profileImage,
      assignedClasses,
      password,
    } = req.body;

    const teacherCount = await Teacher.countDocuments();
    const teacherId = req.body.teacherId || `TCH-${String(teacherCount + 1).padStart(3, '0')}`;

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name: fullName,
        email: email.toLowerCase().trim(),
        password: password || 'Teacher@123',
        role: 'teacher',
        avatar: profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
        phone,
      });
    }

    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      fullName,
      email: email.toLowerCase().trim(),
      phone,
      gender: gender || 'Female',
      dob,
      address,
      qualification: qualification || 'M.Sc, B.Ed',
      experience: experience || '5 Years',
      joiningDate: joiningDate || new Date(),
      salary: salary || 45000,
      profileImage: profileImage || user.avatar,
      assignedClasses: assignedClasses || [],
      employmentStatus: 'active',
    });

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedClasses.classId', 'name')
      .populate('assignedClasses.sectionId', 'name')
      .populate('assignedClasses.subjectId', 'name code')
      .populate('user', 'email isActive');

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully',
      data: populatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update teacher
exports.updateTeacher = async (req, res, next) => {
  try {
    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedClasses.classId', 'name')
      .populate('assignedClasses.sectionId', 'name')
      .populate('assignedClasses.subjectId', 'name code')
      .populate('user', 'email isActive');

    if (req.body.fullName || req.body.profileImage) {
      await User.findByIdAndUpdate(teacher.user._id, {
        name: teacher.fullName,
        avatar: teacher.profileImage,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete / toggle teacher status
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (req.query.permanent === 'true') {
      await User.findByIdAndDelete(teacher.user);
      await Teacher.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Teacher permanently deleted' });
    } else {
      teacher.employmentStatus = teacher.employmentStatus === 'active' ? 'inactive' : 'active';
      await teacher.save();
      await User.findByIdAndUpdate(teacher.user, { isActive: teacher.employmentStatus === 'active' });
      return res.status(200).json({
        success: true,
        message: `Teacher status set to ${teacher.employmentStatus}`,
        data: teacher,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Teacher Dashboard stats
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    // Class and Section IDs assigned
    const classIds = teacher.assignedClasses.map((ac) => ac.classId).filter(Boolean);
    const sectionIds = teacher.assignedClasses.map((ac) => ac.sectionId).filter(Boolean);

    // Total unique classes assigned
    const uniqueClassCount = new Set(classIds.map((id) => id.toString())).size;

    // Total students across these classes
    const totalStudents = await Student.countDocuments({
      classId: { $in: classIds },
      status: 'active',
    });

    // Today's classes count from timetable
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    const timetablesToday = await Timetable.find({
      dayOfWeek: todayName,
      'periods.teacherId': teacher._id,
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('periods.subjectId', 'name code');

    // Flatten today's periods for this teacher
    const todaysPeriods = [];
    timetablesToday.forEach((tt) => {
      tt.periods.forEach((p) => {
        if (p.teacherId && p.teacherId.toString() === teacher._id.toString()) {
          todaysPeriods.push({
            periodNumber: p.periodNumber,
            startTime: p.startTime,
            endTime: p.endTime,
            className: tt.classId?.name || '',
            sectionName: tt.sectionId?.name || '',
            subjectName: p.subjectId?.name || '',
            room: p.room,
          });
        }
      });
    });

    todaysPeriods.sort((a, b) => a.periodNumber - b.periodNumber);

    // Pending Homework submissions to review
    const teacherHomeworks = await Homework.find({ teacherId: teacher._id }).select('_id');
    const hwIds = teacherHomeworks.map((h) => h._id);

    const pendingSubmissionsCount = await HomeworkSubmission.countDocuments({
      homeworkId: { $in: hwIds },
      status: { $in: ['Submitted', 'Late Submitted'] },
    });

    // Today's attendance status
    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceMarkedToday = await Attendance.countDocuments({
      classId: { $in: classIds },
      date: todayStr,
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssignedClasses: uniqueClassCount || teacher.assignedClasses.length,
        totalStudents,
        todayClassesCount: todaysPeriods.length,
        pendingSubmissions: pendingSubmissionsCount,
        attendanceMarkedToday: attendanceMarkedToday > 0,
        todaysSchedule: todaysPeriods,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get teacher's assigned classes & students
exports.getMyClasses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('assignedClasses.classId', 'name numericGrade')
      .populate('assignedClasses.sectionId', 'name roomNumber')
      .populate('assignedClasses.subjectId', 'name code');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    // Fetch students in assigned classes
    const classIds = teacher.assignedClasses.map((ac) => ac.classId?._id).filter(Boolean);
    const students = await Student.find({
      classId: { $in: classIds },
      status: 'active',
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ classId: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      assignedClasses: teacher.assignedClasses,
      students,
    });
  } catch (error) {
    next(error);
  }
};
