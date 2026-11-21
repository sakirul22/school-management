const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    weeklyPeriods: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ classId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
