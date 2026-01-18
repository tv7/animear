import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [
    { count: animeCount },
    { count: episodesCount },
    { count: usersCount },
    { count: adsCount },
  ] = await Promise.all([
    supabase.from("anime").select("*", { count: "exact", head: true }),
    supabase.from("episodes").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("ads").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-gray-500 text-sm mb-2">عدد الأنمي</h3>
          <p className="text-3xl font-bold">{animeCount || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-gray-500 text-sm mb-2">عدد الحلقات</h3>
          <p className="text-3xl font-bold">{episodesCount || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-gray-500 text-sm mb-2">عدد المستخدمين</h3>
          <p className="text-3xl font-bold">{usersCount || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-gray-500 text-sm mb-2">عدد الإعلانات</h3>
          <p className="text-3xl font-bold">{adsCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
