import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-svh lg:flex">
      <AdminNav admin={admin} />
      <main className="pb-24 lg:flex-1 lg:pb-0">{children}</main>
    </div>
  );
}
