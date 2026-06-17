export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
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
