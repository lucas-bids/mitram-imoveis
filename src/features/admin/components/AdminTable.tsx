import { ReactNode } from "react";

import { cardClasses } from "@/components/ui/cardStyles";

interface AdminTableProps {
  headers: ReactNode[];
  children: ReactNode;
}

export function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <div className={cardClasses("bg-white rounded-lg overflow-hidden")}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className={`px-6 py-3 text-sm font-semibold text-gray-600 ${i === headers.length - 1 ? 'text-right' : ''}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
