import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import FloatingLabelInput from '../../components/Input/FloatingLabelInput';
import MemberAvatar from '../../components/Member/MemberAvatar';
import { formatCurrency, formatDate, getMemberName, getStatusColor, capitalize } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { Member } from '../../types';

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-gray-50 p-3">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-[#111827]">{value}</p>
  </div>
);

const MemberProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ first_name: '', middle_name: '', last_name: '', gender: 'male', birth_date: '', contact_number: '', address: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useSetPageTitle(member ? getMemberName(member) : 'Member Profile');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data } = await api.get<Member>(`/members/${id}`);
        setMember(data);
        setForm({
          first_name: data.first_name, middle_name: data.middle_name ?? '', last_name: data.last_name,
          gender: data.gender, birth_date: data.birth_date, contact_number: data.contact_number,
          address: data.address ?? '', email: data.email ?? '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.put(`/members/${id}`, form);
      setMember(data);
      setShowEdit(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" /></div>;
  if (!member) return <div className="text-center text-gray-500">Member not found</div>;

  const photoUrl = member.profile_picture_url ?? member.profile_picture;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/members')}><ArrowLeft size={16} /> Back</Button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-6">
          <MemberAvatar src={photoUrl} name={getMemberName(member)} size="lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">{getMemberName(member)}</h2>
                <p className="text-gray-500">{member.member_code}</p>
              </div>
              <Button variant="outline" onClick={() => setShowEdit(true)}><Pencil size={16} /> Edit</Button>
            </div>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(member.membership_status)}`}>
              {capitalize(member.membership_status)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Gender" value={capitalize(member.gender)} />
          <InfoItem label="Birth Date" value={formatDate(member.birth_date)} />
          <InfoItem label="Contact" value={member.contact_number} />
          <InfoItem label="Email" value={member.email ?? '-'} />
          <InfoItem label="Address" value={member.address ?? '-'} />
          <InfoItem label="Category" value={capitalize(member.membership_category)} />
          <InfoItem label="Plan" value={member.membership_plan?.name ?? '-'} />
          <InfoItem label="Price" value={member.membership_plan ? formatCurrency(member.membership_plan.price) : '-'} />
          <InfoItem label="Start Date" value={formatDate(member.membership_start_date)} />
          <InfoItem label="End Date" value={formatDate(member.membership_end_date)} />
          <InfoItem label="Registered" value={formatDate(member.registration_date)} />
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Member" size="lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FloatingLabelInput label="First Name" name="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <FloatingLabelInput label="Middle Name" name="middle_name" value={form.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} />
            <FloatingLabelInput label="Last Name" name="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            <FloatingLabelInput label="Gender" name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} as="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
            <FloatingLabelInput label="Birth Date" name="birth_date" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            <FloatingLabelInput label="Contact Number" name="contact_number" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
            <FloatingLabelInput label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <FloatingLabelInput label="Address" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} as="textarea" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MemberProfilePage;
