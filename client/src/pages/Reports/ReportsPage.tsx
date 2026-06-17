import { useState } from 'react';
import { FileDown, FileText, Users, UserCheck, UserX, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { downloadReport } from '../../services/reports';
import Button from '../../components/Button/Button';
import DataTable from '../../components/Table/DataTable';
import StatCard from '../../components/Card/StatCard';
import { formatCurrency, formatDate, getMemberName, capitalize } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { ReportResponse, Payment, Member, Attendance } from '../../types';

const reportTypes = [
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'student_revenue', label: 'Student Revenue Report' },
  { value: 'regular_revenue', label: 'Regular Revenue Report' },
  { value: 'daily_pass', label: 'Daily Pass Report' },
  { value: 'monthly_membership', label: 'Monthly Membership Report' },
  { value: 'yearly_membership', label: 'Yearly Membership Report' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'members', label: 'Member Report' },
  { value: 'membership', label: 'Membership Report' },
];

const ReportsPage = () => {
  useSetPageTitle('Reports');
  const [reportType, setReportType] = useState('members');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ReportResponse>('/reports', { params: { type: reportType, start_date: startDate, end_date: endDate } });
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    setExporting(format);
    try {
      await downloadReport(format, { type: reportType, start_date: startDate, end_date: endDate });
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const isPaymentReport = ['revenue', 'student_revenue', 'regular_revenue', 'daily_pass', 'monthly_membership', 'yearly_membership'].includes(reportType);
  const isAttendanceReport = reportType === 'attendance';
  const isMemberReport = reportType === 'members' || reportType === 'membership';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-[#111827]">Generate Report</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20">
              {reportTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20" />
          </div>
          <div className="flex items-end">
            <Button onClick={generateReport} disabled={loading} className="w-full">
              <FileDown size={16} /> {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </div>

      {report && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">{report.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(report.start_date)} - {formatDate(report.end_date)}</p>
                <p className="mt-2 text-2xl font-bold text-[#EAB308]">
                  {isPaymentReport ? formatCurrency(report.total) : `${report.total} records`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!!exporting}>
                  <FileText size={16} /> {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
                </Button>
                <Button variant="outline" onClick={() => handleExport('docx')} disabled={!!exporting}>
                  <FileDown size={16} /> {exporting === 'docx' ? 'Exporting...' : 'Export DOCX'}
                </Button>
              </div>
            </div>
          </div>

          {report.summary && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Members" value={report.summary.total_members ?? 0} icon={<Users size={22} />} />
                <StatCard title="Active Members" value={report.summary.active_members ?? 0} icon={<UserCheck size={22} />} />
                <StatCard title="Expired Members" value={report.summary.expired_members ?? 0} icon={<UserX size={22} />} />
                <StatCard title="Period Revenue" value={formatCurrency(report.summary.total_revenue ?? 0)} icon={<DollarSign size={22} />} />
              </div>

              {report.summary.plan_breakdown && report.summary.plan_breakdown.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h4 className="mb-4 font-semibold text-[#111827]">Membership Breakdown</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {report.summary.plan_breakdown.map((item) => (
                      <div key={item.plan} className="flex items-center justify-between rounded-lg bg-[#FACC15]/10 px-4 py-3">
                        <span className="text-sm font-medium text-[#111827]">{item.plan}</span>
                        <span className="rounded-full bg-[#FACC15] px-3 py-1 text-xs font-bold text-[#111827]">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {isPaymentReport && (
            <DataTable
              columns={[
                { key: 'reference_number', label: 'Reference #', render: (p: Payment) => p.reference_number },
                { key: 'member', label: 'Member', render: (p: Payment) => p.member ? getMemberName(p.member) : '-' },
                { key: 'plan', label: 'Plan', render: (p: Payment) => p.membership_plan?.name ?? '-' },
                { key: 'amount', label: 'Amount', render: (p: Payment) => formatCurrency(p.amount) },
                { key: 'date', label: 'Date', render: (p: Payment) => formatDate(p.payment_date) },
              ]}
              data={report.data as Payment[]}
            />
          )}

          {isAttendanceReport && (
            <DataTable
              columns={[
                { key: 'member', label: 'Member', render: (a: Attendance) => a.member ? getMemberName(a.member) : '-' },
                { key: 'date', label: 'Date', render: (a: Attendance) => formatDate(a.date) },
                { key: 'time_in', label: 'Time In', render: (a: Attendance) => a.time_in },
                { key: 'status', label: 'Status', render: (a: Attendance) => capitalize(a.status) },
              ]}
              data={report.data as Attendance[]}
            />
          )}

          {isMemberReport && (
            <DataTable
              columns={[
                { key: 'member_code', label: 'Member ID', render: (m: Member) => m.member_code },
                { key: 'name', label: 'Name', render: (m: Member) => getMemberName(m) },
                { key: 'category', label: 'Category', render: (m: Member) => capitalize(m.membership_category) },
                { key: 'plan', label: 'Plan', render: (m: Member) => m.membership_plan?.name ?? '-' },
                { key: 'status', label: 'Status', render: (m: Member) => capitalize(m.membership_status) },
                { key: 'registered', label: 'Registered', render: (m: Member) => formatDate(m.registration_date) },
              ]}
              data={report.data as Member[]}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
