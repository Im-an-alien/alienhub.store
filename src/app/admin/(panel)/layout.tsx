import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "./_components/sidebar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-space">
      <AdminSidebar adminName={session.name} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
