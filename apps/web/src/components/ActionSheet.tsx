import { ReactNode, useEffect } from 'react';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function ActionSheet({ isOpen, onClose, title, children }: ActionSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <h3 className="px-4 pb-3 text-lg font-semibold border-b border-gray-200">
            {title}
          </h3>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-4 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
