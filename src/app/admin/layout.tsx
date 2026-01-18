import { requireAdmin } from "@/lib/supabase/auth";
import Link from "next/link";
import { LayoutDashboard, Film, Play, Megaphone } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">لوحة التحكم</h2>
        <nav className="space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <LayoutDashboard className="h-5 w-5" />
            الرئيسية
          </Link>
          <Link
            href="/admin/anime"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Film className="h-5 w-5" />
            إدارة الأنمي
          </Link>
          <Link
            href="/admin/ads"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Megaphone className="h-5 w-5" />
            إدارة الإعلانات
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
