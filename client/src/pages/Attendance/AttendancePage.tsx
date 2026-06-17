import { useEffect, useState, useCallback } from 'react';
import { LogIn } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/Table/DataTable';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import FloatingLabelInput from '../../components/Input/FloatingLabelInput';
import { formatDate, formatTime, getMemberName, capitalize } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { Attendance, Member, PaginatedResponse } from '../../types';

const AttendancePage = () => {
  useSetPageTitle('Attendance');
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Attendance>>('/attendances', {
        params: { search, date: dateFilter, page },
      });
      setAttendances(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter, page]);

  useEffect(() => { fetchAttendances(); }, [fetchAttendances]);

  useEffect(() => {
    api.get<PaginatedResponse<Member>>('/members', { params: { status: 'active', per_page: 100 } })
      .then(({ data }) => setMembers(data.data));
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/attendances/check-in', { member_id: memberId });
      setShowCheckIn(false);
      setMemberId('');
      fetchAttendances();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setMessage(axiosErr.response?.data?.message ?? 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <Button onClick={() => setShowCheckIn(true)}><LogIn size={16} /> Check In Member</Button>
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'member', label: 'Member', render: (a) => a.member ? getMemberName(a.member) : '-' },
          { key: 'member_code', label: 'Member ID', render: (a) => a.member?.member_code ?? '-' },
          { key: 'date', label: 'Date', render: (a) => formatDate(a.date) },
          { key: 'time_in', label: 'Time In', render: (a) => formatTime(a.time_in) },
          { key: 'status', label: 'Status', render: (a) => capitalize(a.status) },
        ]}
        data={attendances}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search attendance..."
        currentPage={page}
        lastPage={lastPage}
        onPageChange={setPage}
        loading={loading}
      />

      <Modal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} title="Member Check-In">
        {message && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{message}</div>}
        <form onSubmit={handleCheckIn} className="space-y-4">
          <FloatingLabelInput
            label="Select Member"
            name="member_id"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            as="select"
            options={members.map((m) => ({ value: String(m.id), label: `${m.member_code} - ${getMemberName(m)}` }))}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCheckIn(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Checking in...' : 'Check In'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
