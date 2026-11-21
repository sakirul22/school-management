const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const Fine = require('../models/Fine');
const Student = require('../models/Student');
const Class = require('../models/Class');

const generateReceiptNo = async () => {
  const count = await Payment.countDocuments();
  const year = new Date().getFullYear();
  return `REC-${year}-${String(count + 1).padStart(5, '0')}`;
};

// ===== FEE STRUCTURES =====
exports.getFeeStructures = async (req, res, next) => {
  try {
    const feeStructures = await FeeStructure.find().populate('classId', 'name numericGrade');
    res.status(200).json({ success: true, count: feeStructures.length, data: feeStructures });
  } catch (error) {
    next(error);
  }
};

exports.upsertFeeStructure = async (req, res, next) => {
  try {
    const { classId, academicYear, tuitionFee, admissionFee, examFee, transportFee, otherCharges, lateFinePerDay, dueDateDay } = req.body;

    const feeStructure = await FeeStructure.findOneAndUpdate(
      { classId, academicYear: academicYear || '2026-2027' },
      {
        tuitionFee: Number(tuitionFee),
        admissionFee: Number(admissionFee || 0),
        examFee: Number(examFee || 0),
        transportFee: Number(transportFee || 0),
        otherCharges: Number(otherCharges || 0),
        lateFinePerDay: Number(lateFinePerDay || 50),
        dueDateDay: Number(dueDateDay || 10),
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('classId', 'name');

    res.status(200).json({ success: true, message: 'Fee structure saved successfully', data: feeStructure });
  } catch (error) {
    next(error);
  }
};

// ===== STUDENT FEES =====
exports.getStudentFees = async (req, res, next) => {
  try {
    const { classId, status, month, search } = req.query;
    const query = {};

    if (classId) query.classId = classId;
    if (status) query.status = status;
    if (month) query.month = month;

    let studentFees = await StudentFee.find(query)
      .populate({
        path: 'studentId',
        select: 'admissionNo firstName lastName rollNumber profileImage parentName phone',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
        ],
      })
      .populate('classId', 'name')
      .sort({ createdAt: -1 });

    if (search) {
      studentFees = studentFees.filter((sf) => {
        const name = `${sf.studentId?.firstName} ${sf.studentId?.lastName}`.toLowerCase();
        const adm = sf.studentId?.admissionNo?.toLowerCase() || '';
        return name.includes(search.toLowerCase()) || adm.includes(search.toLowerCase());
      });
    }

    res.status(200).json({ success: true, count: studentFees.length, data: studentFees });
  } catch (error) {
    next(error);
  }
};

// @desc Record Manual Payment & Generate Receipt
exports.recordPayment = async (req, res, next) => {
  try {
    const { studentFeeId, studentId, amountPaid, paymentMethod, transactionId, remarks } = req.body;

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const receiptNo = await generateReceiptNo();

    const payment = await Payment.create({
      receiptNo,
      studentFeeId,
      studentId,
      amountPaid: Number(amountPaid),
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId || '',
      receivedBy: req.user._id,
      remarks: remarks || 'Tuition / School Fee payment',
      paymentDate: new Date(),
    });

    // Update StudentFee status
    if (studentFeeId) {
      const studentFee = await StudentFee.findById(studentFeeId);
      if (studentFee) {
        studentFee.paidAmount += Number(amountPaid);
        if (studentFee.paidAmount >= studentFee.totalAmount) {
          studentFee.status = 'Paid';
        } else if (studentFee.paidAmount > 0) {
          studentFee.status = 'Partial';
        }
        await studentFee.save();
      }
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'studentId',
        select: 'admissionNo firstName lastName parentName rollNumber',
        populate: { path: 'classId', select: 'name' },
      })
      .populate('receivedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Payment of ₹${amountPaid} recorded successfully. Receipt No: ${receiptNo}`,
      data: populatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Payments History
exports.getPayments = async (req, res, next) => {
  try {
    const { studentId, search } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;

    let payments = await Payment.find(query)
      .populate({
        path: 'studentId',
        select: 'admissionNo firstName lastName parentName rollNumber',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
        ],
      })
      .populate('receivedBy', 'name')
      .sort({ paymentDate: -1 });

    if (search) {
      payments = payments.filter((p) => {
        const rNo = p.receiptNo.toLowerCase();
        const sName = `${p.studentId?.firstName} ${p.studentId?.lastName}`.toLowerCase();
        return rNo.includes(search.toLowerCase()) || sName.includes(search.toLowerCase());
      });
    }

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc Get single payment receipt
exports.getReceipt = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { receiptNo: req.params.id }] }
      : { receiptNo: req.params.id };

    const payment = await Payment.findOne(query)
      .populate({
        path: 'studentId',
        select: 'admissionNo firstName lastName parentName rollNumber address phone',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
        ],
      })
      .populate('studentFeeId')
      .populate('receivedBy', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// ===== FINES =====
exports.getFines = async (req, res, next) => {
  try {
    const { studentId, status } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const fines = await Fine.find(query)
      .populate('studentId', 'admissionNo firstName lastName')
      .populate('imposedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: fines.length, data: fines });
  } catch (error) {
    next(error);
  }
};

exports.createFine = async (req, res, next) => {
  try {
    const { studentId, title, amount, reason } = req.body;
    const fine = await Fine.create({
      studentId,
      title,
      amount: Number(amount),
      reason,
      imposedBy: req.user._id,
      status: 'Pending',
    });

    // Update active student fee fine amount
    const activeFee = await StudentFee.findOne({ studentId, status: { $ne: 'Paid' } });
    if (activeFee) {
      activeFee.fineAmount += Number(amount);
      activeFee.totalAmount += Number(amount);
      await activeFee.save();
    }

    const populated = await Fine.findById(fine._id).populate('studentId', 'admissionNo firstName lastName');
    res.status(201).json({ success: true, message: 'Fine applied successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateFineStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const fine = await Fine.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, message: `Fine marked as ${status}`, data: fine });
  } catch (error) {
    next(error);
  }
};

// ===== STUDENT PORTAL FEE VIEW =====
exports.getMyFees = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const feeRecords = await StudentFee.find({ studentId: student._id }).sort({ createdAt: -1 });
    const payments = await Payment.find({ studentId: student._id }).sort({ paymentDate: -1 });
    const fines = await Fine.find({ studentId: student._id }).sort({ date: -1 });

    const totalPayable = feeRecords.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalPaid = feeRecords.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = Math.max(0, totalPayable - totalPaid);
    const totalFines = fines.filter((f) => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalPayable,
        totalPaid,
        totalPending,
        totalFines,
        status: totalPending === 0 ? 'Paid' : 'Pending',
      },
      feeRecords,
      payments,
      fines,
    });
  } catch (error) {
    next(error);
  }
};
