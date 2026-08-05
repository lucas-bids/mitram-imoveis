import { ReactNode } from "react";

interface FormSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function FormSection({ id, title, description, children }: FormSectionProps) {
  return (
    <div id={id} className="scroll-mt-24 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-mitram-dark">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
