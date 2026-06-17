export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '-';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return '-';
  }

  return `₱${numericAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const extractDatePart = (value: string): string => {
  if (value.includes('T')) {
    return value.split('T')[0];
  }

  if (value.includes(' ')) {
    return value.split(' ')[0];
  }

  return value;
};

const parseDateValue = (value: string): Date | null => {
  const trimmed = value.trim();

  if (!trimmed || trimmed === '0000-00-00') {
    return null;
  }

  const datePart = extractDatePart(trimmed);

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const parsed = new Date(`${datePart}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) {
    return '-';
  }

  const parsed = parseDateValue(date);

  if (!parsed) {
    return '-';
  }

  return parsed.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) {
    return '-';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('en-PH');
};

export const formatEmail = (email?: string | null): string => {
  if (!email || email.trim() === '') {
    return '-';
  }

  return email;
};

export const calculateMembershipEndDate = (startDate: string, durationDays: number): string => {
  const datePart = extractDatePart(startDate);
  const start = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(start.getTime())) {
    return startDate;
  }

  start.setDate(start.getDate() + durationDays - 1);

  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatTime = (time: string | null | undefined): string => {
  if (!time) {
    return '-';
  }

  const match = time.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return '-';
  }

  const h = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const getMemberName = (member: { first_name: string; middle_name?: string; last_name: string }): string => {
  return [member.first_name, member.middle_name, member.last_name].filter(Boolean).join(' ');
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'paid':
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'expiring_soon':
    case 'pending':
    case 'late':
      return 'bg-yellow-100 text-yellow-800';
    case 'expired':
    case 'cancelled':
    case 'absent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const capitalize = (str: string): string => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
