import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      <h3 className="text-lg md:text-xl font-medium text-mitram-dark mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  );
}
