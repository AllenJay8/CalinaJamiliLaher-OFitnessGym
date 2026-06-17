export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
}

export interface MembershipPlan {
  id: number;
  name: string;
  category: 'student' | 'regular';
  type: 'daily' | 'monthly' | 'yearly';
  price: number;
  duration_days: number;
  description?: string;
  is_active: boolean;
}

export interface Member {
  id: number;
  member_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  contact_number: string;
  address?: string;
  email?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  membership_category: 'student' | 'regular';
  membership_plan_id: number;
  membership_status: 'active' | 'expiring_soon' | 'expired';
  membership_start_date: string;
  membership_end_date: string;
  registration_date: string;
  membership_plan?: MembershipPlan;
  full_name?: string;
  membership_price?: number | null;
  formatted_price?: string | null;
}

export interface Membership {
  id: number;
  member_id: number;
  membership_plan_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expiring_soon' | 'expired';
  member?: Member;
  membership_plan?: MembershipPlan;
}

export interface Attendance {
  id: number;
  member_id: number;
  date: string;
  time_in: string;
  status: 'present' | 'late' | 'absent';
  member?: Member;
}

export interface Payment {
  id: number;
  reference_number: string;
  member_id: number;
  membership_plan_id: number;
  amount: number;
  payment_method: 'cash' | 'gcash' | 'bank_transfer' | 'card' | 'other';
  payment_date: string;
  payment_status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  member?: Member;
  membership_plan?: MembershipPlan;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  member_id?: number;
  is_read: boolean;
  created_at: string;
  member?: Member;
}

export interface WebhookLog {
  id: number;
  event: string;
  payload: Record<string, unknown>;
  url: string;
  status_code?: number;
  response_body?: string;
  success: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_members: number;
  active_members: number;
  expired_members: number;
  expiring_soon: number;
  student_members: number;
  regular_members: number;
  today_attendance: number;
  new_members_this_month: number;
  daily_revenue: number;
  monthly_revenue: number;
  yearly_revenue: number;
  total_revenue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ReportSummary {
  total_members?: number;
  active_members?: number;
  expired_members?: number;
  expiring_soon?: number;
  total_revenue?: number;
  membership_breakdown?: Record<string, number>;
  plan_breakdown?: { plan: string; count: number }[];
  record_count?: number;
  daily_summary?: { date: string; count: number }[];
}

export interface ReportResponse {
  type: string;
  title: string;
  start_date: string;
  end_date: string;
  total: number;
  currency?: string;
  data: unknown[];
  summary?: ReportSummary;
}
