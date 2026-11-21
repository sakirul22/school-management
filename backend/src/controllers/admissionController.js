const Admission = require('../models/Admission');
const Student = require('../models/Student');
const User = require('../models/User');
const Section = require('../models/Section');

const generateApplicationNumber = async () => {
  const count = await Admission.countDocuments();
  const year = new Date().getFullYear();
  return `APP-${year}-${String(count + 1).padStart(4, '0')}`;
};

const generateAdmissionNumber = async () => {
  const count = await Student.countDocuments();
  const year = new Date().getFullYear();
  return `ADM-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc Get all admissions with filter
exports.getAdmissions = async (req, res, next) => {
  try {
    const { status, classId, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (classId) query.appliedClass = classId;
    if (search) {
      query.$or = [
        { studentFirstName: { $regex: search, $options: 'i' } },
        { studentLastName: { $regex: search, $options: 'i' } },
        { applicationNo: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { parentPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const admissions = await Admission.find(query)
      .populate('appliedClass', 'name numericGrade')
      .populate('assignedSection', 'name')
      .populate('createdStudentId', 'admissionNo')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (error) {
    next(error);
  }
};

// @desc Submit new admission application
exports.createAdmission = async (req, res, next) => {
  try {
    const applicationNo = await generateApplicationNumber();
    const admission = await Admission.create({
      ...req.body,
      applicationNo,
      status: 'Pending',
    });

    const populated = await Admission.findById(admission._id).populate('appliedClass', 'name');

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Approve admission application -> Creates Student + User
exports.approveAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission application not found' });
    }

    if (admission.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Application is already approved' });
    }

    const sectionId = req.body.assignedSection || admission.assignedSection;
    if (!sectionId) {
      // Find default section 'A' for this class
      const defaultSection = await Section.findOne({ classId: admission.appliedClass });
      if (defaultSection) {
        admission.assignedSection = defaultSection._id;
      }
    } else {
      admission.assignedSection = sectionId;
    }

    const admissionNo = await generateAdmissionNumber();
    const studentEmail = admission.parentEmail
      ? `s.${admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.school.com`
      : `${admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.school.com`;

    // 1. Create or link User
    let user = await User.findOne({ email: studentEmail });
    if (!user) {
      user = await User.create({
        name: `${admission.studentFirstName} ${admission.studentLastName}`,
        email: studentEmail,
        password: 'Student@123',
        role: 'student',
        phone: admission.parentPhone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${admission.studentFirstName}`,
      });
    }

    // 2. Count existing students in class/section for roll number
    const currentClassCount = await Student.countDocuments({
      classId: admission.appliedClass,
      sectionId: admission.assignedSection,
    });
    const rollNumber = String(currentClassCount + 1).padStart(2, '0');

    // 3. Create Student
    const student = await Student.create({
      user: user._id,
      admissionNo,
      firstName: admission.studentFirstName,
      lastName: admission.studentLastName,
      dob: admission.dob,
      gender: admission.gender,
      email: studentEmail,
      phone: admission.parentPhone,
      address: admission.address,
      parentName: admission.parentName,
      parentPhone: admission.parentPhone,
      parentEmail: admission.parentEmail,
      classId: admission.appliedClass,
      sectionId: admission.assignedSection,
      rollNumber,
      admissionDate: new Date(),
      previousSchool: admission.previousSchool,
      bloodGroup: admission.bloodGroup || 'B+',
      profileImage: user.avatar,
      status: 'active',
    });

    // 4. Update Admission record
    admission.status = 'Approved';
    admission.createdStudentId = student._id;
    admission.remarks = req.body.remarks || 'Admission approved and student enrolled';
    await admission.save();

    res.status(200).json({
      success: true,
      message: `Admission approved! Student enrolled with Admission No: ${admissionNo}`,
      data: {
        admission,
        student,
        tempCredentials: {
          email: studentEmail,
          password: 'Student@123',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reject admission
exports.rejectAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission application not found' });
    }

    admission.status = 'Rejected';
    admission.remarks = req.body.remarks || 'Application rejected';
    await admission.save();

    res.status(200).json({ success: true, message: 'Application rejected', data: admission });
  } catch (error) {
    next(error);
  }
};
