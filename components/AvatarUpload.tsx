'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import ProfileAvatar from './ProfileAvatar';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface AvatarUploadProps {
  email: string;
  name?: string | null;
  currentAvatarUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
}

export default function AvatarUpload({
  email,
  name,
  currentAvatarUrl,
  onUploadComplete,
  onRemove,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing('avatarUploader', {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res?.[0]?.ufsUrl) {
        onUploadComplete(res[0].ufsUrl);
      }
    },
    onUploadError: (err) => {
      setIsUploading(false);
      setError(err.message || 'Upload failed');
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setError(null);
      setIsUploading(true);

      const file = acceptedFiles[0];

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('File too large. Maximum size is 2MB.');
        setIsUploading(false);
        return;
      }

      await startUpload([file]);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Current avatar preview */}
        <ProfileAvatar
          email={email}
          name={name}
          avatarUrl={currentAvatarUrl}
          size="xl"
        />

        {/* Upload zone */}
        <div className="flex-1">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-cyan bg-cyan/5' : 'border-border hover:border-navy-light'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <p className="text-sm text-muted">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-sm text-cyan">Drop image here</p>
            ) : (
              <div>
                <p className="text-sm text-body mb-1">
                  Drop an image here, or click to select
                </p>
                <p className="text-xs text-muted">
                  PNG, JPG, GIF up to 2MB
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}

          {currentAvatarUrl && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-red-500 hover:text-red-700 mt-2"
            >
              Remove custom photo
            </button>
          )}

          <p className="text-xs text-muted mt-2">
            If you don&apos;t upload a photo, we&apos;ll use your{' '}
            <a
              href="https://gravatar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline"
            >
              Gravatar
            </a>{' '}
            or show your initials.
          </p>
        </div>
      </div>
    </div>
  );
}
