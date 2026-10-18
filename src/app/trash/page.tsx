"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  Clock,
  AlertTriangle,
  FileText,
  Film,
  FolderArchive,
  Search,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";

interface TrashItem {
  id: string;
  title: string;
  originContainer: string;
  type: "text" | "movie" | "file";
  deletedAt: string;
  daysRemaining: number; // Varsayılan 30 günden geri sayım (Bölüm 12.3)
  contentPreview?: string;
  posterUrl?: string;
}

const INITIAL_TRASH_ITEMS: TrashItem[] = [
  {
    id: "tr1",
    title: "Eski Taslak Şiir Denemesi",
    originContainer: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    deletedAt: "Bugün 13:40",
    daysRemaining: 30,
    contentPreview: "Yarım kalan kelimelerin ardında saklanan sessizlik...",
  },
  {
    id: "tr2",
    title: "Tenet (2020)",
    originContainer: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    deletedAt: "Dün",
    daysRemaining: 29,
    contentPreview: "Christopher Nolan • Bilim Kurgu / Aksiyon • Zamanın tersine akışı",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "tr3",
    title: "Eski Web Sitesi Fikirleri 2025",
    originContainer: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    deletedAt: "6 gün önce",
    daysRemaining: 24,
    contentPreview: "Kullanıcıların dijital arşivlerini yönetebileceği sade bir container tasarımı...",
  },
];

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>(INITIAL_TRASH_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "text" | "movie">("all");
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<TrashItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Geri Yükle
  const handleRestore = (item: TrashItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setToastMessage(`"${item.title}" başarıyla "${item.originContainer}" deposuna geri yüklendi.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Kalıcı Olarak Sil
  const handlePermanentDelete = () => {
    if (!itemToDeletePermanently) return;
    setItems((prev) => prev.filter((i) => i.id !== itemToDeletePermanently.id));
    setToastMessage(`"${itemToDeletePermanently.title}" kalıcı olarak silindi.`);
    setItemToDeletePermanently(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tümünü Kalıcı Sil (Çöp Kutusunu Boşalt)
  const handleEmptyTrash = () => {
    if (items.length === 0) return;
    if (confirm("Çöp kutusundaki tüm içerikler kalıcı olarak silinecektir. Bu işlem geri alınamaz. Onaylıyor musunuz?")) {
      setItems([]);
      setToastMessage("Çöp kutusu tamamen boşaltıldı.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originContainer.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "text") return item.type === "text";
    if (activeFilter === "movie") return item.type === "movie";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* ÜST BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-slate-900">
                Çöp Kutusu
              </h1>
              <p className="text-[11px] text-slate-500">
                {items.length} silinmiş öğe • 30 gün sonra otomatik temizlenir
              </p>
            </div>
          </div>
        </div>

        {/* Tümünü Boşalt Butonu */}
        {items.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            Çöp Kutusunu Boşalt
          </button>
        )}
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Bilgi Kutusu (Section 12.3 Açıklaması) */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Otomatik Silme Kuralı:</span> Silinen içerikler varsayılan olarak 30 gün boyunca burada saklanır. Süre dolduğunda depolama tasarrufu amacıyla kalıcı olarak temizlenir. Dilediğiniz içeriği süresi dolmadan geri yükleyebilirsiniz.
          </div>
        </div>

        {/* Filtre ve Arama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter("text")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Metinler ({items.filter((i) => i.type === "text").length})
            </button>
            <button
              onClick={() => setActiveFilter("movie")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "movie" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Filmler ({items.filter((i) => i.type === "movie").length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Çöp kutusunda ara..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>
        </div>

        {/* Silinmiş Öğeler Listesi */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-800">Çöp kutusu tertemiz</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Şu anda silinmiş veya çöp kutusunda bekleyen herhangi bir içerik bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                      item.type === "text"
                        ? "bg-blue-500"
                        : item.type === "movie"
                        ? "bg-purple-600"
                        : "bg-emerald-500"
                    }`}
                  >
                    {item.type === "text" ? (
                      <FileText className="w-5 h-5" />
                    ) : item.type === "movie" ? (
                      <Film className="w-5 h-5" />
                    ) : (
                      <FolderArchive className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {item.originContainer}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {item.contentPreview}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
                      <span>Silindi: {item.deletedAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        {item.daysRemaining} gün kaldı
                      </span>
                    </div>
                  </div>
                </div>

                {/* Eylemler: Geri Yükle & Kalıcı Sil */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Geri Yükle</span>
                  </button>

                  <button
                    onClick={() => setItemToDeletePermanently(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Kalıcı Olarak Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* KALICI SİLME ONAY MODALI (Bölüm 12.2) */}
      <AnimatePresence>
        {itemToDeletePermanently && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setItemToDeletePermanently(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Kalıcı Olarak Silinsin mi?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  "{itemToDeletePermanently.title}" içeriği tamamen silinecek ve geri alınamayacaktır.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setItemToDeletePermanently(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                >
                  Kalıcı Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST BİLDİRİMİ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
