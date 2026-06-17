import { useRef } from 'react';
import { ImageIcon } from 'lucide-react';
import Button from '../Button/Button';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const validateProfilePicture = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Only JPG, JPEG, and PNG files are allowed.';
  }
  return null;
};

interface ProfilePictureUploadProps {
  currentPhotoUrl?: string | null;
  preview?: string | null;
  removed?: boolean;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
}

const ProfilePictureUpload = ({
  currentPhotoUrl,
  preview,
  removed = false,
  error,
  onChange,
  onRemove,
}: ProfilePictureUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasExistingPhoto = Boolean(currentPhotoUrl) && !removed;
  const displaySrc = preview ?? (hasExistingPhoto ? currentPhotoUrl : null);
  const showRemove = Boolean(onRemove) && (hasExistingPhoto || preview);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
      <p className="mb-3 text-sm font-medium text-[#111827]">Profile Picture</p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#FACC15] bg-white">
          {displaySrc ? (
            <img src={displaySrc} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 px-2 text-gray-400">
              <ImageIcon size={28} strokeWidth={1.5} />
              <span className="text-center text-xs leading-tight">No photo</span>
            </div>
          )}
        </div>

        <div className="min-w-0 w-full flex-1 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {hasExistingPhoto || preview ? 'Current Photo' : 'Photo'}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleInputChange}
            className="sr-only"
            aria-label="Upload profile picture"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={openFilePicker}>
              {hasExistingPhoto || preview ? 'Change Photo' : 'Upload'}
            </Button>

            {showRemove && (
              <Button type="button" variant="secondary" onClick={onRemove}>
                Remove Photo
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">Accepted formats: JPG, JPEG, PNG</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
