"use client";

// Merkezi Veri Depolama & Senkronizasyon Katmanı (Client-Side Reactive Store)
// Sayfalar (Home, Containers, Trash, Profile, Share) arasında silinen içeriklerin,
// çöp kutusunun ve paylaşılan bağlantıların anında senkronize olmasını sağlar.

export interface TrashItem {
  id: string;
  title: string;
  originContainer: string;
  type: "container" | "text" | "movie" | "code" | "travel" | "study" | "audio" | "image" | "file";
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
  type: "text" | "movie" | "code" | "travel" | "study" | "audio" | "image" | "file" | "container";
  scope: "container" | "item";
  createdAt: string;
  views: number;
  isActive: boolean;
}

const STORAGE_KEYS = {
  TRASH: "psc_trash_items",
  SHARED: "psc_shared_links_v2",
  DELETED_TOKENS: "psc_deleted_tokens_v2",
  CONTAINERS: "psc_containers",
  MOVIES: "psc_movies",
  TEXTS: "psc_texts",
  SNIPPETS: "psc_snippets",
  TRAVELS: "psc_travels",
  STUDY: "psc_study_notes",
  AUDIOS: "psc_audio_items",
  MEDIA: "psc_media_items",
  FILES: "psc_file_items",
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
    itemTitle: "Yaz 2026 Ege & Akdeniz Gezisi",
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
    itemTitle: "Kaş, Kalkan & Fethiye Sahil Rotası",
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
    itemTitle: "A* Arama & Heuristic Fonksiyonları",
    containerName: "Yapay Zekâ & Algoritmalar Dersi",
    type: "study",
    scope: "item",
    createdAt: "2 gün önce",
    views: 19,
    isActive: true,
  },
  {
    id: "s11",
    token: "sesli-notlar-deposu",
    itemTitle: "Sesli Notlar & Podcast Fikirleri",
    containerName: "Sesli Notlar & Podcast Fikirleri",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 24,
    isActive: true,
  },
  {
    id: "s12",
    token: "podcast-bolum-taslagi",
    itemTitle: "Bölüm 12: Yapay Zekâ Çağında Kişisel Hafıza",
    containerName: "Sesli Notlar & Podcast Fikirleri",
    type: "audio",
    scope: "item",
    createdAt: "1 gün önce",
    views: 15,
    isActive: true,
  },
  {
    id: "s13",
    token: "gorsel-koleksiyon-deposu",
    itemTitle: "Tasarım İlhamları & Fotoğraf Arşivi",
    containerName: "Tasarım İlhamları & Fotoğraf Arşivi",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 41,
    isActive: true,
  },
  {
    id: "s14",
    token: "minimalist-mimari-cekim",
    itemTitle: "Nordik Minimalist Mimari & Işık Etüdü",
    containerName: "Tasarım İlhamları & Fotoğraf Arşivi",
    type: "image",
    scope: "item",
    createdAt: "4 gün önce",
    views: 29,
    isActive: true,
  },
  {
    id: "s15",
    token: "belge-ve-dosya-deposu",
    itemTitle: "Sözleşmeler, Faturalar & Belgelerim",
    containerName: "Sözleşmeler, Faturalar & Belgelerim",
    type: "container",
    scope: "container",
    createdAt: "Ekim 2026",
    views: 16,
    isActive: true,
  },
  {
    id: "s16",
    token: "proje-sozlesme-taslagi",
    itemTitle: "2026 SaaS Yazılım Geliştirme Sözleşmesi.pdf",
    containerName: "Sözleşmeler, Faturalar & Belgelerim",
    type: "file",
    scope: "item",
    createdAt: "5 gün önce",
    views: 12,
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

  // KRİTİK KURAL:
  // - Eğer bir DEPO (type === "container") silindiyse, o depoya ve içindeki öğelere ait paylaşımları iptal et.
  // - Eğer sadece tekil bir İÇERİK silindiyse, YALNIZCA o içeriğin paylaşımını iptal et (deponun kendisini iptal etme!).
  revokeSharesForDeletedItem(newItem.title, newItem.type === "container");

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
    } else if (target.type === "study") {
      const studies = safeGet<any[]>(STORAGE_KEYS.STUDY, []);
      safeSet(STORAGE_KEYS.STUDY, [target.originalData, ...studies]);
    } else if (target.type === "audio") {
      const audios = safeGet<any[]>(STORAGE_KEYS.AUDIOS, []);
      safeSet(STORAGE_KEYS.AUDIOS, [target.originalData, ...audios]);
    } else if (target.type === "image") {
      const media = safeGet<any[]>(STORAGE_KEYS.MEDIA, []);
      safeSet(STORAGE_KEYS.MEDIA, [target.originalData, ...media]);
    } else if (target.type === "file") {
      const files = safeGet<any[]>(STORAGE_KEYS.FILES, []);
      safeSet(STORAGE_KEYS.FILES, [target.originalData, ...files]);
    }
  }

  // Çöp kutusundan geri yüklenen öğe veya deponun paylaşım bağlantısını da yeniden aktif et
  restoreSharesForItem(target.title, target.type === "container");

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

