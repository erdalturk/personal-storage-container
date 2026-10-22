"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Code2,
  Compass,
  GraduationCap,
  Plus,
  Search,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  FileText,
  Music,
  Image as ImageIcon,
  FolderArchive,
  ArrowUpDown,
  Sparkles,
  Share2,
  MoreVertical,
  Calendar,
  Layers,
  ChevronRight,
  X,
  CheckCircle2,
  Eye,
  Upload,
  Loader2,
} from "lucide-react";
import {
  addToTrash,
  activateShareToken,
  getStoredCollection,
  saveStoredCollection,
  searchAllItems,
  GlobalSearchResult,
  getCurrentUser,
  hasMasterPin,
  setMasterPin,
  verifyMasterPin,
  resetMasterPinForDemo,
} from "@/lib/appStore";
import { autoIngestFile } from "@/lib/uploadUtils";
import ThemeToggle from "@/components/ThemeToggle";

// Akıllı Depo Tanımları (Vitrindeki 4 Sabit Kart)
const SMART_CONTAINERS = [
  {
    id: "movie",
    title: "Film & Dizi Deposu",
    badge: "Kültür & Sanat",
    desc: "Afişler, yönetmen, oyuncu ve fragmanlar. İzlediklerin ve izlenecekler.",
    icon: Film,
    color: "from-purple-500 to-indigo-600",
    bgSoft: "bg-purple-50 text-purple-700 border-purple-200",
    shadow: "hover:shadow-purple-200",
    tags: ["TMDB Entegrasyonu", "İzlendi / İzlenecek", "Favoriler"],
  },
  {
    id: "code",
    title: "Kod Parçacıkları Deposu",
    badge: "Yazılım & Teknik",
    desc: "Syntax highlighting, dil seçimi, etiketler ve tek tıkla kopyalama.",
    icon: Code2,
    color: "from-emerald-500 to-teal-600",
    bgSoft: "bg-emerald-50 text-emerald-700 border-emerald-200",
    shadow: "hover:shadow-emerald-200",
    tags: ["Syntax Highlighting", "TypeScript / Python", "Hızlı Arama"],
  },
  {
    id: "travel",
    title: "Gezi & Seyahat Anıları",
    badge: "Anı & Yaşam",
    desc: "Şehirler, rotalar, tarihler, mekan notları ve fotoğraf albümleri.",
    icon: Compass,
    color: "from-amber-500 to-orange-600",
    bgSoft: "bg-amber-50 text-amber-700 border-amber-200",
    shadow: "hover:shadow-amber-200",
    tags: ["Harita / Konum", "Fotoğraflar", "Seyahat Notları"],
  },
  {
    id: "study",
    title: "Ders & Çalışma Notları",
    badge: "Eğitim & Dosya",
    desc: "Ders adı, konu, vize/final slaytları, PDF okuyucu ve kişisel özetler.",
    icon: GraduationCap,
    color: "from-sky-500 to-blue-600",
    bgSoft: "bg-sky-50 text-sky-700 border-sky-200",
    shadow: "hover:shadow-sky-200",
    tags: ["PDF / Doküman", "Özet Notlar", "Vize & Final"],
  },
];

// Standart Depo Formatları (5. Kart tıklandığında seçilecek türler)
const STANDARD_FORMATS = [
  {
    id: "text",
    title: "Metin Deposu",
    desc: "Düz metin, şiir, günlük veya fikir notları. Kelime ve dize istatistikleri.",
    icon: FileText,
    color: "bg-blue-500",
    preview: "Dize ve kıta düzeni, kelime & karakter sayacı desteği.",
  },
  {
    id: "audio",
    title: "Ses Deposu",
    desc: "Ses kayıtları, sesli notlar, müzik fikirleri veya podcast taslakları.",
    icon: Music,
    color: "bg-rose-500",
    preview: "Dalga formu (waveform) önizlemesi ve oynatıcı.",
  },
  {
    id: "image",
    title: "Görüntü Deposu",
    desc: "Fotoğraflar, taranmış anılar, çizimler ve görsel koleksiyonlar.",
    icon: ImageIcon,
    color: "bg-amber-500",
    preview: "Galeri görünümü, etiketleme ve tam ekran lightbox.",
  },
  {
    id: "file",
    title: "Dosya & Belge Deposu",
    desc: "PDF'ler, arşiv dosyaları (zip), sunumlar ve belgeler.",
    icon: FolderArchive,
    color: "bg-emerald-500",
    preview: "Belge önizleme, boyut takibi ve hızlı indirme.",
  },
];

