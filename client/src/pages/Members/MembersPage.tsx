import { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/Table/DataTable';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import FloatingLabelInput from '../../components/Input/FloatingLabelInput';
import MemberAvatar from '../../components/Member/MemberAvatar';
import FormPriceCard from '../../components/Member/FormPriceCard';
import ProfilePictureUpload, { validateProfilePicture } from '../../components/Member/ProfilePictureUpload';
import { formatCurrency, formatDate, getMemberName, getStatusColor, capitalize } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { Member, MembershipPlan, PaginatedResponse } from '../../types';

const MembersPage = () => {
  useSetPageTitle('Members');
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<Member | null>(null);
  const [showRenew, setShowRenew] = useState<Member | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '', gender: 'male',
    birth_date: '', contact_number: '', address: '', email: '',
    membership_category: 'student', membership_plan_id: '', payment_method: 'cash',
    profile_picture: null as File | null,
  });

  const [renewForm, setRenewForm] = useState({ membership_plan_id: '', payment_method: 'cash' });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Member>>('/members', {
        params: { search, status: statusFilter, category: categoryFilter, page, sort_by: sortBy, sort_dir: sortDir },
      });
      setMembers(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page, sortBy, sortDir]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    api.get<MembershipPlan[]>('/membership-plans', { params: { active_only: true } })
      .then(({ data }) => setPlans(data));
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const filteredPlans = plans.filter((p) => p.category === form.membership_category);
  const renewPlans = plans.filter((p) => p.category === showRenew?.membership_category);

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'membership_category') setForm((prev) => ({ ...prev, membership_plan_id: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateProfilePicture(file);
    if (validationError) {
      setFormErrors((prev) => ({ ...prev, profile_picture: validationError }));
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, profile_picture: file }));
    setFormErrors((prev) => ({ ...prev, profile_picture: '' }));
  };

  const resetForm = () => {
    setForm({ first_name: '', middle_name: '', last_name: '', gender: 'male', birth_date: '', contact_number: '', address: '', email: '', membership_category: 'student', membership_plan_id: '', payment_method: 'cash', profile_picture: null });
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v as string | Blob);
      });
      await api.post('/members', fd);
      setShowAdd(false);
      resetForm();
      fetchMembers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const errors = axiosErr.response?.data?.errors;
      if (errors) {
        const mapped: Record<string, string> = {};
        Object.entries(errors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setFormErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    await api.delete(`/members/${showDelete.id}`);
    setShowDelete(null);
    fetchMembers();
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenew) return;
    setSubmitting(true);
    try {
      await api.post(`/memberships/${showRenew.id}/renew`, renewForm);
      setShowRenew(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === Number(form.membership_plan_id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Categories</option>
            <option value="student">Student</option>
            <option value="regular">Regular</option>
          </select>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add Member</Button>
      </div>

      <DataTable
        columns={[
          { key: 'photo', label: 'Photo', render: (m) => (
            <MemberAvatar src={m.profile_picture_url ?? m.profile_picture} name={getMemberName(m)} size="sm" />
          )},
          { key: 'member_code', label: 'Member ID', sortable: true },
          { key: 'name', label: 'Name', render: (m) => getMemberName(m) },
          { key: 'membership_category', label: 'Category', render: (m) => capitalize(m.membership_category) },
          { key: 'plan', label: 'Plan', render: (m) => m.membership_plan?.name ?? '-' },
          { key: 'membership_status', label: 'Status', render: (m) => (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(m.membership_status)}`}>
              {capitalize(m.membership_status)}
            </span>
          )},
          { key: 'membership_end_date', label: 'Expires', render: (m) => formatDate(m.membership_end_date) },
        ]}
        data={members}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search members..."
        currentPage={page}
        lastPage={lastPage}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        loading={loading}
        actions={(m) => (
          <div className="flex gap-1">
            <button onClick={() => navigate(`/members/${m.id}`)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50"><Eye size={16} /></button>
            <button onClick={() => setShowRenew(m)} className="rounded p-1.5 text-green-600 hover:bg-green-50"><RefreshCw size={16} /></button>
            <button onClick={() => setShowDelete(m)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
          </div>
        )}
      />

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); resetForm(); }} title="Add Member" size="lg">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <FloatingLabelInput label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={formErrors.first_name} required />
            <FloatingLabelInput label="Middle Name" name="middle_name" value={form.middle_name} onChange={handleChange} />
            <FloatingLabelInput label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={formErrors.last_name} required />
            <FloatingLabelInput label="Gender" name="gender" value={form.gender} onChange={handleChange} as="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} required />
            <FloatingLabelInput label="Birth Date" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} error={formErrors.birth_date} required />
            <FloatingLabelInput label="Contact Number" name="contact_number" value={form.contact_number} onChange={handleChange} error={formErrors.contact_number} required />
            <FloatingLabelInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={formErrors.email} />
            <FloatingLabelInput label="Category" name="membership_category" value={form.membership_category} onChange={handleChange} as="select" options={[{ value: 'student', label: 'Student' }, { value: 'regular', label: 'Regular' }]} required />
            <FloatingLabelInput label="Plan" name="membership_plan_id" value={form.membership_plan_id} onChange={handleChange} as="select" options={filteredPlans.map((p) => ({ value: String(p.id), label: p.name }))} error={formErrors.membership_plan_id} required />
            <FloatingLabelInput label="Payment Method" name="payment_method" value={form.payment_method} onChange={handleChange} as="select" options={[{ value: 'cash', label: 'Cash' }, { value: 'gcash', label: 'GCash' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'card', label: 'Card' }]} required />

            {selectedPlan && (
              <FormPriceCard price={formatCurrency(selectedPlan.price)} durationDays={selectedPlan.duration_days} />
            )}

            <ProfilePictureUpload preview={photoPreview} error={formErrors.profile_picture} onChange={handleFileChange} />

            <div className="md:col-span-2">
              <FloatingLabelInput label="Address" name="address" value={form.address} onChange={handleChange} as="textarea" error={formErrors.address} />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={() => { setShowAdd(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Member'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Member">
        <p className="text-gray-600">Are you sure you want to delete <strong>{showDelete && getMemberName(showDelete)}</strong>?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Modal isOpen={!!showRenew} onClose={() => setShowRenew(null)} title="Renew Membership">
        <form onSubmit={handleRenew} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <FloatingLabelInput label="Plan" name="membership_plan_id" value={renewForm.membership_plan_id} onChange={(e) => setRenewForm({ ...renewForm, membership_plan_id: e.target.value })} as="select" options={renewPlans.map((p) => ({ value: String(p.id), label: p.name }))} required />
            <FloatingLabelInput label="Payment Method" name="payment_method" value={renewForm.payment_method} onChange={(e) => setRenewForm({ ...renewForm, payment_method: e.target.value })} as="select" options={[{ value: 'cash', label: 'Cash' }, { value: 'gcash', label: 'GCash' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'card', label: 'Card' }]} required />
            {(() => {
              const renewPlan = renewPlans.find((p) => p.id === Number(renewForm.membership_plan_id));
              return renewPlan ? (
                <FormPriceCard price={formatCurrency(renewPlan.price)} durationDays={renewPlan.duration_days} />
              ) : null;
            })()}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowRenew(null)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Renewing...' : 'Renew'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembersPage;
