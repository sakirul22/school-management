const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    applicationNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    studentLastName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true,
    },
    parentEmail: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    appliedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    assignedSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    previousSchool: {
      type: String,
      default: '',
    },
    bloodGroup: {
      type: String,
      default: 'B+',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      default: '',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    createdStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
