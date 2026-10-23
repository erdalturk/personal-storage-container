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
  TrashRetentionDays,
  getTrashRetentionDays,
  setTrashRetentionDays,
  purgeExpiredTrashItems,
  restoreBatchFromTrash,
  permanentDeleteBatchFromTrash,
} from "@/lib/appStore";
import ThemeToggle from "@/components/ThemeToggle";
import BatchActionBar from "@/components/BatchActionBar";

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [retentionDays, setRetentionDaysState] = useState<TrashRetentionDays>(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "container" | "text" | "movie" | "code" | "travel" | "study" | "audio" | "image" | "file"
  >("all");
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<TrashItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Merkezi depodan canlı yükleme ve olay dinleyici
  useEffect(() => {
    const savedRetention = getTrashRetentionDays();
    setRetentionDaysState(savedRetention);
    purgeExpiredTrashItems(savedRetention);
    setItems(getTrashItems());

    const handleUpdate = () => {
      setRetentionDaysState(getTrashRetentionDays());
      setItems(getTrashItems());
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

  const handleRetentionChange = (days: TrashRetentionDays) => {
    setTrashRetentionDays(days);
    setRetentionDaysState(days);
    const { purgedCount } = purgeExpiredTrashItems(days);
    setItems(getTrashItems());
    if (purgedCount > 0) {
      setToastMessage(`Saklama süresi ${days} gün olarak ayarlandı. Süresi dolan ${purgedCount} içerik otomatik temizlendi.`);
    } else {
      setToastMessage(`Çöp kutusu saklama süresi ${days} gün olarak güncellendi.`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredItems.map((i) => i.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBatchRestore = () => {
    if (selectedIds.length === 0) return;
    const restored = restoreBatchFromTrash(selectedIds);
    setToastMessage(`${restored.length} içerik başarıyla geri yüklendi.`);
    setSelectedIds([]);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBatchPermanentDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Seçili ${selectedIds.length} öğe kalıcı olarak silinecektir. Bu işlem geri alınamaz. Onaylıyor musunuz?`)) {
      const count = permanentDeleteBatchFromTrash(selectedIds);
      setToastMessage(`${count} içerik kalıcı olarak silindi.`);
      setSelectedIds([]);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* ÜST BAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Çöp Kutusu
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {items.length} Öğe
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Silinen depolar ve içerikler 30 gün boyunca burada saklanır
              </p>
            </div>
          </div>
        </div>

        {/* Sağ Butonlar: Tema & Tümünü Boşalt */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 transition-colors"
            >
              Çöp Kutusunu Boşalt
            </button>
          )}
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Bilgi Kutusu & Saklama Süresi Ayarı (Section 12.3 & 13.1) */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otomatik Silme Kuralı:</span> Silinen içerikler ve depolar belirlediğiniz <b>{retentionDays} gün</b> boyunca burada saklanır. Bir içerik silindiğinde dış paylaşımları otomatik sonlandırılır. Süresi dolanlar otomatik kalıcı silinir; son 5 günde kırmızı uyarı verilir.
            </div>
          </div>

          {/* Saklama Süresi Seçici (Retention Selector) */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 shrink-0 self-start md:self-auto shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Saklama:
            </span>
            {([15, 30, 60] as TrashRetentionDays[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleRetentionChange(d)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  retentionDays === d
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {d} Gün {d === 30 && <span className="opacity-75 text-[10px]">(Varsayılan)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Filtre ve Arama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "all" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Tümü ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter("container")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "container" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Depolar ({items.filter((i) => i.type === "container").length})
            </button>
            <button
              onClick={() => setActiveFilter("movie")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "movie" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Filmler ({items.filter((i) => i.type === "movie").length})
            </button>
            <button
              onClick={() => setActiveFilter("text")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "text" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Metinler ({items.filter((i) => i.type === "text").length})
            </button>
            <button
              onClick={() => setActiveFilter("code")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "code" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Kodlar ({items.filter((i) => i.type === "code").length})
            </button>
            <button
              onClick={() => setActiveFilter("travel")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "travel" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Geziler ({items.filter((i) => i.type === "travel").length})
            </button>
            <button
              onClick={() => setActiveFilter("study")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "study" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Ders ({items.filter((i) => i.type === "study").length})
            </button>
            <button
              onClick={() => setActiveFilter("audio")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "audio" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Ses ({items.filter((i) => i.type === "audio").length})
            </button>
            <button
              onClick={() => setActiveFilter("image")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "image" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Görüntü ({items.filter((i) => i.type === "image").length})
            </button>
            <button
              onClick={() => setActiveFilter("file")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "file" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Dosya ({items.filter((i) => i.type === "file").length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Çöp kutusunda ara..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* LİSTE */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Çöp kutusu tertemiz</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Şu anda silinmiş veya çöp kutusunda bekleyen herhangi bir içerik bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  selectedIds.includes(item.id)
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Seçim Checkbox'ı */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSelect(item.id, e)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer shrink-0 mt-0.5"
                    title={selectedIds.includes(item.id) ? "Seçimi Kaldır" : "Öğeyi Seç"}
                  >
                    {selectedIds.includes(item.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/60" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-400" />
                    )}
                  </button>

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
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.originContainer}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {item.contentPreview}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      <span>Silindi: {item.deletedAt}</span>
                      <span>•</span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          item.daysRemaining <= 5
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {item.daysRemaining} gün kaldı {item.daysRemaining <= 5 && "(Son Günler)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Eylemler: Geri Yükle & Kalıcı Sil */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Geri Yükle</span>
                  </button>

                  <button
                    onClick={() => setItemToDeletePermanently(item)}
                    className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Kalıcı Olarak Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Kayan Çoklu Eylem Çubuğu */}
        <BatchActionBar
          selectedCount={selectedIds.length}
          totalCount={filteredItems.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onRestoreBatch={handleBatchRestore}
          onDeleteBatch={handleBatchPermanentDelete}
          onClose={handleDeselectAll}
          deleteLabel="Kalıcı Sil"
          restoreLabel="Geri Yükle"
        />
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
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Kalıcı Olarak Silinsin mi?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  <b className="text-slate-800 dark:text-slate-200">"{itemToDeletePermanently.title}"</b> öğesi tamamen silinecektir. Bu işlem geri alınamaz.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setItemToDeletePermanently(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none transition-colors"
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
