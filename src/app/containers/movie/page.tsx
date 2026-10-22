"use client";

import React, { useState, useEffect } from "react";
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
  Star,
  Eye,
  Bookmark,
  Heart,
  Calendar,
  Clock,
  Film,
  Sparkles,
  Trash2,
  Share2,
  ExternalLink,
  Lock,
  Unlock,
  RotateCcw,
  SlidersHorizontal,
  X,
  Play,
  Check,
  Clapperboard,
  Download,
  Loader2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { exportMovieCollection } from "@/lib/exportUtils";
import { searchMoviesOnline, MovieSearchResult } from "@/lib/tmdbClient";

interface MovieItem {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  director: string;
  cast: string[];
  genres: string[];
  rating: number; // IMDb / TMDB puanı
  posterUrl: string;
  backdropUrl?: string;
  overview: string;
  duration: string;
  trailerUrl?: string;
  isWatched: boolean; // İzlendi
  isWatchlist: boolean; // İzlenecek
  isFavorite: boolean; // Favori
  userNote?: string; // Kullanıcının kişisel notu
  userRating?: number; // Kullanıcının verdiği puan (1-10)
}

// Başlangıç Film Arşivi (Zengin & Estetik Örnekler)
const INITIAL_MOVIES: MovieItem[] = [
  {
    id: "m1",
    title: "Inception",
    originalTitle: "Inception",
    year: 2010,
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
    rating: 8.8,
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    overview: "Çok yetenekli bir hırsız olan Dom Cobb, insanların rüyalarına girerek bilinçaltındaki en değerli sırları çalar. Kendisine verilen imkansız bir görevde ise fikir çalmak yerine zihne fikir eklemesi gerekmektedir.",
    duration: "2s 28dk",
    isWatched: true,
    isWatchlist: false,
    isFavorite: true,
    userNote: "Zaman kavramının rüyalar katmanında bükülmesi sinema tarihinin en zeki kurgularından biri. Hans Zimmer müzikleri muazzam.",
    userRating: 10,
  },
  {
    id: "m2",
    title: "Interstellar",
    originalTitle: "Interstellar",
    year: 2014,
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    genres: ["Bilim Kurgu", "Macera", "Dram"],
    rating: 8.7,
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    overview: "İnsanlığın Dünya'daki son günleri yaklaşırken, bir grup kaşif insanlık için yaşanabilir yeni bir gezegen bulmak amacıyla bir solucan deliğinden geçerek bilinmeyene doğru yolculuğa çıkar.",
    duration: "2s 49dk",
    isWatched: true,
    isWatchlist: false,
    isFavorite: true,
    userNote: "Yerçekimi, sevgi ve zamanın buluştuğu nokta. Ağlatmayan nadir bilim kurgulardan.",
    userRating: 9.8,
  },
  {
    id: "m3",
    title: "Dune: Part Two",
    originalTitle: "Dune: Part Two",
    year: 2024,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    genres: ["Bilim Kurgu", "Macera"],
    rating: 8.5,
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80",
    overview: "Paul Atreides, ailesini yok eden komploculara karşı intikam arayışındayken Chani ve Fremenlerle güçlerini birleştirir.",
    duration: "2s 46dk",
    isWatched: true,
    isWatchlist: false,
    isFavorite: false,
    userNote: "Görsel ve işitsel bir başyapıt. Çöl sahneleri sinemada büyüleyiciydi.",
    userRating: 8.7,
  },
  {
    id: "m4",
    title: "Kış Uykusu",
    originalTitle: "Winter Sleep",
    year: 2014,
    director: "Nuri Bilge Ceylan",
    cast: ["Haluk Bilginer", "Demet Akbağ", "Melisa Sözen"],
    genres: ["Dram"],
    rating: 8.1,
    posterUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80",
    overview: "Emekli bir tiyatro oyuncusu olan Aydın, Kapadokya'da babasından kalan butik oteli işletmektedir. Kışın bastırmasıyla birlikte yalnızlık, vicdan ve insan ilişkileri derinlemesine sorgulanır.",
    duration: "3s 16dk",
    isWatched: false,
    isWatchlist: true,
    isFavorite: false,
    userNote: "Altın Palmiye ödüllü başyapıt. Uzun bir pazar günü izlenecek.",
  },
  {
    id: "m5",
    title: "Spirited Away",
    originalTitle: "Sen to Chihiro no Kamikakushi",
    year: 2001,
    director: "Hayao Miyazaki",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    genres: ["Animasyon", "Macera", "Fantastik"],
    rating: 8.6,
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    overview: "10 yaşındaki Chihiro, ailesiyle yeni bir kasabaya taşınırken gizemli bir ruhlar dünyasına adım atar. Anne ve babası domuza dönüşen küçük kız onları kurtarmak için mücadele eder.",
    duration: "2s 5dk",
    isWatched: true,
    isWatchlist: false,
    isFavorite: true,
    userNote: "Miyazaki'nin hayal gücünün zirvesi. Çocukken ayrı, büyüyünce ayrı etkileyen zamansız bir sanat eseri.",
    userRating: 9.5,
  },
  {
    id: "m6",
    title: "Oppenheimer",
    originalTitle: "Oppenheimer",
    year: 2023,
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    genres: ["Biyografi", "Dram", "Tarih"],
    rating: 8.9,
    posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    overview: "Atom bombasının babası J. Robert Oppenheimer'ın Manhattan Projesi sırasındaki bilimsel mücadelesi ve ardından gelen ahlaki ve politik hesaplaşması.",
    duration: "3s 0dk",
    isWatched: false,
    isWatchlist: true,
    isFavorite: false,
  },
];

