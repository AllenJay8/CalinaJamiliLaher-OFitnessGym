import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/Table/DataTable';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import FloatingLabelInput from '../../components/Input/FloatingLabelInput';
import { formatCurrency, formatDate, getMemberName, getStatusColor, capitalize } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { Member, MembershipPlan, Payment, PaginatedResponse } from '../../types';

const PaymentsPage = () => {
  useSetPageTitle('Payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    member_id: '', membership_plan_id: '', amount: '', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: '',
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Payment>>('/payments', { params: { search, page } });
      setPayments(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    api.get<PaginatedResponse<Member>>('/members', { params: { per_page: 100 } }).then(({ data }) => setMembers(data.data));
    api.get<MembershipPlan[]>('/membership-plans').then(({ data }) => setPlans(data));
  }, []);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === Number(planId));
    setForm({ ...form, membership_plan_id: planId, amount: plan ? String(plan.price) : '' });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payments', { ...form, amount: Number(form.amount) });
      setShowAdd(false);
      setForm({ member_id: '', membership_plan_id: '', amount: '', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: '' });
      fetchPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Record Payment</Button>
      </div>

      <DataTable
        columns={[
          { key: 'reference_number', label: 'Reference #' },
          { key: 'member', label: 'Member', render: (p) => p.member ? getMemberName(p.member) : '-' },
          { key: 'plan', label: 'Plan', render: (p) => p.membership_plan?.name ?? '-' },
          { key: 'category', label: 'Category', render: (p) => p.membership_plan ? capitalize(p.membership_plan.category) : '-' },
          { key: 'amount', label: 'Amount', render: (p) => formatCurrency(p.amount) },
          { key: 'payment_method', label: 'Method', render: (p) => capitalize(p.payment_method) },
          { key: 'payment_date', label: 'Date', render: (p) => formatDate(p.payment_date) },
          { key: 'payment_status', label: 'Status', render: (p) => (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(p.payment_status)}`}>{capitalize(p.payment_status)}</span>
          )},
        ]}
        data={payments}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search payments..."
        currentPage={page}
        lastPage={lastPage}
        onPageChange={setPage}
        loading={loading}
      />

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Record Payment" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FloatingLabelInput label="Member" name="member_id" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} as="select" options={members.map((m) => ({ value: String(m.id), label: getMemberName(m) }))} required />
            <FloatingLabelInput label="Plan" name="membership_plan_id" value={form.membership_plan_id} onChange={(e) => handlePlanChange(e.target.value)} as="select" options={plans.map((p) => ({ value: String(p.id), label: `${p.name} - ${formatCurrency(p.price)}` }))} required />
            <FloatingLabelInput label="Amount (₱)" name="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <FloatingLabelInput label="Payment Method" name="payment_method" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} as="select" options={[{ value: 'cash', label: 'Cash' }, { value: 'gcash', label: 'GCash' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'card', label: 'Card' }]} required />
            <FloatingLabelInput label="Payment Date" name="payment_date" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
          </div>
          <FloatingLabelInput label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} as="textarea" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Record Payment'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
