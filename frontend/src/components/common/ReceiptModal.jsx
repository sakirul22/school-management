import React from 'react';
import Modal from './Modal';
import { Printer, Download, CheckCircle, School } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = receipt.studentId || {};
  const fee = receipt.studentFeeId || {};
  const dateFormatted = new Date(receipt.paymentDate || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Payment Receipt" maxWidth="max-w-2xl">
      <div>
        {/* Printable Area */}
        <div className="printable-area bg-white border border-slate-200 rounded-xl p-6 sm:p-8 text-slate-800 shadow-sm relative overflow-hidden">
          {/* Watermark Paid Stamp */}
          <div className="absolute right-8 top-28 pointer-events-none select-none opacity-20 rotate-[-15deg]">
            <div className="border-4 border-emerald-600 text-emerald-700 font-extrabold text-4xl px-6 py-2 rounded-lg tracking-widest uppercase">
              PAID
            </div>
          </div>

          {/* School Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <School className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                DEMO SCHOOL
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              CBSE Affiliated Senior Secondary School • Demo Campus, Knowledge Park - 110001
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Phone: +91 11 2617 8900 • Email: accounts@school.com</p>
            <div className="inline-block mt-3 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700 tracking-wider uppercase">
              OFFICIAL FEE PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Details Header */}
          <div className="grid grid-cols-2 gap-4 my-5 text-xs">
            <div>
              <p className="text-slate-500">Receipt No:</p>
              <p className="font-bold text-slate-800 text-sm">{receipt.receiptNo || 'REC-2026-0001'}</p>
              <p className="text-slate-500 mt-2">Payment Date:</p>
              <p className="font-semibold text-slate-800">{dateFormatted}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Payment Mode:</p>
              <p className="font-semibold text-indigo-600">{receipt.paymentMethod || 'Cash'}</p>
              {receipt.transactionId && (
                <>
                  <p className="text-slate-500 mt-2">Txn ID / Ref:</p>
                  <p className="font-mono text-slate-700">{receipt.transactionId}</p>
                </>
              )}
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block">Student Name:</span>
                <span className="font-bold text-slate-800">
                  {student.firstName ? `${student.firstName} ${student.lastName}` : 'Aarav Sharma'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Admission No:</span>
                <span className="font-semibold text-slate-800">{student.admissionNo || 'ADM-2026-0001'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Class & Section:</span>
                <span className="font-semibold text-slate-800">
                  {student.classId?.name || 'Class 10'} - {student.sectionId?.name || 'A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Roll Number:</span>
                <span className="font-semibold text-slate-800">{student.rollNumber || '01'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Parent / Guardian:</span>
                <span className="font-semibold text-slate-800">{student.parentName || 'Vikram Sharma'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fee Month:</span>
                <span className="font-semibold text-slate-800">{fee.month || 'Term 1 / April 2026'}</span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <table className="w-full text-xs text-left border-collapse mb-5">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Particulars</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 text-slate-700">Monthly Tuition Fee</td>
                <td className="py-2 px-3 text-right font-medium">₹{(receipt.amountPaid * 0.7).toFixed(0)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-700">Examination & Assessment Charges</td>
                <td className="py-2 px-3 text-right font-medium">₹{(receipt.amountPaid * 0.2).toFixed(0)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-700">Library & Laboratory Maintenance</td>
                <td className="py-2 px-3 text-right font-medium">₹{(receipt.amountPaid * 0.1).toFixed(0)}</td>
              </tr>
              <tr className="border-t-2 border-slate-300 bg-indigo-50/50 font-bold text-slate-900 text-sm">
                <td className="py-3 px-3">Total Amount Paid:</td>
                <td className="py-3 px-3 text-right text-indigo-700">₹{receipt.amountPaid?.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Remarks & Signatures */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
            <div>
              <p className="text-slate-400 italic">This is a computer generated receipt.</p>
              <p className="text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" /> Status: Verified and Credited
              </p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 w-32 pb-6 text-slate-400 font-mono text-[10px]">
                [Authorized Sign]
              </div>
              <p className="text-[11px] font-semibold text-slate-600 mt-1">Accounts Officer</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-5 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
