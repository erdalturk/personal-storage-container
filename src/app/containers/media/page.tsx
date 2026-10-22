"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Search,
  Folder,
  FolderPlus,
  Heart,
  Share2,
  Trash2,
  Edit3,
  Maximize2,
  Camera,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Download,
  Upload,
  Loader2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { exportDocumentFile, exportImageFile } from "@/lib/exportUtils";
import { compressImageClient, readFileAsDataUrl, formatBytes } from "@/lib/uploadUtils";
import {
  addToTrash,
  restoreFromTrash,
  getStoredCollection,
  saveStoredCollection,
  createOrGetShareTokenForRecord,
} from "@/lib/appStore";

export interface MediaItem {
  id: string;
  title: string;
  folder: string | null;
  imageUrl: string;
  resolution: string;
  format: "JPG" | "PNG" | "RAW" | "WEBP";
  size: string;
  cameraInfo: string;
  description: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
}

const INITIAL_FOLDERS = [
  "Mimari & İç Mekan",
  "UI / UX İlhamları",
  "Doğa & Minimalizm",
  "Kişisel Çekimler",
];

const PRESET_IMAGES = [
  {
    label: "Nordik Mimari",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Minimalist Çalışma Masası",
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Sisli Dağ Manzarası",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Modern Soyut Sanat",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85",
  },
];

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: "img-1",
    title: "Nordik Minimalist Mimari & Işık Etüdü",
    folder: "Mimari & İç Mekan",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    resolution: "3840 × 2160",
    format: "RAW",
    size: "18.4 MB",
    cameraInfo: "Sony A7IV • 35mm f/1.4 • ISO 100",
    description:
      "Gün batımında doğal ahşap ve brüt beton yüzeylerin sıcak ışıkla buluştuğu İskandinav cephe referansı.",
    tags: ["mimari", "minimalizm", "ışık"],
    createdAt: "Bugün, 16:10",
    isFavorite: true,
  },
  {
    id: "img-2",
    title: "Sıcak Krem & Taş Tonları UI Renk Paleti",
    folder: "UI / UX İlhamları",
    imageUrl:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
    resolution: "2560 × 1440",
    format: "PNG",
    size: "4.2 MB",
    cameraInfo: "Figma Export • DCI-P3",
    description:
      "Kişisel Depo projemiz için ilham alınan editoryal masaüstü kurgusu ve tipografik denge.",
    tags: ["ui-ux", "tasarım", "palet"],
    createdAt: "Dün, 19:45",
    isFavorite: true,
  },
  {
    id: "img-3",
    title: "Kuzey Pasifik Sisli Vadiler",
    folder: "Doğa & Minimalizm",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    resolution: "4096 × 2730",
    format: "JPG",
    size: "8.7 MB",
    cameraInfo: "Fujifilm X-T5 • 23mm f/2 • ISO 160",
    description:
      "Sabahın erken saatlerinde göl yüzeyine yansıyan çam ormanları ve sis katmanları.",
    tags: ["doğa", "manzara", "fujifilm"],
    createdAt: "12 Ekim 2026",
    isFavorite: false,
  },
  {
    id: "img-4",
    title: "Geometrik Gölge ve Dokular #07",
    folder: "Kişisel Çekimler",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85",
    resolution: "3200 × 2400",
    format: "WEBP",
    size: "3.1 MB",
    cameraInfo: "Leica Q3 • 28mm f/1.7",
    description:
      "İç mekanda pencereden süzülen sert öğle güneşinin oluşturduğu keskin kontrastlar.",
    tags: ["gölge", "iç-mekan", "leica"],
    createdAt: "8 Ekim 2026",
    isFavorite: false,
  },
];

