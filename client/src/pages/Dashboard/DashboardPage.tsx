import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, DollarSign, ClipboardCheck, UserPlus, GraduationCap, Dumbbell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/Card/StatCard';
import { formatCurrency } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { DashboardStats } from '../../types';

const COLORS = ['#FACC15', '#EAB308', '#EF4444'];

const DashboardPage = () => {
  useSetPageTitle('Dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<{
    monthly_revenue: { month: string; revenue: number }[];
    attendance: { date: string; count: number }[];
    membership_status: { status: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.stats);
        setCharts(data.charts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Members" value={stats?.total_members ?? 0} icon={<Users size={24} />} />
        <StatCard title="Active Members" value={stats?.active_members ?? 0} icon={<UserCheck size={24} />} />
        <StatCard title="Expired Members" value={stats?.expired_members ?? 0} icon={<UserX size={24} />} />
        <StatCard title="Today's Attendance" value={stats?.today_attendance ?? 0} icon={<ClipboardCheck size={24} />} />
        <StatCard title="New This Month" value={stats?.new_members_this_month ?? 0} icon={<UserPlus size={24} />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Daily Revenue" value={formatCurrency(stats?.daily_revenue ?? 0)} icon={<DollarSign size={24} />} />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthly_revenue ?? 0)} icon={<DollarSign size={24} />} />
        <StatCard title="Yearly Revenue" value={formatCurrency(stats?.yearly_revenue ?? 0)} icon={<DollarSign size={24} />} />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.total_revenue ?? 0)} icon={<DollarSign size={24} />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Student Members" value={stats?.student_members ?? 0} icon={<GraduationCap size={24} />} />
        <StatCard title="Regular Members" value={stats?.regular_members ?? 0} icon={<Dumbbell size={24} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-[#111827]">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts?.monthly_revenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `₱${v}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="revenue" fill="#FACC15" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-[#111827]">Membership Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={charts?.membership_status ?? []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(charts?.membership_status ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 font-semibold text-[#111827]">Attendance (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={charts?.attendance ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FACC15" strokeWidth={2} dot={{ fill: '#EAB308' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
