const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const bcrypt = require('bcryptjs');

// Generate Admission Number e.g. ADM-2026-0051
const generateAdmissionNumber = async () => {
  const count = await Student.countDocuments();
  const year = new Date().getFullYear();
  return `ADM-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc Get all students with search & filter & pagination
exports.getStudents = async (req, res, next) => {
  try {
    const { search, classId, sectionId, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('classId', 'name numericGrade')
      .populate('sectionId', 'name roomNumber')
      .populate('user', 'email isActive avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single student profile
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classId', 'name numericGrade')
      .populate('sectionId', 'name roomNumber')
      .populate('user', 'email isActive avatar');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc Create new student
exports.createStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      gender,
      email,
      phone,
      address,
      parentName,
      parentPhone,
      parentEmail,
      classId,
      sectionId,
      rollNumber,
      admissionDate,
      previousSchool,
      bloodGroup,
      profileImage,
      password,
    } = req.body;

    const admissionNo = req.body.admissionNo || (await generateAdmissionNumber());
    const studentEmail = email || `${admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.school.com`;

    // Check if user account already exists with email
    let user = await User.findOne({ email: studentEmail });
    if (!user) {
      user = await User.create({
        name: `${firstName} ${lastName}`,
        email: studentEmail,
        password: password || 'Student@123',
        role: 'student',
        avatar: profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        phone: phone || parentPhone,
      });
    }

    const student = await Student.create({
      user: user._id,
      admissionNo,
      firstName,
      lastName,
      dob: dob || new Date('2012-05-15'),
      gender: gender || 'Male',
      email: studentEmail,
      phone,
      address,
      parentName,
      parentPhone,
      parentEmail,
      classId,
      sectionId,
      rollNumber: rollNumber || '01',
      admissionDate: admissionDate || new Date(),
      previousSchool,
      bloodGroup: bloodGroup || 'B+',
      profileImage: profileImage || user.avatar,
      status: 'active',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('user', 'email isActive');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update student
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update Student record
    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('user', 'email isActive');

    // Update user name/avatar if changed
    if (req.body.firstName || req.body.lastName || req.body.profileImage) {
      await User.findByIdAndUpdate(student.user._id, {
        name: `${student.firstName} ${student.lastName}`,
        avatar: student.profileImage,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete / Deactivate student
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Deactivate user or delete
    if (req.query.permanent === 'true') {
      await User.findByIdAndDelete(student.user);
      await Student.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Student permanently deleted' });
    } else {
      student.status = student.status === 'active' ? 'inactive' : 'active';
      await student.save();
      await User.findByIdAndUpdate(student.user, { isActive: student.status === 'active' });
      return res.status(200).json({
        success: true,
        message: `Student marked as ${student.status}`,
        data: student,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get student's own profile (for student portal)
exports.getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('classId', 'name numericGrade')
      .populate('sectionId', 'name roomNumber')
      .populate('user', 'email isActive avatar');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};
