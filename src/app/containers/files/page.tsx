"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FolderArchive,
  FileText,
  FileSpreadsheet,
  FileCode,
  Plus,
  Search,
  Folder,
  FolderPlus,
  Heart,
  Share2,
  Trash2,
  Edit3,
  Download,
  Eye,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  Clock,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { exportDocumentFile } from "@/lib/exportUtils";
import {
  addToTrash,
  restoreFromTrash,
  getStoredCollection,
  saveStoredCollection,
  createOrGetShareTokenForRecord,
} from "@/lib/appStore";

export type FileExtension = "PDF" | "ZIP" | "DOCX" | "XLSX" | "PPTX" | "JSON";

export interface FileItem {
  id: string;
  title: string;
  folder: string | null;
  extension: FileExtension;
  sizeMB: number;
  sizeLabel: string;
  version: string;
  summary: string;
  previewContent: string;
  tags: string[];
  updatedAt: string;
  isFavorite: boolean;
}

const INITIAL_FOLDERS = [
  "Sözleşmeler & Hukuk",
  "Finans & Faturalar",
  "Sunum & Raporlar",
  "Yedek & Arşivler",
];

const INITIAL_FILES: FileItem[] = [
  {
    id: "fl-1",
    title: "2026 SaaS Yazılım Geliştirme Sözleşmesi.pdf",
    folder: "Sözleşmeler & Hukuk",
    extension: "PDF",
    sizeMB: 2.4,
    sizeLabel: "2.4 MB",
    version: "v2.1 • İmzalı",
    summary:
      "Kurumsal müşteri için hazırlanan fikri mülkiyet, gizlilik (NDA) ve SLA maddelerini içeren ana hizmet sözleşmesi.",
    previewContent:
      "MADDE 1 - TARAFLAR VE KONU\nİşbu Yazılım Geliştirme ve Lisans Sözleşmesi, Kişisel Depo (Hizmet Sağlayıcı) ile Kurumsal Müşteri arasında bulut tabanlı veri saklama modüllerinin teslimi amacıyla imzalanmıştır.\n\nMADDE 4 - VERİ GÜVENLİĞİ VE GİZLİLİK\nKullanıcı verileri uçtan uca şifrelenmiş depolarda saklanır. Silinen veriler 30 gün boyunca Çöp Kutusu'nda tutulur ve paylaşılan bağlantılar anında geçersiz kılınır.",
    tags: ["sözleşme", "hukuk", "nda"],
    updatedAt: "Bugün, 13:40",
    isFavorite: true,
  },
  {
    id: "fl-2",
    title: "Q3-Q4 Gelir Gider ve Bütçe Projeksiyonu.xlsx",
    folder: "Finans & Faturalar",
    extension: "XLSX",
    sizeMB: 4.8,
    sizeLabel: "4.8 MB",
    version: "v4.0 • Final",
    summary:
      "2026 yılı 3. ve 4. çeyrek sunucu maliyetleri, abonelik gelirleri ve birim ekonomisi (LTV / CAC) hesaplama tablosu.",
    previewContent:
      "TABLO ÖZETİ (Q4 2026):\n• Aktif Kullanıcı Sayısı: 14,200\n• Aylık Tekrarlayan Gelir (MRR): $48,500\n• Bulut Depolama Maliyeti: $3,120\n• Net Brüt Marj: %88.4",
    tags: ["finans", "bütçe", "excel"],
    updatedAt: "Dün, 18:15",
    isFavorite: true,
  },
  {
    id: "fl-3",
    title: "Kişisel Depo Yatırımcı Sunumu (Pitch Deck).pptx",
    folder: "Sunum & Raporlar",
    extension: "PPTX",
    sizeMB: 18.6,
    sizeLabel: "18.6 MB",
    version: "v1.8",
    summary:
      "Tohum yatırım turu için hazırlanan 16 slaytlık ürün vizyonu, pazar büyüklüğü ve canlı demo akışı sunumu.",
    previewContent:
      "SLAYT 1: Kişisel Depo — Dijital Hafızanızın İkinci Beyni\nSLAYT 2: Problem — Dağınık notlar, kaybolan dosyalar ve güvensiz paylaşım linkleri.\nSLAYT 3: Çözüm — 4 Standart + 4 Akıllı Depo ile bağlamsal organizasyon.",
    tags: ["sunum", "yatırım", "pitch-deck"],
    updatedAt: "11 Ekim 2026",
    isFavorite: false,
  },
  {
    id: "fl-4",
    title: "Tasarım_Sistemi_Ikon_Paketi_2026.zip",
    folder: "Yedek & Arşivler",
    extension: "ZIP",
    sizeMB: 34.2,
    sizeLabel: "34.2 MB",
    version: "v1.0 • Arşiv",
    summary:
      "Projede kullanılan özel SVG ikonlar, tipografi font dosyaları ve yüksek çözünürlüklü kapak görselleri yedeği.",
    previewContent:
      "ARŞİV İÇERİĞİ (142 Dosya):\n- /icons/svg/*.svg (84 adet)\n- /fonts/PlusJakartaSans/*.woff2\n- /brand/logo-guidelines.pdf",
    tags: ["arşiv", "yedek", "tasarım"],
    updatedAt: "5 Ekim 2026",
    isFavorite: false,
  },
];

