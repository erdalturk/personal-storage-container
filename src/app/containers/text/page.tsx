"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  addToTrash,
  addBatchToTrash,
  restoreBatchFromTrash,
  getStoredCollection,
  saveStoredCollection,
  createOrGetShareTokenForRecord,
  activateShareToken,
  getContainerByFormatOrType,
  syncContainerItemCount,
  updateContainerDetails,
  Container,
} from "@/lib/appStore";
import {
  ArrowLeft,
  LayoutGrid,
  List as ListIcon,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Search,
  Folder,
  FolderPlus,
  Trash2,
  Pencil,
  FileText,
  Clock,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Hash,
  AlignLeft,
  Share2,
  MoreVertical,
  X,
  AlertCircle,
  Upload,
  Edit3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import useEscKey from "@/hooks/useEscKey";
import BatchActionBar from "@/components/BatchActionBar";
import { exportMarkdownFile, downloadTextFile } from "@/lib/exportUtils";
import { readFileAsText } from "@/lib/uploadUtils";

// Örnek Klasörler
interface FolderItem {
  id: string;
  name: string;
}

// Örnek Metin İçeriği
interface TextItem {
  id: string;
  title: string;
  content: string;
  folderId: string | null; // null ise klasörsüz
  formatType: "poem" | "note" | "plain"; // Şiir, Fikir Notu veya Düz Metin
  lastUpdated: string;
  wordCount: number;
  lineCount: number;
}

const INITIAL_FOLDERS: FolderItem[] = [
  { id: "f1", name: "Şiirlerim & Dizeler" },
  { id: "f2", name: "Proje Fikirleri" },
  { id: "f3", name: "Günün Notları" },
];

const INITIAL_TEXTS: TextItem[] = [
  {
    id: "t1",
    title: "Mavi Bir Akşamüstü",
    content: "Rüzgâr estiğinde deniz fısıldar,\nUzak kıyılardan kalan bir hatırayı.\nHer dizede biraz kaybolur insan,\nVe her sessizlikte yeniden başlar.",
    folderId: "f1",
    formatType: "poem",
    lastUpdated: "Bugün 14:20",
    wordCount: 22,
    lineCount: 4,
  },
  {
    id: "t2",
    title: "Kişisel Depo — Mimari Düşünceler",
    content: "Dağınık dijital varlıkları tek bir merkezde toplamak kullanıcıya inanılmaz bir zihinsel ferahlık sunuyor. Duolingo benzeri mikro etkileşimler ve görsel önizlemeler ile sıkıcı arşiv mantığı tamamen kırılıyor.",
    folderId: "f2",
    formatType: "note",
    lastUpdated: "Dün",
    wordCount: 30,
    lineCount: 1,
  },
  {
    id: "t3",
    title: "Haftalık Okuma Listesi Notları",
    content: "1. Tasarım Sistemleri Üzerine Notlar\n2. İnsan Zihninin Dijital Arşivleme Alışkanlıkları\n3. Sadeliğin Gücü ve Minimalist Yazılımlar",
    folderId: "f3",
    formatType: "plain",
    lastUpdated: "3 gün önce",
    wordCount: 17,
    lineCount: 3,
  },
  {
    id: "t4",
    title: "Yıldızların Altında Bir Cümle",
    content: "Gecenin karanlığı derinleştikçe zihnin en duru fikirleri sessizce yüzeye çıkar.",
    folderId: null, // Klasörsüz içerik
    formatType: "plain",
    lastUpdated: "5 gün önce",
    wordCount: 10,
    lineCount: 1,
  },
];

export default function TextContainerPage() {
  // Arayüz Durumları
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Galeri vs Liste görünümü
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Tek tık sol panel kontrolü
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | "all" | "unorganized">("all");

  // Veri Durumları
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [currentContainer, setCurrentContainer] = useState<Container | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContainerTitle, setEditContainerTitle] = useState("Gece Düşünceleri & Şiirlerim");
  const [editGradient, setEditGradient] = useState("from-blue-600 via-indigo-600 to-purple-700");

  // Klasör Ağaç Yapısı Genişletme Durumu (PM-CONTROL Satır 94: VS Code Tree View)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({
    unorganized: true,
    f1: true,
    f2: true,
    f3: false,
  });

  const toggleFolderExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolderIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const loadData = () => {
      const stored = getStoredCollection<TextItem>("texts", INITIAL_TEXTS);
      setTexts(stored);

      const cont = getContainerByFormatOrType("Metin Belgeleri");
      if (cont) {
        setCurrentContainer(cont);
        setEditContainerTitle(cont.title);
        setEditGradient(cont.coverGradient || "from-blue-600 via-indigo-600 to-purple-700");
      } else {
        syncContainerItemCount("Metin Belgeleri", stored.length, "Gece Düşünceleri & Şiirlerim");
        const fresh = getContainerByFormatOrType("Metin Belgeleri");
        if (fresh) {
          setCurrentContainer(fresh);
          setEditContainerTitle(fresh.title);
        }
      }
    };

    loadData();
    window.addEventListener("psc-store-updated", loadData);
    return () => window.removeEventListener("psc-store-updated", loadData);
  }, []);

  const handleSaveContainerDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContainerTitle.trim()) return;
    const contId = currentContainer?.id || "c5";
    const updated = updateContainerDetails(contId, {
      title: editContainerTitle.trim(),
      coverGradient: editGradient,
    });
    if (updated) {
      setCurrentContainer(updated);
    }
    setIsEditModalOpen(false);
    setToastMessage("Depo bilgileri güncellendi.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Editör Modalı
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TextItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFormatType, setEditFormatType] = useState<"poem" | "note" | "plain">("poem");
  const [editFolderId, setEditFolderId] = useState<string | null>(null);

  // Klasör Oluşturma / Silme / Yeniden Adlandırma Modalı (Bölüm 10.4 & 10.7 Kuralı)
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderItem | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  // Değişiklik Kontrolü & ESC Kapatma Desteği (PM-CONTROL Satır 90)
  const isEditorDirty = editingItem
    ? editTitle !== editingItem.title || editContent !== editingItem.content
    : Boolean(editTitle.trim() || editContent.trim());

  useEscKey(isEditorOpen, () => setIsEditorOpen(false), isEditorDirty);
  useEscKey(isNewFolderModalOpen, () => setIsNewFolderModalOpen(false));
  useEscKey(Boolean(folderToDelete), () => setFolderToDelete(null));
  useEscKey(Boolean(folderToRename), () => setFolderToRename(null));

  // Hızlı Geri Al (Undo Toast - Bölüm 12.1) & Toplu Seçim
  const [deletedItemBackup, setDeletedItemBackup] = useState<TextItem | null>(null);
  const [lastTrashBatchIds, setLastTrashBatchIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Canlı Sayaçlar (Editör için)
  const editWords = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;
  const editLines = editContent.length > 0 ? editContent.split("\n").length : 0;
  const editChars = editContent.length;
  const editReadTime = Math.max(1, Math.ceil(editWords / 200));

  // Filtrelenmiş Metinler
  const filteredTexts = texts.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFolderId === "all") return true;
    if (selectedFolderId === "unorganized") return item.folderId === null;
    return item.folderId === selectedFolderId;
  });

  // Toplam İstatistikler
  const totalWords = texts.reduce((acc, t) => acc + t.wordCount, 0);
  const totalLines = texts.reduce((acc, t) => acc + t.lineCount, 0);

  // Editörü Aç (Yeni veya Düzenleme)
  const handleOpenEditor = (item?: TextItem) => {
    if (item) {
      setEditingItem(item);
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditFormatType(item.formatType);
      setEditFolderId(item.folderId);
    } else {
      setEditingItem(null);
      setEditTitle("");
      setEditContent("");
      setEditFormatType("plain");
      setEditFolderId(selectedFolderId !== "all" && selectedFolderId !== "unorganized" ? selectedFolderId : null);
    }
    setIsEditorOpen(true);
  };

  // Metni Kaydet
  const handleSaveText = () => {
    if (!editTitle.trim()) {
      alert("Lütfen metin için bir başlık belirleyin.");
      return;
    }

    const words = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;
    const lines = editContent.length > 0 ? editContent.split("\n").length : 0;

    if (editingItem) {
      // Güncelle
      const updated = texts.map((t) =>
        t.id === editingItem.id
          ? {
              ...t,
              title: editTitle,
              content: editContent,
              formatType: editFormatType,
              folderId: editFolderId,
              lastUpdated: "Az önce",
              wordCount: words,
              lineCount: lines,
            }
          : t
      );
      setTexts(updated);
      saveStoredCollection("texts", updated);
    } else {
      // Yeni Ekle
      const newItem: TextItem = {
        id: "t_" + Date.now(),
        title: editTitle,
        content: editContent,
        folderId: editFolderId,
        formatType: editFormatType,
        lastUpdated: "Az önce",
        wordCount: words,
        lineCount: lines,
      };
      const updated = [newItem, ...texts];
      setTexts(updated);
      saveStoredCollection("texts", updated);
      syncContainerItemCount("Metin Belgeleri", updated.length, currentContainer?.title);
    }

    setIsEditorOpen(false);
  };

  // Metni Sil ve Hızlı Geri Al (Undo) Başlat (Bölüm 12.1 + Çöp Kutusu ve Paylaşım İptali)
  const handleDeleteText = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemToDelete = texts.find((t) => t.id === id);
    if (!itemToDelete) return;

    // 1. Çöp Kutusuna Gönder (Bu işlem varsa paylaşılan içeriklerden de anında kaldırır ve iptal eder!)
    addToTrash({
      title: itemToDelete.title,
      originContainer: currentContainer?.title || "Gece Düşünceleri & Şiirlerim",
      type: "text",
      contentPreview: itemToDelete.content.slice(0, 100),
      originalData: itemToDelete,
    });

    setDeletedItemBackup(itemToDelete);
    const updated = texts.filter((t) => t.id !== id);
    setTexts(updated);
    saveStoredCollection("texts", updated);
    syncContainerItemCount("Metin Belgeleri", updated.length, currentContainer?.title);
    setToastMessage(`"${itemToDelete.title}" Çöp Kutusu'na taşındı.`);

    // 5 saniye sonra geri alma imkanını temizle
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Hızlı Geri Al Fonksiyonu
  const handleUndoDelete = () => {
    if (lastTrashBatchIds.length > 0) {
      restoreBatchFromTrash(lastTrashBatchIds);
      setLastTrashBatchIds([]);
      setToastMessage(null);
    } else if (deletedItemBackup) {
      const updated = [deletedItemBackup, ...texts];
      setTexts(updated);
      saveStoredCollection("texts", updated);
      syncContainerItemCount("Metin Belgeleri", updated.length, currentContainer?.title);
      setDeletedItemBackup(null);
      setToastMessage(null);
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredTexts.map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const itemsToDelete = texts.filter((t) => selectedIds.includes(t.id));
    const remaining = texts.filter((t) => !selectedIds.includes(t.id));
    setTexts(remaining);
    saveStoredCollection("texts", remaining);
    syncContainerItemCount("Metin Belgeleri", remaining.length, currentContainer?.title);

    const trashEntries = addBatchToTrash(
      itemsToDelete.map((item) => ({
        title: item.title,
        originContainer: currentContainer?.title || "Gece Düşünceleri & Şiirlerim",
        type: "text",
        contentPreview: item.content.slice(0, 100),
        originalData: item,
      }))
    );

    const ids = trashEntries.map((t) => t.id);
    setLastTrashBatchIds(ids);
    setDeletedItemBackup(null);
    setSelectedIds([]);
    setToastMessage(`${itemsToDelete.length} metin Çöp Kutusu'na taşındı.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Yeni Klasör Ekle
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: FolderItem = {
      id: "f_" + Date.now(),
      name: newFolderName.trim(),
    };
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setIsNewFolderModalOpen(false);
  };

  // Klasör Yeniden Adlandır (Bölüm 10.4 Kuralı)
  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename || !renameFolderName.trim()) return;
    const newName = renameFolderName.trim();
    setFolders((prev) =>
      prev.map((f) => (f.id === folderToRename.id ? { ...f, name: newName } : f))
    );
    setFolderToRename(null);
    setRenameFolderName("");
    setToastMessage(`Klasör adı "${newName}" olarak güncellendi.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Klasör Silme — Bölüm 10.7 Seçenekleri:
  // Seçenek 1: İçerikleri koru (klasörsüz yap)
  const handleDeleteFolderKeepItems = (folderId: string) => {
    const updated = texts.map((t) => (t.folderId === folderId ? { ...t, folderId: null } : t));
    setTexts(updated);
    saveStoredCollection("texts", updated);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId("all");
    setFolderToDelete(null);
  };

  // Seçenek 2: Klasör ve içeriklerini birlikte sil (Çöp kutusuna at)
  const handleDeleteFolderWithItems = (folderId: string) => {
    const itemsInFolder = texts.filter((t) => t.folderId === folderId);
    itemsInFolder.forEach((t) => {
      addToTrash({
        title: t.title,
        originContainer: "Gece Düşünceleri & Şiirlerim",
        type: "text",
        contentPreview: t.content.slice(0, 100),
        originalData: t,
      });
    });
    const updated = texts.filter((t) => t.folderId !== folderId);
    setTexts(updated);
    saveStoredCollection("texts", updated);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId("all");
    setFolderToDelete(null);
  };

  // Metni TXT olarak İndir
  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([editContent], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${editTitle || "metin"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Panoya Kopyala
  const handleCopy = () => {
    navigator.clipboard.writeText(editContent);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. ÜST HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Tek Tık Sol Panel Aç/Kapat Butonu */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isSidebarOpen
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={isSidebarOpen ? "Sol Paneli Gizle" : "Sol Paneli Göster (Tek Tık)"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Depo Başlığı & Format Rozeti */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                {currentContainer?.title || "Gece Düşünceleri & Şiirlerim"}
              </h1>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                title="Depo Adını ve Kapağını Düzenle"
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                Metin Formatı
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {texts.length} içerik • {totalWords} toplam kelime
            </p>
          </div>
        </div>

        {/* Sağ Araçlar: Tema, Görünüm Değiştirici (Galeri/Liste) & Yeni Ekle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Depoyu Paylaş Butonu */}
          <button
            type="button"
            onClick={() => {
              activateShareToken("gece-siirleri-deposu");
              window.open("/share/gece-siirleri-deposu", "_blank");
            }}
            title="Tüm Metin Deposunu Salt Okunur Paylaş"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Depoyu Paylaş</span>
          </button>

          {/* Görünüm Değiştirici Switch (Galeri vs Liste) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode("grid")}
              title="Galeri (Kart) Görünümü"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="Liste Görünümü"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Yeni Metin / Şiir Ekle Butonu */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenEditor()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Metin / Şiir</span>
          </motion.button>
        </div>
      </header>

      {/* 2. ANA GÖVDE: SOL PANEL (SIDEBAR) + İÇERİK ALANI */}
      <div className="flex-1 flex overflow-hidden">
        {/* SOL PANEL (KLASÖRLER & İSTATİSTİKLER) */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden z-20"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Klasörler
                </span>
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                  title="Yeni Klasör Ekle"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Klasör Listesi */}
              <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                <button
                  onClick={() => setSelectedFolderId("all")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedFolderId === "all"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <AlignLeft className="w-4 h-4 text-slate-400" />
                    <span>Tüm İçerikler</span>
                  </div>
                  <span className="text-[11px] opacity-75">{texts.length}</span>
                </button>

                <div>
                  <button
                    onClick={() => setSelectedFolderId("unorganized")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedFolderId === "unorganized"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        onClick={(e) => toggleFolderExpanded("unorganized", e)}
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                        title={expandedFolderIds["unorganized"] ? "Daralt" : "Genişlet"}
                      >
                        {expandedFolderIds["unorganized"] ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Klasörsüz İçerikler</span>
                    </div>
                    <span className="text-[11px] opacity-75">
                      {texts.filter((t) => t.folderId === null).length}
                    </span>
                  </button>

                  {/* Klasörsüz İçerik Ağaç Dalı */}
                  {expandedFolderIds["unorganized"] && (
                    <div className="ml-5 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 my-1">
                      {texts
                        .filter((t) => t.folderId === null)
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditor(t);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group/item"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3 h-3 text-slate-400 group-hover/item:text-indigo-500 shrink-0" />
                              <span className="truncate">{t.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {t.wordCount}w
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Klasör Ağacı (VS Code Explorer)
                </div>

                {folders.map((folder) => {
                  const folderTexts = texts.filter((t) => t.folderId === folder.id);
                  const count = folderTexts.length;
                  const isExpanded = Boolean(expandedFolderIds[folder.id]);

                  return (
                    <div key={folder.id} className="space-y-0.5">
                      <div
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedFolderId === folder.id
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        onClick={() => setSelectedFolderId(folder.id)}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            onClick={(e) => toggleFolderExpanded(folder.id, e)}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                            title={isExpanded ? "Daralt" : "Genişlet"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] opacity-75 group-hover:hidden">
                            {count}
                          </span>
                          {/* Klasör Yeniden Adlandır Butonu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderToRename(folder);
                              setRenameFolderName(folder.name);
                            }}
                            className="hidden group-hover:block p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Klasörü Yeniden Adlandır"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {/* Klasör Sil Butonu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderToDelete(folder);
                            }}
                            className="hidden group-hover:block p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Klasörü Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Hiyerarşik Klasör İçi Notlar (VS Code Tree View) */}
                      {isExpanded && (
                        <div className="ml-5 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 my-1">
                          {folderTexts.map((t) => (
                            <button
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditor(t);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group/item"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3 h-3 text-slate-400 group-hover/item:text-indigo-500 shrink-0" />
                                <span className="truncate">{t.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {t.wordCount}w
                              </span>
                            </button>
                          ))}
                          {folderTexts.length === 0 && (
                            <div className="px-2.5 py-1 text-[10px] text-slate-400 italic">
                              (Boş klasör)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sol Panel Alt İstatistik Kartı */}
              <div className="p-3 m-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Depo İstatistikleri</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <div className="text-sm font-extrabold text-slate-900">{totalWords}</div>
                    <div className="text-[10px] text-slate-400">Kelime</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <div className="text-sm font-extrabold text-slate-900">{totalLines}</div>
                    <div className="text-[10px] text-slate-400">Satır/Dize</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* SAĞ İÇERİK ALANI (GALERİ VEYA LİSTE) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Arama Alanı */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Şiirlerinde veya notlarında ara..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none shadow-xs"
            />
          </div>

          {/* İÇERİKLER GÖRÜNÜMÜ */}
          {filteredTexts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Bu bölümde henüz metin yok</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                İlk şiirini, fikrini veya düz metnini kaydetmek için yukarıdaki butona tıkla.
              </p>
              <button
                onClick={() => handleOpenEditor()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
              >
                + Yeni Metin Ekle
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* GALERİ (GRID) GÖRÜNÜMÜ */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTexts.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ y: -4 }}
                  onClick={() => handleOpenEditor(item)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                    selectedIds.includes(item.id)
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/30"
                      : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div>
                    {/* Üst Rozet & Format Türü */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelect(item.id, e)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          title={selectedIds.includes(item.id) ? "Seçimi Kaldır" : "Metni Seç"}
                        >
                          {selectedIds.includes(item.id) ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                          ) : (
                            <div className="w-4 h-4 rounded-md border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500" />
                          )}
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.formatType === "poem"
                            ? "Şiir"
                            : item.formatType === "note"
                            ? "Fikir Notu"
                            : "Düz Metin"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.lastUpdated}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>

                    {/* Metin Önizlemesi (Şiir veya Düz Metin Biçiminde) */}
                    <p
                      className={`text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-4 whitespace-pre-line ${
                        item.formatType === "poem" ? "italic font-serif" : ""
                      }`}
                    >
                      {item.content}
                    </p>
                  </div>

                  {/* Alt Sayaçlar & Hızlı Sil (PM-CONTROL Satır 99) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{item.wordCount} kelime</span>
                      <span>•</span>
                      <span>{item.content.length} karakter</span>
                      <span>•</span>
                      <span>{item.lineCount} satır</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const token = createOrGetShareTokenForRecord(
                            item,
                            "text",
                            item.title || currentContainer?.title || "Gece Düşünceleri & Şiirlerim"
                          );
                          activateShareToken(token);
                          window.open(`/share/${token}`, "_blank");
                        }}
                        className="p-1 rounded-md text-slate-300 hover:text-indigo-600 transition-colors"
                        title="Bu Metni Paylaş"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportMarkdownFile(item.title, item.content);
                        }}
                        className="p-1 rounded-md text-slate-300 hover:text-indigo-600 transition-colors"
                        title="Markdown (.md) Olarak İndir"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteText(item.id, e)}
                        className="p-1 rounded-md text-slate-300 hover:text-rose-600 transition-colors"
                        title="Sil (Çöp Kutusu)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* LİSTE (LIST) GÖRÜNÜMÜ */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Başlık</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Kelime</th>
                    <th className="py-3 px-4">Karakter</th>
                    <th className="py-3 px-4">Dize / Satır</th>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4 text-right">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredTexts.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEditor(item)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {item.formatType === "poem"
                            ? "Şiir"
                            : item.formatType === "note"
                            ? "Fikir"
                            : "Düz Metin"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.wordCount}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.content.length}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.lineCount}</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">{item.lastUpdated}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => handleDeleteText(item.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kayan Çoklu Eylem Çubuğu */}
          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filteredTexts.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDeleteBatch={handleBatchDelete}
            onClose={handleDeselectAll}
            deleteLabel="Seçilenleri Sil"
          />
        </main>
      </div>

      {/* 3. ODAKLANMIŞ EDİTÖR MODALI (CANLI İSTATİSTİKLERLE) */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5 flex flex-col max-h-[90vh]"
            >
              {/* Editör Üst Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setEditFormatType("poem")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        editFormatType === "poem"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Şiir Düzeni
                    </button>
                    <button
                      onClick={() => setEditFormatType("plain")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        editFormatType === "plain"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Düz Metin
                    </button>
                    <button
                      onClick={() => setEditFormatType("note")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        editFormatType === "note"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Fikir Notu
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                    title="Cihazdan .txt veya .md Dosyası Yükle"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Metin / MD Yükle</span>
                    <input
                      type="file"
                      accept=".txt,.md,.markdown,text/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const text = await readFileAsText(file);
                          setEditContent(text);
                          const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
                          setEditTitle(cleanTitle);
                          const isMd = file.name.toLowerCase().endsWith(".md");
                          setEditFormatType(isMd ? "note" : "plain");
                        } catch {
                          alert("Dosya okunamadı.");
                        }
                      }}
                    />
                  </label>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Panoya Kopyala"
                  >
                    {copiedSuccess ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const token = createOrGetShareTokenForRecord(
                        editingItem || {
                          id: `text-${Date.now()}`,
                          title: editTitle || "Taslak Metin",
                          content: editContent,
                        },
                        "text",
                        editTitle || currentContainer?.title || "Gece Düşünceleri & Şiirlerim"
                      );
                      activateShareToken(token);
                      window.open(`/share/${token}`, "_blank");
                    }}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Salt Okunur Önizleme Bağlantısını Aç"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportMarkdownFile(editTitle || "metin", editContent)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Markdown (.md) Olarak İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="TXT Olarak İndir"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Başlık Girişi (PM-CONTROL Satır 88) */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Başlık girin..."
                className="w-full text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />

              {/* Metin Yazma Alanı */}
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={
                  editFormatType === "poem"
                    ? "Dizelerinizi buraya yazın..."
                    : "Düşüncelerinizi buraya yazın..."
                }
                rows={12}
                className={`w-full flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 leading-relaxed resize-none transition-all ${
                  editFormatType === "poem" ? "font-serif italic" : "font-sans"
                }`}
              />

              {/* Canlı İstatistik Çubuğu (Bölüm 6.3 & 6.4) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    <b>{editWords}</b> kelime
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-emerald-500" />
                    <b>{editLines}</b> dize/satır
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <b>{editChars}</b> karakter
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    ~{editReadTime} dk okuma
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={handleSaveText}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. YENİ KLASÖR OLUŞTURMA MODALI */}
      <AnimatePresence>
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsNewFolderModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Yeni Klasör Oluştur</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Depo içi içeriklerini gruplamak için bir klasör adı yazın.
              </p>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Örn: 2026 Şiirleri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-indigo-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. KLASÖR SİLME MODALI (BÖLÜM 10.7 KRAL SEÇENEKLERİ) */}
      <AnimatePresence>
        {folderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setFolderToDelete(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  "{folderToDelete.name}" klasörü silinsin mi?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Bu klasörün içindeki içerikleri korumak mı istersiniz, yoksa klasörle birlikte Çöp Kutusu'na taşımak mı?
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {/* 1. Seçenek: İçerikleri Koru */}
                <button
                  onClick={() => handleDeleteFolderKeepItems(folderToDelete.id)}
                  className="w-full p-3.5 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">İçerikleri Koru</div>
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                      Klasör silinir, içindeki metinler "Klasörsüz İçerikler"e aktarılır.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>

                {/* 2. Seçenek: Klasör ve İçerikleri Sil */}
                <button
                  onClick={() => handleDeleteFolderWithItems(folderToDelete.id)}
                  className="w-full p-3.5 rounded-2xl border-2 border-rose-100 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-900/50 text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-rose-950 dark:text-rose-200">Klasör ve İçeriklerini Sil</div>
                    <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                      Klasör ve içindeki tüm metinler Çöp Kutusu'na taşınır.
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>

              <div className="text-right pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setFolderToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 5.1. KLASÖR YENİDEN ADLANDIRMA MODALI (BÖLÜM 10.4 KURALI) */}
      <AnimatePresence>
        {folderToRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setFolderToRename(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Klasörü Yeniden Adlandır</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                "{folderToRename.name}" klasörü için yeni bir isim belirleyin.
              </p>
              <form onSubmit={handleRenameFolder} className="space-y-4">
                <input
                  type="text"
                  value={renameFolderName}
                  onChange={(e) => setRenameFolderName(e.target.value)}
                  placeholder="Klasör Adı"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFolderToRename(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. HIZLI GERİ ALMA (UNDO TOAST - BÖLÜM 12.1) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-4 text-xs font-medium"
          >
            <span>{toastMessage}</span>
            <button
              onClick={handleUndoDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Geri Al</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* DEPO DÜZENLEME MODALI */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Depoyu Düzenle</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Metin deposu adını ve tema rengini özelleştirin</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveContainerDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Depo Başlığı
                  </label>
                  <input
                    type="text"
                    required
                    value={editContainerTitle}
                    onChange={(e) => setEditContainerTitle(e.target.value)}
                    placeholder="Örn: Kişisel Notlarım"
                    className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Kapak Rengi Gradyanı
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Mor & İndigo", val: "from-blue-600 via-indigo-600 to-purple-700" },
                      { label: "Siber Mavi", val: "from-blue-600 via-cyan-600 to-teal-500" },
                      { label: "Zümrüt", val: "from-emerald-600 via-teal-600 to-cyan-700" },
                      { label: "Alev Turuncu", val: "from-amber-500 via-orange-600 to-rose-600" },
                      { label: "Gül & Fuşya", val: "from-rose-500 via-pink-600 to-purple-600" },
                      { label: "Koyu Gece", val: "from-slate-800 via-slate-900 to-zinc-950" },
                    ].map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => setEditGradient(g.val)}
                        className={`h-11 rounded-xl bg-gradient-to-r ${g.val} p-1 text-[10px] font-bold text-white flex items-center justify-center transition-all ${
                          editGradient === g.val ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-102" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
