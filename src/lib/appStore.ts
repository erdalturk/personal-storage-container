"use client";

// Merkezi Veri Depolama & Senkronizasyon Katmanı (Client-Side Reactive Store)
// Sayfalar (Home, Containers, Trash, Profile, Share) arasında silinen içeriklerin,
// çöp kutusunun ve paylaşılan bağlantıların anında senkronize olmasını sağlar.

export interface TrashItem {
  id: string;
  title: string;
  originContainer: string;
  type: "container" | "text" | "movie" | "code" | "travel" | "study" | "file";
  deletedAt: string;
  daysRemaining: number;
  contentPreview?: string;
  posterUrl?: string;
  originalData?: any; // Geri yükleme (Restore) için orijinal veri yedeği
}

export interface SharedLink {
  id: string;
  token: string;
  itemTitle: string;
  containerName: string;
  type: "text" | "movie" | "code" | "travel" | "study" | "container";
  scope: "container" | "item";
  createdAt: string;
  views: number;
  isActive: boolean;
}

const STORAGE_KEYS = {
  TRASH: "psc_trash_items",
  SHARED: "psc_shared_links",
  DELETED_TOKENS: "psc_deleted_tokens",
  CONTAINERS: "psc_containers",
  MOVIES: "psc_movies",
  TEXTS: "psc_texts",
  SNIPPETS: "psc_snippets",
  TRAVELS: "psc_travels",
  STUDY: "psc_study_notes",
};

// 1. Çöp Kutusu Başlangıç Verileri
const INITIAL_TRASH: TrashItem[] = [
  {
    id: "tr-seed-1",
    title: "Eski Taslak Şiir Denemesi",
    originContainer: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    deletedAt: "Dün 14:20",
    daysRemaining: 29,
    contentPreview: "Yarım kalan kelimelerin ardında saklanan sessizlik...",
  },
  {
    id: "tr-seed-2",
    title: "Tenet (2020)",
    originContainer: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    deletedAt: "3 gün önce",
    daysRemaining: 27,
    contentPreview: "Christopher Nolan • Bilim Kurgu • Zamanın tersine akışı",
    posterUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
  },
];

// 2. Paylaşılan İçerikler Başlangıç Verileri
const INITIAL_SHARED: SharedLink[] = [
  {
    id: "s1",
    token: "sinema-kulubu-deposu",
    itemTitle: "Sinema Kulübü & Başyapıtlar",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 42,
    isActive: true,
  },
  {
    id: "s2",
    token: "gece-siirleri-deposu",
    itemTitle: "Gece Düşünceleri & Şiirlerim",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 19,
    isActive: true,
  },
  {
    id: "s3",
    token: "kod-parcaciklari-deposu",
    itemTitle: "Frontend & Fullstack Snippet'lar",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 31,
    isActive: true,
  },
  {
    id: "s4",
    token: "inception-arsiv",
    itemTitle: "Inception & Arşiv Notlarım",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    scope: "item",
    createdAt: "3 gün önce",
    views: 28,
    isActive: true,
  },
  {
    id: "s5",
    token: "mavi-aksamustu",
    itemTitle: "Mavi Bir Akşamüstü (Şiir)",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    scope: "item",
    createdAt: "Dün",
    views: 14,
    isActive: true,
  },
  {
    id: "s6",
    token: "snippet-jwt-auth",
    itemTitle: "FastAPI JWT Bearer Middleware",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "code",
    scope: "item",
    createdAt: "Dün",
    views: 9,
    isActive: true,
  },
  {
    id: "s7",
    token: "gezi-ve-seyahat-deposu",
    itemTitle: "Gezi & Seyahat Anıları",
    containerName: "Gezi & Seyahat Anıları",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 24,
    isActive: true,
  },
  {
    id: "s8",
    token: "ege-akdeniz-gezi-rotasi",
    itemTitle: "Yaz 2026 Ege & Akdeniz Gezisi",
    containerName: "Gezi & Seyahat Anıları",
    type: "travel",
    scope: "item",
    createdAt: "3 gün önce",
    views: 18,
    isActive: true,
  },
  {
    id: "s9",
    token: "yapay-zeka-ve-algoritmalar-deposu",
    itemTitle: "Yapay Zekâ & Algoritmalar Dersi",
    containerName: "Yapay Zekâ & Algoritmalar Dersi",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 35,
    isActive: true,
  },
  {
    id: "s10",
    token: "yapay-zeka-ders-notlari",
    itemTitle: "A* Arama & Gradient Descent Özet Notları",
    containerName: "Yapay Zekâ & Algoritmalar Dersi",
    type: "study",
    scope: "item",
    createdAt: "2 gün önce",
    views: 19,
    isActive: true,
  },
];

