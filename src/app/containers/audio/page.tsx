"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Music,
  Mic,
  Play,
  Pause,
  Plus,
  Search,
  Folder,
  FolderPlus,
  Heart,
  Share2,
  Trash2,
  Edit3,
  Clock,
  Volume2,
  FileAudio,
  Sparkles,
  Tag,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  Headphones,
  FastForward,
  AlignLeft,
  Download,
  Upload,
  CheckCircle2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BatchActionBar from "@/components/BatchActionBar";
import { exportAudioFile } from "@/lib/exportUtils";
import { formatBytes } from "@/lib/uploadUtils";
import {
  addToTrash,
  restoreFromTrash,
  addBatchToTrash,
  restoreBatchFromTrash,
  getStoredCollection,
  saveStoredCollection,
  createOrGetShareTokenForRecord,
} from "@/lib/appStore";

export interface AudioItem {
  id: string;
  title: string;
  folder: string | null;
  durationSec: number;
  durationLabel: string;
  format: "MP3" | "WAV" | "M4A";
  bitrate: string;
  size: string;
  transcript: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
  waveform: number[];
  audioUrl?: string;
}

const INITIAL_FOLDERS = [
  "Podcast Taslakları",
  "Toplantı Kayıtları",
  "Sesli Fikirler",
  "Müzik & Demo",
];

