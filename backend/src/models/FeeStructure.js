const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    tuitionFee: {
      type: Number,
      required: true,
      default: 3000,
    },
    admissionFee: {
      type: Number,
      default: 5000,
    },
    examFee: {
      type: Number,
      default: 1200,
    },
    transportFee: {
      type: Number,
      default: 1500,
    },
    otherCharges: {
      type: Number,
      default: 500,
    },
    lateFinePerDay: {
      type: Number,
      default: 50,
    },
    dueDateDay: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

feeStructureSchema.index({ classId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
