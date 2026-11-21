const mongoose = require('mongoose');

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Homework',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['Submitted', 'Late Submitted', 'Reviewed', 'Pending'],
      default: 'Submitted',
    },
    marksObtained: {
      type: Number,
      default: null,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    feedback: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