// Kullanıcı mevcut (silinmemiş) bir depo veya içerikte "Paylaş" butonuna bastığında bağlantıyı aktif eder
export function activateShareToken(token: string): void {
  const currentDeleted = getDeletedTokens();
  if (currentDeleted.includes(token)) {
    safeSet(
      STORAGE_KEYS.DELETED_TOKENS,
      currentDeleted.filter((t) => t !== token)
    );
  }

  const currentShares = getSharedLinks();
  const exists = currentShares.some((s) => s.token === token);
  if (!exists) {
    const template = INITIAL_SHARED.find((s) => s.token === token);
    if (template) {
      safeSet(STORAGE_KEYS.SHARED, [{ ...template, isActive: true }, ...currentShares]);
    }
  } else {
    safeSet(
      STORAGE_KEYS.SHARED,
      currentShares.map((s) => (s.token === token ? { ...s, isActive: true } : s))
    );
  }
  notifyStoreUpdate();
}

// Çöp kutusundan geri yüklenen depo veya içeriğin paylaşımını geri açar
export function restoreSharesForItem(itemTitle: string, isContainerRestore: boolean = false): void {
  const titleLower = itemTitle.toLowerCase().trim();
  const currentShares = getSharedLinks();
  const currentDeleted = getDeletedTokens();

  const matchingTemplates = INITIAL_SHARED.filter((share) => {
    const shareTitleLower = share.itemTitle.toLowerCase().trim();
    const shareContainerLower = share.containerName.toLowerCase().trim();
    if (isContainerRestore) {
      return (
        shareTitleLower === titleLower ||
        shareContainerLower === titleLower ||
        shareTitleLower.includes(titleLower) ||
        titleLower.includes(shareTitleLower)
      );
    }
    return (
      share.scope === "item" &&
      (shareTitleLower === titleLower ||
        shareTitleLower.includes(titleLower) ||
        titleLower.includes(shareTitleLower))
    );
  });

  if (matchingTemplates.length > 0) {
    const restoredTokens = new Set(matchingTemplates.map((m) => m.token));
    safeSet(
      STORAGE_KEYS.DELETED_TOKENS,
      currentDeleted.filter((t) => !restoredTokens.has(t))
    );

    const existingTokens = new Set(currentShares.map((s) => s.token));
    const toAdd = matchingTemplates.filter((m) => !existingTokens.has(m.token));
    if (toAdd.length > 0) {
      safeSet(STORAGE_KEYS.SHARED, [...toAdd, ...currentShares]);
    }
  }
}

// Bir içerik veya depo silindiğinde ilgili paylaşımları iptal et ve listeden kaldır
export function revokeSharesForDeletedItem(
  itemTitle: string,
  isContainerDeletion: boolean = false
): void {
  const currentShares = getSharedLinks();
  const currentDeletedTokens = getDeletedTokens();

  const titleLower = itemTitle.toLowerCase().trim();

  const remainingShares: SharedLink[] = [];
  const newlyDeletedTokens: string[] = [];

  currentShares.forEach((share) => {
    const shareTitleLower = share.itemTitle.toLowerCase().trim();
    const shareContainerLower = share.containerName.toLowerCase().trim();

    if (isContainerDeletion) {
      // Depo silindiyse: hem deponun kendi paylaşımını hem de o depodaki içerik paylaşımlarını iptal et
      const isMatch =
        shareTitleLower === titleLower ||
        shareContainerLower === titleLower ||
        shareTitleLower.includes(titleLower) ||
        titleLower.includes(shareTitleLower);

      if (isMatch) {
        newlyDeletedTokens.push(share.token);
      } else {
        remainingShares.push(share);
      }
    } else {
      // Sadece tek bir içerik silindiyse: YALNIZCA o tekil içeriğin (scope === "item") paylaşımını iptal et!
      // Deponun tamamına ait paylaşımı (scope === "container") ASLA iptal etme!
      const isDirectItemMatch =
        share.scope === "item" &&
        (shareTitleLower === titleLower ||
          shareTitleLower.includes(titleLower) ||
          titleLower.includes(shareTitleLower));

      if (isDirectItemMatch) {
        newlyDeletedTokens.push(share.token);
      } else {
        remainingShares.push(share);
      }
    }
  });

  if (newlyDeletedTokens.length > 0) {
    safeSet(STORAGE_KEYS.SHARED, remainingShares);
    const updatedDeletedTokens = Array.from(
      new Set([...currentDeletedTokens, ...newlyDeletedTokens])
    );
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
/* KOLEKSİYONLAR SENKRONİZASYONU                                              */
/* ========================================================================== */

export type CollectionKey =
  | "containers"
  | "movies"
  | "texts"
  | "snippets"
  | "travels"
  | "study"
  | "audios"
  | "media"
  | "files";

function resolveStorageKey(key: CollectionKey): string {
  switch (key) {
    case "containers":
      return STORAGE_KEYS.CONTAINERS;
    case "movies":
      return STORAGE_KEYS.MOVIES;
    case "texts":
      return STORAGE_KEYS.TEXTS;
    case "snippets":
      return STORAGE_KEYS.SNIPPETS;
    case "travels":
      return STORAGE_KEYS.TRAVELS;
    case "study":
      return STORAGE_KEYS.STUDY;
    case "audios":
      return STORAGE_KEYS.AUDIOS;
    case "media":
      return STORAGE_KEYS.MEDIA;
    case "files":
      return STORAGE_KEYS.FILES;
  }
}

export function getStoredCollection<T>(key: CollectionKey, fallback: T[]): T[] {
  return safeGet<T[]>(resolveStorageKey(key), fallback);
}

export function saveStoredCollection<T>(key: CollectionKey, data: T[]): void {
  safeSet(resolveStorageKey(key), data);
  notifyStoreUpdate();
}

