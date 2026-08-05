import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link href={href} className="text-gray-500 hover:text-mitram-dark inline-flex items-center gap-1 text-sm font-medium">
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
