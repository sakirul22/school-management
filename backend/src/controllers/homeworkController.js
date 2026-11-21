const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @desc Get homework list (with filters for class, subject, teacher)
exports.getHomeworks = async (req, res, next) => {
  try {
    const { classId, sectionId, subjectId, teacherId } = req.query;
    const query = {};

    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (subjectId) query.subjectId = subjectId;
    if (teacherId) query.teacherId = teacherId;

    // If teacher role, auto filter by this teacher unless querying all
    if (req.user.role === 'teacher' && !classId) {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) query.teacherId = teacher._id;
    }

    const homeworks = await Homework.find(query)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'fullName')
      .sort({ createdAt: -1 });

    // Include submission stats for each homework
    const homeworkWithStats = await Promise.all(
      homeworks.map(async (hw) => {
        const totalStudents = await Student.countDocuments({
          classId: hw.classId?._id,
          sectionId: hw.sectionId?._id,
          status: 'active',
        });
        const submittedCount = await HomeworkSubmission.countDocuments({
          homeworkId: hw._id,
        });
        const reviewedCount = await HomeworkSubmission.countDocuments({
          homeworkId: hw._id,
          status: 'Reviewed',
        });

        return {
          ...hw.toObject(),
          totalStudents,
          submittedCount,
          pendingReviewCount: submittedCount - reviewedCount,
        };
      })
    );

    res.status(200).json({ success: true, count: homeworks.length, data: homeworkWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc Create new homework (Teacher)
exports.createHomework = async (req, res, next) => {
  try {
    const { title, description, classId, sectionId, subjectId, deadline, attachments } = req.body;

    let teacherId = req.body.teacherId;
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) teacherId = teacher._id;
    }

    const homework = await Homework.create({
      title,
      description,
      classId,
      sectionId,
      subjectId,
      teacherId,
      deadline: new Date(deadline),
      attachments: attachments || [],
      status: 'Active',
    });

    const populated = await Homework.findById(homework._id)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'fullName');

    res.status(201).json({ success: true, message: 'Homework created successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Update homework
exports.updateHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'fullName');

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    res.status(200).json({ success: true, message: 'Homework updated', data: homework });
  } catch (error) {
    next(error);
  }
};

// @desc Delete homework
exports.deleteHomework = async (req, res, next) => {
  try {
    await Homework.findByIdAndDelete(req.params.id);
    await HomeworkSubmission.deleteMany({ homeworkId: req.params.id });
    res.status(200).json({ success: true, message: 'Homework and its submissions removed' });
  } catch (error) {
    next(error);
  }
};

// @desc Get homework submissions for a homework (Teacher view)
exports.getHomeworkSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const homework = await Homework.findById(id)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name');

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    // Get all students in this class/section
    const students = await Student.find({
      classId: homework.classId?._id,
      sectionId: homework.sectionId?._id,
      status: 'active',
    }).sort({ rollNumber: 1 });

    // Get submissions
    const submissions = await HomeworkSubmission.find({ homeworkId: id });
    const submissionMap = {};
    submissions.forEach((sub) => {
      submissionMap[sub.studentId.toString()] = sub;
    });

    const studentSubmissions = students.map((stu) => {
      const sub = submissionMap[stu._id.toString()];
      return {
        studentId: stu._id,
        admissionNo: stu.admissionNo,
        rollNumber: stu.rollNumber,
        fullName: `${stu.firstName} ${stu.lastName}`,
        profileImage: stu.profileImage,
        hasSubmitted: !!sub,
        submissionId: sub ? sub._id : null,
        submissionDate: sub ? sub.submissionDate : null,
        content: sub ? sub.content : '',
        attachments: sub ? sub.attachments : [],
        status: sub ? sub.status : 'Pending',
        marksObtained: sub ? sub.marksObtained : null,
        totalMarks: sub ? sub.totalMarks : 100,
        feedback: sub ? sub.feedback : '',
        reviewedAt: sub ? sub.reviewedAt : null,
      };
    });

    res.status(200).json({
      success: true,
      homework,
      totalStudents: students.length,
      submittedCount: submissions.length,
      data: studentSubmissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Evaluate / Grade homework submission (Teacher)
exports.evaluateSubmission = async (req, res, next) => {
  try {
    const { marksObtained, totalMarks, feedback } = req.body;
    let submission = await HomeworkSubmission.findById(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.marksObtained = marksObtained;
    submission.totalMarks = totalMarks || 100;
    submission.feedback = feedback || '';
    submission.status = 'Reviewed';
    submission.reviewedAt = new Date();
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Homework evaluated and graded successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get student's homework list with submission status (Student Portal)
exports.getStudentHomeworks = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const homeworks = await Homework.find({
      classId: student.classId,
      sectionId: student.sectionId,
    })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'fullName')
      .sort({ deadline: -1 });

    const submissions = await HomeworkSubmission.find({ studentId: student._id });
    const subMap = {};
    submissions.forEach((s) => {
      subMap[s.homeworkId.toString()] = s;
    });

    const data = homeworks.map((hw) => {
      const sub = subMap[hw._id.toString()];
      const isPastDeadline = new Date() > new Date(hw.deadline);

      let status = 'Assigned';
      if (sub) {
        status = sub.status;
      } else if (isPastDeadline) {
        status = 'Overdue';
      }

      return {
        _id: hw._id,
        title: hw.title,
        description: hw.description,
        subject: hw.subjectId?.name || 'General',
        subjectCode: hw.subjectId?.code || '',
        teacherName: hw.teacherId?.fullName || '',
        deadline: hw.deadline,
        attachments: hw.attachments,
        status,
        submission: sub
          ? {
              _id: sub._id,
              submissionDate: sub.submissionDate,
              content: sub.content,
              attachments: sub.attachments,
              marksObtained: sub.marksObtained,
              totalMarks: sub.totalMarks,
              feedback: sub.feedback,
              reviewedAt: sub.reviewedAt,
            }
          : null,
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc Submit homework (Student)
exports.submitHomework = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { homeworkId, content, attachments } = req.body;
    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const isLate = new Date() > new Date(homework.deadline);
    const status = isLate ? 'Late Submitted' : 'Submitted';

    let submission = await HomeworkSubmission.findOne({ homeworkId, studentId: student._id });

    if (submission) {
      // Re-submit
      submission.content = content || submission.content;
      if (attachments) submission.attachments = attachments;
      submission.status = status;
      submission.submissionDate = new Date();
      await submission.save();
    } else {
      submission = await HomeworkSubmission.create({
        homeworkId,
        studentId: student._id,
        content: content || '',
        attachments: attachments || [],
        status,
        submissionDate: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Homework submitted successfully ${isLate ? '(Late)' : ''}`,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};