// Olay bildirimi tetikleyici (Aynı sekmedeki veya sekmeler arası bileşenleri uyarır)
function notifyStoreUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("psc-store-updated"));
  }
}

// Güvenli LocalStorage Okuma
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

// Güvenli LocalStorage Yazma
function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("LocalStorage write error:", err);
  }
}

/* ========================================================================== */
/* ÇÖP KUTUSU (TRASH) YÖNETİMİ                                                */
/* ========================================================================== */

export function getTrashItems(): TrashItem[] {
  return safeGet<TrashItem[]>(STORAGE_KEYS.TRASH, INITIAL_TRASH);
}

export function addToTrash(item: Omit<TrashItem, "id" | "deletedAt" | "daysRemaining"> & { id?: string }): TrashItem {
  const current = getTrashItems();
  const newItem: TrashItem = {
    ...item,
    id: item.id || `tr-${Date.now()}`,
    deletedAt: "Az önce",
    daysRemaining: 30,
  };

  const updated = [newItem, ...current];
  safeSet(STORAGE_KEYS.TRASH, updated);

  // KRİTİK KURAL: Silinen içeriğe veya depoya ait paylaşımları anında iptal et ve kaldır!
  revokeSharesForDeletedItem(newItem.title, newItem.originContainer);

  notifyStoreUpdate();
  return newItem;
}

export function restoreFromTrash(trashId: string): TrashItem | null {
  const current = getTrashItems();
  const target = current.find((i) => i.id === trashId);
  if (!target) return null;

  const updated = current.filter((i) => i.id !== trashId);
  safeSet(STORAGE_KEYS.TRASH, updated);

  // Orijinal koleksiyonuna geri koy
  if (target.originalData) {
    if (target.type === "container") {
      const containers = safeGet<any[]>(STORAGE_KEYS.CONTAINERS, []);
      safeSet(STORAGE_KEYS.CONTAINERS, [target.originalData, ...containers]);
    } else if (target.type === "movie") {
      const movies = safeGet<any[]>(STORAGE_KEYS.MOVIES, []);
      safeSet(STORAGE_KEYS.MOVIES, [target.originalData, ...movies]);
    } else if (target.type === "text") {
      const texts = safeGet<any[]>(STORAGE_KEYS.TEXTS, []);
      safeSet(STORAGE_KEYS.TEXTS, [target.originalData, ...texts]);
    } else if (target.type === "code") {
      const snippets = safeGet<any[]>(STORAGE_KEYS.SNIPPETS, []);
      safeSet(STORAGE_KEYS.SNIPPETS, [target.originalData, ...snippets]);
    } else if (target.type === "travel") {
      const travels = safeGet<any[]>(STORAGE_KEYS.TRAVELS, []);
      safeSet(STORAGE_KEYS.TRAVELS, [target.originalData, ...travels]);
    }
  }

  notifyStoreUpdate();
  return target;
}

export function permanentDeleteFromTrash(trashId: string): void {
  const current = getTrashItems();
  const updated = current.filter((i) => i.id !== trashId);
  safeSet(STORAGE_KEYS.TRASH, updated);
  notifyStoreUpdate();
}

export function emptyTrash(): void {
  safeSet(STORAGE_KEYS.TRASH, []);
  notifyStoreUpdate();
}

/* ========================================================================== */
/* PAYLAŞIM VE OTOMATİK İPTAL YÖNETİMİ                                         */
/* ========================================================================== */

export function getSharedLinks(): SharedLink[] {
  return safeGet<SharedLink[]>(STORAGE_KEYS.SHARED, INITIAL_SHARED);
}

export function getDeletedTokens(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.DELETED_TOKENS, ["silinmis-icerik-ornegi"]);
}