// Demo Kullanıcı Depoları (İlk görünüm için gerçekçi örnekler)
interface ContainerItem {
  id: string;
  title: string;
  type: "smart" | "standard";
  formatTitle: string;
  itemCount: number;
  lastUpdated: string;
  isLocked: boolean;
  coverGradient: string;
  icon?: any;
}

function getContainerIcon(item: ContainerItem) {
  if (typeof item.icon === "function") return item.icon;
  if (
    item.icon &&
    typeof item.icon === "object" &&
    ("render" in item.icon || "$$typeof" in item.icon)
  ) {
    return item.icon;
  }
  const title = (item.formatTitle || item.title || "").toLowerCase();
  const id = item.id || "";

  if (title.includes("film") || title.includes("sinema") || id === "c1") return Film;
  if (title.includes("kod") || title.includes("snippet") || id === "c2") return Code2;
  if (title.includes("gezi") || title.includes("seyahat") || id === "c3") return Compass;
  if (title.includes("ders") || title.includes("algoritma") || id === "c4") return GraduationCap;
  if (title.includes("metin") || title.includes("şiir") || id === "c5") return FileText;
  if (title.includes("ses") || title.includes("müzik")) return Music;
  if (title.includes("görüntü") || title.includes("foto")) return ImageIcon;
  if (title.includes("dosya") || title.includes("belge")) return FolderArchive;
  return Layers;
}

