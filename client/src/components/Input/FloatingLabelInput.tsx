interface Props {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  as?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  rows?: number;
  accept?: string;
}

const FloatingLabelInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required,
  as = 'input',
  options,
  rows = 3,
  accept,
}: Props) => {
  const baseClass = `peer w-full rounded-lg border bg-white px-4 pt-6 pb-2 text-[#111827] outline-none transition-colors focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <div className="relative">
      {as === 'select' ? (
        <select id={name} name={name} value={value} onChange={onChange} required={required} className={baseClass}>
          <option value="">Select...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          className={baseClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          accept={accept}
          className={baseClass}
          placeholder=" "
        />
      )}
      <label
        htmlFor={name}
        className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
