import React, { ReactNode } from 'react';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  );
}

export function DialogContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h2>;
}

export function DialogFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-900/50 ${className}`}>{children}</div>;
}
