import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, capitalize } from '../../utils/format';
import { useSetPageTitle } from '../../hooks/useSetPageTitle';
import type { MembershipPlan } from '../../types';

const MembershipPlansPage = () => {
  useSetPageTitle('Membership Plans');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<MembershipPlan[]>('/membership-plans')
      .then(({ data }) => setPlans(data))
      .finally(() => setLoading(false));
  }, []);

  const studentPlans = plans.filter((p) => p.category === 'student');
  const regularPlans = plans.filter((p) => p.category === 'regular');

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  const PlanCard = ({ plan }: { plan: MembershipPlan }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.category === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
            {capitalize(plan.category)}
          </span>
          <h3 className="mt-2 font-semibold text-[#111827]">{plan.name}</h3>
          <p className="mt-1 text-2xl font-bold text-[#EAB308]">{formatCurrency(plan.price)}</p>
        </div>
        <span className="rounded-lg bg-[#FACC15]/20 px-2 py-1 text-xs font-medium text-[#111827]">
          {capitalize(plan.type)}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{plan.duration_days} day{plan.duration_days > 1 ? 's' : ''}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {plan.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Student Plans</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studentPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Regular Plans</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regularPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      </div>
    </div>
  );
};

export default MembershipPlansPage;