// TMDB Örnek Arama Havuzu (Canlı Arama Simülasyonu)
const SEARCH_DATABASE = [
  {
    title: "Fight Club",
    year: 1999,
    director: "David Fincher",
    rating: 8.8,
    genres: ["Dram", "Gerilim"],
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    duration: "2s 19dk",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
    overview: "Uykusuzluk çeken bir ofis çalışanı ve başına buyruk bir sabun üreticisi, yeraltında gizli bir dövüş kulübü kurarak düzene meydan okur.",
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    director: "Quentin Tarantino",
    rating: 8.9,
    genres: ["Suç", "Dram"],
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    duration: "2s 34dk",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    overview: "Los Angeles yeraltı dünyasından iki tetikçi, bir boksör ve bir gangsterin karısının hayatları beklenmedik şekilde kesişir.",
  },
  {
    title: "The Matrix",
    year: 1999,
    director: "Lana & Lilly Wachowski",
    rating: 8.7,
    genres: ["Bilim Kurgu", "Aksiyon"],
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    duration: "2s 16dk",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    overview: "Sıradan bir hacker olan Neo, yaşadığı dünyanın aslında makineler tarafından yaratılmış yapay bir simülasyon olduğunu keşfeder.",
  },
  {
    title: "Yüzüklerin Efendisi: Kralın Dönüşü",
    year: 2003,
    director: "Peter Jackson",
    rating: 9.0,
    genres: ["Fantastik", "Macera"],
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    duration: "3s 21dk",
    cast: ["Elijah Wood", "Viggo Mortensen", "Ian McKellen"],
    overview: "Orta Dünya'nın kaderi Hüküm Dağı'ndaki son yürüyüşe bağlıyken Gondor krallığı devasa Sauron ordularına karşı direnmektedir.",
  },
];

