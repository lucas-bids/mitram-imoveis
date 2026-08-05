import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // For back link or actions
}

export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      {children}
      <h1 className="text-2xl font-bold text-mitram-dark mt-2">{title}</h1>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
