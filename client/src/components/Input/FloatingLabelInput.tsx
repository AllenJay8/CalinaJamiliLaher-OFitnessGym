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
  className?: string;
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
  className = '',
}: Props) => {
  const isSelect = as === 'select';
  const isTextarea = as === 'textarea';
  const isDate = type === 'date';
  const alwaysFloatLabel = isSelect || isTextarea || isDate;

  const fieldClass = [
    'peer w-full min-w-0 rounded-lg border bg-white px-4 text-sm text-[#111827] outline-none transition-colors',
    'focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20',
    alwaysFloatLabel ? 'pt-6 pb-2' : 'pt-6 pb-2 placeholder-transparent',
    isSelect ? 'appearance-none truncate pr-10' : '',
    error ? 'border-red-500' : 'border-gray-300',
  ].join(' ');

  const labelClass = [
    'pointer-events-none absolute left-4 text-xs font-medium text-gray-500 transition-all',
    alwaysFloatLabel
      ? 'top-2'
      : 'top-4 text-sm peer-focus:top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
  ].join(' ');

  return (
    <div className={`relative min-w-0 w-full ${className}`}>
      {isSelect ? (
        <>
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={fieldClass}
          >
            <option value="">Select...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
        </>
      ) : isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          className={`${fieldClass} resize-y`}
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
          className={fieldClass}
          placeholder=" "
        />
      )}

      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {error && <p className="mt-1 truncate text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingLabelInput;
