const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    month: {
      type: String,
      required: true, // e.g. "April 2026", "May 2026"
    },
    tuitionFee: {
      type: Number,
      default: 0,
    },
    admissionFee: {
      type: Number,
      default: 0,
    },
    examFee: {
      type: Number,
      default: 0,
    },
    transportFee: {
      type: Number,
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Partial', 'Overdue'],
      default: 'Unpaid',
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

studentFeeSchema.index({ studentId: 1, month: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('StudentFee', studentFeeSchema);
