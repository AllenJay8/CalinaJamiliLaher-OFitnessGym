import { useEffect, useMemo, useState } from 'react';
import api, { getStorageUrl } from '../../services/api';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import FloatingLabelInput from '../Input/FloatingLabelInput';
import FormPriceCard from './FormPriceCard';
import ProfilePictureUpload, { validateProfilePicture } from './ProfilePictureUpload';
import { calculateMembershipEndDate, formatCurrency } from '../../utils/format';
import type { Member, MembershipPlan } from '../../types';

export interface EditMemberForm {
  gender: string;
  contact_number: string;
  email: string;
  address: string;
  membership_category: 'student' | 'regular';
  membership_plan_id: string;
  membership_start_date: string;
  membership_end_date: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  member: Member;
  onClose: () => void;
  onSaved: (member: Member) => void;
}

const EditMemberModal = ({ isOpen, member, onClose, onSaved }: EditMemberModalProps) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [form, setForm] = useState<EditMemberForm>({
    gender: member.gender,
    contact_number: member.contact_number,
    email: member.email ?? '',
    address: member.address ?? '',
    membership_category: member.membership_category,
    membership_plan_id: String(member.membership_plan_id),
    membership_start_date: member.membership_start_date,
    membership_end_date: member.membership_end_date,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [endDateTouched, setEndDateTouched] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const currentPhotoUrl = member.profile_picture_url ?? getStorageUrl(member.profile_picture) ?? null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm({
      gender: member.gender,
      contact_number: member.contact_number,
      email: member.email ?? '',
      address: member.address ?? '',
      membership_category: member.membership_category,
      membership_plan_id: String(member.membership_plan_id),
      membership_start_date: member.membership_start_date,
      membership_end_date: member.membership_end_date,
    });
    setErrors({});
    setEndDateTouched(false);
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setRemovePhoto(false);
  }, [isOpen, member]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    api.get<MembershipPlan[]>('/membership-plans', { params: { active_only: true } })
      .then(({ data }) => setPlans(data))
      .catch(console.error);
  }, [isOpen]);

  const filteredPlans = useMemo(
    () => plans.filter((plan) => plan.category === form.membership_category),
    [plans, form.membership_category],
  );

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === Number(form.membership_plan_id)),
    [plans, form.membership_plan_id],
  );

  const autoEndDate = useMemo(() => {
    if (!selectedPlan || !form.membership_start_date) {
      return form.membership_end_date;
    }

    return calculateMembershipEndDate(form.membership_start_date, selectedPlan.duration_days);
  }, [selectedPlan, form.membership_start_date, form.membership_end_date]);

  const displayedEndDate = endDateTouched ? form.membership_end_date : autoEndDate;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'membership_category') {
        next.membership_plan_id = '';
        setEndDateTouched(false);
      }

      if (name === 'membership_plan_id' || name === 'membership_start_date') {
        setEndDateTouched(false);
      }

      if (name === 'membership_end_date') {
        setEndDateTouched(true);
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateProfilePicture(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, profile_picture: validationError }));
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
    setErrors((prev) => ({ ...prev, profile_picture: '' }));
  };

  const handlePhotoRemove = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    setErrors((prev) => ({ ...prev, profile_picture: '' }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!form.contact_number.trim()) {
      nextErrors.contact_number = 'Contact number is required.';
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address or leave blank.';
    }

    if (!form.membership_plan_id) {
      nextErrors.membership_plan_id = 'Please select a membership plan.';
    }

    if (!form.membership_start_date) {
      nextErrors.membership_start_date = 'Start date is required.';
    }

    if (!displayedEndDate) {
      nextErrors.membership_end_date = 'End date is required.';
    } else if (form.membership_start_date && displayedEndDate < form.membership_start_date) {
      nextErrors.membership_end_date = 'End date cannot be before start date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        gender: form.gender,
        contact_number: form.contact_number.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        membership_category: form.membership_category,
        membership_plan_id: Number(form.membership_plan_id),
        membership_start_date: form.membership_start_date,
        membership_end_date: displayedEndDate,
      };

      let updatedMember: Member;

      if (photoFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        formData.append('profile_picture', photoFile);
        formData.append('_method', 'PUT');

        const { data } = await api.post<Member>(`/members/${member.id}`, formData);
        updatedMember = data;
      } else {
        const { data } = await api.put<Member>(`/members/${member.id}`, payload);
        updatedMember = data;

        if (removePhoto && currentPhotoUrl) {
          const { data: removedData } = await api.delete<Member>(`/members/${member.id}/photo`);
          updatedMember = removedData;
        }
      }

      onSaved(updatedMember);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const serverErrors = axiosErr.response?.data?.errors;

      if (serverErrors) {
        const mapped: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, value]) => {
          mapped[key] = value[0];
        });
        setErrors(mapped);
      } else {
        setErrors({ form: axiosErr.response?.data?.message ?? 'Unable to save member profile.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Member Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>}

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Member ID</p>
          <p className="mt-1 truncate text-sm font-semibold text-[#111827]">{member.member_code}</p>
        </div>

        <ProfilePictureUpload
          currentPhotoUrl={currentPhotoUrl}
          preview={photoPreview}
          removed={removePhoto}
          error={errors.profile_picture}
          onChange={handlePhotoChange}
          onRemove={currentPhotoUrl || photoPreview ? handlePhotoRemove : undefined}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <FloatingLabelInput
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            as="select"
            required
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <FloatingLabelInput
            label="Contact Number"
            name="contact_number"
            value={form.contact_number}
            onChange={handleChange}
            required
            error={errors.contact_number}
          />
          <FloatingLabelInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <FloatingLabelInput
            label="Category"
            name="membership_category"
            value={form.membership_category}
            onChange={handleChange}
            as="select"
            required
            options={[
              { value: 'student', label: 'Student' },
              { value: 'regular', label: 'Regular' },
            ]}
          />
          <FloatingLabelInput
            label="Plan"
            name="membership_plan_id"
            value={form.membership_plan_id}
            onChange={handleChange}
            as="select"
            required
            error={errors.membership_plan_id}
            options={filteredPlans.map((plan) => ({ value: String(plan.id), label: plan.name }))}
          />
          <FloatingLabelInput
            label="Start Date"
            name="membership_start_date"
            type="date"
            value={form.membership_start_date}
            onChange={handleChange}
            required
            error={errors.membership_start_date}
          />
          <FloatingLabelInput
            label="End Date"
            name="membership_end_date"
            type="date"
            value={displayedEndDate}
            onChange={handleChange}
            required
            error={errors.membership_end_date}
          />

          {selectedPlan && (
            <FormPriceCard
              price={formatCurrency(selectedPlan.price)}
              durationDays={selectedPlan.duration_days}
            />
          )}

          <div className="md:col-span-2">
            <FloatingLabelInput
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              as="textarea"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMemberModal;
