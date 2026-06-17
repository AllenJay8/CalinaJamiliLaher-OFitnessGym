import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/Button/Button';
import MemberDetailsCard from '../../components/Member/MemberDetailsCard';
import EditMemberModal from '../../components/Member/EditMemberModal';
import { getMemberName } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { Member } from '../../types';

const MemberProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState('');

  useSetPageTitle(member ? getMemberName(member) : 'Member Profile');

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get<Member>(`/members/${id}`);
        setMember(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load member profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return <div className="text-center text-gray-500">{error || 'Member not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/members')}>
        <ArrowLeft size={16} /> Back to Members
      </Button>

      <MemberDetailsCard member={member} onEdit={() => setShowEdit(true)} />

      <EditMemberModal
        isOpen={showEdit}
        member={member}
        onClose={() => setShowEdit(false)}
        onSaved={setMember}
      />
    </div>
  );
};

export default MemberProfilePage;