const INITIAL_AUDIOS: AudioItem[] = [
  {
    id: "au-1",
    title: "Bölüm 12: Yapay Zekâ Çağında Kişisel Hafıza",
    folder: "Podcast Taslakları",
    durationSec: 272,
    durationLabel: "04:32",
    format: "WAV",
    bitrate: "1411 kbps",
    size: "42.8 MB",
    transcript:
      "Giriş: Bugün dijital çağda bilgileri neden sadece kaydetmekle kalmayıp anlamlandırmamız gerektiğini konuşuyoruz. İkinci beyin kavramı, klasik klasörleme sistemlerinin ötesinde bağlamsal depolamayı gerektirir...",
    tags: ["podcast", "yapay-zeka", "hafıza"],
    createdAt: "Bugün, 14:20",
    isFavorite: true,
    waveform: [35, 60, 45, 80, 95, 70, 50, 85, 65, 40, 75, 90, 60, 55, 80, 45, 70, 85, 50, 40, 65, 90, 75, 55],
  },
  {
    id: "au-2",
    title: "Q4 Ürün Yol Haritası Beyin Fırtınası",
    folder: "Toplantı Kayıtları",
    durationSec: 518,
    durationLabel: "08:38",
    format: "M4A",
    bitrate: "256 kbps",
    size: "16.4 MB",
    transcript:
      "Ekip ile yapılan haftalık değerlendirme: 1) Paylaşım kartlarının vitrin görünümü tamamlanacak. 2) Ses, Görüntü ve Dosya depolarında tek seviyeli klasör mimarisi korunacak. 3) Çöp kutusu 30 gün kuralı aktif.",
    tags: ["toplantı", "yol-haritası", "ürün"],
    createdAt: "Dün, 11:05",
    isFavorite: false,
    waveform: [25, 40, 55, 70, 60, 85, 90, 45, 35, 60, 75, 80, 50, 65, 95, 70, 55, 40, 60, 75, 50, 35, 45, 30],
  },
  {
    id: "au-3",
    title: "Gece Yarısı Kitap Özeti Sesli Notu",
    folder: "Sesli Fikirler",
    durationSec: 145,
    durationLabel: "02:25",
    format: "MP3",
    bitrate: "320 kbps",
    size: "5.8 MB",
    transcript:
      "Atomik Alışkanlıklar 4. Bölüm üzerine sesli düşünce kaydı: Sistemler hedeflerden daha önemlidir. Her gün %1 daha iyi olmak yıl sonunda 37 kat gelişim sağlar.",
    tags: ["kitap", "sesli-not", "felsefe"],
    createdAt: "14 Ekim 2026",
    isFavorite: true,
    waveform: [50, 70, 85, 60, 45, 90, 75, 55, 40, 65, 80, 95, 70, 50, 35, 60, 75, 85, 65, 45, 55, 70, 60, 40],
  },
  {
    id: "au-4",
    title: "Lo-Fi Ambient Piyano Akor Denemesi #4",
    folder: "Müzik & Demo",
    durationSec: 94,
    durationLabel: "01:34",
    format: "WAV",
    bitrate: "1411 kbps",
    size: "24.1 MB",
    transcript:
      "Fmaj7 - Em7 - Dm7 - Cmaj7 yürüyüşü. BPM: 78. Arka planda hafif yağmur ambiyansı ile çalışma odaklı arka plan müziği taslağı.",
    tags: ["müzik", "piyano", "demo"],
    createdAt: "10 Ekim 2026",
    isFavorite: false,
    waveform: [60, 80, 95, 85, 70, 75, 90, 100, 80, 65, 70, 85, 90, 75, 60, 50, 65, 80, 70, 55, 60, 75, 50, 35],
  },
];

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AudioContainerPage() {
  const [audios, setAudios] = useState<AudioItem[]>(INITIAL_AUDIOS);
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");

  // Audio Player State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Folder Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  // Add/Edit Audio Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AudioItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formFolder, setFormFolder] = useState<string>("Sesli Fikirler");
  const [formDuration, setFormDuration] = useState("03:15");
  const [formFormat, setFormFormat] = useState<"MP3" | "WAV" | "M4A">("MP3");
  const [formTranscript, setFormTranscript] = useState("");
  const [formTags, setFormTags] = useState("");
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedAudioUrl(url);

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
    setFormTitle(cleanTitle);

    const ext = file.name.split(".").pop()?.toUpperCase();
    if (ext === "WAV" || ext === "M4A" || ext === "MP3") {
      setFormFormat(ext as any);
    }

    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      const sec = Math.round(tempAudio.duration);
      if (sec && !isNaN(sec)) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        setFormDuration(`${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`);
      }
    };
  };

  // Toast & Undo & Batch
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastTrashId, setLastTrashId] = useState<string | null>(null);
  const [lastTrashBatchIds, setLastTrashBatchIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = getStoredCollection<AudioItem>("audios", INITIAL_AUDIOS);
    setAudios(stored);

    const handleSync = () => {
      setAudios(getStoredCollection<AudioItem>("audios", INITIAL_AUDIOS));
    };
    window.addEventListener("psc-store-updated", handleSync);
    return () => window.removeEventListener("psc-store-updated", handleSync);
  }, []);

  // Simulated playback timer
  useEffect(() => {
    if (!playingId) return;
    const currentAudio = audios.find((a) => a.id === playingId);
    if (!currentAudio) return;

    const interval = setInterval(() => {
      setProgressMap((prev) => {
        const currentSec = prev[playingId] || 0;
        const nextSec = currentSec + 1 * playbackSpeed;
        if (nextSec >= currentAudio.durationSec) {
          setPlayingId(null);
          return { ...prev, [playingId]: 0 };
        }
        return { ...prev, [playingId]: nextSec };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playingId, playbackSpeed, audios]);

  const showToast = (msg: string, trashId?: string) => {
    setToastMessage(msg);
    setLastTrashId(trashId || null);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredAudios.map((a) => a.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const itemsToDelete = audios.filter((a) => selectedIds.includes(a.id));
    const remaining = audios.filter((a) => !selectedIds.includes(a.id));
    syncAudios(remaining);

    const trashEntries = addBatchToTrash(
      itemsToDelete.map((item) => ({
        title: item.title,
        originContainer: "Sesli Notlar & Podcast Fikirleri",
        type: "audio",
        contentPreview: `${item.format} • ${item.durationLabel} • ${item.transcript.slice(0, 90)}...`,
        originalData: item,
      }))
    );

    const ids = trashEntries.map((t) => t.id);
    setLastTrashBatchIds(ids);
    setLastTrashId(null);
    setSelectedIds([]);
    showToast(`${itemsToDelete.length} ses kaydı çöp kutusuna taşındı.`);
  };

  const handleBatchUndo = () => {
    if (lastTrashBatchIds.length === 0) return;
    restoreBatchFromTrash(lastTrashBatchIds);
    setToastMessage(null);
    setLastTrashBatchIds([]);
  };

  const syncAudios = (updated: AudioItem[]) => {
    setAudios(updated);
    saveStoredCollection("audios", updated);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const target = audios.find((a) => a.id === id);
      if (target?.audioUrl && typeof window !== "undefined") {
        try {
          audioRef.current = new Audio(target.audioUrl);
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().catch(() => {});
          audioRef.current.onended = () => setPlayingId(null);
        } catch {}
      }
      setPlayingId(id);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
    if (audioRef.current) {
      audioRef.current.playbackRate = speeds[nextIdx];
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = audios.map((a) =>
      a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
    );
    syncAudios(updated);
  };

  const handleDeleteAudio = (item: AudioItem) => {
    if (playingId === item.id) setPlayingId(null);
    const updated = audios.filter((a) => a.id !== item.id);
    syncAudios(updated);

    const trashEntry = addToTrash({
      title: item.title,
      originContainer: "Sesli Notlar & Podcast Fikirleri",
      type: "audio",
      contentPreview: `${item.format} • ${item.durationLabel} • ${item.transcript.slice(0, 90)}...`,
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

  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename || !renameFolderName.trim()) return;
    const newName = renameFolderName.trim();
    if (newName === folderToRename) {
      setFolderToRename(null);
      return;
    }
    const updatedFolders = folders.map((f) => (f === folderToRename ? newName : f));
    setFolders(updatedFolders);
    const updatedAudios = audios.map((a) => (a.folder === folderToRename ? { ...a, folder: newName } : a));
    syncAudios(updatedAudios);
    if (selectedFolder === folderToRename) setSelectedFolder(newName);
    setFolderToRename(null);
    setRenameFolderName("");
    showToast(`Klasör adı "${newName}" olarak güncellendi.`);
  };

  const handleDeleteFolderKeepItems = (folderName: string) => {
    const updated = audios.map((a) =>
      a.folder === folderName ? { ...a, folder: null } : a
    );
    syncAudios(updated);
    setFolders(folders.filter((f) => f !== folderName));
    if (selectedFolder === folderName) setSelectedFolder("all");
    setFolderToDelete(null);
    showToast(`"${folderName}" silindi, içerikler Klasörsüz'e taşındı.`);
  };

  const handleDeleteFolderAndItems = (folderName: string) => {
    const itemsInFolder = audios.filter((a) => a.folder === folderName);
    const remaining = audios.filter((a) => a.folder !== folderName);
    syncAudios(remaining);

    itemsInFolder.forEach((item) => {
      addToTrash({
        title: item.title,
        originContainer: "Sesli Notlar & Podcast Fikirleri",
        type: "audio",
        contentPreview: `${item.format} • ${item.durationLabel} • ${item.transcript.slice(0, 90)}...`,
        originalData: item,
      });
    });

    setFolders(folders.filter((f) => f !== folderName));
    if (selectedFolder === folderName) setSelectedFolder("all");
    setFolderToDelete(null);
    showToast(
      `"${folderName}" ve içindeki ${itemsInFolder.length} ses kaydı çöp kutusuna taşındı.`
    );
  };

  // Modal Open/Save
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
    setFormDuration("03:45");
    setFormFormat("MP3");
    setFormTranscript("");
    setFormTags("sesli-not, fikir");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AudioItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormFolder(item.folder || "");
    setFormDuration(item.durationLabel);
    setFormFormat(item.format);
    setFormTranscript(item.transcript);
    setFormTags(item.tags.join(", "));
    setIsModalOpen(true);
  };

  const handleSaveAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parts = formDuration.split(":");
    const durSec =
      parts.length === 2
        ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
        : 180;

    const parsedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated = audios.map((a) =>
        a.id === editingItem.id
          ? {
              ...a,
              title: formTitle.trim(),
              folder: formFolder || null,
              durationLabel: formDuration,
              durationSec: durSec || 180,
              format: formFormat,
              transcript: formTranscript.trim() || "Sesli not açıklaması bulunmuyor.",
              tags: parsedTags,
            }
          : a
      );
      syncAudios(updated);
      showToast(`"${formTitle.trim()}" güncellendi.`);
    } else {
      const newAudio: AudioItem = {
        id: `au-${Date.now()}`,
        title: formTitle.trim(),
        folder: formFolder || null,
        durationSec: durSec || 180,
        durationLabel: formDuration || "03:00",
        format: formFormat,
        bitrate: formFormat === "WAV" ? "1411 kbps" : "320 kbps",
        size: formFormat === "WAV" ? "31.4 MB" : "7.2 MB",
        transcript:
          formTranscript.trim() ||
          "Yeni eklenen ses kaydı özeti ve konuşma metni.",
        tags: parsedTags.length > 0 ? parsedTags : ["sesli-not"],
        createdAt: "Az önce",
        isFavorite: false,
        waveform: [40, 65, 80, 55, 90, 75, 50, 85, 95, 60, 45, 70, 85, 65, 50, 75, 90, 60, 40, 70, 80, 55, 45, 60],
        audioUrl: uploadedAudioUrl || undefined,
      };
      syncAudios([newAudio, ...audios]);
      showToast(`"${newAudio.title}" ses deposuna eklendi.`);
    }

    setIsModalOpen(false);
  };

  // Filtered List
  const filteredAudios = audios.filter((item) => {
    const matchesFolder =
      selectedFolder === "all"
        ? true
        : selectedFolder === "favorites"
        ? item.isFavorite
        : selectedFolder === "unorganized"
        ? !item.folder
        : item.folder === selectedFolder;

    const matchesFormat =
      selectedFormat === "all" ? true : item.format === selectedFormat;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.transcript.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));

    return matchesFolder && matchesFormat && matchesSearch;
  });

  const totalSeconds = audios.reduce((acc, a) => acc + a.durationSec, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  Standart Depo • Ses
                </span>
                <span className="text-xs text-stone-400 dark:text-slate-500">1-Seviye Klasör Mimarisi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight mt-0.5">
                Sesli Notlar & Podcast Fikirleri
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => window.open("/share/sesli-notlar-deposu", "_blank")}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 text-sm font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Depoyu Paylaş
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yeni Ses Kaydı
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Toplam Kayıt
              </p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {audios.length} Ses Dosyası
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FileAudio className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Toplam Süre
              </p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {totalMinutes} Dakika
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <Headphones className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Klasör Sayısı
              </p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {folders.length} Klasör
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
              <Folder className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Oynatma Hızı
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-700">
                  {playbackSpeed}x
                </span>
                <button
                  onClick={cycleSpeed}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200/60 transition cursor-pointer"
                >
                  Değiştir
                </button>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FastForward className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 1-Level Folder Bar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-600" />
              Klasörler (Tek Seviyeli Hiyerarşi)
            </span>
            <button
              onClick={() => setIsNewFolderOpen(!isNewFolderOpen)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
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
                className="flex-1 max-w-xs px-3 py-1.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 cursor-pointer"
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
              Tümü ({audios.length})
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
              Favoriler ({audios.filter((a) => a.isFavorite).length})
            </button>

            {folders.map((folder) => {
              const count = audios.filter((a) => a.folder === folder).length;
              const isSelected = selectedFolder === folder;
              return (
                <div
                  key={folder}
                  className={`group flex items-center rounded-xl text-xs font-semibold transition shrink-0 ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-sm"
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
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToRename(folder);
                        setRenameFolderName(folder);
                      }}
                      className={`px-1 py-2 opacity-60 hover:opacity-100 transition cursor-pointer ${
                        isSelected ? "text-white" : "text-stone-400 hover:text-amber-600"
                      }`}
                      title="Klasörü Yeniden Adlandır"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
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
              Klasörsüz ({audios.filter((a) => !a.folder).length})
            </button>
          </div>
        </div>

        {/* Search & Format Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ses kaydı başlığı, konuşma metni (transkript) veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200/90 text-sm focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-stone-200/80 shadow-sm">
            {(["all", "MP3", "WAV", "M4A"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedFormat === fmt
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {fmt === "all" ? "Tüm Formatlar" : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Audio List */}
        {filteredAudios.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Ses Kaydı Bulunamadı
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mt-1 mb-6">
              Arama kriterlerinize veya seçili klasöre ait bir ses kaydı yok. Yeni bir sesli not ekleyebilirsiniz.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              İlk Ses Kaydını Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredAudios.map((item) => {
              const isPlaying = playingId === item.id;
              const currentSec = progressMap[item.id] || 0;
              const progressPct = Math.min(
                100,
                Math.round((currentSec / item.durationSec) * 100)
              );

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 p-6 shadow-sm hover:shadow-md ${
                    selectedIds.includes(item.id)
                      ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/15"
                      : isPlaying
                      ? "border-amber-400 ring-2 ring-amber-500/15"
                      : "border-stone-200/80 hover:border-stone-300"
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelect(item.id, e)}
                        className="p-1 text-stone-400 hover:text-amber-600 transition cursor-pointer shrink-0"
                        title={selectedIds.includes(item.id) ? "Seçimi Kaldır" : "Kaydı Seç"}
                      >
                        {selectedIds.includes(item.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-amber-600 fill-amber-100" />
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-stone-300 hover:border-amber-500" />
                        )}
                      </button>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                        {item.format}
                      </span>
                      <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                        {item.folder || "Klasörsüz"}
                      </span>
                      <span className="text-xs text-stone-400">
                        {item.size} • {item.bitrate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          item.isFavorite
                            ? "text-rose-500 bg-rose-50"
                            : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                        }`}
                        title="Favorilere Ekle"
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
                            "audio",
                            "Sesli Notlar & Podcast Fikirleri"
                          );
                          window.open(`/share/${token}`, "_blank");
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
                        title="Bu Ses Kaydını Paylaş"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          exportAudioFile({
                            title: item.title,
                            durationLabel: item.durationLabel,
                            format: item.format,
                          })
                        }
                        className="p-2 rounded-xl text-stone-400 hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
                        title="Ses Dosyasını İndir (.mp3)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAudio(item)}
                        className="p-2 rounded-xl text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-stone-900 mb-4 leading-snug">
                    {item.title}
                  </h3>

                  {/* Waveform Player Box */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200/70 mb-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => togglePlay(item.id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer ${
                          isPlaying
                            ? "bg-amber-600 text-white"
                            : "bg-stone-900 text-white hover:bg-amber-600"
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>

                      {/* Interactive Waveform Bars */}
                      <div
                        className="flex-1 flex items-center gap-1 h-12 cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickRatio = Math.max(
                            0,
                            Math.min(1, (e.clientX - rect.left) / rect.width)
                          );
                          setProgressMap((prev) => ({
                            ...prev,
                            [item.id]: Math.round(clickRatio * item.durationSec),
                          }));
                        }}
                      >
                        {item.waveform.map((val, idx) => {
                          const barPct = ((idx + 1) / item.waveform.length) * 100;
                          const isActiveBar = barPct <= progressPct;
                          return (
                            <div
                              key={idx}
                              style={{ height: `${Math.max(20, val)}%` }}
                              className={`flex-1 rounded-full transition-all duration-150 ${
                                isActiveBar
                                  ? "bg-amber-600"
                                  : isPlaying
                                  ? "bg-amber-300/70"
                                  : "bg-stone-300"
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-stone-800">
                          {formatSeconds(currentSec)} / {item.durationLabel}
                        </div>
                        <button
                          onClick={cycleSpeed}
                          className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                        >
                          {playbackSpeed}x Hız
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transcript / Voice Summary */}
                  <div className="bg-stone-50/80 rounded-xl p-3.5 border border-stone-200/50 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                      <AlignLeft className="w-3.5 h-3.5 text-amber-600" />
                      Transkript & Sesli Not Özeti
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {item.transcript}
                    </p>
                  </div>

                  {/* Footer Tags & Date */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {item.createdAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Kayan Çoklu Eylem Çubuğu */}
        <BatchActionBar
          selectedCount={selectedIds.length}
          totalCount={filteredAudios.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onDeleteBatch={handleBatchDelete}
          onClose={handleDeselectAll}
          deleteLabel="Seçilenleri Sil"
        />
      </main>

      {/* 2-Option Folder Delete Modal (Section 10 Rule) */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              &ldquo;{folderToDelete}&rdquo; Klasörünü Sil
            </h3>
            <p className="text-sm text-stone-600 mt-1 mb-6">
              Bu klasörün içindeki ses kayıtlarına ne yapılmasını istersiniz?
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

      {/* Folder Rename Modal */}
      {folderToRename && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              Klasörü Yeniden Adlandır
            </h3>
            <p className="text-xs text-stone-500">
              &ldquo;{folderToRename}&rdquo; klasörü için yeni bir isim belirleyin.
            </p>
            <form onSubmit={handleRenameFolder} className="space-y-4">
              <input
                type="text"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                placeholder="Klasör Adı"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold outline-none focus:border-amber-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFolderToRename(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-md hover:bg-amber-700 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Audio Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-stone-900">
                {editingItem ? "Ses Kaydını Düzenle" : "Yeni Ses Kaydı Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAudio} className="space-y-4">
              {/* Cihazdan Ses Yükleme Alanı */}
              <div className="border-2 border-dashed border-amber-300 dark:border-amber-900/60 rounded-2xl p-4 text-center hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition cursor-pointer relative bg-amber-50/20 dark:bg-slate-900">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a"
                  onChange={handleAudioFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-amber-500 mb-1" />
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Cihazınızdan Ses Dosyası Seçin (.mp3, .wav, .m4a)
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {uploadedAudioUrl ? "✅ Ses dosyası seçildi ve süre algılandı" : "Süre ve format otomatik algılanır"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Kayıt Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: Bölüm 13 Podcast Giriş Kaydı"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-amber-500"
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
                      setFormFormat(e.target.value as "MP3" | "WAV" | "M4A")
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="MP3">MP3</option>
                    <option value="WAV">WAV</option>
                    <option value="M4A">M4A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Süre (DK:SN)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="04:15"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Transkript / Sesli Not Özeti
                </label>
                <textarea
                  rows={3}
                  value={formTranscript}
                  onChange={(e) => setFormTranscript(e.target.value)}
                  placeholder="Ses kaydının metin dökümü veya önemli dakikaların notları..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  Etiketler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="podcast, sesli-not, toplantı"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition cursor-pointer"
                >
                  {editingItem ? "Değişiklikleri Kaydet" : "Kaydı Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Undo Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-medium">{toastMessage}</span>
          {(lastTrashId || lastTrashBatchIds.length > 0) && (
            <button
              onClick={lastTrashBatchIds.length > 0 ? handleBatchUndo : handleUndo}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition cursor-pointer"
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
