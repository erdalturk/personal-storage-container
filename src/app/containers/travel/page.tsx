"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  addToTrash,
  getStoredCollection,
  saveStoredCollection,
  createOrGetShareTokenForRecord,
} from "@/lib/appStore";
import {
  ArrowLeft,
  Search,
  Plus,
  Compass,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  Trash2,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  X,
  Camera,
  Check,
  CheckCircle2,
  Globe2,
  Navigation,
  Sparkles,
  Plane,
  Eye,
  Tag,
  ChevronRight,
  Info,
  Download,
  Upload,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { exportTravelGuide } from "@/lib/exportUtils";
import { compressImageClient } from "@/lib/uploadUtils";

export type TravelCategory = "deniz" | "kultur" | "doga" | "sehir" | "gastronomi";

export interface TravelMemory {
  id: string;
  title: string;
  destination: string;
  country: string;
  isInternational: boolean;
  startDate: string;
  endDate?: string;
  durationDays: number;
  season: "summer" | "spring" | "autumn" | "winter";
  category: TravelCategory;
  coverPhoto: string;
  galleryPhotos: string[];
  rating: number; // 1-10
  isFavorite: boolean;
  isCompleted: boolean; // true = Gerçekleşti, false = Planlanan Gezi
  highlightPlaces: string[];
  experiencesNote: string;
  topRecommendations?: string;
  budgetLevel?: "$" | "$$" | "$$$" | "$$$$";
}

const CATEGORY_META: Record<TravelCategory, { label: string; bg: string; text: string; icon: string }> = {
  deniz: { label: "Deniz & Kıyı", bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700", icon: "🏖️" },
  kultur: { label: "Kültür & Tarih", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: "🏛️" },
  doga: { label: "Doğa & Macera", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "🌲" },
  sehir: { label: "Şehir Keşfi", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: "🏙️" },
  gastronomi: { label: "Gastronomi", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "🍷" },
};

// Başlangıç İlham Verici Seyahat Rotaları & Anıları
const INITIAL_TRAVELS: TravelMemory[] = [
  {
    id: "trv-1",
    title: "Yaz 2026 Ege & Akdeniz Gezisi",
    destination: "Kaş, Kalkan & Fethiye",
    country: "Türkiye 🇹🇷",
    isInternational: false,
    startDate: "12 Temmuz 2026",
    endDate: "20 Temmuz 2026",
    durationDays: 8,
    season: "summer",
    category: "deniz",
    rating: 9.8,
    isFavorite: true,
    isCompleted: true,
    coverPhoto: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
    ],
    highlightPlaces: ["Kaputaş Plajı", "Kekova Batık Şehir", "Patara Kum Tepeleri", "Saklıkent Kanyonu", "Meis Adası"],
    experiencesNote:
      "Turkuaz suların ve antik Likya Yolu patikalarının buluştuğu eşsiz bir yaz rotası. Gün batımını Patara kum tepelerinde izlemek ve Kekova'da şnorkelle antik kalıntıları keşfetmek unutulmazdı.",
    topRecommendations: "Kaş merkezde gün batımı dondurması, Kekova için küçük ahşap tekne kiralayarak batık şehri kano ile gezmek.",
    budgetLevel: "$$$",
  },
  {
    id: "trv-2",
    title: "Floransa & Toskana Vadisi Rotası",
    destination: "Floransa, Siena & Val d'Orcia",
    country: "İtalya 🇮🇹",
    isInternational: true,
    startDate: "18 Mayıs 2025",
    endDate: "24 Mayıs 2025",
    durationDays: 7,
    season: "spring",
    category: "kultur",
    rating: 9.7,
    isFavorite: true,
    isCompleted: true,
    coverPhoto: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=600&q=80",
    ],
    highlightPlaces: ["Duomo Katedrali", "Uffizi Galerisi", "Ponte Vecchio", "Pienza Köyü", "Siena Piazza del Campo"],
    experiencesNote:
      "Rönesans sanatının kalbinde yürümek ve servi ağaçlarıyla çevrili tepelerde kaybolmak. Toskana köylerindeki taze el yapımı makarnalar ve trüf mantarlı peynirler damağımızda kaldı.",
    topRecommendations: "Uffizi biletlerini en az 3 hafta önceden online ayırtın; Pienza'da pecorino peyniri tadımı yapın.",
    budgetLevel: "$$$$",
  },
  {
    id: "trv-3",
    title: "Kapadokya — Masalsı Bir Sonbahar",
    destination: "Göreme, Uçhisar & Avanos",
    country: "Türkiye 🇹🇷",
    isInternational: false,
    startDate: "10 Ekim 2025",
    endDate: "14 Ekim 2025",
    durationDays: 4,
    season: "autumn",
    category: "doga",
    rating: 9.4,
    isFavorite: true,
    isCompleted: true,
    coverPhoto: "https://images.unsplash.com/photo-1641128324571-a93c347dd943?auto=format&fit=crop&w=1200&q=80",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1608481337062-4093bf3ed404?auto=format&fit=crop&w=600&q=80",
    ],
    highlightPlaces: ["Aşk Vadisi Balon İzleme", "Uçhisar Kalesi", "Derinkuyu Yeraltı Şehri", "Avanos Çömlek Atölyeleri"],
    experiencesNote:
      "Sabah 05:30'da vadinin üzerinden yükselen yüzlerce renkli balonun yarattığı büyüleyici manzara. Peri bacalarının arasında gün batımı yürüyüşü ve taş oyma mağara otel deneyimi harikaydı.",
    topRecommendations: "Balon uçuşu için ilk güne rezervasyon yapın (hava şartlarından dolayı ertelenebilir); testi kebabı mutlaka deneyin.",
    budgetLevel: "$$",
  },
  {
    id: "trv-4",
    title: "Kyoto & Tokyo — Kiraz Çiçekleri Dönemi",
    destination: "Kyoto & Tokyo",
    country: "Japonya 🇯🇵",
    isInternational: true,
    startDate: "28 Mart 2025",
    endDate: "7 Nisan 2025",
    durationDays: 11,
    season: "spring",
    category: "sehir",
    rating: 9.9,
    isFavorite: true,
    isCompleted: true,
    coverPhoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80",
    ],
    highlightPlaces: ["Fushimi Inari Bin Torii Tapınağı", "Arashiyama Bambu Ormanı", "Shibuya Crossing", "Kinkaku-ji Altın Köşk", "Akihabara"],
    experiencesNote:
      "Gelenek ve fütürizmin kusursuz uyumu. Kyoto'nun sessiz zen tapınaklarından Tokyo'nun neon ışıklı sokaklarına Shinkansen hızlı treniyle geçen rüya gibi bir seyahat.",
    topRecommendations: "JR Pass tren kartını seyahatten önce alın; sabah 07:00'den önce Fushimi Inari'ye çıkarak kalabalıktan kaçının.",
    budgetLevel: "$$$$",
  },
  {
    id: "trv-5",
    title: "Bled Gölü & Triglav Alpleri Gezisi",
    destination: "Bled, Bohinj & Ljubljana",
    country: "Slovenya 🇸🇮",
    isInternational: true,
    startDate: "15 Ağustos 2026",
    endDate: "20 Ağustos 2026",
    durationDays: 6,
    season: "summer",
    category: "doga",
    rating: 8.9,
    isFavorite: false,
    isCompleted: false, // Planlanan Gezi
    coverPhoto: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    ],
    highlightPlaces: ["Bled Adası Kilisesi", "Vintgar Kanyonu Ahşap Parkur", "Bohinj Buzul Gölü", "Ljubljana Ejderha Köprüsü"],
    experiencesNote:
      "Avrupa'nın en yeşil ve bakir coğrafyalarından biri. Zümrüt yeşili sularda kürek çekmek ve Alplerin eteklerindeki kanyonlarda serinlemek harika bir dinlenme planı.",
    topRecommendations: "Göl kenarındaki Bled Kalesi'nden geleneksel kremalı pasta (Kremna Rezina) tadın; gölde pletna teknesi kiralayın.",
    budgetLevel: "$$$",
  },
];

