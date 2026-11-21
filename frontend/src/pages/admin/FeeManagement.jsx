import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ReceiptModal from '../../components/common/ReceiptModal';
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  CreditCard,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Sliders,
  TrendingUp,
} from 'lucide-react';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('fees'); // 'fees', 'structures', 'payments', 'fines'
  const [studentFees, setStudentFees] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fines, setFines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modals
  const [recordPaymentModal, setRecordPaymentModal] = useState(false);
  const [createFineModal, setCreateFineModal] = useState(false);
  const [structureModal, setStructureModal] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    studentFeeId: '',
    amountPaid: '',
    paymentMethod: 'Cash',
    transactionId: '',
    remarks: 'Tuition and School Fee Payment',
  });

  const [fineForm, setFineForm] = useState({
    studentId: '',
    title: 'Library Book Overdue',
    amount: 150,
    reason: 'Late return after 14 days',
  });

  const [structureForm, setStructureForm] = useState({
    classId: '',
    tuitionFee: 3500,
    admissionFee: 5000,
    examFee: 1000,
    transportFee: 1500,
    otherCharges: 500,
    lateFinePerDay: 50,
  });

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSF, resFS, resP, resF, resC, resStu] = await Promise.all([
        api.get('/fees/student-fees', { params: { search, status: statusFilter, classId: classFilter } }),
        api.get('/fees/structures'),
        api.get('/fees/payments'),
        api.get('/fees/fines'),
        api.get('/classes'),
        api.get('/students', { params: { limit: 100 } }),
      ]);

      if (resSF.data?.success) setStudentFees(resSF.data.data);
      if (resFS.data?.success) setFeeStructures(resFS.data.data);
      if (resP.data?.success) setPayments(resP.data.data);
      if (resF.data?.success) setFines(resF.data.data);
      if (resC.data?.success) setClasses(resC.data.data);
      if (resStu.data?.success) setStudents(resStu.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, classFilter]);

  // Overall Financial Totals
  const totalBilled = studentFees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
  const totalCollected = studentFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalPending = Math.max(0, totalBilled - totalCollected);
  const totalFines = fines.reduce((sum, f) => sum + (f.amount || 0), 0);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/fees/record-payment', paymentForm);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: res.data.message });
        setRecordPaymentModal(false);
        setSelectedReceipt(res.data.data);
        setReceiptModalOpen(true);
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Payment recording failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFine = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/fees/fines', fineForm);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Fine applied successfully!' });
        setCreateFineModal(false);
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to apply fine' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/fees/structures', structureForm);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Fee structure saved successfully!' });
        setStructureModal(false);
        fetchData();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to update fee structure' });
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModalForFee = (fee) => {
    setSelectedStudentFee(fee);
    setPaymentForm({
      studentId: fee.studentId?._id,
      studentFeeId: fee._id,
      amountPaid: fee.totalAmount - fee.paidAmount,
      paymentMethod: 'Cash',
      transactionId: '',
      remarks: `Term Fee Payment for ${fee.month || 'Term 1'}`,
    });
    setRecordPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Fee & Payment Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Set class fee structures, record fee collections, issue receipts, and manage student fines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateFineModal(true)}
            className="px-3 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Apply Fine
          </button>
          <button
            onClick={() => {
              if (studentFees.length > 0) openPaymentModalForFee(studentFees[0]);
              else setRecordPaymentModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <CreditCard className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {alertMsg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Fees Billed</p>
          <h3 className="text-xl font-extrabold text-slate-800 mt-1">₹{totalBilled.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Across active enrolled students</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase">Total Fees Collected</p>
          <h3 className="text-xl font-extrabold text-emerald-700 mt-1">₹{totalCollected.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% Realization
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-rose-500 uppercase">Pending Invoices</p>
          <h3 className="text-xl font-extrabold text-rose-600 mt-1">₹{totalPending.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Outstanding student balances</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase">Total Fines Imposed</p>
          <h3 className="text-xl font-extrabold text-amber-600 mt-1">₹{totalFines.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{fines.length} disciplinary records</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'fees'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Student Fee Records
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'structures'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" /> Class Fee Structures
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payment History & Receipts
        </button>
        <button
          onClick={() => setActiveTab('fines')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'fines'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" /> Student Fines
        </button>
      </div>

      {/* TAB 1: Student Fees Table */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student or adm no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Standard</th>
                  <th className="py-3 px-4">Month / Term</th>
                  <th className="py-3 px-4">Total (₹)</th>
                  <th className="py-3 px-4">Paid (₹)</th>
                  <th className="py-3 px-4">Balance (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentFees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  studentFees.map((sf) => {
                    const balance = sf.totalAmount - sf.paidAmount;
                    return (
                      <tr key={sf._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">
                            {sf.studentId?.firstName} {sf.studentId?.lastName}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">{sf.studentId?.admissionNo}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {sf.studentId?.classId?.name} - {sf.studentId?.sectionId?.name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600">{sf.month}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          ₹{sf.totalAmount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          ₹{sf.paidAmount?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-600">
                          ₹{balance?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sf.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sf.status === 'Partial'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {sf.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {balance > 0 ? (
                            <button
                              onClick={() => openPaymentModalForFee(sf)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Fee Structures */}
      {activeTab === 'structures' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Academic Standards Fee Schedule</h3>
              <p className="text-xs text-slate-500">Breakdown of tuition, admission, exam, and transport fees</p>
            </div>
            <button
              onClick={() => {
                setStructureForm({
                  classId: classes[0]?._id || '',
                  tuitionFee: 3500,
                  admissionFee: 5000,
                  examFee: 1000,
                  transportFee: 1500,
                  otherCharges: 500,
                  lateFinePerDay: 50,
                });
                setStructureModal(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Modify / Set Structure
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map((fs) => (
              <div key={fs._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 text-sm">{fs.classId?.name}</h4>
                  <span className="text-xs font-semibold text-indigo-600">Session 2026-27</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Monthly Tuition Fee:</span>
                    <strong className="text-slate-800">₹{fs.tuitionFee?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Admission / Enrollment Fee:</span>
                    <strong className="text-slate-800">₹{fs.admissionFee?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Examination Fee:</span>
                    <strong className="text-slate-800">₹{fs.examFee?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Transport Service Fee:</span>
                    <strong className="text-slate-800">₹{fs.transportFee?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Other Activity Charges:</span>
                    <strong className="text-slate-800">₹{fs.otherCharges?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 text-[11px]">
                    <span>Late Fine: ₹{fs.lateFinePerDay}/day after 10th</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Payments History & Receipts */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Amount (₹)</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{p.receiptNo}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">
                        {p.studentId?.firstName} {p.studentId?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.studentId?.admissionNo}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.paymentDate || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ₹{p.amountPaid?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{p.remarks}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReceipt(p);
                          setReceiptModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Student Fines */}
      {activeTab === 'fines' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Fine Reason</th>
                  <th className="py-3 px-4">Amount (₹)</th>
                  <th className="py-3 px-4">Imposed Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">
                        {f.studentId?.firstName} {f.studentId?.lastName}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">{f.studentId?.admissionNo}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{f.title}</p>
                      <p className="text-[11px] text-slate-500">{f.reason}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">₹{f.amount}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(f.date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          f.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {f.status === 'Pending' && (
                        <button
                          onClick={async () => {
                            await api.put(`/fees/fines/${f._id}/status`, { status: 'Paid' });
                            fetchData();
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={recordPaymentModal} onClose={() => setRecordPaymentModal(false)} title="Record Fee Collection" maxWidth="max-w-md">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
            <select
              required
              value={paymentForm.studentId}
              onChange={(e) => {
                const sId = e.target.value;
                const matchFee = studentFees.find((f) => f.studentId?._id === sId && f.status !== 'Paid');
                setPaymentForm({
                  ...paymentForm,
                  studentId: sId,
                  studentFeeId: matchFee ? matchFee._id : '',
                  amountPaid: matchFee ? matchFee.totalAmount - matchFee.paidAmount : 4800,
                });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.admissionNo}) - {s.classId?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Collect (₹) *</label>
            <input
              type="number"
              required
              value={paymentForm.amountPaid}
              onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No</label>
              <input
                type="text"
                placeholder="Optional"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={paymentForm.remarks}
              onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setRecordPaymentModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Recording...' : 'Generate Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Fine Modal */}
      <Modal isOpen={createFineModal} onClose={() => setCreateFineModal(false)} title="Apply Fine to Student" maxWidth="max-w-md">
        <form onSubmit={handleCreateFine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={fineForm.studentId}
              onChange={(e) => setFineForm({ ...fineForm, studentId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.admissionNo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fine Title *</label>
            <input
              type="text"
              required
              value={fineForm.title}
              onChange={(e) => setFineForm({ ...fineForm, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              required
              value={fineForm.amount}
              onChange={(e) => setFineForm({ ...fineForm, amount: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Disciplinary Reason</label>
            <textarea
              rows={2}
              value={fineForm.reason}
              onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateFineModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm"
            >
              {submitting ? 'Applying...' : 'Impose Fine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Structure Modal */}
      <Modal isOpen={structureModal} onClose={() => setStructureModal(false)} title="Set Class Fee Structure" maxWidth="max-w-md">
        <form onSubmit={handleSaveStructure} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class *</label>
            <select
              required
              value={structureForm.classId}
              onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tuition Fee (₹)</label>
              <input
                type="number"
                value={structureForm.tuitionFee}
                onChange={(e) => setStructureForm({ ...structureForm, tuitionFee: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Fee (₹)</label>
              <input
                type="number"
                value={structureForm.admissionFee}
                onChange={(e) => setStructureForm({ ...structureForm, admissionFee: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Fee (₹)</label>
              <input
                type="number"
                value={structureForm.examFee}
                onChange={(e) => setStructureForm({ ...structureForm, examFee: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transport Fee (₹)</label>
              <input
                type="number"
                value={structureForm.transportFee}
                onChange={(e) => setStructureForm({ ...structureForm, transportFee: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStructureModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Structure'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default FeeManagement;
