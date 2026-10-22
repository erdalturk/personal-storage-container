"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  addToTrash,
  getStoredCollection,
  saveStoredCollection,
} from "@/lib/appStore";
import {
  ArrowLeft,
  Search,
  Plus,
  Copy,
  Check,
  Code2,
  Trash2,
  Share2,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  X,
  FileCode,
  Tag,
  Clock,
  Terminal,
  Layers,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Edit3,
  Bookmark,
  CheckCircle2,
  Download,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { exportCodeFile } from "@/lib/exportUtils";

// Desteklenen Yazılım Dilleri & Renk Temaları
export type SupportedLang =
  | "typescript"
  | "javascript"
  | "python"
  | "sql"
  | "rust"
  | "go"
  | "bash"
  | "html"
  | "css"
  | "json"
  | "dockerfile";

interface LangMeta {
  id: SupportedLang;
  name: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

export const LANGUAGES: Record<SupportedLang, LangMeta> = {
  typescript: {
    id: "typescript",
    name: "TypeScript",
    badgeBg: "bg-blue-500/15 border-blue-500/30",
    badgeText: "text-blue-400",
    dotColor: "bg-blue-400",
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    badgeBg: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-400",
    dotColor: "bg-amber-400",
  },
  python: {
    id: "python",
    name: "Python",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30",
    badgeText: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  sql: {
    id: "sql",
    name: "SQL (PostgreSQL)",
    badgeBg: "bg-cyan-500/15 border-cyan-500/30",
    badgeText: "text-cyan-400",
    dotColor: "bg-cyan-400",
  },
  rust: {
    id: "rust",
    name: "Rust",
    badgeBg: "bg-orange-500/15 border-orange-500/30",
    badgeText: "text-orange-400",
    dotColor: "bg-orange-400",
  },
  go: {
    id: "go",
    name: "Go (Golang)",
    badgeBg: "bg-sky-500/15 border-sky-500/30",
    badgeText: "text-sky-400",
    dotColor: "bg-sky-400",
  },
  bash: {
    id: "bash",
    name: "Bash / Shell",
    badgeBg: "bg-lime-500/15 border-lime-500/30",
    badgeText: "text-lime-400",
    dotColor: "bg-lime-400",
  },
  html: {
    id: "html",
    name: "HTML / JSX",
    badgeBg: "bg-rose-500/15 border-rose-500/30",
    badgeText: "text-rose-400",
    dotColor: "bg-rose-400",
  },
  css: {
    id: "css",
    name: "CSS / Tailwind",
    badgeBg: "bg-indigo-500/15 border-indigo-500/30",
    badgeText: "text-indigo-400",
    dotColor: "bg-indigo-400",
  },
  json: {
    id: "json",
    name: "JSON",
    badgeBg: "bg-zinc-500/15 border-zinc-500/30",
    badgeText: "text-zinc-400",
    dotColor: "bg-zinc-400",
  },
  dockerfile: {
    id: "dockerfile",
    name: "Dockerfile",
    badgeBg: "bg-blue-600/15 border-blue-600/30",
    badgeText: "text-blue-300",
    dotColor: "bg-blue-300",
  },
};

export interface CodeSnippet {
  id: string;
  title: string;
  language: SupportedLang;
  code: string;
  description?: string;
  tags: string[];
  createdAt: string;
  isFavorite?: boolean;
}

// Demo Başlangıç Kod Parçacıkları (Zengin, gerçekçi yazılım kütüphanesi)
const INITIAL_SNIPPETS: CodeSnippet[] = [
  {
    id: "sn-1",
    title: "Supabase RLS Policy with Auth Check",
    language: "sql",
    tags: ["#database", "#supabase", "#rls", "#security"],
    description: "Kullanıcının sadece kendi depo ve dökümanlarını okuyup güncelleyebilmesini sağlayan Row Level Security (RLS) kuralı.",
    createdAt: "2 saat önce",
    isFavorite: true,
    code: `-- Kullanıcıların yalnızca kendi depolarını görmesini ve düzenlemesini sağlayan RLS kuralı
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own containers"
ON containers
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- İndeks ekleyerek sorgu performansını garantiye alalım
CREATE INDEX IF NOT EXISTS idx_containers_user_id ON containers(user_id);`,
  },
  {
    id: "sn-2",
    title: "FastAPI JWT Bearer Middleware",
    language: "python",
    tags: ["#api", "#auth", "#fastapi", "#jwt"],
    description: "Bearer token kontrolü yapan ve geçersiz oturumlarda 401 Unauthorized fırlatan temiz dependency fonksiyonu.",
    createdAt: "Dün",
    isFavorite: true,
    code: `from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()
SECRET_KEY = "your-personal-secret-key"
ALGORITHM = "HS256"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")
        return {"user_id": user_id, "email": payload.get("email")}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum doğrulaması başarısız oldu",
        )`,
  },
  {
    id: "sn-3",
    title: "Next.js 16 Server-Sent Event Hook (useSSE)",
    language: "typescript",
    tags: ["#react", "#nextjs", "#hook", "#streaming"],
    description: "AI yanıtlarını ve sunucu olaylarını stream formatında dinlemek için temiz React hook'u.",
    createdAt: "3 gün önce",
    isFavorite: false,
    code: `import { useState, useEffect, useCallback } from "react";

export function useSSE(url: string | null) {
  const [data, setData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startStream = useCallback(() => {
    if (!url) return;
    setIsLoading(true);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setData((prev) => prev + event.data);
    };

    eventSource.onerror = (err) => {
      setError(new Error("Stream bağlantı hatası"));
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
      setIsLoading(false);
    };
  }, [url]);

  return { data, isLoading, error, startStream };
}`,
  },
  {
    id: "sn-4",
    title: "Rust Thread-Safe Counter (Arc + Mutex)",
    language: "rust",
    tags: ["#rust", "#concurrency", "#multithread"],
    description: "Farklı thread'ler arasında güvenli veri paylaşımı ve mutasyon için standart Arc<Mutex<T>> kalıbı.",
    createdAt: "5 gün önce",
    isFavorite: false,
    code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter_clone = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter_clone.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Sonuç: {}", *counter.lock().unwrap());
}`,
  },
  {
    id: "sn-5",
    title: "Docker Multi-Stage Next.js Build",
    language: "dockerfile",
    tags: ["#docker", "#devops", "#deployment"],
    description: "Next.js standalone çıktısını minimale indirgeyen ultra hafif (~120MB) multi-stage üretim konteyneri.",
    createdAt: "1 hafta önce",
    isFavorite: false,
    code: `FROM node:20-alpine AS base

# 1. Bağımlılıkları yükle
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Kaynak kodları derle
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Üretim Runner katmanı
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]`,
  },
  {
    id: "sn-6",
    title: "Tailwind Glassmorphism CSS Snippet",
    language: "css",
    tags: ["#ui", "#css", "#tailwind", "#glassmorphism"],
    description: "Buzlu cam efekti için modern backdrop-blur ve border gradyan stili.",
    createdAt: "2 hafta önce",
    isFavorite: false,
    code: `@utility glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
}

@utility glass-panel-dark {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}`,
  },
];

// Basit, Hızlı ve %100 Güvenli Syntax Tokenizer (Harici kütüphane gerektirmez)
function highlightCode(code: string, language: SupportedLang): React.ReactNode[] {
  const lines = code.split("\n");

  return lines.map((line, lineIdx) => {
    // Boş satır
    if (!line.trim()) {
      return (
        <div key={lineIdx} className="leading-6">
          &nbsp;
        </div>
      );
    }

    // Basit yorum satırı tespiti
    if (
      line.trim().startsWith("//") ||
      line.trim().startsWith("#") ||
      line.trim().startsWith("--")
    ) {
      return (
        <div key={lineIdx} className="leading-6 text-slate-500 italic">
          {line}
        </div>
      );
    }

    // Kelime bazında temel renklendirme
    const words = line.split(/(\s+|[(){}[\].,;:"'`=+\-*/<>!&|])/);

    const renderedWords = words.map((token, tokenIdx) => {
      // Anahtar Kelimeler (Keywords)
      if (
        /^(const|let|var|function|return|import|export|from|async|await|class|interface|type|public|private|def|if|else|elif|for|while|try|except|fn|mut|impl|pub|struct|enum|match|use|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|ON|CREATE|TABLE|ALTER|POLICY|ENABLE|ROW|LEVEL|SECURITY|FROM|WORKDIR|RUN|COPY|EXPOSE|CMD|ENV)$/i.test(
          token
        )
      ) {
        return (
          <span key={tokenIdx} className="text-purple-400 font-semibold">
            {token}
          </span>
        );
      }

      // Built-in Tipler & Değerler
      if (/^(true|false|null|undefined|None|True|False|string|number|boolean|any|void|int|str|dict|list|u32|i32|usize|Vec|Option|Some|Ok|Err)$/.test(token)) {
        return (
          <span key={tokenIdx} className="text-amber-400">
            {token}
          </span>
        );
      }

      // Metin Dizeleri (Strings)
      if (/^["'`].*["'`]$/.test(token)) {
        return (
          <span key={tokenIdx} className="text-emerald-400">
            {token}
          </span>
        );
      }

      // Sayılar
      if (/^\d+$/.test(token)) {
        return (
          <span key={tokenIdx} className="text-sky-300">
            {token}
          </span>
        );
      }

      return <span key={tokenIdx}>{token}</span>;
    });

    return (
      <div key={lineIdx} className="leading-6 whitespace-pre">
        {renderedWords}
      </div>
    );
  });
}

