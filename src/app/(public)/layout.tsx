import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