const PRESET_COVERS = [
  { name: "Akdeniz Koyu", url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80" },
  { name: "İtalya Köyü", url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80" },
  { name: "Kapadokya Balonları", url: "https://images.unsplash.com/photo-1641128324571-a93c347dd943?auto=format&fit=crop&w=1200&q=80" },
  { name: "Japon Tapınağı", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" },
  { name: "Alp Dağları", url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80" },
];

export default function TravelContainerPage() {
  const [travels, setTravels] = useState<TravelMemory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "domestic" | "international" | "favorites" | "completed" | "planned">("all");
  const [sortBy, setSortBy] = useState<"rating" | "date" | "title">("rating");

  // Detay & Düzenleme Modalları
  const [selectedTravel, setSelectedTravel] = useState<TravelMemory | null>(null);
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<TravelMemory | null>(null);

  // Form State'leri
  const [formTitle, setFormTitle] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formCountry, setFormCountry] = useState("Türkiye 🇹🇷");
  const [formStartDate, setFormStartDate] = useState("");
  const [formDurationDays, setFormDurationDays] = useState("5");
  const [formCategory, setFormCategory] = useState<TravelCategory>("deniz");
  const [formCoverPhoto, setFormCoverPhoto] = useState(PRESET_COVERS[0].url);
  const [formHighlightPlaces, setFormHighlightPlaces] = useState("");
  const [formExperiencesNote, setFormExperiencesNote] = useState("");
  const [formTopRecommendations, setFormTopRecommendations] = useState("");
  const [formRating, setFormRating] = useState("9.5");
  const [formIsCompleted, setFormIsCompleted] = useState(true);

  // Paylaşım & Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState<string | null>(null);
  const [deletedBackup, setDeletedBackup] = useState<TravelMemory | null>(null);

  // Merkezi Store ile Senkronizasyon
  useEffect(() => {
    setTravels(getStoredCollection("travels", INITIAL_TRAVELS));

    const handleUpdate = () => {
      setTravels(getStoredCollection("travels", INITIAL_TRAVELS));
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

  // Toplam İstatistikler
  const totalCountries = useMemo(() => {
    const set = new Set(travels.map((t) => t.country));
    return set.size;
  }, [travels]);

  const totalPlacesCount = useMemo(() => {
    return travels.reduce((acc, t) => acc + t.highlightPlaces.length, 0);
  }, [travels]);

  // Filtreleme & Sıralama
  const filteredTravels = useMemo(() => {
    return travels
      .filter((t) => {
        // Arama filtresi
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inTitle = t.title.toLowerCase().includes(q);
          const inDest = t.destination.toLowerCase().includes(q);
          const inCountry = t.country.toLowerCase().includes(q);
          const inPlaces = t.highlightPlaces.some((p) => p.toLowerCase().includes(q));
          const inNotes = t.experiencesNote.toLowerCase().includes(q);
          if (!inTitle && !inDest && !inCountry && !inPlaces && !inNotes) return false;
        }

        // Sekme filtresi
        if (activeTab === "domestic") return !t.isInternational;
        if (activeTab === "international") return t.isInternational;
        if (activeTab === "favorites") return t.isFavorite;
        if (activeTab === "completed") return t.isCompleted;
        if (activeTab === "planned") return !t.isCompleted;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0; // Tarih varsayılan akışı
      });
  }, [travels, searchQuery, activeTab, sortBy]);

  // 1-Tıkla Favorileme (Toggle)
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = travels.map((t) =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    setTravels(updated);
    saveStoredCollection("travels", updated);
    if (selectedTravel && selectedTravel.id === id) {
      setSelectedTravel({ ...selectedTravel, isFavorite: !selectedTravel.isFavorite });
    }
  };

  // Yeni Gezi Modalı Aç
  const handleOpenNewTravel = () => {
    setEditingTravel(null);
    setFormTitle("");
    setFormDestination("");
    setFormCountry("Türkiye 🇹🇷");
    setFormStartDate("Ağustos 2026");
    setFormDurationDays("5");
    setFormCategory("deniz");
    setFormCoverPhoto(PRESET_COVERS[0].url);
    setFormHighlightPlaces("Merkez Sahil, Antik Tiyatro, Seyir Tepesi");
    setFormExperiencesNote("");
    setFormTopRecommendations("");
    setFormRating("9.0");
    setFormIsCompleted(true);
    setIsEditorOpen(true);
  };

  // Mevcut Gezi Düzenleme Modalı Aç
  const handleOpenEditTravel = (travel: TravelMemory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTravel(travel);
    setFormTitle(travel.title);
    setFormDestination(travel.destination);
    setFormCountry(travel.country);
    setFormStartDate(travel.startDate);
    setFormDurationDays(String(travel.durationDays));
    setFormCategory(travel.category);
    setFormCoverPhoto(travel.coverPhoto);
    setFormHighlightPlaces(travel.highlightPlaces.join(", "));
    setFormExperiencesNote(travel.experiencesNote);
    setFormTopRecommendations(travel.topRecommendations || "");
    setFormRating(String(travel.rating));
    setFormIsCompleted(travel.isCompleted);
    setIsEditorOpen(true);
  };

  // Kaydet (Ekle veya Güncelle)
  const handleSaveTravel = () => {
    if (!formTitle.trim()) {
      alert("Lütfen gezi için bir başlık belirleyin.");
      return;
    }
    if (!formDestination.trim()) {
      alert("Lütfen rota veya şehir bilgisini yazın.");
      return;
    }

    const places = formHighlightPlaces
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const isIntl = !formCountry.toLowerCase().includes("türkiye");

    if (editingTravel) {
      // Güncelleme
      const updatedItem: TravelMemory = {
        ...editingTravel,
        title: formTitle.trim(),
        destination: formDestination.trim(),
        country: formCountry.trim(),
        isInternational: isIntl,
        startDate: formStartDate.trim() || "Bahar 2026",
        durationDays: Number(formDurationDays) || 5,
        category: formCategory,
        coverPhoto: formCoverPhoto,
        highlightPlaces: places.length > 0 ? places : ["Merkez"],
        experiencesNote: formExperiencesNote.trim(),
        topRecommendations: formTopRecommendations.trim(),
        rating: Math.min(10, Math.max(1, Number(formRating) || 9)),
        isCompleted: formIsCompleted,
      };

      const updated = travels.map((t) => (t.id === editingTravel.id ? updatedItem : t));
      setTravels(updated);
      saveStoredCollection("travels", updated);
      if (selectedTravel && selectedTravel.id === editingTravel.id) {
        setSelectedTravel(updatedItem);
      }
      setToastMessage("Gezi rotası başarıyla güncellendi.");
    } else {
      // Yeni Ekleme
      const newItem: TravelMemory = {
        id: `trv-${Date.now()}`,
        title: formTitle.trim(),
        destination: formDestination.trim(),
        country: formCountry.trim(),
        isInternational: isIntl,
        startDate: formStartDate.trim() || "Bugün",
        durationDays: Number(formDurationDays) || 5,
        season: "summer",
        category: formCategory,
        coverPhoto: formCoverPhoto,
        galleryPhotos: [formCoverPhoto],
        rating: Math.min(10, Math.max(1, Number(formRating) || 9)),
        isFavorite: false,
        isCompleted: formIsCompleted,
        highlightPlaces: places.length > 0 ? places : ["Merkez"],
        experiencesNote: formExperiencesNote.trim(),
        topRecommendations: formTopRecommendations.trim(),
        budgetLevel: "$$$",
      };

      const updated = [newItem, ...travels];
      setTravels(updated);
      saveStoredCollection("travels", updated);
      setToastMessage("Yeni seyahat rotası arşive eklendi.");
    }

    setIsEditorOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Geziyi Sil (Çöp Kutusuna At & Varsa Paylaşımını Otomatik İptal Et)
  const handleDeleteTravel = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = travels.find((t) => t.id === id);
    if (!target) return;

    // 1. Çöp Kutusuna Gönder (ve varsa paylaşılan içeriklerden anında kaldır/iptal et)
    addToTrash({
      title: target.title,
      originContainer: "Gezi & Seyahat Anıları",
      type: "travel",
      posterUrl: target.coverPhoto,
      contentPreview: `${target.destination} • ${target.country} • ${target.durationDays} gün`,
      originalData: target,
    });

    setDeletedBackup(target);
    const updated = travels.filter((t) => t.id !== id);
    setTravels(updated);
    saveStoredCollection("travels", updated);
    if (selectedTravel && selectedTravel.id === id) {
      setSelectedTravel(null);
    }

    setToastMessage(`"${target.title}" Çöp Kutusu'na taşındı.`);
    setTimeout(() => {
      setToastMessage((curr) => (curr ? null : curr));
    }, 5000);
  };

  // Silmeyi Geri Al
  const handleUndoDelete = () => {
    if (deletedBackup) {
      const updated = [deletedBackup, ...travels];
      setTravels(updated);
      saveStoredCollection("travels", updated);
      setDeletedBackup(null);
      setToastMessage(`"${deletedBackup.title}" geri yüklendi.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Paylaşım Bağlantısını Salt Okunur Kart / Vitrin Olarak Yeni Sekmede Aç
  const handleShareTravel = (itemOrSlug?: TravelMemory | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof itemOrSlug === "object" && itemOrSlug !== null) {
      const token = createOrGetShareTokenForRecord(
        itemOrSlug,
        "travel",
        "Gezi & Seyahat Anıları"
      );
      window.open(`/share/${token}`, "_blank");
    } else {
      const slug = typeof itemOrSlug === "string" ? itemOrSlug : "gezi-ve-seyahat-deposu";
      window.open(`/share/${slug}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* 1. ÜST HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Gezi & Seyahat Anıları
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                Akıllı Depo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Keşfedilen rotalar, seyahat deneyimleri, duraklar ve fotoğraf albümleri
            </p>
          </div>
        </div>

        {/* Sağ Butonlar */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <button
            onClick={() => handleShareTravel("gezi-ve-seyahat-deposu")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Tüm Gezi Deposunu Salt Okunur Paylaş"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Depoyu Paylaş</span>
          </button>

          <button
            onClick={handleOpenNewTravel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md shadow-amber-200 dark:shadow-none transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Rota Ekle</span>
          </button>
        </div>
      </header>

      {/* 2. İSTATİSTİK ŞERİDİ & HERO (Duolingo Mikro Etkileşimli Kartlar) */}
      <section className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/15 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{totalCountries}</span>
                <p className="text-[11px] text-slate-500 font-medium">Ziyaret Edilen Ülke</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{travels.length}</span>
                <p className="text-[11px] text-slate-500 font-medium">Kayıtlı Rota & Anı</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">{totalPlacesCount}</span>
                <p className="text-[11px] text-slate-500 font-medium">Ziyaret Edilen Durak</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">
                  {travels.filter((t) => t.isFavorite).length}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Favori Seyahat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ANA İÇERİK ALANI */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Arama, Filtre Sekmeleri ve Sıralama */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filtre Sekmeleri */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tümü ({travels.length})
            </button>
            <button
              onClick={() => setActiveTab("domestic")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === "domestic" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yurt İçi 🇹🇷 ({travels.filter((t) => !t.isInternational).length})
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === "international" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yurt Dışı 🌍 ({travels.filter((t) => t.isInternational).length})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === "favorites" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Favoriler ⭐ ({travels.filter((t) => t.isFavorite).length})
            </button>
            <button
              onClick={() => setActiveTab("planned")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                activeTab === "planned" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Planlananlar 📌 ({travels.filter((t) => !t.isCompleted).length})
            </button>
          </div>

          {/* Arama ve Sıralama */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Şehir, ülke veya mekan ara..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
            >
              <option value="rating">Puana Göre (En Yüksek)</option>
              <option value="date">Tarihe Göre</option>
              <option value="title">İsme Göre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 4. GEZİ KARTLARI GRİDİ */}
        {filteredTravels.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto border border-amber-100">
              <Compass className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-800">Eşleşen seyahat anısı bulunamadı</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Farklı bir arama terimi deneyebilir veya yeni bir seyahat rotası ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTravels.map((travel) => {
              const meta = CATEGORY_META[travel.category] || CATEGORY_META.deniz;
              return (
                <motion.div
                  key={travel.id}
                  layout
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                  onClick={() => setSelectedTravel(travel)}
                >
                  {/* Kart Görseli & Üst Rozetler */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={travel.coverPhoto}
                      alt={travel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Sol Üst: Ülke & Şehir */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {travel.destination}
                      </span>
                    </div>

                    {/* Sağ Üst: Favori Butonu & Puan */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => toggleFavorite(travel.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                          travel.isFavorite
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-black/30 hover:bg-black/50 text-white/90"
                        }`}
                        title={travel.isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                      >
                        <Heart
                          className={`w-4 h-4 ${travel.isFavorite ? "fill-white" : ""}`}
                        />
                      </button>

                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        {travel.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Alt Kısım: Tarih & Gün Sayısı */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold text-white/95 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        {travel.startDate}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold">
                        {travel.durationDays} Gün
                      </span>
                    </div>
                  </div>

                  {/* Kart İçerik Gövdesi */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Kategori ve Ülke Rozeti */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.text}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {travel.country}
                        </span>
                        {travel.isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Gerçekleşti
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            📌 Planlanan
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {travel.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {travel.experiencesNote}
                      </p>
                    </div>

                    {/* Duraklar (Etiketler) */}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {travel.highlightPlaces.slice(0, 3).map((place, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            • {place}
                          </span>
                        ))}
                        {travel.highlightPlaces.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{travel.highlightPlaces.length - 3} durak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Kart Altı Aksiyon Çubuğu */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTravel(travel);
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detayları Gör
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleOpenEditTravel(travel, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Geziyi Düzenle"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleShareTravel(travel, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Bu Geziyi Salt Okunur Kart Olarak Paylaş"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTravel(travel.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Çöp Kutusu'na Gönder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. GEZİ DETAY VE ROTA MODALI */}
      <AnimatePresence>
        {selectedTravel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTravel(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 p-6 sm:p-8 space-y-6"
            >
              {/* Kapat Butonu */}
              <button
                onClick={() => setSelectedTravel(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Büyük Kapak Fotoğrafı */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                <img
                  src={selectedTravel.coverPhoto}
                  alt={selectedTravel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {selectedTravel.destination}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-md text-white border border-white/20">
                    {selectedTravel.country}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {selectedTravel.title}
                    </h2>
                    <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
                      <span>{selectedTravel.startDate} {selectedTravel.endDate ? `— ${selectedTravel.endDate}` : ""}</span>
                      <span>•</span>
                      <span>{selectedTravel.durationDays} Günlük Rota</span>
                    </p>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-sm shadow-md flex items-center gap-1">
                    <Star className="w-4 h-4 fill-white" />
                    {selectedTravel.rating.toFixed(1)} / 10
                  </span>
                </div>
              </div>

              {/* Galeri Küçük Resimleri */}
              {selectedTravel.galleryPhotos && selectedTravel.galleryPhotos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Fotoğraf Galerisi ({selectedTravel.galleryPhotos.length} Kare)
                  </h4>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {selectedTravel.galleryPhotos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setActivePhotoPreview(photo)}
                        className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-amber-500 transition-all"
                      >
                        <img src={photo} alt="galeri" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rota Durakları (Adım Adım Yol Haritası) */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-600" />
                  Önemli Duraklar & Gezilen Yerler
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTravel.highlightPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-semibold text-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{place}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seyahat Notları & Deneyimler */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Seyahat Deneyimi & Anılar
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-2xl border border-amber-200/50">
                  {selectedTravel.experiencesNote}
                </p>
              </div>

              {/* Mutlaka Denenmeli / Tavsiyeler */}
              {selectedTravel.topRecommendations && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-700">
                    <Sparkles className="w-4 h-4" />
                    Mutlaka Denenmeli / İpuçları
                  </div>
                  <p className="leading-relaxed">{selectedTravel.topRecommendations}</p>
                </div>
              )}

              {/* Alt Butonlar */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteTravel(selectedTravel.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Çöp Kutusuna Taşı
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      exportTravelGuide({
                        title: selectedTravel.title,
                        destination: selectedTravel.destination,
                        country: selectedTravel.country,
                        durationDays: selectedTravel.durationDays,
                        rating: selectedTravel.rating,
                        overview: selectedTravel.experiencesNote,
                        userNote: selectedTravel.topRecommendations,
                        highlightPlaces: selectedTravel.highlightPlaces,
                      });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    title="Gezi Rehberini Markdown Olarak İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Rehberi İndir (.md)</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditTravel(selectedTravel)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleShareTravel(selectedTravel)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm"
                    title="Bu Geziyi Salt Okunur Kart Olarak Paylaş"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Paylaş
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. YENİ ROTA / ANİ EKLEME & DÜZENLEME MODALI */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {editingTravel ? "Rotayı Düzenle" : "Yeni Seyahat Anısı"}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    {editingTravel ? editingTravel.title : "Yeni Bir Rota Kaydet"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Alanları */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gezi / Rota Başlığı *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: Yaz 2026 Ege & Akdeniz Gezisi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Şehir / Bölge *</label>
                    <input
                      type="text"
                      value={formDestination}
                      onChange={(e) => setFormDestination(e.target.value)}
                      placeholder="Örn: Kaş, Kalkan, Fethiye"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ülke *</label>
                    <input
                      type="text"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      placeholder="Örn: Türkiye 🇹🇷 veya İtalya 🇮🇹"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tarih / Dönem</label>
                    <input
                      type="text"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      placeholder="Örn: Temmuz 2026"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Süre (Gün Sayısı)</label>
                    <input
                      type="number"
                      value={formDurationDays}
                      onChange={(e) => setFormDurationDays(e.target.value)}
                      placeholder="Örn: 7"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Puan (1-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e: any) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="deniz">🏖️ Deniz & Kıyı</option>
                      <option value="kultur">🏛️ Kültür & Tarih</option>
                      <option value="doga">🌲 Doğa & Macera</option>
                      <option value="sehir">🏙️ Şehir Keşfi</option>
                      <option value="gastronomi">🍷 Gastronomi</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gezi Durumu</label>
                    <select
                      value={formIsCompleted ? "true" : "false"}
                      onChange={(e) => setFormIsCompleted(e.target.value === "true")}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="true">✓ Gerçekleşti (Tamamlanan Anı)</option>
                      <option value="false">📌 Planlanan Gezi (Gelecek Rota)</option>
                    </select>
                  </div>
                </div>

                {/* Kapak Fotoğrafı URL, Cihazdan Yükleme ve Hızlı Şablonlar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block text-xs">Kapak Fotoğrafı</label>
                    <label className="cursor-pointer px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors flex items-center gap-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cihazdan Fotoğraf Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const comp = await compressImageClient(file);
                            setFormCoverPhoto(comp.dataUrl);
                          } catch {
                            alert("Fotoğraf yüklenemedi.");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formCoverPhoto}
                    onChange={(e) => setFormCoverPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/... veya Cihazdan Yükleyin"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium text-xs"
                  />
                  {formCoverPhoto && (
                    <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <img
                        src={formCoverPhoto}
                        alt="Kapak önizleme"
                        className="w-14 h-10 object-cover rounded-lg shadow-xs"
                      />
                      <span className="text-[11px] text-slate-500 font-medium line-clamp-1">
                        Kapak görseli seçildi
                      </span>
                    </div>
                  )}
                  {/* Hızlı Şablon Seçiciler */}
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">Hızlı Seç:</span>
                    {PRESET_COVERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormCoverPhoto(preset.url)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border shrink-0 transition-colors ${
                          formCoverPhoto === preset.url
                            ? "bg-amber-50 border-amber-300 text-amber-700 font-bold"
                            : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Önemli Duraklar (Virgülle Ayırın)</label>
                  <input
                    type="text"
                    value={formHighlightPlaces}
                    onChange={(e) => setFormHighlightPlaces(e.target.value)}
                    placeholder="Kaputaş Plajı, Kekova Batık Şehir, Patara Kum Tepeleri"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seyahat Deneyimi & Anı Notları</label>
                  <textarea
                    rows={3}
                    value={formExperiencesNote}
                    onChange={(e) => setFormExperiencesNote(e.target.value)}
                    placeholder="Bu gezide hissettikleriniz, rota detayları, karşılaştığınız ilginç anlar..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mutlaka Denenmeli / Tavsiyeler (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formTopRecommendations}
                    onChange={(e) => setFormTopRecommendations(e.target.value)}
                    placeholder="Örn: Gün batımında tepeye çıkın, falanca restoranda deniz ürünlerini tadın."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Alt Eylemler */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveTravel}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-200"
                >
                  {editingTravel ? "Değişiklikleri Kaydet" : "Rotayı Arşive Ekle"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. FOTOĞRAF TAM EKRAN ÖNİZLEME (LIGHTBOX) */}
      <AnimatePresence>
        {activePhotoPreview && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={activePhotoPreview}
                alt="Tam ekran önizleme"
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. BİLDİRİM & GERİ ALMA TOAST'I (UNDO) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{toastMessage}</span>
            {deletedBackup && (
              <button
                onClick={handleUndoDelete}
                className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
              >
                Geri Al
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