export default function CodeContainerPage() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);

  useEffect(() => {
    setSnippets(getStoredCollection("snippets", INITIAL_SNIPPETS));

    const handleUpdate = () => {
      setSnippets(getStoredCollection("snippets", INITIAL_SNIPPETS));
    };

    window.addEventListener("psc-store-updated", handleUpdate);
    return () => window.removeEventListener("psc-store-updated", handleUpdate);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Detay & Düzenleme Modalı State'leri
  const [detailSnippet, setDetailSnippet] = useState<CodeSnippet | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);

  // Editör Form State'leri
  const [editTitle, setEditTitle] = useState("");
  const [editLang, setEditLang] = useState<SupportedLang>("typescript");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");

  // Kopyalama & Toast Bildirimleri
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletedSnippetCache, setDeletedSnippetCache] = useState<{
    item: CodeSnippet;
    index: number;
  } | null>(null);

  // Mevcut benzersiz etiketler
  const allTags = useMemo(() => {
    const set = new Set<string>();
    snippets.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [snippets]);

  // Filtreleme Mantığı
  const filteredSnippets = useMemo(() => {
    return snippets.filter((item) => {
      // Dil filtresi
      if (selectedLang !== "all" && item.language !== selectedLang) {
        return false;
      }
      // Etiket filtresi
      if (selectedTag !== "all" && !item.tags.includes(selectedTag)) {
        return false;
      }
      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inCode = item.code.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inCode && !inDesc && !inTag) return false;
      }
      return true;
    });
  }, [snippets, selectedLang, selectedTag, searchQuery]);

  // 1-Tıkla Kopyala Eylemi (Duolingo Mikro Etkileşimi)
  const handleCopyCode = (id: string, code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Yeni Kod Ekleme Modalını Aç
  const handleOpenNewSnippet = () => {
    setEditingSnippet(null);
    setEditTitle("");
    setEditLang("typescript");
    setEditCode("");
    setEditDescription("");
    setEditTags("#helper, #utility");
    setIsEditorOpen(true);
  };

  // Mevcut Kodu Düzenleme Modalını Aç
  const handleOpenEditSnippet = (snippet: CodeSnippet, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSnippet(snippet);
    setEditTitle(snippet.title);
    setEditLang(snippet.language);
    setEditCode(snippet.code);
    setEditDescription(snippet.description || "");
    setEditTags(snippet.tags.join(", "));
    setIsEditorOpen(true);
  };

  // Kodu Kaydet (Ekle veya Güncelle)
  const handleSaveSnippet = () => {
    if (!editTitle.trim()) {
      alert("Lütfen bir başlık girin.");
      return;
    }
    if (!editCode.trim()) {
      alert("Lütfen kod içeriğini yazın.");
      return;
    }

    const parsedTags = editTags
      .split(/[, ]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    if (editingSnippet) {
      // Güncelleme
      const updated = snippets.map((s) =>
        s.id === editingSnippet.id
          ? {
              ...s,
              title: editTitle.trim(),
              language: editLang,
              code: editCode,
              description: editDescription.trim(),
              tags: parsedTags.length > 0 ? parsedTags : ["#snippet"],
            }
          : s
      );
      setSnippets(updated);
      saveStoredCollection("snippets", updated);

      if (detailSnippet && detailSnippet.id === editingSnippet.id) {
        setDetailSnippet({
          ...detailSnippet,
          title: editTitle.trim(),
          language: editLang,
          code: editCode,
          description: editDescription.trim(),
          tags: parsedTags.length > 0 ? parsedTags : ["#snippet"],
        });
      }
      setToastMessage("Kod parçacığı başarıyla güncellendi.");
    } else {
      // Yeni Ekleme
      const newSnippet: CodeSnippet = {
        id: `sn-${Date.now()}`,
        title: editTitle.trim(),
        language: editLang,
        code: editCode,
        description: editDescription.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ["#kod"],
        createdAt: "Az önce",
        isFavorite: false,
      };
      const updated = [newSnippet, ...snippets];
      setSnippets(updated);
      saveStoredCollection("snippets", updated);
      setToastMessage("Yeni kod parçacığı arşive eklendi.");
    }

    setIsEditorOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Kodu Sil (Çöp Kutusuna Gönder & Varsa Paylaşımını Otomatik İptal Et)
  const handleDeleteSnippet = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const index = snippets.findIndex((s) => s.id === id);
    if (index === -1) return;
    const target = snippets[index];

    // 1. Çöp Kutusuna Gönder (Bu işlem varsa paylaşılan içeriklerden de anında kaldırır ve iptal eder!)
    addToTrash({
      title: target.title,
      originContainer: "Frontend & Fullstack Snippet'lar",
      type: "code",
      contentPreview: target.description || target.code.slice(0, 80),
      originalData: target,
    });

    setDeletedSnippetCache({ item: target, index });
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    saveStoredCollection("snippets", updated);
    if (detailSnippet && detailSnippet.id === id) {
      setDetailSnippet(null);
    }

    setToastMessage(`"${target.title}" çöp kutusuna taşındı.`);
    setTimeout(() => {
      setToastMessage((curr) => (curr ? null : curr));
    }, 5000);
  };

  // Silmeyi Geri Al
  const handleUndoDelete = () => {
    if (!deletedSnippetCache) return;
    const { item, index } = deletedSnippetCache;
    const next = [...snippets];
    next.splice(index, 0, item);
    setSnippets(next);
    saveStoredCollection("snippets", next);
    setDeletedSnippetCache(null);
    setToastMessage(`"${item.title}" geri yüklendi.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* 1. ÜST HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-white">
                Frontend & Fullstack Snippet'lar
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Akıllı Depo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Syntax highlighting, dil filtreleri, hızlı kopyalama ve geliştirici notları
            </p>
          </div>
        </div>

        {/* Sağ Butonlar: Tema, Yeni Kod Ekle & Depoyu Paylaş */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={() => window.open("/share/kod-parcaciklari-deposu", "_blank")}
            title="Tüm Kod Deposunu Salt Okunur Paylaş"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Depoyu Paylaş</span>
          </button>

          <button
            onClick={handleOpenNewSnippet}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kod Ekle</span>
          </button>
        </div>
      </header>

      {/* 2. ARAMA, DİL VE ETİKET FİLTRE ŞERİDİ */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xs p-4 sm:px-8 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Arama Alanı */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Başlık, kod, etiket (#auth) veya açıklama ara..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sağ Kontroller: Görünüm Değiştirici (Grid / List) */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Galeri
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>

        {/* Dil Seçim Sekmeleri */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedLang("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedLang === "all"
                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm shadow-emerald-500/20"
                : "bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            Tüm Diller ({snippets.length})
          </button>
          {(Object.keys(LANGUAGES) as SupportedLang[]).map((langKey) => {
            const count = snippets.filter((s) => s.language === langKey).length;
            if (count === 0 && selectedLang !== langKey) return null;
            const meta = LANGUAGES[langKey];
            return (
              <button
                key={langKey}
                onClick={() => setSelectedLang(langKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedLang === langKey
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm shadow-emerald-500/20"
                    : "bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
                <span>{meta.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Popüler Etiketler Şeridi */}
        {allTags.length > 0 && (
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto text-[11px] pt-0.5">
            <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-slate-500" />
              Etiketler:
            </span>
            <button
              onClick={() => setSelectedTag("all")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                selectedTag === "all"
                  ? "bg-slate-700 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Hepsi
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                className={`px-2 py-0.5 rounded-lg font-mono transition-colors ${
                  selectedTag === tag
                    ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. ANA İÇERİK: KOD PARÇALARI */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {filteredSnippets.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-16 text-center border-2 border-dashed border-slate-800 space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <FileCode className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-white">Bu filtrede kod parçacığı bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Farklı bir dil/etiket seçebilir veya yukarıdaki "+ Yeni Kod Ekle" butonuna tıklayarak ilk kodunu arşive kaydedebilirsin.
            </p>
            <button
              onClick={handleOpenNewSnippet}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              + Yeni Kod Ekle
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ======================================================== */
          /* GALERİ (GRID) GÖRÜNÜMÜ: macOS TERMINAL PENCERE STİLİ    */
          /* ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredSnippets.map((snippet) => {
              const langMeta = LANGUAGES[snippet.language];
              const lines = snippet.code.split("\n");
              const isLong = lines.length > 12; // 1 numaralı karar: Uzun kodlar için önizleme sınırı
              const displayLines = isLong ? lines.slice(0, 11).join("\n") : snippet.code;

              return (
                <motion.div
                  key={snippet.id}
                  layout
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => setDetailSnippet(snippet)}
                  className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-lg overflow-hidden flex flex-col justify-between group cursor-pointer transition-all hover:shadow-emerald-950/20"
                >
                  {/* Terminal Penceresi Üst Başlığı (macOS Noktaları) */}
                  <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 pl-2">
                        {snippet.language}
                      </span>
                    </div>

                    {/* Dil Rozeti & 1-Tıkla Kopyala Butonu */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${langMeta.badgeBg} ${langMeta.badgeText}`}
                      >
                        {langMeta.name}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportCodeFile(snippet.title, snippet.code, snippet.language);
                          setToastMessage(`"${snippet.title}" kaynak dosyası indirildi.`);
                        }}
                        title="Dosya Olarak İndir"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleCopyCode(snippet.id, snippet.code, e)}
                        title="Kodu Kopyala"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                      >
                        {copiedId === snippet.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Kod İçeriği (Syntax Highlighting + Satır Sınırı) */}
                  <div className="relative p-4 font-mono text-xs text-slate-200 bg-slate-950/40 overflow-hidden min-h-[160px] max-h-[250px]">
                    <div className="flex gap-3">
                      {/* Satır Numaraları */}
                      <div className="select-none text-slate-600 text-right pr-2 border-r border-slate-800/60 font-mono text-[11px]">
                        {(isLong ? lines.slice(0, 11) : lines).map((_, i) => (
                          <div key={i} className="leading-6">
                            {i + 1}
                          </div>
                        ))}
                      </div>

                      {/* Kod Gövdesi */}
                      <div className="flex-1 overflow-x-auto scrollbar-none font-mono text-[11px]">
                        {highlightCode(displayLines, snippet.language)}
                      </div>
                    </div>

                    {/* Uzun Kodlar İçin Gradyan Karartma & "Tamamını İncele" Butonu (Karar 1) */}
                    {isLong && (
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent flex items-end justify-center pb-2 z-10">
                        <span className="text-[11px] font-bold text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                          Tamamını İncele ({lines.length} satır) →
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Kart Alt Bilgileri: Başlık, Açıklama, Etiketler & Eylemler */}
                  <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {snippet.title}
                      </h3>
                      {snippet.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {snippet.description}
                        </p>
                      )}
                    </div>

                    {/* Etiketler */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {snippet.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Alt Bilgi & Sil / Düzenle Butonları */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {snippet.createdAt}
                      </span>

                      {/* Not: Karar 2 doğrultusunda burada kopya sayacı yer almamaktadır */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open("/share/snippet-jwt-auth", "_blank");
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Bu Kodu Salt Okunur Paylaş (Tekil İçerik)"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenEditSnippet(snippet, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                          title="Kodu Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSnippet(snippet.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
                          title="Sil (Çöp Kutusu)"
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
        ) : (
          /* ======================================================== */
          /* LİSTE (LIST) GÖRÜNÜMÜ                                     */
          /* ======================================================== */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Başlık & Not</th>
                  <th className="py-3 px-4">Dil</th>
                  <th className="py-3 px-4">Etiketler</th>
                  <th className="py-3 px-4">Satır</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSnippets.map((snippet) => {
                  const meta = LANGUAGES[snippet.language];
                  const lineCount = snippet.code.split("\n").length;

                  return (
                    <tr
                      key={snippet.id}
                      onClick={() => setDetailSnippet(snippet)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {snippet.title}
                        </div>
                        {snippet.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {snippet.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeBg} ${meta.badgeText}`}
                        >
                          {meta.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {snippet.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {lineCount} satır
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {snippet.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleCopyCode(snippet.id, snippet.code, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Kodu Kopyala"
                          >
                            {copiedId === snippet.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleOpenEditSnippet(snippet, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSnippet(snippet.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 4. TAM EKRAN KOD DETAY MODALI */}
      <AnimatePresence>
        {detailSnippet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailSnippet(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Üst Şeridi */}
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${LANGUAGES[detailSnippet.language].badgeBg} ${LANGUAGES[detailSnippet.language].badgeText}`}
                    >
                      {LANGUAGES[detailSnippet.language].name}
                    </span>
                    <span className="text-xs text-slate-400">{detailSnippet.createdAt}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{detailSnippet.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      exportCodeFile(detailSnippet.title, detailSnippet.code, detailSnippet.language);
                      setToastMessage(`"${detailSnippet.title}" kaynak kodu indirildi.`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                    title="Dosya Olarak İndir"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Dosyayı İndir</span>
                  </button>

                  <button
                    onClick={() => handleCopyCode(detailSnippet.id, detailSnippet.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    {copiedId === detailSnippet.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === detailSnippet.id ? "Kopyalandı" : "Kodu Kopyala"}</span>
                  </button>

                  <button
                    onClick={() => {
                      const target = detailSnippet;
                      setDetailSnippet(null);
                      handleOpenEditSnippet(target);
                    }}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDetailSnippet(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Kod ve Notlar Gövdesi */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Kişisel Kullanım / Arşiv Notu */}
                {detailSnippet.description && (
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Kişisel Arşiv & Kullanım Notu</span>
                    </div>
                    <p className="leading-relaxed">{detailSnippet.description}</p>
                  </div>
                )}

                {/* Tam Kod Bloğu */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
                  <div className="flex gap-4">
                    <div className="select-none text-slate-600 text-right pr-3 border-r border-slate-800/80 text-xs">
                      {detailSnippet.code.split("\n").map((_, i) => (
                        <div key={i} className="leading-6">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-x-auto font-mono text-xs leading-6">
                      {highlightCode(detailSnippet.code, detailSnippet.language)}
                    </div>
                  </div>
                </div>

                {/* Etiketler */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-500 font-bold">Etiketler:</span>
                  {detailSnippet.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. YENİ KOD EKLEME / DÜZENLEME MODALI */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-lg text-white">
                  {editingSnippet ? "Kod Parçacığını Düzenle" : "Yeni Kod Parçacığı Ekle"}
                </h3>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Başlık & Dil Seçimi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-400">Başlık *</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Örn: FastAPI JWT Bearer Middleware"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Yazılım Dili *</label>
                    <select
                      value={editLang}
                      onChange={(e) => setEditLang(e.target.value as SupportedLang)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                    >
                      {(Object.keys(LANGUAGES) as SupportedLang[]).map((langKey) => (
                        <option key={langKey} value={langKey}>
                          {LANGUAGES[langKey].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Kod İçeriği (Monospace Textarea) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400">Kod Bloğu *</label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {editCode.split("\n").length} satır
                    </span>
                  </div>
                  <textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="// Kodlarınızı buraya yapıştırın veya yazın..."
                    rows={10}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs leading-relaxed outline-none focus:border-emerald-500 resize-none transition-colors"
                  />
                </div>

                {/* Kişisel Kullanım Notu */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">
                    Kişisel Not & Açıklama (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Bu kod parçası nerede kullanılır? Örn: Kimlik doğrulama kontrollerinde."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Etiketler */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="#auth, #api, #jwt, #security"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveSnippet}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-colors"
                >
                  {editingSnippet ? "Değişiklikleri Kaydet" : "Arşive Ekle"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. HIZLI GERİ ALMA (UNDO TOAST) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 text-xs font-medium"
          >
            <span>{toastMessage}</span>
            {deletedSnippetCache && (
              <button
                onClick={handleUndoDelete}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Geri Al</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
