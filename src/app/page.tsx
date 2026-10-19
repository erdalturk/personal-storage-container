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
} from "lucide-react";
import {
  addToTrash,
  getStoredCollection,
  saveStoredCollection,
} from "@/lib/appStore";

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
  icon: any;
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
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "alpha" | "manual">("updated");
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "smart" | "standard">("all");

  useEffect(() => {
    setContainers(getStoredCollection("containers", INITIAL_CONTAINERS));

    const handleUpdate = () => {
      setContainers(getStoredCollection("containers", INITIAL_CONTAINERS));
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

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
  const [pinError, setPinError] = useState(false);

  const handleVerifyPin = () => {
    // Demo varsayılan PIN: 1234
    if (enteredPin === "1234" && pinModalTarget) {
      const target = pinModalTarget;
      setPinModalTarget(null);
      if (target.formatTitle === "Metin" || target.id === "c5") {
        router.push("/containers/text");
      } else if (target.formatTitle === "Film & Dizi" || target.id === "c1") {
        router.push("/containers/movie");
      }
    } else {
      setPinError(true);
    }
  };

  // Kilit açma/kapama fonksiyonu (Depo Kilidi On/Off Switch)
  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContainers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLocked: !item.isLocked } : item
      )
    );
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 font-sans">
      {/* 1. ÜST HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Başlık */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                  Kişisel Depo
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Container
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Kişisel Dijital Arşiv Sistemi
              </p>
            </div>
          </div>

          {/* Sağ Eylemler: Çöp Kutusu & Profil */}
          <div className="flex items-center gap-3">
            <Link
              href="/trash"
              title="Çöp Kutusu (30 gün saklanır)"
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            >
              <Trash2 className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </Link>

            <Link
              href="/profile"
              title="Hesap ve Paylaşım Yönetimi"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/60"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                ET
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                Erdal Türk
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
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dağınık dosyalar yok, tek bir akıllı merkez var.</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Neyi saklamak istiyorsun?
          </h1>

          {/* Büyük Arama Girişi */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Depolarında, filmlerinde veya ders notlarında ara..."
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition-all shadow-xs outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. VİTRİN: 4 AKILLI DEPO KARTI + 1 STANDART DEPO KARTI (TOPLAM 5 KART) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Yeni Depo Başlat
              </h2>
              <span className="text-xs text-slate-500 font-medium">
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
                  className={`relative group bg-white rounded-3xl p-5 border-2 border-slate-200/90 shadow-sm hover:border-indigo-400 ${card.shadow} transition-all cursor-pointer flex flex-col justify-between overflow-hidden`}
                  onClick={() => {
                    if (card.id === "movie") {
                      router.push("/containers/movie");
                    } else if (card.id === "code") {
                      router.push("/containers/code");
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
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        Akıllı
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Etiketler ve Tıklama İpucu */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
                    <span className="text-[11px] text-slate-400">Hemen Oluştur</span>
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
              className="bg-gradient-to-b from-indigo-50/60 via-white to-indigo-50/30 rounded-3xl p-5 border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-100 transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[200px]"
            >
              <div className="w-13 h-13 rounded-2xl bg-white border-2 border-indigo-200 group-hover:border-indigo-500 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                Standart Depo
              </h3>
              <p className="text-xs text-slate-500 mt-1">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            {/* Sol Sekmeler */}
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Depolarım</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                {filteredContainers.length}
              </span>

              <div className="ml-4 flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setActiveTab("smart")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "smart"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Akıllı Depolar
                </button>
                <button
                  onClick={() => setActiveTab("standard")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "standard"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Standart
                </button>
              </div>
            </div>

            {/* Sağ Sıralama Seçenekleri (Section 4.6) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="updated">Son Güncellenen</option>
                <option value="alpha">Alfabetik (A-Z)</option>
                <option value="manual">Manuel Sıralama</option>
              </select>
            </div>
          </div>

          {/* Depo Kartları Grid'i */}
          {filteredContainers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Aramana uygun depo bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Farklı bir kelime deneyebilir veya yukarıdaki vitrinden yeni bir depo oluşturabilirsin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContainers.map((item) => {
                const IconComp = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                    onClick={() => {
                      if (item.isLocked) {
                        setPinModalTarget(item);
                        setEnteredPin("");
                        setPinError(false);
                        return;
                      }
                      if (item.formatTitle === "Metin" || item.id === "c5") {
                        router.push("/containers/text");
                      } else if (item.formatTitle === "Film & Dizi" || item.id === "c1") {
                        router.push("/containers/movie");
                      } else if (item.formatTitle === "Kod Parçacıkları" || item.id === "c2") {
                        router.push("/containers/code");
                      } else {
                        alert(`"${item.title}" açılıyor...`);
                      }
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
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          <span>{item.formatTitle}</span>
                          <span className="text-slate-500 font-medium">
                            {item.lastUpdated}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </div>

                      {/* Alt Bilgi Çubuğu: İçerik Sayısı & Eylemler */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
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
                                  : "sinema-kulubu-deposu";
                              window.open(`/share/${token}`, "_blank");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Depoyu Çöp Kutusuna Taşı (Sil)"
                            onClick={(e) => handleDeleteContainer(item, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-slate-200 z-10 space-y-6"
            >
              {/* Modal Başlığı */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    Standart Depo Oluştur
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    Depo formatını seç
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Format, deponun tasarımını ve içinde saklayacağın içerik türünü belirler.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
                          ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-200"
                          : "border-slate-200 hover:border-slate-300 bg-white"
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
                            <h4 className="font-bold text-sm text-slate-900">
                              {fmt.title}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {fmt.desc}
                          </p>
                        </div>
                      </div>

                      {/* Canlı Önizleme İpucu */}
                      <div className="mt-3 pt-2 border-t border-slate-100/80 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{fmt.preview}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Alt Butonlar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  İptal
                </button>
                <button
                  disabled={!selectedFormat}
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    if (selectedFormat === "text") {
                      router.push("/containers/text");
                    } else {
                      alert(`Seçilen format: ${selectedFormat}. Bu formatın tasarım ekranı bir sonraki adımda inşa edilecek.`);
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

      {/* 6. DEPO KİLİDİ (PIN) DOĞRULAMA MODALI (Bölüm 14.2) */}
      <AnimatePresence>
        {pinModalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPinModalTarget(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 text-center space-y-5"
            >
              {/* Kilit İkonu */}
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Bu Depo Korumalı
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  "{pinModalTarget.title}" deposuna erişmek için lütfen 4 haneli PIN şifrenizi girin.
                </p>
                <div className="mt-2 text-[11px] font-semibold text-indigo-600 bg-indigo-50 py-1 px-2.5 rounded-lg inline-block">
                  Demo PIN: 1234
                </div>
              </div>

              {/* PIN Giriş Alanı */}
              <div className="space-y-3">
                <input
                  type="password"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyPin();
                  }}
                  placeholder="••••"
                  className={`w-40 mx-auto text-center tracking-[0.5em] text-2xl font-mono font-bold py-2.5 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                    pinError
                      ? "border-rose-500 bg-rose-50 text-rose-700 focus:ring-4 focus:ring-rose-100"
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  }`}
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs text-rose-600 font-bold animate-shake">
                    Hatalı PIN! Lütfen tekrar deneyin.
                  </p>
                )}
              </div>

              {/* Butonlar ve Şifremi Unuttum */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPinModalTarget(null)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleVerifyPin}
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors"
                  >
                    Kilidi Aç →
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Şifre Kurtarma: Güvenlik politikası gereği, kayıtlı e-posta adresinize (erdalturk@example.com) tek kullanımlık depo PIN sıfırlama kodu gönderilebilir."
                    )
                  }
                  className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors block mx-auto underline"
                >
                  Depo PIN'ini mi unuttun?
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
