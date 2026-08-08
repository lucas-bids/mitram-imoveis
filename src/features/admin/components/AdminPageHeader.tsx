import { ReactNode } from "react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // For back link or actions
}

export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      {children}
      <Heading as="h1" variant="h3" className="mt-2">{title}</Heading>
      {description && <Text variant="bodySm" className="mt-1">{description}</Text>}
    </div>
  );
}