export default function MovieContainerPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "watched" | "watchlist" | "favorites">("all");
  const [sortBy, setSortBy] = useState<"rating" | "year" | "title">("rating");
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setMovies(getStoredCollection("movies", INITIAL_MOVIES));

    const handleUpdate = () => {
      setMovies(getStoredCollection("movies", INITIAL_MOVIES));
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

  // Detay Modalı
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);

  // Arama & Ekleme Açılır Menüsü (Section 7.3 - Canlı TMDB / OMDb API)
  const [addSearchInput, setAddSearchInput] = useState("");
  const [isAddSearchOpen, setIsAddSearchOpen] = useState(false);
  const [onlineSearchResults, setOnlineSearchResults] = useState<MovieSearchResult[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  useEffect(() => {
    if (!addSearchInput.trim() || addSearchInput.trim().length < 2) {
      setOnlineSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    setIsSearchingOnline(true);
    const timer = setTimeout(async () => {
      const results = await searchMoviesOnline(addSearchInput);
      setOnlineSearchResults(results);
      setIsSearchingOnline(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [addSearchInput]);

  // Manuel Film Ekleme Modalı (Section 7.5)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualDirector, setManualDirector] = useState("");
  const [manualRating, setManualRating] = useState("");
  const [manualOverview, setManualOverview] = useState("");

  // Hızlı Geri Al (Undo Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletedMovieBackup, setDeletedMovieBackup] = useState<MovieItem | null>(null);

  // 3 İkonlu Kontrolün Açma/Kapama (Toggle) Mantığı (Section 7.4)
  const toggleMovieStatus = (
    movieId: string,
    statusKey: "isWatched" | "isWatchlist" | "isFavorite",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setMovies((prev) => {
      const updated = prev.map((m) => {
        if (m.id === movieId) {
          const item = { ...m, [statusKey]: !m[statusKey] };
          if (selectedMovie && selectedMovie.id === movieId) {
            setSelectedMovie(item);
          }
          return item;
        }
        return m;
      });
      saveStoredCollection("movies", updated);
      return updated;
    });
  };

  // Film Sil ve Geri Al (Çöp Kutusuna Atar & Varsa Paylaşımını Otomatik İptal Eder)
  const handleDeleteMovie = (movieId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const movieToDelete = movies.find((m) => m.id === movieId);
    if (!movieToDelete) return;

    // 1. Çöp Kutusuna Gönder (Bu işlem varsa paylaşılan içeriklerden de anında kaldırır ve iptal eder!)
    addToTrash({
      title: movieToDelete.title,
      originContainer: "Sinema Kulübü & Başyapıtlar",
      type: "movie",
      posterUrl: movieToDelete.posterUrl,
      contentPreview: `${movieToDelete.director} • ${movieToDelete.year} • ${movieToDelete.genres.join(", ")}`,
      originalData: movieToDelete,
    });

    setDeletedMovieBackup(movieToDelete);
    const updated = movies.filter((m) => m.id !== movieId);
    setMovies(updated);
    saveStoredCollection("movies", updated);

    if (selectedMovie?.id === movieId) setSelectedMovie(null);

    setToastMessage(`"${movieToDelete.title}" Çöp Kutusu'na taşındı. Varsa paylaşım bağlantısı otomatik iptal edildi.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUndoDelete = () => {
    if (deletedMovieBackup) {
      setMovies((prev) => [deletedMovieBackup, ...prev]);
      setDeletedMovieBackup(null);
      setToastMessage(null);
    }
  };

  // Aramadan Film Ekle (Canlı TMDB / OMDb Entegrasyonu)
  const handleAddMovieFromSearch = (item: MovieSearchResult | (typeof SEARCH_DATABASE)[0]) => {
    const newMovie: MovieItem = {
      id: "m_" + Date.now(),
      title: item.title,
      year: item.year,
      director: item.director,
      rating: item.rating,
      genres: item.genres,
      posterUrl: item.posterUrl,
      backdropUrl: (item as any).backdropUrl || item.posterUrl,
      duration: item.duration,
      cast: item.cast,
      overview: item.overview,
      isWatched: false,
      isWatchlist: true,
      isFavorite: false,
    };
    const updated = [newMovie, ...movies];
    setMovies(updated);
    saveStoredCollection("movies", updated);
    setAddSearchInput("");
    setIsAddSearchOpen(false);
    setToastMessage(`"${item.title}" filmi deponuza eklendi.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manuel Film Kaydet
  const handleSaveManualMovie = () => {
    if (!manualTitle.trim()) {
      alert("Lütfen film adını girin.");
      return;
    }
    const newMovie: MovieItem = {
      id: "m_" + Date.now(),
      title: manualTitle.trim(),
      year: parseInt(manualYear) || 2026,
      director: manualDirector.trim() || "Bilinmiyor",
      rating: parseFloat(manualRating) || 8.0,
      genres: ["Kişisel Kayıt"],
      posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
      duration: "2s",
      cast: [],
      overview: manualOverview.trim() || "Kullanıcı tarafından manuel eklendi.",
      isWatched: true,
      isWatchlist: false,
      isFavorite: false,
    };
    setMovies([newMovie, ...movies]);
    setManualTitle("");
    setManualYear("");
    setManualDirector("");
    setManualRating("");
    setManualOverview("");
    setIsManualModalOpen(false);
  };

  // Filtreleme ve Sıralama
  const filteredMovies = movies
    .filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;

      if (activeFilter === "watched") return m.isWatched;
      if (activeFilter === "watchlist") return m.isWatchlist;
      if (activeFilter === "favorites") return m.isFavorite;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "year") return b.year - a.year;
      return a.title.localeCompare(b.title);
    });

  // İstatistikler
  const watchedCount = movies.filter((m) => m.isWatched).length;
  const watchlistCount = movies.filter((m) => m.isWatchlist).length;
  const favoritesCount = movies.filter((m) => m.isFavorite).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. SİNEMATİK ÜST BAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  Sinema Kulübü & Başyapıtlar
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  Akıllı Depo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {movies.length} Film Arşivde • {watchedCount} İzlendi • {favoritesCount} Favori
              </p>
            </div>
          </div>
        </div>

        {/* Sağ Eylemler: Tema Değiştirici, Kilit Switch'i & Film Ekle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Depo Kilidi Switch'i */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isLocked
                ? "bg-rose-50 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/50 text-rose-700 dark:text-rose-300"
                : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Depo Şifre Koruması (On/Off)"
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Kilitli</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Korumasız</span>
              </>
            )}
          </button>

          {/* Koleksiyon Dışa Aktar (JSON) */}
          <button
            onClick={() => {
              exportMovieCollection(movies, "Film_Koleksiyonu_Yedek");
              setToastMessage(`${movies.length} adet film JSON olarak dışa aktarıldı.`);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Film Arşivini JSON Olarak İndir"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Arşivi İndir</span>
          </button>

          {/* Film Ekle Butonu */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Film / Dizi Ekle</span>
          </motion.button>
        </div>
      </header>

      {/* 2. FİLTRE VE ARAMA ŞERİDİ */}
      <div className="border-b border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xs px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Durum Sekmeleri (Section 7.4 İzlendi/İzlenecek/Favori) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tüm Filmler ({movies.length})
            </button>
            <button
              onClick={() => setActiveFilter("watched")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "watched"
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-900/30"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>İzlendi ({watchedCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter("watchlist")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "watchlist"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-900/30"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>İzlenecek ({watchlistCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter("favorites")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "favorites"
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-900/30"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favoriler ({favoritesCount})</span>
            </button>
          </div>

          {/* Sağ: Yerel Arama & Sıralama */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bu depoda film ara..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-purple-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
              >
                <option value="rating">Puana Göre</option>
                <option value="year">Yıla Göre</option>
                <option value="title">İsme Göre (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SİNEMATİK POSTER IZGARASI (LETTERBOXD / NETFLIX TARZI) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {filteredMovies.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-200 dark:border-purple-500/20">
              <Clapperboard className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Bu filtrede film bulunamadı</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Farklı bir arama yapabilir veya yukarıdaki "Film / Dizi Ekle" butonuna basarak arşivine yeni filmler ekleyebilirsin.
            </p>
            <button
              onClick={() => setIsAddSearchOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              + Film Ara ve Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredMovies.map((movie) => (
              <motion.div
                key={movie.id}
                layout
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={() => setSelectedMovie(movie)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-xs hover:border-purple-400 dark:hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-100 dark:hover:shadow-purple-950/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Dikey Afiş (2:3 Oranı) */}
                <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Üst Gradyan Karartma & Puan Rozeti */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 flex flex-col justify-between p-3 opacity-90 group-hover:opacity-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10 shadow-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{movie.rating}</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteMovie(movie.id, e)}
                        className="p-1 rounded-md text-white/50 hover:text-rose-400 hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Filmi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Hover ile açığa çıkan yönetmen & tür bilgisi */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider line-clamp-1">
                        {movie.director}
                      </div>
                      <div className="text-[11px] font-bold text-white line-clamp-1">
                        {movie.title}
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium">
                        {movie.year} • {movie.genres[0]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* KART ALTI: 3 İKONLU KONTROL (Section 7.4) */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-around gap-1">
                  {/* 1. İzlenecek Butonu */}
                  <button
                    onClick={(e) => toggleMovieStatus(movie.id, "isWatchlist", e)}
                    title={movie.isWatchlist ? "İzleme Listesinden Çıkar" : "İzleme Listesine Ekle"}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                      movie.isWatchlist
                        ? "bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/40 shadow-xs"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${movie.isWatchlist ? "fill-sky-500 dark:fill-sky-400" : ""}`}
                    />
                  </button>

                  {/* 2. İzlendi Butonu */}
                  <button
                    onClick={(e) => toggleMovieStatus(movie.id, "isWatched", e)}
                    title={movie.isWatched ? "İzlendi İşaretini Kaldır" : "İzlendi Olarak İşaretle"}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                      movie.isWatched
                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 shadow-xs"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* 3. Favori Butonu */}
                  <button
                    onClick={(e) => toggleMovieStatus(movie.id, "isFavorite", e)}
                    title={movie.isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                      movie.isFavorite
                        ? "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40 shadow-xs"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${movie.isFavorite ? "fill-rose-500 dark:fill-rose-400" : ""}`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* 4. FİLM ARAMA & EKLEME MODALI (Section 7.3) */}
      <AnimatePresence>
        {isAddSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsAddSearchOpen(false)}
              className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Film veya Dizi Ara</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Afişi ve tüm bilgileri otomatik çekip depoya ekleyin.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddSearchOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Arama Girişi */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addSearchInput}
                  onChange={(e) => setAddSearchInput(e.target.value)}
                  placeholder="Örn: Fight Club, Matrix, Pulp Fiction..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-950 transition-all"
                  autoFocus
                />
              </div>

              {/* Arama Sonuçları */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {isSearchingOnline ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-xs font-semibold">Canlı film veritabanında aranıyor...</span>
                  </div>
                ) : (addSearchInput.trim().length >= 2 ? onlineSearchResults : SEARCH_DATABASE).length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    Aradığınız isimde bir film bulunamadı. Aşağıdan manuel ekleyebilirsiniz.
                  </div>
                ) : (
                  (addSearchInput.trim().length >= 2 ? onlineSearchResults : SEARCH_DATABASE).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-950/60 hover:bg-purple-50/50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded-xl shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.title}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">({item.year})</span>
                            <span className="flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 font-bold ml-1">
                              <Star className="w-3 h-3 fill-amber-500 dark:fill-amber-400" /> {item.rating}
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-0.5 truncate">
                            Yönetmen: {item.director}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.overview}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddMovieFromSearch(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                      >
                        + Depoya Ekle
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Alt Buton: Manuel Film Ekle */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Aradığın filmi bulamadın mı?</span>
                <button
                  onClick={() => {
                    setIsAddSearchOpen(false);
                    setIsManualModalOpen(true);
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  Manuel Olarak Ekle →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MANUEL FİLM EKLEME MODALI (Section 7.5) */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsManualModalOpen(false)}
              className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-xs"
            />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Manuel Film Kaydı Oluştur</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kaynakta bulunmayan nadir veya bağımsız filmler için bilgileri elle girin.
              </p>

              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Film Adı *"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    placeholder="Yıl (Örn: 2024)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={manualRating}
                    onChange={(e) => setManualRating(e.target.value)}
                    placeholder="Puan (Örn: 8.5)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500"
                  />
                </div>
                <input
                  type="text"
                  value={manualDirector}
                  onChange={(e) => setManualDirector(e.target.value)}
                  placeholder="Yönetmen"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500"
                />
                <textarea
                  value={manualOverview}
                  onChange={(e) => setManualOverview(e.target.value)}
                  placeholder="Film hakkında kısa özet veya kişisel notun..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveManualMovie}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. SİNEMATİK FİLM DETAY MODALI */}
      <AnimatePresence>
        {selectedMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setSelectedMovie(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Üst Backdrop Görseli */}
              <div className="h-48 sm:h-64 relative overflow-hidden bg-slate-950 shrink-0">
                <img
                  src={selectedMovie.backdropUrl || selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/40 dark:via-slate-900/40 to-transparent" />

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      exportMovieCollection([selectedMovie], selectedMovie.title);
                      setToastMessage(`"${selectedMovie.title}" film kaydı JSON olarak indirildi.`);
                    }}
                    title="Bu Filmi JSON Olarak İndir"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-slate-800 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>İndir (.json)</span>
                  </button>
                  <button
                    onClick={() => {
                      const token = createOrGetShareTokenForRecord(
                        selectedMovie,
                        "movie",
                        "Sinema Kulübü & Başyapıtlar"
                      );
                      window.open(`/share/${token}`, "_blank");
                    }}
                    title="Bu Filmi Salt Okunur Paylaş (Tekil İçerik)"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-purple-600 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all shadow-md"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bu Filmi Paylaş</span>
                  </button>
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="p-2 rounded-full bg-black/50 text-white/80 hover:text-white backdrop-blur-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Başlık ve Temel Bilgiler Backdrop Üzerinde */}
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 font-bold mb-1">
                    <span>{selectedMovie.year}</span>
                    <span>•</span>
                    <span>{selectedMovie.duration}</span>
                    <span>•</span>
                    <span>{selectedMovie.genres.join(", ")}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-xs">
                    {selectedMovie.title}
                  </h2>
                </div>
              </div>

              {/* Detay Gövdesi */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* 3 İkonlu Durum Butonları (Modal İçi) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Durum:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMovieStatus(selectedMovie.id, "isWatchlist")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMovie.isWatchlist
                          ? "bg-sky-500 text-white"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>İzlenecek</span>
                    </button>
                    <button
                      onClick={() => toggleMovieStatus(selectedMovie.id, "isWatched")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMovie.isWatched
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>İzlendi</span>
                    </button>
                    <button
                      onClick={() => toggleMovieStatus(selectedMovie.id, "isFavorite")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMovie.isFavorite
                          ? "bg-rose-500 text-white"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Favori</span>
                    </button>
                  </div>
                </div>

                {/* Özet & Bilgiler */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Film Özeti
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedMovie.overview}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Yönetmen</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{selectedMovie.director}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Başrol Oyuncuları</span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {selectedMovie.cast && selectedMovie.cast.length > 0
                        ? selectedMovie.cast.join(", ")
                        : "Belirtilmedi"}
                    </span>
                  </div>
                </div>

                {/* Kişisel Not & Eleştiri Alanı */}
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                      Kişisel Arşiv Notum
                    </span>
                    {selectedMovie.userRating && (
                      <span className="text-amber-500 dark:text-amber-400">★ {selectedMovie.userRating}/10</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{selectedMovie.userNote || "Bu filme henüz kişisel not eklenmedi."}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. HIZLI GERİ ALMA (UNDO TOAST) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 text-xs font-medium"
          >
            <span>{toastMessage}</span>
            <button
              onClick={handleUndoDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Geri Al</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
