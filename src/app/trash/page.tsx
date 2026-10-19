"use client";

import React, { useState, useEffect } from "react";
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
  Layers,
  Code2,
  Compass,
  GraduationCap,
  Music,
  Image as ImageIcon,
} from "lucide-react";
import {
  getTrashItems,
  restoreFromTrash,
  permanentDeleteFromTrash,
  emptyTrash,
  TrashItem,
} from "@/lib/appStore";

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "container" | "text" | "movie" | "code" | "travel" | "study" | "audio" | "image" | "file"
  >("all");
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<TrashItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Merkezi depodan canlı yükleme ve olay dinleyici
  useEffect(() => {
    setItems(getTrashItems());

    const handleUpdate = () => {
      setItems(getTrashItems());
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

  // Geri Yükle
  const handleRestore = (item: TrashItem) => {
    restoreFromTrash(item.id);
    setToastMessage(`"${item.title}" başarıyla "${item.originContainer}" konumuna geri yüklendi.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Kalıcı Olarak Sil
  const handlePermanentDelete = () => {
    if (!itemToDeletePermanently) return;
    permanentDeleteFromTrash(itemToDeletePermanently.id);
    setToastMessage(`"${itemToDeletePermanently.title}" kalıcı olarak silindi.`);
    setItemToDeletePermanently(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tümünü Kalıcı Sil (Çöp Kutusunu Boşalt)
  const handleEmptyTrash = () => {
    if (items.length === 0) return;
    if (confirm("Çöp kutusundaki tüm içerikler kalıcı olarak silinecektir. Bu işlem geri alınamaz. Onaylıyor musunuz?")) {
      emptyTrash();
      setToastMessage("Çöp kutusu tamamen boşaltıldı.");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originContainer.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
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
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-900">
                  Çöp Kutusu
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {items.length} Öğe
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Silinen depolar ve içerikler 30 gün boyunca burada saklanır
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
            <span className="font-bold">Otomatik Silme Kuralı:</span> Silinen içerikler ve depolar varsayılan olarak 30 gün boyunca burada saklanır. Bir içerik silindiğinde ona ait dış paylaşımlar otomatik olarak sonlandırılır. Dilediğiniz içeriği süresi dolmadan geri yükleyebilirsiniz.
          </div>
        </div>

        {/* Filtre ve Arama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter("container")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "container" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Depolar ({items.filter((i) => i.type === "container").length})
            </button>
            <button
              onClick={() => setActiveFilter("movie")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "movie" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Filmler ({items.filter((i) => i.type === "movie").length})
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
              onClick={() => setActiveFilter("code")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "code" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kodlar ({items.filter((i) => i.type === "code").length})
            </button>
            <button
              onClick={() => setActiveFilter("travel")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "travel" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Geziler ({items.filter((i) => i.type === "travel").length})
            </button>
            <button
              onClick={() => setActiveFilter("study")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "study" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ders ({items.filter((i) => i.type === "study").length})
            </button>
            <button
              onClick={() => setActiveFilter("audio")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "audio" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ses ({items.filter((i) => i.type === "audio").length})
            </button>
            <button
              onClick={() => setActiveFilter("image")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "image" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Görüntü ({items.filter((i) => i.type === "image").length})
            </button>
            <button
              onClick={() => setActiveFilter("file")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "file" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dosya ({items.filter((i) => i.type === "file").length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Çöp kutusunda ara..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* LİSTE */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto border border-emerald-100">
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
                      item.type === "container"
                        ? "bg-indigo-600"
                        : item.type === "text"
                        ? "bg-blue-500"
                        : item.type === "movie"
                        ? "bg-purple-600"
                        : item.type === "code"
                        ? "bg-emerald-600"
                        : item.type === "travel"
                        ? "bg-amber-500"
                        : item.type === "study"
                        ? "bg-sky-600"
                        : item.type === "audio"
                        ? "bg-amber-600"
                        : item.type === "image"
                        ? "bg-rose-600"
                        : "bg-slate-600"
                    }`}
                  >
                    {item.type === "container" ? (
                      <Layers className="w-5 h-5" />
                    ) : item.type === "text" ? (
                      <FileText className="w-5 h-5" />
                    ) : item.type === "movie" ? (
                      <Film className="w-5 h-5" />
                    ) : item.type === "code" ? (
                      <Code2 className="w-5 h-5" />
                    ) : item.type === "travel" ? (
                      <Compass className="w-5 h-5" />
                    ) : item.type === "study" ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : item.type === "audio" ? (
                      <Music className="w-5 h-5" />
                    ) : item.type === "image" ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : (
                      <FolderArchive className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {item.originContainer}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        {item.type === "container"
                          ? "Depo"
                          : item.type === "movie"
                          ? "Film"
                          : item.type === "code"
                          ? "Kod"
                          : item.type === "travel"
                          ? "Gezi"
                          : item.type === "study"
                          ? "Ders Notu"
                          : item.type === "audio"
                          ? "Ses"
                          : item.type === "image"
                          ? "Görsel"
                          : item.type === "file"
                          ? "Dosya"
                          : "Metin"}
                      </span>
                    </div>

                    {item.contentPreview && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {item.contentPreview}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
                      <span>Silindi: {item.deletedAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
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

      {/* KALICI SİLME ONAY MODALI */}
      <AnimatePresence>
        {itemToDeletePermanently && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDeletePermanently(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Kalıcı Olarak Silinsin mi?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  <b className="text-slate-800">"{itemToDeletePermanently.title}"</b> öğesi tamamen silinecektir. Bu işlem geri alınamaz.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setItemToDeletePermanently(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-colors"
                >
                  Evet, Kalıcı Olarak Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BİLDİRİM TOASTI */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
