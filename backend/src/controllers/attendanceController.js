const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Section = require('../models/Section');

// @desc Get student attendance for a given class, section, date
exports.getClassAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required' });
    }

    const studentQuery = { classId, status: 'active' };
    if (sectionId) studentQuery.sectionId = sectionId;

    const students = await Student.find(studentQuery)
      .populate('sectionId', 'name')
      .sort({ rollNumber: 1 });

    // Fetch existing attendance records for these students on this date
    const attendanceRecords = await Attendance.find({
      type: 'student',
      classId,
      ...(sectionId ? { sectionId } : {}),
      date: queryDate,
    });

    const attendanceMap = {};
    attendanceRecords.forEach((att) => {
      attendanceMap[att.studentId.toString()] = {
        _id: att._id,
        status: att.status,
        remarks: att.remarks,
      };
    });

    // Merge students with their attendance status
    const studentList = students.map((stu) => {
      const att = attendanceMap[stu._id.toString()];
      return {
        studentId: stu._id,
        admissionNo: stu.admissionNo,
        rollNumber: stu.rollNumber,
        fullName: `${stu.firstName} ${stu.lastName}`,
        profileImage: stu.profileImage,
        sectionName: stu.sectionId?.name || '',
        status: att ? att.status : 'Present', // default to Present if not yet marked
        isMarked: !!att,
        attendanceId: att ? att._id : null,
        remarks: att ? att.remarks : '',
      };
    });

    res.status(200).json({
      success: true,
      date: queryDate,
      totalStudents: students.length,
      isMarked: attendanceRecords.length > 0,
      data: studentList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Save/Update batch attendance for a class
exports.saveClassAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date, attendanceList } = req.body;
    // attendanceList is array of { studentId, status, remarks }
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (!classId || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance submission data' });
    }

    const operations = attendanceList.map((item) => ({
      updateOne: {
        filter: {
          type: 'student',
          studentId: item.studentId,
          date: targetDate,
        },
        update: {
          $set: {
            type: 'student',
            studentId: item.studentId,
            classId,
            sectionId: sectionId || item.sectionId,
            date: targetDate,
            status: item.status || 'Present',
            remarks: item.remarks || '',
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: `Attendance for ${attendanceList.length} students recorded for ${targetDate}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get student's personal attendance history & summary (for student portal)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const records = await Attendance.find({
      type: 'student',
      studentId: student._id,
    }).sort({ date: -1 });

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'Present').length;
    const lateDays = records.filter((r) => r.status === 'Late').length;
    const absentDays = records.filter((r) => r.status === 'Absent').length;

    const percentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 95;

    res.status(200).json({
      success: true,
      summary: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        percentage,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Teacher Attendance Overview (Admin View)
exports.getTeacherAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const teachers = await Teacher.find({ employmentStatus: 'active' });
    const records = await Attendance.find({
      type: 'teacher',
      date: targetDate,
    });

    const recordMap = {};
    records.forEach((r) => {
      if (r.teacherId) recordMap[r.teacherId.toString()] = r;
    });

    const data = teachers.map((tch) => {
      const rec = recordMap[tch._id.toString()];
      return {
        teacherId: tch._id,
        code: tch.teacherId,
        fullName: tch.fullName,
        email: tch.email,
        phone: tch.phone,
        status: rec ? rec.status : 'Present',
        remarks: rec ? rec.remarks : '',
        isMarked: !!rec,
      };
    });

    res.status(200).json({
      success: true,
      date: targetDate,
      totalTeachers: teachers.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Save/Update Teacher Attendance
exports.saveTeacherAttendance = async (req, res, next) => {
  try {
    const { date, attendanceList } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const operations = attendanceList.map((item) => ({
      updateOne: {
        filter: {
          type: 'teacher',
          teacherId: item.teacherId,
          date: targetDate,
        },
        update: {
          $set: {
            type: 'teacher',
            teacherId: item.teacherId,
            date: targetDate,
            status: item.status || 'Present',
            remarks: item.remarks || '',
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: `Teacher attendance updated for ${targetDate}`,
    });
  } catch (error) {
    next(error);
  }
};