export default function MediaContainerPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Lightbox Modal
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  // Folder Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  // Add/Edit Image Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formFolder, setFormFolder] = useState<string>("Mimari & İç Mekan");
  const [formImageUrl, setFormImageUrl] = useState(PRESET_IMAGES[0].url);
  const [formFormat, setFormFormat] = useState<"JPG" | "PNG" | "RAW" | "WEBP">("JPG");
  const [formResolution, setFormResolution] = useState("3840 × 2160");
  const [formCamera, setFormCamera] = useState("Sony A7IV • 35mm f/1.4");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      if (file.type.startsWith("video/")) {
        const dataUrl = await readFileAsDataUrl(file);
        setFormImageUrl(dataUrl);
        setFormResolution("Video Oynatıcı");
        setFormFormat("RAW");
        if (!formTitle.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
          setFormTitle(cleanName);
        }
        setFormCamera(`Video Dosyası • ${formatBytes(file.size)}`);
      } else {
        const res = await compressImageClient(file);
        setFormImageUrl(res.dataUrl);
        setFormResolution(`${res.width} × ${res.height}`);
        const ext = file.name.split(".").pop()?.toUpperCase() || "JPG";
        setFormFormat(ext === "PNG" ? "PNG" : ext === "WEBP" ? "WEBP" : "JPG");
        if (!formTitle.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
          setFormTitle(cleanName);
        }
        setFormCamera(`Cihazdan Yüklendi • ${res.sizeStr}`);
      }
    } catch (err) {
      alert("Medya dosyası okunurken bir hata oluştu.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Toast & Undo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastTrashId, setLastTrashId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredCollection<MediaItem>("media", INITIAL_MEDIA);
    setMediaList(stored);

    const handleSync = () => {
      setMediaList(getStoredCollection<MediaItem>("media", INITIAL_MEDIA));
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

  const syncMedia = (updated: MediaItem[]) => {
    setMediaList(updated);
    saveStoredCollection("media", updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = mediaList.map((m) =>
      m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
    );
    syncMedia(updated);
    if (lightboxItem && lightboxItem.id === id) {
      setLightboxItem({ ...lightboxItem, isFavorite: !lightboxItem.isFavorite });
    }
  };

  const handleDeleteMedia = (item: MediaItem) => {
    if (lightboxItem?.id === item.id) setLightboxItem(null);
    const updated = mediaList.filter((m) => m.id !== item.id);
    syncMedia(updated);

    const trashEntry = addToTrash({
      title: item.title,
      originContainer: "Tasarım İlhamları & Fotoğraf Arşivi",
      type: "image",
      contentPreview: `${item.format} (${item.resolution}) • ${item.description.slice(0, 90)}...`,
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
    const updated = mediaList.map((m) =>
      m.folder === folderName ? { ...m, folder: null } : m
    );
    syncMedia(updated);
    setFolders(folders.filter((f) => f !== folderName));
    if (selectedFolder === folderName) setSelectedFolder("all");
    setFolderToDelete(null);
    showToast(`"${folderName}" silindi, görseller Klasörsüz'e taşındı.`);
  };

  const handleDeleteFolderAndItems = (folderName: string) => {
    const itemsInFolder = mediaList.filter((m) => m.folder === folderName);
    const remaining = mediaList.filter((m) => m.folder !== folderName);
    syncMedia(remaining);

    itemsInFolder.forEach((item) => {
      addToTrash({
        title: item.title,
        originContainer: "Tasarım İlhamları & Fotoğraf Arşivi",
        type: "image",
        contentPreview: `${item.format} (${item.resolution}) • ${item.description.slice(0, 90)}...`,
        originalData: item,
      });
    });

    setFolders(folders.filter((f) => f !== folderName));
    if (selectedFolder === folderName) setSelectedFolder("all");
    setFolderToDelete(null);
    showToast(
      `"${folderName}" ve içindeki ${itemsInFolder.length} görsel çöp kutusuna taşındı.`
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
    setFormImageUrl(PRESET_IMAGES[0].url);
    setFormFormat("JPG");
    setFormResolution("3840 × 2160");
    setFormCamera("Sony A7IV • 35mm f/1.4");
    setFormDescription("");
    setFormTags("tasarım, ilham");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormFolder(item.folder || "");
    setFormImageUrl(item.imageUrl);
    setFormFormat(item.format);
    setFormResolution(item.resolution);
    setFormCamera(item.cameraInfo);
    setFormDescription(item.description);
    setFormTags(item.tags.join(", "));
    setIsModalOpen(true);
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated = mediaList.map((m) =>
        m.id === editingItem.id
          ? {
              ...m,
              title: formTitle.trim(),
              folder: formFolder || null,
              imageUrl: formImageUrl.trim() || PRESET_IMAGES[0].url,
              format: formFormat,
              resolution: formResolution.trim() || "1920 × 1080",
              cameraInfo: formCamera.trim() || "Standart Lens",
              description: formDescription.trim() || "Görsel açıklaması.",
              tags: parsedTags,
            }
          : m
      );
      syncMedia(updated);
      showToast(`"${formTitle.trim()}" güncellendi.`);
    } else {
      const newItem: MediaItem = {
        id: `img-${Date.now()}`,
        title: formTitle.trim(),
        folder: formFolder || null,
        imageUrl: formImageUrl.trim() || PRESET_IMAGES[0].url,
        resolution: formResolution.trim() || "3840 × 2160",
        format: formFormat,
        size: formFormat === "RAW" ? "21.5 MB" : "5.4 MB",
        cameraInfo: formCamera.trim() || "Sony A7IV • 35mm",
        description:
          formDescription.trim() ||
          "Görsel koleksiyonuna eklenen yüksek çözünürlüklü referans kaydı.",
        tags: parsedTags.length > 0 ? parsedTags : ["görsel"],
        createdAt: "Az önce",
        isFavorite: false,
      };
      syncMedia([newItem, ...mediaList]);
      showToast(`"${newItem.title}" görüntü deposuna eklendi.`);
    }

    setIsModalOpen(false);
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesFolder =
      selectedFolder === "all"
        ? true
        : selectedFolder === "favorites"
        ? item.isFavorite
        : selectedFolder === "unorganized"
        ? !item.folder
        : item.folder === selectedFolder;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.cameraInfo.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));

    return matchesFolder && matchesSearch;
  });

  const navigateLightbox = (dir: -1 | 1) => {
    if (!lightboxItem || filteredMedia.length === 0) return;
    const idx = filteredMedia.findIndex((m) => m.id === lightboxItem.id);
    if (idx === -1) return;
    const nextIdx = (idx + dir + filteredMedia.length) % filteredMedia.length;
    setLightboxItem(filteredMedia[nextIdx]);
  };

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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Standart Depo • Görüntü
                </span>
                <span className="text-xs text-stone-400 dark:text-slate-500">1-Seviye Klasör & Galeri</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight mt-0.5">
                Tasarım İlhamları & Fotoğraf Arşivi
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() =>
                window.open("/share/gorsel-koleksiyon-deposu", "_blank")
              }
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 text-sm font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Depoyu Paylaş
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yeni Görsel Ekle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* 1-Level Folder Bar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-rose-600" />
              Görsel Klasörleri (Tek Seviyeli Hiyerarşi)
            </span>
            <button
              onClick={() => setIsNewFolderOpen(!isNewFolderOpen)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
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
                className="flex-1 max-w-xs px-3 py-1.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-rose-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
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
              Tümü ({mediaList.length})
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
              Favoriler ({mediaList.filter((m) => m.isFavorite).length})
            </button>

            {folders.map((folder) => {
              const count = mediaList.filter((m) => m.folder === folder).length;
              const isSelected = selectedFolder === folder;
              return (
                <div
                  key={folder}
                  className={`group flex items-center rounded-xl text-xs font-semibold transition shrink-0 ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-sm"
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
              Klasörsüz ({mediaList.filter((m) => !m.folder).length})
            </button>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Görsel başlığı, kamera/lens bilgisi veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200/90 text-sm focus:outline-none focus:border-rose-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200/80 shadow-sm self-end">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-stone-900 text-white"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
              title="Galeri Görünümü"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-stone-900 text-white"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
              title="Liste Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery Grid / List */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Görsel Bulunamadı
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mt-1 mb-6">
              Seçili klasörde veya arama kriterlerinize uygun bir görsel yok.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yeni Görsel Ekle
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-60 overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setLightboxItem(item)}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-stone-900/80 backdrop-blur-md text-white">
                      {item.format}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/90 backdrop-blur-md text-stone-800">
                      {item.resolution}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
                        item.isFavorite
                          ? "bg-rose-600 text-white"
                          : "bg-white/90 text-stone-700 hover:bg-white"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          item.isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => setLightboxItem(item)}
                      className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-stone-700 hover:bg-white transition cursor-pointer"
                      title="Tam Ekran İncele"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        {item.folder || "Klasörsüz"}
                      </span>
                      <span className="text-xs text-stone-400">{item.size}</span>
                    </div>

                    <h3
                      onClick={() => setLightboxItem(item)}
                      className="text-base font-bold text-stone-900 hover:text-rose-600 transition cursor-pointer line-clamp-1 mb-1.5"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-3">
                      <Camera className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{item.cameraInfo}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const token = createOrGetShareTokenForRecord(
                            item,
                            "image",
                            "Tasarım İlhamları & Fotoğraf Arşivi"
                          );
                          window.open(`/share/${token}`, "_blank");
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Paylaşım Kartını Aç"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 flex items-center justify-between gap-4 shadow-sm hover:border-stone-300 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onClick={() => setLightboxItem(item)}
                    className="w-20 h-16 rounded-xl object-cover shrink-0 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-white">
                        {item.format}
                      </span>
                      <span className="text-xs font-medium text-rose-700">
                        {item.folder || "Klasörsüz"}
                      </span>
                      <span className="text-xs text-stone-400">
                        {item.resolution} • {item.size}
                      </span>
                    </div>
                    <h4
                      onClick={() => setLightboxItem(item)}
                      className="text-sm font-bold text-stone-900 truncate cursor-pointer hover:text-rose-600"
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">
                      {item.cameraInfo} — {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-2 rounded-xl cursor-pointer ${
                      item.isFavorite ? "text-rose-600" : "text-stone-400"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${item.isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      const token = createOrGetShareTokenForRecord(item, "image", "Tasarım İlhamları & Fotoğraf Arşivi");
                      window.open(`/share/${token}`, "_blank");
                    }}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Paylaş"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(item)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Fullscreen Preview Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigateLightbox(-1)}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigateLightbox(1)}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-600 text-white">
                    {lightboxItem.format}
                  </span>
                  <span className="text-xs text-stone-400">
                    {lightboxItem.resolution} • {lightboxItem.size}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{lightboxItem.title}</h3>
                <p className="text-sm text-stone-300 leading-relaxed mb-4">
                  {lightboxItem.description}
                </p>
                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 text-xs text-stone-300 space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Klasör:</span>
                    <span className="font-semibold">
                      {lightboxItem.folder || "Klasörsüz"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Kamera / EXIF:</span>
                    <span className="font-semibold">{lightboxItem.cameraInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Eklenme:</span>
                    <span>{lightboxItem.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-stone-800">
                <button
                  onClick={() =>
                    exportImageFile(
                      lightboxItem.title,
                      lightboxItem.format,
                      lightboxItem.imageUrl
                    )
                  }
                  className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </button>
                <button
                  onClick={() => {
                    const token = createOrGetShareTokenForRecord(
                      lightboxItem,
                      "image",
                      "Tasarım İlhamları & Fotoğraf Arşivi"
                    );
                    window.open(`/share/${token}`, "_blank");
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Paylaşım Kartını Aç
                </button>
                <button
                  onClick={() => handleDeleteMedia(lightboxItem)}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-rose-950 text-rose-400 transition cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Option Folder Delete Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              &ldquo;{folderToDelete}&rdquo; Klasörünü Sil
            </h3>
            <p className="text-sm text-stone-600 mt-1 mb-6">
              Bu klasörün içindeki görsellere ne yapılmasını istersiniz?
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

      {/* Add / Edit Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-stone-900">
                {editingItem ? "Görseli Düzenle" : "Yeni Görsel Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Görsel Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: Minimalist Mimari Cephe Referansı"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Fotoğraf Seçimi & Yükleme
                </label>

                {/* Cihazdan Dosya Seçme / Yükleme Alanı */}
                <div className="border-2 border-dashed border-rose-300 dark:border-rose-900/60 rounded-2xl p-4 text-center hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition cursor-pointer relative mb-3 bg-rose-50/20 dark:bg-slate-900">
                  <input
                    type="file"
                    accept="image/*,video/*,.mp4,.webm,.mov,.mkv,.avi"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-rose-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-bold">Medya işleniyor ve optimize ediliyor...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 text-rose-500 mb-1" />
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Bilgisayarınızdan Fotoğraf veya Video Seçin ya da Sürükleyin
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        PNG, JPG, WEBP, MP4, WEBM • Otomatik çözünürlük & optimizasyon
                      </p>
                    </div>
                  )}
                </div>

                {/* Küçük Resim Önizlemesi */}
                {formImageUrl && (
                  <div className="mb-3 flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                    <img
                      src={formImageUrl}
                      alt="Seçilen Görsel"
                      className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                    />
                    <div className="text-[11px] text-stone-500">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">Seçili Görsel Hazır</span>
                      <span>Format: {formFormat} • {formResolution}</span>
                    </div>
                  </div>
                )}

                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Veya Hazır İlham Örneklerinden Seçin:
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => {
                        setFormImageUrl(p.url);
                        setFormResolution("3840 × 2160");
                      }}
                      className={`p-1 rounded-xl border text-[10px] font-medium overflow-hidden transition cursor-pointer ${
                        formImageUrl === p.url
                          ? "border-rose-600 ring-2 ring-rose-500/20"
                          : "border-stone-200 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-10 object-cover rounded-lg mb-1"
                      />
                      <span className="block truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Klasör
                  </label>
                  <select
                    value={formFolder}
                    onChange={(e) => setFormFolder(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-rose-500"
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
                    value={formFormat}
                    onChange={(e) =>
                      setFormFormat(
                        e.target.value as "JPG" | "PNG" | "RAW" | "WEBP"
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                    <option value="RAW">RAW</option>
                    <option value="WEBP">WEBP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Çözünürlük
                  </label>
                  <input
                    type="text"
                    value={formResolution}
                    onChange={(e) => setFormResolution(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Kamera / EXIF veya Kaynak Bilgisi
                </label>
                <input
                  type="text"
                  value={formCamera}
                  onChange={(e) => setFormCamera(e.target.value)}
                  placeholder="Sony A7IV • 35mm f/1.4"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Açıklama / Görsel Notu
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Görselin hikayesi veya tasarım notu..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition cursor-pointer"
                >
                  {editingItem ? "Değişiklikleri Kaydet" : "Görseli Ekle"}
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition cursor-pointer"
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
