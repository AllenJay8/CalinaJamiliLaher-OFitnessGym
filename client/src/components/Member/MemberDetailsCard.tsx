import { Pencil } from 'lucide-react';
import Button from '../Button/Button';
import MemberAvatar from './MemberAvatar';
import { capitalize, formatCurrency, formatDate, formatEmail, getMemberName, getStatusColor } from '../../utils/format';
import type { Member } from '../../types';

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-[#FACC15]/20 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-[#111827]">{value}</p>
  </div>
);

interface MemberDetailsCardProps {
  member: Member;
  onEdit: () => void;
}

const MemberDetailsCard = ({ member, onEdit }: MemberDetailsCardProps) => {
  const photoUrl = member.profile_picture_url ?? member.profile_picture;
  const price = member.formatted_price ?? (member.membership_plan ? formatCurrency(member.membership_plan.price) : '-');

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-[#FACC15]/30 bg-[#FACC15]/10 px-6 py-5">
        <div className="flex flex-wrap items-start gap-6">
          <MemberAvatar src={photoUrl} name={getMemberName(member)} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">{getMemberName(member)}</h2>
                <p className="mt-1 text-sm text-gray-600">Member ID: {member.member_code}</p>
              </div>
              <Button variant="outline" onClick={onEdit}>
                <Pencil size={16} /> Edit Profile
              </Button>
            </div>
            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(member.membership_status)}`}>
              {capitalize(member.membership_status)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Gender" value={capitalize(member.gender)} />
        <InfoItem label="Birth Date" value={formatDate(member.birth_date)} />
        <InfoItem label="Contact" value={member.contact_number} />
        <InfoItem label="Email" value={formatEmail(member.email)} />
        <InfoItem label="Address" value={member.address?.trim() ? member.address : '-'} />
        <InfoItem label="Category" value={capitalize(member.membership_category)} />
        <InfoItem label="Plan" value={member.membership_plan?.name ?? '-'} />
        <InfoItem label="Price" value={price} />
        <InfoItem label="Start Date" value={formatDate(member.membership_start_date)} />
        <InfoItem label="End Date" value={formatDate(member.membership_end_date)} />
        <InfoItem label="Registered" value={formatDate(member.registration_date)} />
      </div>
    </div>
  );
};

export default MemberDetailsCard;
