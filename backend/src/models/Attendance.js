const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Partial filter unique indexes
attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true, partialFilterExpression: { studentId: { $type: 'objectId' } } }
);

attendanceSchema.index(
  { teacherId: 1, date: 1 },
  { unique: true, partialFilterExpression: { teacherId: { $type: 'objectId' } } }
);

attendanceSchema.index({ classId: 1, sectionId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
