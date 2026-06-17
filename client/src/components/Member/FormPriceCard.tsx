interface FormPriceCardProps {
  price: string;
  durationDays: number | null;
}

const FormPriceCard = ({ price, durationDays }: FormPriceCardProps) => (
  <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#FACC15]/40 bg-[#FACC15]/10 p-4 sm:grid-cols-2 md:col-span-2">
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price</p>
      <p className="mt-1 truncate text-lg font-bold text-[#111827]">{price}</p>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</p>
      <p className="mt-1 text-lg font-bold text-[#111827]">
        {durationDays !== null ? `${durationDays} days` : '-'}
      </p>
    </div>
  </div>
);

export default FormPriceCard;
