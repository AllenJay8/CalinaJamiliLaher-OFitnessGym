import { type ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, subtitle }: Props) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[#111827]">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FACC15]/20 text-[#EAB308]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
