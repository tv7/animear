"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AD_TYPES, AD_POSITIONS } from "@/lib/constants";
import { Trash2, Edit, Plus } from "lucide-react";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "banner",
    position: "header_top",
    content: "",
    active: true,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/ads");
      const data = await response.json();
      if (data.data) {
        setAds(data.data);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAd
        ? `/api/ads/${editingAd.id}`
        : "/api/ads";
      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingAd(null);
        setFormData({
          type: "banner",
          position: "header_top",
          content: "",
          active: true,
          start_date: "",
          end_date: "",
        });
        fetchAds();
      }
    } catch (error) {
      console.error("Error saving ad:", error);
    }
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      type: ad.type,
      position: ad.position,
      content: ad.content,
      active: ad.active,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

    try {
      await fetch(`/api/ads/${id}`, { method: "DELETE" });
      fetchAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الإعلانات</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 ml-2" />
          إعلان جديد
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">النوع</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value={AD_TYPES.BANNER}>بانر</option>
              <option value={AD_TYPES.SIDEBAR}>شريط جانبي</option>
              <option value={AD_TYPES.BLOCK}>كتلة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الموضع</label>
            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value={AD_POSITIONS.HEADER_TOP}>أعلى الهيدر</option>
              <option value={AD_POSITIONS.HEADER_BOTTOM}>أسفل الهيدر</option>
              <option value={AD_POSITIONS.SIDEBAR_TOP}>أعلى الشريط الجانبي</option>
              <option value={AD_POSITIONS.SIDEBAR_BOTTOM}>أسفل الشريط الجانبي</option>
              <option value={AD_POSITIONS.CONTENT_TOP}>أعلى المحتوى</option>
              <option value={AD_POSITIONS.CONTENT_BOTTOM}>أسفل المحتوى</option>
              <option value={AD_POSITIONS.BETWEEN_CONTENT}>بين المحتوى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المحتوى (HTML)</label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              rows={6}
              required
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">تاريخ البدء</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تاريخ الانتهاء</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
            />
            <label htmlFor="active">نشط</label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editingAd ? "تحديث" : "إنشاء"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingAd(null);
                setFormData({
                  type: "banner",
                  position: "header_top",
                  content: "",
                  active: true,
                  start_date: "",
                  end_date: "",
                });
              }}
            >
              إلغاء
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{ad.type}</span>
                <span className="text-gray-500">-</span>
                <span>{ad.position}</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    ad.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ad.active ? "نشط" : "غير نشط"}
                </span>
              </div>
              <div
                className="text-sm text-gray-600 dark:text-gray-400"
                dangerouslySetInnerHTML={{ __html: ad.content }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(ad)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(ad.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {ads.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            لا توجد إعلانات
          </p>
        )}
      </div>
    </div>
  );
}
