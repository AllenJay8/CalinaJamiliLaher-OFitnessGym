import { getStorageUrl } from '../../services/api';

interface Props {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-24 w-24 text-2xl',
};

const MemberAvatar = ({ src, name, size = 'md' }: Props) => {
  const url = src?.startsWith('http') ? src : getStorageUrl(src ?? undefined);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ring-2 ring-[#FACC15]/30`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-[#FACC15]/20 font-bold text-[#EAB308] ring-2 ring-[#FACC15]/30`}>
      {initial}
    </div>
  );
};

export default MemberAvatar;