function getBadgeStyle(ext: FileExtension) {
  switch (ext) {
    case "PDF":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "XLSX":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "DOCX":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PPTX":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "ZIP":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "JSON":
      return "bg-stone-100 text-stone-800 border-stone-300";
  }
}

export default function FilesContainerPage() {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedExt, setSelectedExt] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Preview Modal
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Folder Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  // Add/Edit File Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formFolder, setFormFolder] = useState<string>("Sözleşmeler & Hukuk");
  const [formExt, setFormExt] = useState<FileExtension>("PDF");
  const [formSize, setFormSize] = useState("3.2");
  const [formVersion, setFormVersion] = useState("v1.0 • Final");
  const [formSummary, setFormSummary] = useState("");
  const [formPreview, setFormPreview] = useState("");
  const [formTags, setFormTags] = useState("");

  // Toast & Undo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastTrashId, setLastTrashId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredCollection<FileItem>("files", INITIAL_FILES);
    setFiles(stored);

    const handleSync = () => {
      setFiles(getStoredCollection<FileItem>("files", INITIAL_FILES));
    };
    window.addEventListener("psc-store-updated", handleSync);
    return () => window.removeEventListener("psc-store-updated", handleSync);
  }, []);

  const showToast = (msg: string, trashId?: string) => {
    setToastMessage(msg);
    setLastTrashId(trashId || null);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  const syncFiles = (updated: FileItem[]) => {
    setFiles(updated);
    saveStoredCollection("files", updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = files.map((f) =>
      f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
    );
    syncFiles(updated);
  };

  const handleDeleteFile = (item: FileItem) => {
    if (previewFile?.id === item.id) setPreviewFile(null);
    const updated = files.filter((f) => f.id !== item.id);
    syncFiles(updated);

    const trashEntry = addToTrash({
      title: item.title,
      originContainer: "Sözleşmeler, Faturalar & Belgelerim",
      type: "file",
      contentPreview: `${item.extension} (${item.sizeLabel}) • ${item.version} • ${item.summary.slice(0, 90)}...`,
      originalData: item,
    });
    showToast(`"${item.title}" çöp kutusuna taşındı.`, trashEntry.id);
  };

  const handleUndo = () => {
    if (!lastTrashId) return;
    const restored = restoreFromTrash(lastTrashId);
    if (restored) {
      setToastMessage(null);
      setLastTrashId(null);
    }
  };

  // Folder Creation & 2-Option Deletion
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed || folders.includes(trimmed)) return;
    setFolders([...folders, trimmed]);
    setSelectedFolder(trimmed);
    setNewFolderName("");
    setIsNewFolderOpen(false);
    showToast(`"${trimmed}" klasörü oluşturuldu.`);
  };

  const handleDeleteFolderKeepItems = (folderName: string) => {
    const updated = files.map((f) =>
      f.folder === folderName ? { ...f, folder: null } : f
    );
    syncFiles(updated);
    setFolders(folders.filter((f) => f !== folderName));
    if (selectedFolder === folderName) setSelectedFolder("all");
    setFolderToDelete(null);
    showToast(`"${folderName}" silindi, belgeler Klasörsüz'e taşındı.`);
  };

  const handleDeleteFolderAndItems = (folderName: string) => {
    const itemsInFolder = files.filter((f) => f.folder === folderName);
    const remaining = files.filter((f) => f.folder !== folderName);
    syncFiles(remaining);

    itemsInFolder.forEach((item) => {
      addToTrash({
        title: item.title,
        originContainer: "Sözleşmeler, Faturalar & Belgelerim",
        type: "file",
        contentPreview: `${item.extension} (${item.sizeLabel}) • ${item.summary.slice(0, 90)}...`,
        originalData: item,
      });
    });

    setFolders(folders.filter((f) => f !== folderName));
    if (selectedFolder === folderName) setSelectedFolder("all");
    setFolderToDelete(null);
    showToast(
      `"${folderName}" ve içindeki ${itemsInFolder.length} dosya çöp kutusuna taşındı.`
    );
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormFolder(
      selectedFolder !== "all" &&
        selectedFolder !== "favorites" &&
        selectedFolder !== "unorganized"
        ? selectedFolder
        : folders[0] || ""
    );
    setFormExt("PDF");
    setFormSize("2.5");
    setFormVersion("v1.0 • Final");
    setFormSummary("");
    setFormPreview("");
    setFormTags("belge, resmi");
    setIsModalOpen(true);
  };

  const openEditModal = (item: FileItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormFolder(item.folder || "");
    setFormExt(item.extension);
    setFormSize(String(item.sizeMB));
    setFormVersion(item.version);
    setFormSummary(item.summary);
    setFormPreview(item.previewContent);
    setFormTags(item.tags.join(", "));
    setIsModalOpen(true);
  };

  const handleSaveFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const sizeNum = parseFloat(formSize) || 1.5;
    const parsedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated = files.map((f) =>
        f.id === editingItem.id
          ? {
              ...f,
              title: formTitle.trim(),
              folder: formFolder || null,
              extension: formExt,
              sizeMB: sizeNum,
              sizeLabel: `${sizeNum.toFixed(1)} MB`,
              version: formVersion.trim() || "v1.0",
              summary: formSummary.trim() || "Dosya açıklaması.",
              previewContent:
                formPreview.trim() || "Belge önizleme metni.",
              tags: parsedTags,
            }
          : f
      );
      syncFiles(updated);
      showToast(`"${formTitle.trim()}" güncellendi.`);
    } else {
      const newFile: FileItem = {
        id: `fl-${Date.now()}`,
        title: formTitle.trim(),
        folder: formFolder || null,
        extension: formExt,
        sizeMB: sizeNum,
        sizeLabel: `${sizeNum.toFixed(1)} MB`,
        version: formVersion.trim() || "v1.0",
        summary:
          formSummary.trim() ||
          "Dosya ve belge deposuna eklenen yeni doküman kaydı.",
        previewContent:
          formPreview.trim() ||
          "DOKÜMAN ÖNİZLEMESİ:\nBu dosya Kişisel Depo güvenli saklama alanında korunmaktadır.",
        tags: parsedTags.length > 0 ? parsedTags : ["belge"],
        updatedAt: "Az önce",
        isFavorite: false,
      };
      syncFiles([newFile, ...files]);
      showToast(`"${newFile.title}" dosya deposuna eklendi.`);
    }

    setIsModalOpen(false);
  };

  const filteredFiles = files.filter((item) => {
    const matchesFolder =
      selectedFolder === "all"
        ? true
        : selectedFolder === "favorites"
        ? item.isFavorite
        : selectedFolder === "unorganized"
        ? !item.folder
        : item.folder === selectedFolder;

    const matchesExt =
      selectedExt === "all" ? true : item.extension === selectedExt;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));

    return matchesFolder && matchesExt && matchesSearch;
  });

  const totalMB = files.reduce((acc, f) => acc + f.sizeMB, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 text-stone-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 transition shadow-sm"
              title="Ana Sayfaya Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <FolderArchive className="w-3.5 h-3.5" />
                  Standart Depo • Dosya & Belge
                </span>
                <span className="text-xs text-stone-400 dark:text-slate-500">1-Seviye Klasör & Doküman Kasası</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight mt-0.5">
                Sözleşmeler, Faturalar & Belgelerim
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() =>
                window.open("/share/belge-ve-dosya-deposu", "_blank")
              }
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 text-sm font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Depoyu Paylaş
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yeni Dosya Yükle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Storage & Security Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Toplam Belge & Arşiv
              </p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {files.length} Dosya ({totalMB.toFixed(1)} MB)
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Bütünlük & Versiyon Kontrolü
              </p>
              <p className="text-sm font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Tüm Belgeler Doğrulandı (SHA-256)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
              Aktif
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-stone-500">Depo Kapasite Kullanımı</span>
              <span className="text-stone-900">{totalMB.toFixed(1)} MB / 500 MB</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (totalMB / 500) * 100)}%` }}
                className="h-full bg-emerald-600 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* 1-Level Folder Bar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-emerald-700" />
              Belge Klasörleri (Tek Seviyeli Hiyerarşi)
            </span>
            <button
              onClick={() => setIsNewFolderOpen(!isNewFolderOpen)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              + Yeni Klasör
            </button>
          </div>

          {isNewFolderOpen && (
            <form
              onSubmit={handleCreateFolder}
              className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100"
            >
              <input
                type="text"
                placeholder="Yeni klasör adı..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 max-w-xs px-3 py-1.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
              >
                Oluştur
              </button>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFolder("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedFolder === "all"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
              }`}
            >
              Tümü ({files.length})
            </button>

            <button
              onClick={() => setSelectedFolder("favorites")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedFolder === "favorites"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Önemli Belgeler ({files.filter((f) => f.isFavorite).length})
            </button>

            {folders.map((folder) => {
              const count = files.filter((f) => f.folder === folder).length;
              const isSelected = selectedFolder === folder;
              return (
                <div
                  key={folder}
                  className={`group flex items-center rounded-xl text-xs font-semibold transition shrink-0 ${
                    isSelected
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200/70"
                  }`}
                >
                  <button
                    onClick={() => setSelectedFolder(folder)}
                    className="px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    {folder} ({count})
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToDelete(folder);
                    }}
                    className={`pr-2.5 pl-1 py-2 opacity-60 hover:opacity-100 transition cursor-pointer ${
                      isSelected ? "text-white" : "text-stone-400 hover:text-rose-600"
                    }`}
                    title="Klasörü Sil"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => setSelectedFolder("unorganized")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedFolder === "unorganized"
                  ? "bg-stone-700 text-white"
                  : "bg-stone-100/80 text-stone-500 hover:bg-stone-200/60"
              }`}
            >
              Klasörsüz ({files.filter((f) => !f.folder).length})
            </button>
          </div>
        </div>

        {/* Search & Extension Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Dosya adı, sözleşme özeti veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200/90 text-sm focus:outline-none focus:border-emerald-600 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200/80 shadow-sm overflow-x-auto">
            {(["all", "PDF", "XLSX", "PPTX", "DOCX", "ZIP"] as const).map(
              (ext) => (
                <button
                  key={ext}
                  onClick={() => setSelectedExt(ext)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedExt === ext
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {ext === "all" ? "Tümü" : ext}
                </button>
              )
            )}
          </div>
        </div>

        {/* File Cards Grid */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <FolderArchive className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Dosya veya Belge Bulunamadı
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mt-1 mb-6">
              Seçili klasörde veya arama kriterlerinize uygun bir belge bulunmuyor.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yeni Dosya Yükle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredFiles.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeStyle(
                          item.extension
                        )}`}
                      >
                        {item.extension}
                      </span>
                      <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                        {item.folder || "Klasörsüz"}
                      </span>
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          item.isFavorite
                            ? "text-rose-500 bg-rose-50"
                            : "text-stone-400 hover:bg-stone-100"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            item.isFavorite ? "fill-current" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          const token = createOrGetShareTokenForRecord(
                            item,
                            "file",
                            "Sözleşmeler, Faturalar & Belgelerim"
                          );
                          window.open(`/share/${token}`, "_blank");
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
                        title="Bu Belgeyi Paylaş"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(item)}
                        className="p-2 rounded-xl text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => setPreviewFile(item)}
                    className="text-lg font-bold text-stone-900 hover:text-emerald-700 transition cursor-pointer mb-2"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-700">
                        {item.sizeLabel}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.updatedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewFile(item)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Önizle
                      </button>
                      <button
                        onClick={() => {
                          exportDocumentFile({
                            name: item.title,
                            size: item.sizeLabel,
                            format: item.extension,
                            content: item.previewContent,
                          });
                          showToast(`"${item.title}" başarıyla indirildi.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        İndir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getBadgeStyle(
                      previewFile.extension
                    )}`}
                  >
                    {previewFile.extension}
                  </span>
                  <span className="text-xs text-stone-500">
                    {previewFile.sizeLabel} • {previewFile.version}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  {previewFile.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-stone-200/80 font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto mb-6">
              {previewFile.previewContent}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  const token = createOrGetShareTokenForRecord(
                    previewFile,
                    "file",
                    "Sözleşmeler, Faturalar & Belgelerim"
                  );
                  window.open(`/share/${token}`, "_blank");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-700" />
                Paylaşım Kartını Aç
              </button>

              <button
                onClick={() => {
                  exportDocumentFile({
                    name: previewFile.title,
                    size: previewFile.sizeLabel,
                    format: previewFile.extension,
                    content: previewFile.previewContent,
                  });
                  showToast(`"${previewFile.title}" başarıyla indirildi.`);
                  setPreviewFile(null);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Dosyayı İndir ({previewFile.sizeLabel})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Option Folder Delete Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              &ldquo;{folderToDelete}&rdquo; Klasörünü Sil
            </h3>
            <p className="text-sm text-stone-600 mt-1 mb-6">
              Bu klasörün içindeki dosya ve belgelere ne yapılmasını istersiniz?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleDeleteFolderKeepItems(folderToDelete)}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-sm font-semibold text-left flex items-center justify-between transition cursor-pointer"
              >
                <span>İçerikleri Koru (Klasörsüz&apos;e Taşı)</span>
                <Check className="w-4 h-4 text-stone-600" />
              </button>

              <button
                onClick={() => handleDeleteFolderAndItems(folderToDelete)}
                className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold text-left flex items-center justify-between transition cursor-pointer"
              >
                <span>Klasörü ve İçeriklerini Sil (Çöp Kutusuna)</span>
                <Trash2 className="w-4 h-4 text-rose-600" />
              </button>
            </div>

            <button
              onClick={() => setFolderToDelete(null)}
              className="w-full mt-4 py-2.5 text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit File Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-stone-900">
                {editingItem ? "Dosyayı Düzenle" : "Yeni Dosya & Belge Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Dosya Adı
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: 2026 Hizmet Sözleşmesi.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Klasör
                  </label>
                  <select
                    value={formFolder}
                    onChange={(e) => setFormFolder(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">Klasörsüz</option>
                    {folders.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Format
                  </label>
                  <select
                    value={formExt}
                    onChange={(e) =>
                      setFormExt(e.target.value as FileExtension)
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="ZIP">ZIP</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Boyut (MB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Versiyon / Durum Etiketi
                </label>
                <input
                  type="text"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                  placeholder="v1.0 • İmzalı"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Belge Özeti
                </label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Dosyanın içeriği hakkında kısa açıklama..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Belge İçi Önizleme Metni
                </label>
                <textarea
                  rows={3}
                  value={formPreview}
                  onChange={(e) => setFormPreview(e.target.value)}
                  placeholder="Önizleme penceresinde gösterilecek önemli maddeler..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition cursor-pointer"
                >
                  {editingItem ? "Değişiklikleri Kaydet" : "Dosyayı Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-4">
          <span className="text-sm font-medium">{toastMessage}</span>
          {lastTrashId && (
            <button
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Geri Al
            </button>
          )}
        </div>
      )}
    </div>
  );
}