const INITIAL_CONTAINERS: ContainerItem[] = [
  {
    id: "c1",
    title: "Sinema Kulübü & Başyapıtlar",
    type: "smart",
    formatTitle: "Film & Dizi",
    itemCount: 38,
    lastUpdated: "2 saat önce",
    isLocked: false,
    coverGradient: "from-purple-600 via-indigo-600 to-blue-700",
    icon: Film,
  },
  {
    id: "c2",
    title: "Frontend & Fullstack Snippet'lar",
    type: "smart",
    formatTitle: "Kod Parçacıkları",
    itemCount: 54,
    lastUpdated: "Dün",
    isLocked: false,
    coverGradient: "from-emerald-600 via-teal-600 to-cyan-700",
    icon: Code2,
  },
  {
    id: "c3",
    title: "Yaz 2026 Ege & Akdeniz Gezisi",
    type: "smart",
    formatTitle: "Gezi & Seyahat",
    itemCount: 124,
    lastUpdated: "3 gün önce",
    isLocked: false,
    coverGradient: "from-amber-500 via-orange-500 to-red-600",
    icon: Compass,
  },
  {
    id: "c4",
    title: "Yapay Zekâ & Algoritmalar Dersi",
    type: "smart",
    formatTitle: "Ders & Notlar",
    itemCount: 16,
    lastUpdated: "5 gün önce",
    isLocked: false,
    coverGradient: "from-sky-500 via-blue-600 to-indigo-700",
    icon: GraduationCap,
  },
  {
    id: "c5",
    title: "Gece Düşünceleri & Şiirlerim",
    type: "standard",
    formatTitle: "Metin",
    itemCount: 22,
    lastUpdated: "Geçen hafta",
    isLocked: true,
    coverGradient: "from-slate-700 via-zinc-800 to-neutral-900",
    icon: FileText,
  },
  {
    id: "c6",
    title: "Sesli Notlar & Podcast Fikirleri",
    type: "standard",
    formatTitle: "Ses",
    itemCount: 4,
    lastUpdated: "Bugün",
    isLocked: false,
    coverGradient: "from-amber-600 via-orange-600 to-amber-800",
    icon: Music,
  },
  {
    id: "c7",
    title: "Tasarım İlhamları & Fotoğraf Arşivi",
    type: "standard",
    formatTitle: "Görüntü",
    itemCount: 4,
    lastUpdated: "Dün",
    isLocked: false,
    coverGradient: "from-rose-600 via-pink-600 to-rose-800",
    icon: ImageIcon,
  },
  {
    id: "c8",
    title: "Sözleşmeler, Faturalar & Belgelerim",
    type: "standard",
    formatTitle: "Dosya & Belge",
    itemCount: 4,
    lastUpdated: "Bugün",
    isLocked: false,
    coverGradient: "from-emerald-700 via-teal-700 to-slate-800",
    icon: FolderArchive,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "alpha" | "manual">("updated");
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "smart" | "standard">("all");

  // Global Arama & Komut Paleti (Ctrl + K) State'leri
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [userName, setUserName] = useState("Erdal Türk");
  const [userAvatar, setUserAvatar] = useState("ET");

  // Evrensel Dosya Yükleyici State'leri
  const [isIngestingFile, setIsIngestingFile] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState<{
    title: string;
    containerName: string;
    route: string;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleUniversalUpload = async (file: File) => {
    setIsIngestingFile(true);
    try {
      const res = await autoIngestFile(file);
      setIngestSuccess({
        title: res.title,
        containerName: res.containerName,
        route: res.route,
      });
      setTimeout(() => {
        setIngestSuccess((curr) => (curr?.title === res.title ? null : curr));
      }, 9000);
    } catch {
      alert("Dosya yüklenirken bir sorun oluştu.");
    } finally {
      setIsIngestingFile(false);
    }
  };

  useEffect(() => {
    const loadAndMerge = () => {
      const stored = getStoredCollection("containers", INITIAL_CONTAINERS);
      const existingIds = new Set(stored.map((c) => c.id));
      const missingNewDefaults = INITIAL_CONTAINERS.filter(
        (init) =>
          (init.id === "c6" || init.id === "c7" || init.id === "c8") &&
          !existingIds.has(init.id)
      );
      if (missingNewDefaults.length > 0) {
        const merged = [...stored, ...missingNewDefaults];
        saveStoredCollection("containers", merged);
        setContainers(merged);
      } else {
        setContainers(stored);
      }
      const u = getCurrentUser();
      if (u?.name) setUserName(u.name);
      if (u?.avatar) setUserAvatar(u.avatar);
    };

    loadAndMerge();

    const handleUpdate = () => {
      setContainers(getStoredCollection("containers", INITIAL_CONTAINERS));
      const u = getCurrentUser();
      if (u?.name) setUserName(u.name);
      if (u?.avatar) setUserAvatar(u.avatar);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsGlobalSearchOpen(false);
      }
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("psc-store-updated", handleUpdate);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const globalResults: GlobalSearchResult[] = searchAllItems(
    isGlobalSearchOpen ? globalQuery : searchQuery
  );

  // Depo Silme Fonksiyonu (Çöp Kutusuna Atar ve Varsa Paylaşım Bağlantılarını Otomatik İptal Eder)
  const handleDeleteContainer = (container: ContainerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${container.title}" deposunu Çöp Kutusu'na taşımak istediğinize emin misiniz?`)) {
      addToTrash({
        title: container.title,
        originContainer: "Kişisel Depolarım",
        type: "container",
        contentPreview: `${container.formatTitle} • ${container.itemCount} içerik`,
        originalData: container,
      });

      const updated = containers.filter((c) => c.id !== container.id);
      setContainers(updated);
      saveStoredCollection("containers", updated);
    }
  };

  // Depo Kilidi (PIN) Doğrulama Durumları
  const [pinModalTarget, setPinModalTarget] = useState<ContainerItem | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // İlk Kez Master PIN Belirleme Modalı (Kullanıcı ilk defa bir depoyu kilitlediğinde)
  const [firstTimePinTarget, setFirstTimePinTarget] = useState<ContainerItem | null>(null);
  const [newMasterPin, setNewMasterPin] = useState("");
  const [confirmMasterPin, setConfirmMasterPin] = useState("");
  const [firstTimeError, setFirstTimeError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Kilitlenme sayacı
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const navigateToContainer = (target: ContainerItem) => {
    if (target.formatTitle === "Metin" || target.id === "c5") {
      router.push("/containers/text");
    } else if (target.formatTitle === "Film & Dizi" || target.id === "c1") {
      router.push("/containers/movie");
    } else if (target.formatTitle === "Kod Parçacıkları" || target.id === "c2") {
      router.push("/containers/code");
    } else if (target.formatTitle === "Gezi & Seyahat" || target.id === "c3") {
      router.push("/containers/travel");
    } else if (target.formatTitle === "Ders & Notlar" || target.id === "c4") {
      router.push("/containers/study");
    } else if (target.formatTitle === "Ses" || target.id === "c6") {
      router.push("/containers/audio");
    } else if (target.formatTitle === "Görüntü" || target.id === "c7") {
      router.push("/containers/media");
    } else if (target.formatTitle === "Dosya & Belge" || target.id === "c8") {
      router.push("/containers/files");
    }
  };

  // PIN Doğrulama
  const handleVerifyPin = () => {
    if (!enteredPin.trim() || lockoutTimer > 0) return;
    const res = verifyMasterPin(enteredPin);
    if (res.valid) {
      const target = pinModalTarget;
      setPinModalTarget(null);
      setEnteredPin("");
      setPinErrorMsg(null);
      if ((target as any)?.isUnlockAction) {
        // Kilidi tamamen kaldırma eylemi
        const updated = containers.map((c) =>
          c.id === target?.id ? { ...c, isLocked: false } : c
        );
        setContainers(updated);
        saveStoredCollection("containers", updated);
        showToast(`"${target?.title}" deposunun kilidi kaldırıldı.`);
      } else if (target) {
        navigateToContainer(target);
      }
    } else {
      if (res.isLockedOut) {
        setLockoutTimer(res.lockSecondsRemaining || 30);
      }
      setPinErrorMsg(res.message || "Hatalı PIN! Lütfen tekrar deneyin.");
    }
  };

  // Kilit açma/kapama fonksiyonu (Depo Kilidi On/Off Switch)
  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = containers.find((c) => c.id === id);
    if (!target) return;

    if (!target.isLocked) {
      // Depoyu KİLİTLEMEK istiyor
      if (!hasMasterPin()) {
        // İlk defa kilitleniyorsa kişisel PIN belirleme ekranı gelsin!
        setFirstTimePinTarget(target);
        setNewMasterPin("");
        setConfirmMasterPin("");
        setFirstTimeError(null);
        return;
      }
      // Zaten Master PIN var: tekrar şifre oluşturmadan doğrudan kilitler!
      const updated = containers.map((item) =>
        item.id === id ? { ...item, isLocked: true } : item
      );
      setContainers(updated);
      saveStoredCollection("containers", updated);
      showToast(`"${target.title}" kilitlendi.`);
    } else {
      // Kilitli bir deponun kilidini açıp korumayı kaldırmak için PIN doğrula
      setPinModalTarget({ ...target, isUnlockAction: true } as any);
      setEnteredPin("");
      setPinErrorMsg(null);
    }
  };

  // İlk Kez Master PIN Kaydetme
  const handleSaveFirstTimePin = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstTimeError(null);
    const clean = newMasterPin.trim();
    if (!/^\d{4,6}$/.test(clean)) {
      setFirstTimeError("PIN sadece 4 ile 6 haneli rakamlardan oluşmalıdır.");
      return;
    }
    if (clean !== confirmMasterPin.trim()) {
      setFirstTimeError("Girdiğiniz PIN'ler birbiriyle uyuşmuyor!");
      return;
    }

    const res = setMasterPin(clean);
    if (res.success) {
      if (firstTimePinTarget) {
        const updated = containers.map((c) =>
          c.id === firstTimePinTarget.id ? { ...c, isLocked: true } : c
        );
        setContainers(updated);
        saveStoredCollection("containers", updated);
        showToast(`Master PIN oluşturuldu ve "${firstTimePinTarget.title}" kilitlendi.`);
      }
      setFirstTimePinTarget(null);
      setNewMasterPin("");
      setConfirmMasterPin("");
    } else {
      setFirstTimeError(res.message);
    }
  };

  // Depo filtreleme
  const filteredContainers = containers.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.formatTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "smart") return c.type === "smart";
    if (activeTab === "standard") return c.type === "standard";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. ÜST HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Başlık */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent">
                  Kişisel Depo
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  Container
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Kişisel Dijital Arşiv Sistemi
              </p>
            </div>
          </div>

          {/* Sağ Eylemler: Tema Değiştirici, Global Arama, Çöp Kutusu & Profil */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => {
                setGlobalQuery("");
                setIsGlobalSearchOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700/80 transition text-xs font-semibold"
              title="Tüm Depolarda ve İçeriklerde Ara (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Global Arama</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                Ctrl K
              </kbd>
            </button>

            {/* Tema Geçiş Butonu (Açık / Koyu / Sistem) */}
            <ThemeToggle />

            <Link
              href="/trash"
              title="Çöp Kutusu (30 gün saklanır)"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors relative border border-slate-200/60 dark:border-slate-700/60"
            >
              <Trash2 className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            </Link>

            <Link
              href="/profile"
              title="Hesap, Yedekleme ve Paylaşım Yönetimi"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {userAvatar}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
                {userName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* 2. ARAMA VE BAŞLIK ALANI (NotebookLM & Duolingo Hissiyatı) */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Dağınık dosyalar yok, tek bir akıllı merkez var.</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Neyi saklamak istiyorsun?
          </h1>

          {/* Büyük Arama Girişi + Global İçerik Sonuçları */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Depolarında, filmlerinde, şiirlerinde veya ders notlarında ara..."
              className="w-full pl-11 pr-28 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 text-slate-900 dark:text-slate-100 text-sm font-medium transition-all shadow-xs outline-none"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setGlobalQuery(searchQuery);
                  setIsGlobalSearchOpen(true);
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition"
                title="Komut Paletini Aç (Ctrl + K)"
              >
                Ctrl + K
              </button>
            </div>
          </div>

          {/* Ana Arama Çubuğuna Yazıldığında Tekil İçerik Eşleşmeleri Özeti */}
          {searchQuery.trim().length > 0 && globalResults.length > 0 && (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-3 text-left space-y-1.5">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>Tüm Depolardaki İçerik Eşleşmeleri ({globalResults.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalQuery(searchQuery);
                    setIsGlobalSearchOpen(true);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold normal-case"
                >
                  Tümünü Komut Paletinde Gör →
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {globalResults.slice(0, 5).map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => router.push(res.href)}
                    className="w-full px-3 py-2.5 hover:bg-indigo-50/60 dark:hover:bg-slate-800/60 flex items-center justify-between gap-3 rounded-xl transition text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {res.containerName} • {res.subtitle}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shrink-0">
                      {res.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2.5 EVRENSEL HIZLI DOSYA & MEDYA YÜKLEYİCİ (Universal Dropzone) */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUniversalUpload(file);
          }}
          className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 ${
            isDraggingOver
              ? "border-emerald-500 bg-emerald-500/10 scale-[1.01] shadow-xl"
              : "border-dashed border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/40 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-700 shadow-xs"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
                {isIngestingFile ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Evrensel Dosya & Medya Yükleyici
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Oto-Yönlendirme
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                  Dosyayı buraya sürükleyin veya cihazınızdan seçin. Sistem türü otomatik algılayıp ilgili depoya depolar.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2 justify-center sm:justify-start">
                  {[
                    { tag: ".py / .ts / .js", desc: "Kod" },
                    { tag: ".txt / .md", desc: "Metin" },
                    { tag: ".mp3 / .wav", desc: "Ses" },
                    { tag: ".jpg / .png / .mp4", desc: "Medya" },
                    { tag: ".pdf / .docx / .pptx", desc: "Belge" },
                  ].map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <b>{item.tag}</b> ({item.desc})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <label className="shrink-0 cursor-pointer px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all">
              <Upload className="w-4 h-4" />
              <span>{isIngestingFile ? "İşleniyor..." : "Cihazdan Dosya Seç"}</span>
              <input
                type="file"
                disabled={isIngestingFile}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUniversalUpload(file);
                }}
              />
            </label>
          </div>

          {/* Başarı Bildirim Şeridi */}
          <AnimatePresence>
            {ingestSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <b>"{ingestSuccess.title}"</b> dosyası başarıyla <b>{ingestSuccess.containerName}</b> alanına yüklendi!
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(ingestSuccess.route)}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                  >
                    Depoya Git →
                  </button>
                  <button
                    onClick={() => setIngestSuccess(null)}
                    className="p-1 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 3. VİTRİN: 4 AKILLI DEPO KARTI + 1 STANDART DEPO KARTI (TOPLAM 5 KART) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Yeni Depo Başlat
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                (Akıllı şablonlar veya özel format)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 4 AKILLI DEPO KARTI */}
            {SMART_CONTAINERS.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`relative group bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 ${card.shadow} transition-all cursor-pointer flex flex-col justify-between overflow-hidden`}
                  onClick={() => {
                    if (card.id === "movie") {
                      router.push("/containers/movie");
                    } else if (card.id === "code") {
                      router.push("/containers/code");
                    } else if (card.id === "travel") {
                      router.push("/containers/travel");
                    } else if (card.id === "study") {
                      router.push("/containers/study");
                    } else {
                      alert(`"${card.title}" oluşturma sihirbazı başlatılıyor.`);
                    }
                  }}
                >
                  {/* Üst Renkli Arka Plan Işıltısı */}
                  <div
                    className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`}
                  />

                  <div>
                    {/* Kart İkonu ve Rozeti */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md`}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        Akıllı
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Etiketler ve Tıklama İpucu */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Hemen Oluştur</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}

            {/* 5. KART: STANDART DEPO OLUŞTURMA KARTI (+) */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-b from-indigo-50/60 dark:from-indigo-950/40 via-white dark:via-slate-900 to-indigo-50/30 dark:to-indigo-950/20 rounded-3xl p-5 border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[200px]"
            >
              <div className="w-13 h-13 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-700 group-hover:border-indigo-500 dark:group-hover:border-indigo-400 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Standart Depo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Metin, Ses, Görüntü veya Dosya formatında serbest depo kur.
              </p>
              <span className="mt-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold shadow-xs">
                Format Seç (+)
              </span>
            </motion.div>
          </div>
        </section>

        {/* 4. KULLANICININ OLUŞTURDUĞU DEPOLAR */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            {/* Sol Sekmeler */}
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Depolarım</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                {filteredContainers.length}
              </span>

              <div className="ml-4 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "all"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setActiveTab("smart")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "smart"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Akıllı Depolar
                </button>
                <button
                  onClick={() => setActiveTab("standard")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "standard"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Standart
                </button>
              </div>
            </div>

            {/* Sağ Sıralama Seçenekleri (Section 4.6) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="updated">Son Güncellenen</option>
                <option value="alpha">Alfabetik (A-Z)</option>
                <option value="manual">Manuel Sıralama</option>
              </select>
            </div>
          </div>

          {/* Depo Kartları Grid'i */}
          {filteredContainers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Aramana uygun depo bulunamadı</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Farklı bir kelime deneyebilir veya yukarıdaki vitrinden yeni bir depo oluşturabilirsin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContainers.map((item) => {
                const IconComp = getContainerIcon(item);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                    onClick={() => {
                      if (item.isLocked) {
                        setPinModalTarget(item);
                        setEnteredPin("");
                        setPinErrorMsg(null);
                        return;
                      }
                      navigateToContainer(item);
                    }}
                  >
                    {/* Depo Kapak Görseli / Gradyan Başlığı */}
                    <div
                      className={`h-24 bg-gradient-to-r ${item.coverGradient} p-4 flex items-start justify-between text-white relative overflow-hidden`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-white" />
                      </div>

                      {/* Depo Kilit Switch'i (Section 4.5 & 14.2) */}
                      <button
                        onClick={(e) => toggleLock(item.id, e)}
                        title={
                          item.isLocked
                            ? "Depo Korumalı (PIN Gerekir) - Tıkla ve Korumayı Kapat"
                            : "Depo Korumasız - Tıkla ve PIN Korumasını Aç"
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all backdrop-blur-md shadow-xs ${
                          item.isLocked
                            ? "bg-rose-500/90 text-white ring-2 ring-rose-300"
                            : "bg-black/30 hover:bg-black/50 text-white/90"
                        }`}
                      >
                        {item.isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Kilitli</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-white/70" />
                            <span>Açık</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Depo Bilgileri */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                          <span>{item.formatTitle}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {item.lastUpdated}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </div>

                      {/* Alt Bilgi Çubuğu: İçerik Sayısı & Eylemler */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{item.itemCount} içerik</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            title="Tüm Depoyu Salt Okunur Paylaş"
                            onClick={(e) => {
                              e.stopPropagation();
                              const token =
                                item.formatTitle === "Metin" || item.id === "c5"
                                  ? "gece-siirleri-deposu"
                                  : item.formatTitle === "Kod Parçacıkları" || item.id === "c2"
                                  ? "kod-parcaciklari-deposu"
                                  : item.formatTitle === "Gezi & Seyahat" || item.id === "c3"
                                  ? "gezi-ve-seyahat-deposu"
                                  : item.formatTitle === "Ders & Notlar" || item.id === "c4"
                                  ? "yapay-zeka-ve-algoritmalar-deposu"
                                  : item.formatTitle === "Ses" || item.id === "c6"
                                  ? "sesli-notlar-deposu"
                                  : item.formatTitle === "Görüntü" || item.id === "c7"
                                  ? "gorsel-koleksiyon-deposu"
                                  : item.formatTitle === "Dosya & Belge" || item.id === "c8"
                                  ? "belge-ve-dosya-deposu"
                                  : "sinema-kulubu-deposu";
                              activateShareToken(token);
                              window.open(`/share/${token}`, "_blank");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Depoyu Çöp Kutusuna Taşı (Sil)"
                            onClick={(e) => handleDeleteContainer(item, e)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 5. STANDART DEPO FORMATI SEÇİM MODALI (Section 5.3 & 6.1) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Karartma */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            {/* Modal Kutusu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-slate-200 dark:border-slate-800 z-10 space-y-6"
            >
              {/* Modal Başlığı */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/60">
                    Standart Depo Oluştur
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                    Depo formatını seç
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Format, deponun tasarımını ve içinde saklayacağın içerik türünü belirler.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Format Seçeneği (Duolingo Tarzı Büyük Seçim Kartları) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STANDARD_FORMATS.map((fmt) => {
                  const IconComp = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <motion.div
                      key={fmt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-200 dark:ring-indigo-800"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${fmt.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {fmt.title}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {fmt.desc}
                          </p>
                        </div>
                      </div>

                      {/* Canlı Önizleme İpucu */}
                      <div className="mt-3 pt-2 border-t border-slate-100/80 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{fmt.preview}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Alt Butonlar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  disabled={!selectedFormat}
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    if (selectedFormat === "text") {
                      router.push("/containers/text");
                    } else if (selectedFormat === "audio") {
                      router.push("/containers/audio");
                    } else if (selectedFormat === "image") {
                      router.push("/containers/media");
                    } else if (selectedFormat === "file") {
                      router.push("/containers/files");
                    }
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    selectedFormat
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Devam Et →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MEVCUT MASTER PIN DOĞRULAMA MODALI */}
      <AnimatePresence>
        {pinModalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (lockoutTimer <= 0) setPinModalTarget(null);
              }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center space-y-5"
            >
              {/* Kilit İkonu */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-800/60 shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {(pinModalTarget as any)?.isUnlockAction
                    ? "Depo Kilidini Kaldır"
                    : "Bu Depo Korumalı"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {(pinModalTarget as any)?.isUnlockAction
                    ? `"${pinModalTarget.title}" deposunun kilidini kaldırmak için Master PIN'inizi girin.`
                    : `"${pinModalTarget.title}" deposuna erişmek için lütfen Master PIN'inizi girin.`}
                </p>
                {!hasMasterPin() && (
                  <div className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 py-1 px-2.5 rounded-lg inline-block">
                    Henüz özel PIN oluşturmadınız (Varsayılan: 1234)
                  </div>
                )}
              </div>

              {/* Kilitlenme Sayacı Aktifse */}
              {lockoutTimer > 0 ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="text-xs font-bold">Geçici Güvenlik Kilidi Aktif</div>
                  <div className="text-2xl font-mono font-extrabold">{lockoutTimer} sn</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400">
                    Çok fazla hatalı deneme yapıldı. Lütfen sürenin dolmasını bekleyin.
                  </div>
                </div>
              ) : (
                /* PIN Giriş Alanı */
                <div className="space-y-3">
                  <input
                    type="password"
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value);
                      setPinErrorMsg(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerifyPin();
                    }}
                    placeholder="••••"
                    className={`w-44 mx-auto text-center tracking-[0.4em] text-2xl font-mono font-bold py-2.5 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all ${
                      pinErrorMsg
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-950/40"
                        : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/40"
                    }`}
                    autoFocus
                  />

                  {pinErrorMsg && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold animate-shake">
                      {pinErrorMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Butonlar ve Şifremi Unuttum */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPinModalTarget(null)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    disabled={lockoutTimer > 0 || !enteredPin.trim()}
                    onClick={handleVerifyPin}
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
                  >
                    {(pinModalTarget as any)?.isUnlockAction ? "Kilidi Aç" : "Giriş Yap →"}
                  </button>
                </div>

                <Link
                  href="/profile"
                  className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block mx-auto underline"
                >
                  PIN'i Değiştir veya Sıfırla (Profil)
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6.5 İLK KEZ MASTER PIN BELİRLEME MODALI */}
      <AnimatePresence>
        {firstTimePinTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFirstTimePinTarget(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center space-y-5"
            >
              {/* İkon */}
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60 shadow-xs">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Kişisel PIN'inizi Belirleyin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  İlk kez bir depo kilitliyorsunuz. Belirleyeceğiniz bu Master PIN, tüm kilitli depolarınızı koruyacak ve sadece Profil sayfasından değiştirilebilecektir.
                </p>
              </div>

              {firstTimeError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {firstTimeError}
                </div>
              )}

              <form onSubmit={handleSaveFirstTimePin} className="space-y-3.5 text-left">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Yeni Master PIN (4-6 Haneli)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newMasterPin}
                    onChange={(e) => setNewMasterPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[0.4em] text-xl font-mono font-bold py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    PIN Tekrar
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmMasterPin}
                    onChange={(e) => setConfirmMasterPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[0.4em] text-xl font-mono font-bold py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFirstTimePinTarget(null)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
                  >
                    PIN'i Kaydet & Kilitle
                  </button>
                </div>
              </form>
            </motion.div>
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
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. GLOBAL ARAMA & HIZLI KOMUT PALETİ MODALI (Ctrl + K) */}
      <AnimatePresence>
        {isGlobalSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGlobalSearchOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
            >
              {/* Üst Arama Girişi */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
                <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && globalResults.length > 0) {
                      setIsGlobalSearchOpen(false);
                      router.push(globalResults[0].href);
                    }
                  }}
                  placeholder="Tüm 8 depoda ara: Film, şiir, kod parçacığı, gezi rotası, ders notu, ses, fotoğraf, PDF..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                  autoFocus
                />
                {globalQuery && (
                  <button
                    type="button"
                    onClick={() => setGlobalQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsGlobalSearchOpen(false)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  ESC
                </button>
              </div>

              {/* Hızlı Kategori Filtre Çipleri */}
              <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                {[
                  { label: "Tümü", q: "" },
                  { label: "🎬 Filmler", q: "film" },
                  { label: "📝 Şiir & Metin", q: "şiir" },
                  { label: "💻 Kod", q: "python" },
                  { label: "✈️ Gezi", q: "gezi" },
                  { label: "🎓 Ders Notu", q: "ceng" },
                  { label: "🎙️ Ses & Podcast", q: "podcast" },
                  { label: "🖼️ Görsel", q: "mimari" },
                  { label: "📄 Sözleşme & PDF", q: "pdf" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setGlobalQuery(chip.q)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                      globalQuery.toLowerCase() === chip.q && chip.q !== ""
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Sonuç Listesi */}
              <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800">
                {globalResults.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      "{globalQuery}" ile eşleşen içerik bulunamadı
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Farklı bir anahtar kelime (örn. Inception, FastAPI, Kaş, A*, Podcast, PDF) deneyin.
                    </p>
                  </div>
                ) : (
                  globalResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        setIsGlobalSearchOpen(false);
                        router.push(res.href);
                      }}
                      className="w-full px-4 py-3 hover:bg-indigo-50/70 dark:hover:bg-slate-800/70 flex items-center justify-between gap-4 rounded-2xl transition text-left group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 transition">
                          {res.type === "movie" ? (
                            <Film className="w-4 h-4" />
                          ) : res.type === "text" ? (
                            <FileText className="w-4 h-4" />
                          ) : res.type === "code" ? (
                            <Code2 className="w-4 h-4" />
                          ) : res.type === "travel" ? (
                            <Compass className="w-4 h-4" />
                          ) : res.type === "study" ? (
                            <GraduationCap className="w-4 h-4" />
                          ) : res.type === "audio" ? (
                            <Music className="w-4 h-4" />
                          ) : res.type === "image" ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : res.type === "file" ? (
                            <FolderArchive className="w-4 h-4" />
                          ) : (
                            <Layers className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 truncate">
                            {res.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {res.containerName}
                            </span>{" "}
                            • {res.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 border border-slate-200/70 dark:border-slate-700/70">
                          {res.badge}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Alt Bilgi Çubuğu */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Toplam <b>{globalResults.length}</b> sonuç listeleniyor
                </span>
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">
                      Enter
                    </kbd>{" "}
                    İlk sonuca git
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">
                      ESC
                    </kbd>{" "}
                    Kapat
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

