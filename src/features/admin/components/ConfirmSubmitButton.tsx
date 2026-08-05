"use client";

interface ConfirmSubmitButtonProps {
  confirmMessage: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
}

export default function ConfirmSubmitButton({
  confirmMessage,
  className,
  title,
  children,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      title={title}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
