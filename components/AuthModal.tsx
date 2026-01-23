'use client';

import { useEffect, useRef, useState } from 'react';
import AuthForm from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formKey, setFormKey] = useState(0);
  const prevIsOpenRef = useRef(isOpen);

  // Reset form when modal opens (transition from closed to open)
  // This is an intentional pattern: we need to change the key prop to reset
  // the AuthForm component when the modal opens. The alternative (keeping
  // the form state) would show stale data from the previous session.
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Modal just opened - increment key to reset form
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormKey(k => k + 1);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 text-[#5c6670] hover:text-[#1a1a1a] transition-colors rounded-md hover:bg-[#f0f4f8]"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-8">
          <AuthForm key={formKey} onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
