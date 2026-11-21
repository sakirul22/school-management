import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileBarChart,
  Download,
  Printer,
  Filter,
  Users,
  GraduationCap,
  CalendarCheck,
  DollarSign,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

const ReportsManagement = () => {
  const [reportType, setReportType] = useState('students');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        if (res.data?.success) setClasses(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchClasses();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports', {
        params: {
          type: reportType,
          classId: selectedClass,
        },
      });
      if (res.data?.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType, selectedClass]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData?.data || reportData.data.length === 0) return;

    let headers = [];
    let rows = [];

    if (reportType === 'students') {
      headers = ['Admission No,Roll,Name,Class,Parent,Phone,Status'];
      rows = reportData.data.map((s) =>
        `"${s.admissionNo}","${s.rollNumber}","${s.firstName} ${s.lastName}","${s.classId?.name || ''}","${s.parentName}","${s.parentPhone}","${s.status}"`
      );
    } else if (reportType === 'teachers') {
      headers = ['Teacher ID,Name,Email,Phone,Qualification,Salary,Status'];
      rows = reportData.data.map((t) =>
        `"${t.teacherId}","${t.fullName}","${t.email}","${t.phone}","${t.qualification}","${t.salary}","${t.employmentStatus}"`
      );
    } else if (reportType === 'fee_collection') {
      headers = ['Receipt No,Student,Class,Amount,Date,Method'];
      rows = reportData.data.map((p) =>
        `"${p.receiptNo}","${p.studentId?.firstName} ${p.studentId?.lastName}","${p.studentId?.classId?.name || ''}","${p.amountPaid}","${new Date(p.paymentDate).toLocaleDateString()}","${p.paymentMethod}"`
      );
    } else if (reportType === 'pending_payments') {
      headers = ['Student,Class,Month,Total,Paid,Pending,Parent Phone'];
      rows = reportData.data.map((f) =>
        `"${f.studentId?.firstName} ${f.studentId?.lastName}","${f.studentId?.classId?.name || ''}","${f.month}","${f.totalAmount}","${f.paidAmount}","${f.totalAmount - f.paidAmount}","${f.studentId?.parentPhone}"`
      );
    } else {
      headers = ['Application No,Student Name,Class,Parent,Phone,Status'];
      rows = reportData.data.map((a) =>
        `"${a.applicationNo}","${a.studentFirstName} ${a.studentLastName}","${a.appliedClass?.name || ''}","${a.parentName}","${a.parentPhone}","${a.status}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Analytics & Administrative Reports</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate audit-ready records, financial statements, and printable transcripts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 no-print">
        {[
          { id: 'students', label: 'Student Enrolment', icon: Users },
          { id: 'teachers', label: 'Faculty Directory', icon: GraduationCap },
          { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck },
          { id: 'fee_collection', label: 'Fee Collections', icon: DollarSign },
          { id: 'pending_payments', label: 'Pending Dues', icon: AlertCircle },
          { id: 'admissions', label: 'Admission Pipeline', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Printable Report Surface */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Report Official Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                DEMO SCHOOL
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Annual Administrative & Compliance Statement • Academic Session 2026-2027
              </p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider">
                {reportType.replace('_', ' ')} Report
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Summary Strip */}
          {reportData?.summary && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              {Object.entries(reportData.summary).map(([key, val]) => (
                <div key={key}>
                  <span className="text-slate-400 capitalize block text-[11px]">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {typeof val === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('payroll') || key.toLowerCase().includes('collected')
                      ? `₹${val.toLocaleString('en-IN')}`
                      : typeof val === 'number' && key.toLowerCase().includes('rate')
                      ? `${val}%`
                      : val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
                {reportType === 'students' && (
                  <>
                    <th className="py-2.5 px-3">Adm No</th>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Standard</th>
                    <th className="py-2.5 px-3">Guardian Name</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </>
                )}
                {reportType === 'teachers' && (
                  <>
                    <th className="py-2.5 px-3">Faculty ID</th>
                    <th className="py-2.5 px-3">Teacher Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Qualification</th>
                    <th className="py-2.5 px-3 text-right">Monthly Salary (₹)</th>
                  </>
                )}
                {reportType === 'fee_collection' && (
                  <>
                    <th className="py-2.5 px-3">Receipt No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Standard</th>
                    <th className="py-2.5 px-3">Payment Date</th>
                    <th className="py-2.5 px-3">Payment Mode</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid (₹)</th>
                  </>
                )}
                {reportType === 'pending_payments' && (
                  <>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Term / Month</th>
                    <th className="py-2.5 px-3">Total Invoiced (₹)</th>
                    <th className="py-2.5 px-3">Paid (₹)</th>
                    <th className="py-2.5 px-3 text-right">Outstanding (₹)</th>
                  </>
                )}
                {reportType === 'admissions' && (
                  <>
                    <th className="py-2.5 px-3">App No</th>
                    <th className="py-2.5 px-3">Applicant Name</th>
                    <th className="py-2.5 px-3">Applied Standard</th>
                    <th className="py-2.5 px-3">Parent / Guardian</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </>
                )}
                {reportType === 'attendance' && (
                  <>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Standard</th>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3 text-right">Attendance Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Compiling report data...
                  </td>
                </tr>
              ) : reportData?.data?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No records matched the report query.
                  </td>
                </tr>
              ) : (
                reportData?.data?.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {reportType === 'students' && (
                      <>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{row.admissionNo}</td>
                        <td className="py-2 px-3 font-bold">#{row.rollNumber}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="py-2 px-3">{row.classId?.name}</td>
                        <td className="py-2 px-3">{row.parentName}</td>
                        <td className="py-2 px-3">{row.parentPhone}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 uppercase text-[10px]">
                          {row.status}
                        </td>
                      </>
                    )}
                    {reportType === 'teachers' && (
                      <>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{row.teacherId}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{row.fullName}</td>
                        <td className="py-2 px-3 text-slate-600">{row.email}</td>
                        <td className="py-2 px-3">{row.phone}</td>
                        <td className="py-2 px-3">{row.qualification}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800">
                          ₹{row.salary?.toLocaleString('en-IN')}
                        </td>
                      </>
                    )}
                    {reportType === 'fee_collection' && (
                      <>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">{row.receiptNo}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.studentId?.firstName} {row.studentId?.lastName}
                        </td>
                        <td className="py-2 px-3">{row.studentId?.classId?.name}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {new Date(row.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3">{row.paymentMethod}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">
                          ₹{row.amountPaid?.toLocaleString('en-IN')}
                        </td>
                      </>
                    )}
                    {reportType === 'pending_payments' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.studentId?.firstName} {row.studentId?.lastName}
                        </td>
                        <td className="py-2 px-3">{row.studentId?.classId?.name}</td>
                        <td className="py-2 px-3">{row.month}</td>
                        <td className="py-2 px-3 font-medium">₹{row.totalAmount}</td>
                        <td className="py-2 px-3 font-medium text-emerald-600">₹{row.paidAmount}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600">
                          ₹{row.totalAmount - row.paidAmount}
                        </td>
                      </>
                    )}
                    {reportType === 'admissions' && (
                      <>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{row.applicationNo}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.studentFirstName} {row.studentLastName}
                        </td>
                        <td className="py-2 px-3">{row.appliedClass?.name}</td>
                        <td className="py-2 px-3">{row.parentName}</td>
                        <td className="py-2 px-3">{row.parentPhone}</td>
                        <td className="py-2 px-3 text-right font-bold uppercase text-[10px]">
                          {row.status}
                        </td>
                      </>
                    )}
                    {reportType === 'attendance' && (
                      <>
                        <td className="py-2 px-3 font-medium text-slate-600">{row.date}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.studentId?.firstName} {row.studentId?.lastName}
                        </td>
                        <td className="py-2 px-3">{row.classId?.name}</td>
                        <td className="py-2 px-3">{row.sectionId?.name}</td>
                        <td className="py-2 px-3 text-right font-bold uppercase text-[10px]">
                          {row.status}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Sign-off for Print */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p>Certified Official Record</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Demo School • IT & ERP Operations</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 w-36 pb-6 font-mono text-[10px] text-slate-400">
              [Signature]
            </div>
            <p className="text-[11px] font-semibold text-slate-700 mt-1">Principal / Secretary</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
