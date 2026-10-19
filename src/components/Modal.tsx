import React, { useLayoutEffect, useRef } from 'react';

interface ModalProps {
  className: string;
  label: string;
  onClose?: () => void;
  children: React.ReactNode;
}

// Native <dialog> + showModal(): focus trap, Esc, inert background and focus restore for free.
export const Modal: React.FC<ModalProps> = ({ className, label, onClose, children }) => {
  const ref = useRef<HTMLDialogElement>(null);

  // Layout effect: cleanup runs before React detaches the node, so close() can restore focus.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(e) => {
        // React state owns visibility; Esc asks the owner to close (or is ignored when there's no close action).
        e.preventDefault();
        onClose?.();
      }}
      className={`m-0 max-w-none max-h-none w-full h-full border-0 backdrop:bg-transparent ${className}`}
    >
      {children}
    </dialog>
  );
};
