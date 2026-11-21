const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const StudentFee = require('../models/StudentFee');
const Admission = require('../models/Admission');

// @desc Generate report data based on report type
exports.getReportData = async (req, res, next) => {
  try {
    const { type, classId, sectionId, startDate, endDate, status } = req.query;

    let data = [];
    let summary = {};

    switch (type) {
      case 'students': {
        const query = {};
        if (classId) query.classId = classId;
        if (sectionId) query.sectionId = sectionId;
        if (status) query.status = status;

        data = await Student.find(query)
          .populate('classId', 'name')
          .populate('sectionId', 'name')
          .sort({ classId: 1, rollNumber: 1 });

        summary = {
          total: data.length,
          active: data.filter((s) => s.status === 'active').length,
          inactive: data.filter((s) => s.status === 'inactive').length,
        };
        break;
      }

      case 'teachers': {
        const query = {};
        if (status) query.employmentStatus = status;

        data = await Teacher.find(query)
          .populate('assignedClasses.classId', 'name')
          .sort({ fullName: 1 });

        summary = {
          total: data.length,
          active: data.filter((t) => t.employmentStatus === 'active').length,
          totalPayroll: data.reduce((sum, t) => sum + (t.salary || 0), 0),
        };
        break;
      }

      case 'attendance': {
        const query = { type: 'student' };
        if (classId) query.classId = classId;
        if (sectionId) query.sectionId = sectionId;
        if (startDate && endDate) {
          query.date = { $gte: startDate, $lte: endDate };
        }

        data = await Attendance.find(query)
          .populate('studentId', 'admissionNo firstName lastName rollNumber')
          .populate('classId', 'name')
          .populate('sectionId', 'name')
          .sort({ date: -1 });

        const present = data.filter((d) => d.status === 'Present').length;
        const absent = data.filter((d) => d.status === 'Absent').length;
        const late = data.filter((d) => d.status === 'Late').length;

        summary = {
          totalRecords: data.length,
          present,
          absent,
          late,
          overallRate: data.length > 0 ? Math.round(((present + late) / data.length) * 100) : 0,
        };
        break;
      }

      case 'fee_collection': {
        const query = {};
        if (startDate && endDate) {
          query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        data = await Payment.find(query)
          .populate({
            path: 'studentId',
            select: 'admissionNo firstName lastName',
            populate: { path: 'classId', select: 'name' },
          })
          .sort({ paymentDate: -1 });

        const totalCollected = data.reduce((sum, p) => sum + p.amountPaid, 0);

        summary = {
          totalTransactions: data.length,
          totalCollected,
        };
        break;
      }

      case 'pending_payments': {
        const query = { status: { $in: ['Unpaid', 'Partial', 'Overdue'] } };
        if (classId) query.classId = classId;

        data = await StudentFee.find(query)
          .populate({
            path: 'studentId',
            select: 'admissionNo firstName lastName parentName parentPhone',
            populate: [
              { path: 'classId', select: 'name' },
              { path: 'sectionId', select: 'name' },
            ],
          })
          .sort({ dueDate: 1 });

        const totalPending = data.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);

        summary = {
          pendingCount: data.length,
          totalPendingAmount: totalPending,
        };
        break;
      }

      case 'admissions': {
        const query = {};
        if (status) query.status = status;
        if (classId) query.appliedClass = classId;

        data = await Admission.find(query)
          .populate('appliedClass', 'name')
          .populate('assignedSection', 'name')
          .sort({ applicationDate: -1 });

        summary = {
          total: data.length,
          approved: data.filter((a) => a.status === 'Approved').length,
          pending: data.filter((a) => a.status === 'Pending').length,
          rejected: data.filter((a) => a.status === 'Rejected').length,
        };
        break;
      }

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type requested' });
    }

    res.status(200).json({
      success: true,
      reportType: type,
      summary,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};
