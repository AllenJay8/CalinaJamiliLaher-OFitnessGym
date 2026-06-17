import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  className?: string;
}

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled, className = '' }: Props) => {
  const variants = {
    primary: 'bg-[#FACC15] hover:bg-[#EAB308] text-[#111827] font-semibold',
    secondary: 'bg-white hover:bg-gray-50 text-[#111827] border border-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-semibold',
    outline: 'bg-transparent hover:bg-[#FACC15]/10 text-[#111827] border border-[#FACC15]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
