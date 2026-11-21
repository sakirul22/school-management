const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periods: [
      {
        periodNumber: {
          type: Number,
          required: true,
        },
        startTime: {
          type: String, // e.g. "08:30 AM"
          required: true,
        },
        endTime: {
          type: String, // e.g. "09:15 AM"
          required: true,
        },
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        teacherId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Teacher',
          required: true,
        },
        room: {
          type: String,
          default: 'Room 101',
        },
      },
    ],
  },
  { timestamps: true }
);

timetableSchema.index({ classId: 1, sectionId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