export function isTokenDeleted(token: string): boolean {
  const deleted = getDeletedTokens();
  return deleted.includes(token);
}

// Bir içerik silindiğinde ilgili paylaşımları iptal et ve listeden kaldır
export function revokeSharesForDeletedItem(itemTitle: string, containerName?: string): void {
  const currentShares = getSharedLinks();
  const currentDeletedTokens = getDeletedTokens();

  const titleLower = itemTitle.toLowerCase().trim();
  const containerLower = containerName ? containerName.toLowerCase().trim() : "";

  const remainingShares: SharedLink[] = [];
  const newlyDeletedTokens: string[] = [];

  currentShares.forEach((share) => {
    const shareTitleLower = share.itemTitle.toLowerCase().trim();
    const shareContainerLower = share.containerName.toLowerCase().trim();

    // Eşleşme kontrolü: Başlık benziyor mu veya silinen bir deponun tamamı mı?
    const isDirectMatch =
      shareTitleLower === titleLower ||
      shareTitleLower.includes(titleLower) ||
      titleLower.includes(shareTitleLower);

    const isContainerMatch =
      containerLower &&
      (shareContainerLower === containerLower ||
        shareTitleLower === containerLower ||
        containerLower.includes(shareTitleLower));

    if (isDirectMatch || isContainerMatch) {
      newlyDeletedTokens.push(share.token);
    } else {
      remainingShares.push(share);
    }
  });

  if (newlyDeletedTokens.length > 0) {
    safeSet(STORAGE_KEYS.SHARED, remainingShares);
    const updatedDeletedTokens = Array.from(new Set([...currentDeletedTokens, ...newlyDeletedTokens]));
    safeSet(STORAGE_KEYS.DELETED_TOKENS, updatedDeletedTokens);
  }
}

export function toggleShareLinkActive(id: string): SharedLink | null {
  const current = getSharedLinks();
  let updatedLink: SharedLink | null = null;
  const updated = current.map((s) => {
    if (s.id === id) {
      updatedLink = { ...s, isActive: !s.isActive };
      return updatedLink;
    }
    return s;
  });
  safeSet(STORAGE_KEYS.SHARED, updated);
  notifyStoreUpdate();
  return updatedLink;
}

export function deleteSharedLink(id: string): void {
  const current = getSharedLinks();
  const target = current.find((s) => s.id === id);
  if (target) {
    const deletedTokens = getDeletedTokens();
    safeSet(STORAGE_KEYS.DELETED_TOKENS, [...deletedTokens, target.token]);
  }
  const updated = current.filter((s) => s.id !== id);
  safeSet(STORAGE_KEYS.SHARED, updated);
  notifyStoreUpdate();
}

/* ========================================================================== */
/* KOLEKSİYONLAR (CONTAINERS, MOVIES, TEXTS, SNIPPETS) SENKRONİZASYONU        */
/* ========================================================================== */

export function getStoredCollection<T>(key: "containers" | "movies" | "texts" | "snippets" | "travels" | "study", fallback: T[]): T[] {
  const storageKey =
    key === "containers"
      ? STORAGE_KEYS.CONTAINERS
      : key === "movies"
      ? STORAGE_KEYS.MOVIES
      : key === "texts"
      ? STORAGE_KEYS.TEXTS
      : key === "snippets"
      ? STORAGE_KEYS.SNIPPETS
      : key === "travels"
      ? STORAGE_KEYS.TRAVELS
      : STORAGE_KEYS.STUDY;

  return safeGet<T[]>(storageKey, fallback);
}

export function saveStoredCollection<T>(key: "containers" | "movies" | "texts" | "snippets" | "travels" | "study", data: T[]): void {
  const storageKey =
    key === "containers"
      ? STORAGE_KEYS.CONTAINERS
      : key === "movies"
      ? STORAGE_KEYS.MOVIES
      : key === "texts"
      ? STORAGE_KEYS.TEXTS
      : key === "snippets"
      ? STORAGE_KEYS.SNIPPETS
      : key === "travels"
      ? STORAGE_KEYS.TRAVELS
      : STORAGE_KEYS.STUDY;

  safeSet(storageKey, data);
  notifyStoreUpdate();
}
