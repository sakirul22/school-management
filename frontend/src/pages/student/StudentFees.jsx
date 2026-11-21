import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ReceiptModal from '../../components/common/ReceiptModal';
import {
  CreditCard,
  DollarSign,
  Printer,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

const StudentFees = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModal, setReceiptModal] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await api.get('/fees/my-fees');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { summary, feeRecords, payments, fines } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Fee & Payment Portal</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Inspect fee balances, fine records, and download official payment receipts.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Payable</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
            ₹{(summary?.totalPayable || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Session 2026-27</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase">Amount Paid</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
            ₹{(summary?.totalPaid || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Cleared with Accounts</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-rose-500 uppercase">Pending Due</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1">
            ₹{(summary?.totalPending || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Outstanding balance</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase">Applicable Fines</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
            ₹{(summary?.totalFines || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Late return / disciplinary</p>
        </div>
      </div>

      {/* Two Column: Fee Invoices & Payment Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Fee Invoices & Particulars</h3>
            <span className="text-xs text-slate-400 font-medium">Session Term</span>
          </div>

          <div className="space-y-3">
            {feeRecords?.map((rec) => (
              <div key={rec._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">{rec.month}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      rec.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 pt-1 border-t border-slate-200/60">
                  <div className="flex justify-between">
                    <span>Tuition Fee:</span>
                    <strong className="text-slate-800">₹{rec.tuitionFee?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Exam & Lab Charges:</span>
                    <strong className="text-slate-800">₹{rec.examFee?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Charges:</span>
                    <strong className="text-slate-800">₹{rec.otherCharges?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold pt-1.5 border-t border-slate-200">
                    <span>Total Payable:</span>
                    <span className="text-indigo-600">₹{rec.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Official Payment Receipts</h3>
            <span className="text-xs text-slate-400 font-medium">Verified Records</span>
          </div>

          <div className="space-y-3">
            {payments?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded.</p>
            ) : (
              payments?.map((p) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-mono font-bold text-indigo-700">{p.receiptNo}</p>
                    <p className="text-slate-600 font-semibold mt-0.5">
                      Amount Paid: ₹{p.amountPaid?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Paid on: {new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMethod}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedReceipt(p);
                      setReceiptModal(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> View Receipt
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Fines Sub-box */}
          {fines?.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Disciplinary Fines
              </h4>
              <div className="space-y-2">
                {fines.map((f) => (
                  <div key={f._id} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{f.title}</p>
                      <p className="text-[11px] text-slate-500">{f.reason}</p>
                    </div>
                    <span className="font-bold text-rose-600 text-sm">₹{f.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModal}
        onClose={() => setReceiptModal(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default StudentFees;
