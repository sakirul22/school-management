const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// ===== CLASSES =====
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'fullName email phone teacherId')
      .sort({ numericGrade: 1 });

    // Include student and section counts for each class
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classId: cls._id, status: 'active' });
        const sections = await Section.find({ classId: cls._id });
        const subjects = await Subject.find({ classId: cls._id }).populate('teacherId', 'fullName');
        return {
          ...cls.toObject(),
          studentCount,
          sections,
          subjects,
        };
      })
    );

    res.status(200).json({ success: true, count: classes.length, data: classesWithStats });
  } catch (error) {
    next(error);
  }
};

exports.createClass = async (req, res, next) => {
  try {
    const { name, numericGrade, classTeacher, description } = req.body;
    const newClass = await Class.create({
      name,
      numericGrade: Number(numericGrade),
      classTeacher: classTeacher || null,
      description,
    });

    // Automatically create default section 'A'
    await Section.create({
      name: 'A',
      classId: newClass._id,
      roomNumber: `Room ${100 + Number(numericGrade)}`,
    });

    res.status(201).json({ success: true, message: 'Class created successfully', data: newClass });
  } catch (error) {
    next(error);
  }
};

exports.updateClass = async (req, res, next) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('classTeacher', 'fullName email teacherId');

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({ success: true, message: 'Class updated', data: updatedClass });
  } catch (error) {
    next(error);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    await Section.deleteMany({ classId: req.params.id });
    await Subject.deleteMany({ classId: req.params.id });
    res.status(200).json({ success: true, message: 'Class and associated sections removed' });
  } catch (error) {
    next(error);
  }
};

// ===== SECTIONS =====
exports.getSections = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const query = classId ? { classId } : {};
    const sections = await Section.find(query).populate('classId', 'name numericGrade');
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.createSection = async (req, res, next) => {
  try {
    const { name, classId, roomNumber, capacity } = req.body;
    const section = await Section.create({
      name,
      classId,
      roomNumber,
      capacity: capacity || 40,
    });
    res.status(201).json({ success: true, message: 'Section created', data: section });
  } catch (error) {
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Section deleted' });
  } catch (error) {
    next(error);
  }
};

// ===== SUBJECTS =====
exports.getSubjects = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const query = classId ? { classId } : {};
    const subjects = await Subject.find(query)
      .populate('classId', 'name numericGrade')
      .populate('teacherId', 'fullName email teacherId');
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, classId, teacherId, weeklyPeriods } = req.body;
    const subject = await Subject.create({
      name,
      code,
      classId,
      teacherId: teacherId || null,
      weeklyPeriods: weeklyPeriods || 5,
    });

    const populated = await Subject.findById(subject._id)
      .populate('classId', 'name')
      .populate('teacherId', 'fullName email');

    res.status(201).json({ success: true, message: 'Subject created', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('classId', 'name')
      .populate('teacherId', 'fullName email');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, message: 'Subject updated', data: subject });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Subject removed' });
  } catch (error) {
    next(error);
  }
};
