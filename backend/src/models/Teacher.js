const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Female',
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
      default: '',
    },
    qualification: {
      type: String,
      required: true,
      default: 'B.Ed, M.Sc',
    },
    experience: {
      type: String,
      default: '5 Years',
    },
    assignedClasses: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Class',
        },
        sectionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section',
        },
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
      },
    ],
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 45000,
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
