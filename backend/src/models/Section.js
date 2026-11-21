const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required (e.g. A, B, C)'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    roomNumber: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 40,
    },
  },
  { timestamps: true }
);

// Compound index to ensure section name is unique within a class
sectionSchema.index({ classId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
