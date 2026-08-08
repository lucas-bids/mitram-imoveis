import { ReactNode } from "react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

interface FormSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function FormSection({ id, title, description, children }: FormSectionProps) {
  return (
    <div id={id} className="scroll-mt-24 bg-white p-6 rounded-xl">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <Heading as="h2" variant="h4">{title}</Heading>
        <Text variant="bodySm">{description}</Text>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
