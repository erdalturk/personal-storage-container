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
  deletedTimestamp?: number; // Silinme epoch ms damgası
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
  CUSTOM_SHARED_RECORDS: "psc_custom_shared_records_v1",
  TRASH_RETENTION: "psc_trash_retention_days",
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
    itemTitle: "Inception (2010)",
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
    itemTitle: "Mavi Bir Akşamüstü",
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
/* ÇÖP KUTUSU (TRASH) YÖNETİMİ & SAKLAMA SÜRESİ AYARLARI                      */
/* ========================================================================== */

export type TrashRetentionDays = 15 | 30 | 60;

export function getTrashRetentionDays(): TrashRetentionDays {
  if (typeof window === "undefined") return 30;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRASH_RETENTION);
    if (saved === "15" || saved === "30" || saved === "60") {
      return parseInt(saved, 10) as TrashRetentionDays;
    }
  } catch {}
  return 30;
}

export function calculateDaysRemaining(item: TrashItem, retentionDays: TrashRetentionDays): number {
  if (item.deletedTimestamp) {
    const elapsedDays = Math.floor((Date.now() - item.deletedTimestamp) / (1000 * 60 * 60 * 24));
    return retentionDays - elapsedDays;
  }
  const text = (item.deletedAt || "").toLowerCase();
  let elapsed = 0;
  if (text.includes("az önce") || text.includes("şimdi") || text.includes("dakika") || text.includes("saat")) {
    elapsed = 0;
  } else if (text.includes("dün")) {
    elapsed = 1;
  } else if (text.includes("gün")) {
    const match = text.match(/\d+/);
    elapsed = match ? parseInt(match[0], 10) : 2;
  } else if (text.includes("hafta")) {
    const match = text.match(/\d+/);
    elapsed = (match ? parseInt(match[0], 10) : 1) * 7;
  }
  return retentionDays - elapsed;
}

export function purgeExpiredTrashItems(retentionDays?: TrashRetentionDays): { remaining: TrashItem[]; purgedCount: number } {
  const days = retentionDays || getTrashRetentionDays();
  const current = safeGet<TrashItem[]>(STORAGE_KEYS.TRASH, INITIAL_TRASH);
  const remaining: TrashItem[] = [];
  let purgedCount = 0;

  for (const item of current) {
    const rem = calculateDaysRemaining(item, days);
    if (rem > 0) {
      remaining.push({
        ...item,
        daysRemaining: rem,
      });
    } else {
      purgedCount++;
    }
  }

  if (purgedCount > 0) {
    safeSet(STORAGE_KEYS.TRASH, remaining);
    notifyStoreUpdate();
  }
  return { remaining, purgedCount };
}

export function setTrashRetentionDays(days: TrashRetentionDays): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRASH_RETENTION, days.toString());
    purgeExpiredTrashItems(days);
    notifyStoreUpdate();
  } catch {}
}

export function getTrashItems(): TrashItem[] {
  const items = safeGet<TrashItem[]>(STORAGE_KEYS.TRASH, INITIAL_TRASH);
  const retention = getTrashRetentionDays();
  return items.map((item) => ({
    ...item,
    daysRemaining: calculateDaysRemaining(item, retention),
  }));
}

export function addToTrash(item: Omit<TrashItem, "id" | "deletedAt" | "daysRemaining"> & { id?: string }): TrashItem {
  const current = getTrashItems();
  const retention = getTrashRetentionDays();
  const now = Date.now();
  const newItem: TrashItem = {
    ...item,
    id: item.id || `tr-${now}`,
    deletedAt: "Az önce",
    daysRemaining: retention,
    deletedTimestamp: now,
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

export function addBatchToTrash(
  items: (Omit<TrashItem, "id" | "deletedAt" | "daysRemaining"> & { id?: string })[]
): TrashItem[] {
  if (items.length === 0) return [];
  const current = getTrashItems();
  const retention = getTrashRetentionDays();
  const now = Date.now();
  const newItems: TrashItem[] = items.map((item, idx) => ({
    ...item,
    id: item.id || `tr-${now}-${idx}`,
    deletedAt: "Az önce",
    daysRemaining: retention,
    deletedTimestamp: now,
  }));

  const updated = [...newItems, ...current];
  safeSet(STORAGE_KEYS.TRASH, updated);

  for (const it of newItems) {
    revokeSharesForDeletedItem(it.title, it.type === "container");
  }

  notifyStoreUpdate();
  return newItems;
}

export function restoreBatchFromTrash(trashIds: string[]): TrashItem[] {
  if (trashIds.length === 0) return [];
  const current = getTrashItems();
  const targets = current.filter((i) => trashIds.includes(i.id));
  if (targets.length === 0) return [];

  const updated = current.filter((i) => !trashIds.includes(i.id));
  safeSet(STORAGE_KEYS.TRASH, updated);

  for (const target of targets) {
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
    restoreSharesForItem(target.title, target.type === "container");
  }

  notifyStoreUpdate();
  return targets;
}

export function permanentDeleteBatchFromTrash(trashIds: string[]): number {
  if (trashIds.length === 0) return 0;
  const current = getTrashItems();
  const updated = current.filter((i) => !trashIds.includes(i.id));
  const deletedCount = current.length - updated.length;
  safeSet(STORAGE_KEYS.TRASH, updated);
  notifyStoreUpdate();
  return deletedCount;
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

// Slug oluşturucu (Türkçe karakterleri güvenli slug'a çevirir)
export function slugify(text: string): string {
  if (!text) return "icerik";
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45) || "icerik";
}

// Dinamik paylaşılan içerik kayıtlarını getirme
export function getCustomSharedRecords(): Record<string, any> {
  return safeGet<Record<string, any>>(STORAGE_KEYS.CUSTOM_SHARED_RECORDS, {});
}

// Token ile dinamik paylaşılan içeriği bulma
export function getCustomSharedRecord(token: string): any {
  const records = getCustomSharedRecords();
  return records[token] || null;
}

// Herhangi bir depo öğesi için benzersiz ve dinamik paylaşım token'ı oluşturma
export function createOrGetShareTokenForRecord(
  item: any,
  type: "text" | "movie" | "code" | "travel" | "study" | "audio" | "image" | "file",
  originContainer: string
): string {
  const cleanTitle = item.title || "Adsız İçerik";
  const baseSlug = slugify(cleanTitle);
  const suffix = item.id
    ? `-${String(item.id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`
    : `-${Date.now().toString(36)}`;
  const token = `${baseSlug}${suffix}`;

  const customRecord = {
    id: item.id || token,
    title: cleanTitle,
    author: "Erdal Türk",
    authorAvatar: "ET",
    scope: "item",
    type: type,
    createdAt: item.createdAt || "Bugün",
    isActive: true,
    // Metin ve İçerik
    content: item.content || item.overview || item.transcript,
    wordCount: item.wordCount,
    lineCount: item.lineCount,
    // Medya ve Görseller
    posterUrl: item.posterUrl || item.imageUrl || item.coverPhoto,
    imageUrl: item.imageUrl || item.posterUrl || item.coverPhoto,
    // Film alanları
    director: item.director,
    year: item.year,
    rating: item.rating,
    genres: item.genres,
    // Açıklama ve Notlar
    overview: item.overview || item.summary || item.description || item.experiencesNote,
    userNote: item.userNote || item.userNotes || item.topRecommendations || item.keyFormulas,
    // Seyahat alanları
    destination: item.destination,
    country: item.country,
    durationDays: item.durationDays,
    highlightPlaces: item.highlightPlaces,
    // Kod alanları
    code: item.code,
    language: item.language,
    tags: item.tags,
    // Ders alanları
    courseCode: item.courseCode,
    term: item.term,
    instructor: item.instructor,
    targetExam: item.targetExam,
    daysLeft: item.daysLeft,
    topics: item.topics,
    pdfName: item.pdfName || item.pdfAttachment?.name,
    pdfSize: item.pdfSize || item.pdfAttachment?.size,
    pdfPages: item.pdfPages || item.pdfAttachment?.pages,
    flashcards: item.flashcards,
    // Ses, Dosya ve Görsel
    durationLabel: item.durationLabel,
    format: item.format || item.extension,
    size: item.size || item.sizeLabel,
    transcript: item.transcript,
    resolution: item.resolution,
    cameraInfo: item.cameraInfo,
    version: item.version,
  };

  // 1. Dinamik paylaşımlar tablosuna ekle
  const records = getCustomSharedRecords();
  records[token] = customRecord;
  safeSet(STORAGE_KEYS.CUSTOM_SHARED_RECORDS, records);

  // 2. Silinmiş tokenlar listesinden çıkar (varsa)
  const currentDeleted = getDeletedTokens();
  if (currentDeleted.includes(token)) {
    safeSet(
      STORAGE_KEYS.DELETED_TOKENS,
      currentDeleted.filter((t) => t !== token)
    );
  }

  // 3. Shared links listesine ekle (profil ve merkezi yönetim için)
  const currentShares = getSharedLinks();
  const exists = currentShares.some((s) => s.token === token);
  if (!exists) {
    const newSharedLink: SharedLink = {
      id: `share-${token}`,
      token,
      itemTitle: cleanTitle,
      containerName: originContainer,
      type: type,
      scope: "item",
      createdAt: "Bugün",
      views: 1,
      isActive: true,
    };
    safeSet(STORAGE_KEYS.SHARED, [newSharedLink, ...currentShares]);
  } else {
    safeSet(
      STORAGE_KEYS.SHARED,
      currentShares.map((s) => (s.token === token ? { ...s, isActive: true } : s))
    );
  }

  notifyStoreUpdate();
  return token;
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

  const pool = [...INITIAL_SHARED, ...currentShares];
  const matchingTemplates = pool.filter((share) => {
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

/* ========================================================================== */
/* KULLANICI OTURUMU (AUTH) YÖNETİMİ                                          */
/* ========================================================================== */

export interface AuthUser {
  name: string;
  email: string;
  avatar: string;
  title: string;
  isAuthenticated: boolean;
  lastLoginAt: string;
}

const DEFAULT_AUTH_USER: AuthUser = {
  name: "Erdal Türk",
  email: "erdal.turk@kisiseldepo.com",
  avatar: "ET",
  title: "Yazılım Geliştirici & Koleksiyoner",
  isAuthenticated: true,
  lastLoginAt: "Bugün",
};

const AUTH_STORAGE_KEY = "psc_auth_user";

export function getCurrentUser(): AuthUser {
  return safeGet<AuthUser>(AUTH_STORAGE_KEY, DEFAULT_AUTH_USER);
}

export function loginUser(email: string, name?: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase() || DEFAULT_AUTH_USER.email;
  const resolvedName =
    name?.trim() ||
    (cleanEmail.startsWith("erdal")
      ? "Erdal Türk"
      : cleanEmail
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()));

  const initials =
    resolvedName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") || "KD";

  const user: AuthUser = {
    name: resolvedName,
    email: cleanEmail,
    avatar: initials,
    title: "Yazılım Geliştirici & Koleksiyoner",
    isAuthenticated: true,
    lastLoginAt: "Az önce",
  };
  safeSet(AUTH_STORAGE_KEY, user);
  notifyStoreUpdate();
  return user;
}

export function logoutUser(): void {
  const current = getCurrentUser();
  safeSet(AUTH_STORAGE_KEY, { ...current, isAuthenticated: false });
  notifyStoreUpdate();
}

/* ========================================================================== */
/* TAM ARŞİV YEDEKLEME (.JSON DIŞA / İÇE AKTARMA)                             */
/* ========================================================================== */

export interface FullArchiveBackup {
  app: "Kişisel Depo (Personal Storage Container)";
  version: "2.0";
  exportedAt: string;
  user: AuthUser;
  collections: {
    containers: any[];
    movies: any[];
    texts: any[];
    snippets: any[];
    travels: any[];
    study: any[];
    audios: any[];
    media: any[];
    files: any[];
  };
  trash: TrashItem[];
  sharedLinks: SharedLink[];
  masterPin?: string | null;
}

export function exportFullArchive(): string {
  const backup: FullArchiveBackup = {
    app: "Kişisel Depo (Personal Storage Container)",
    version: "2.0",
    exportedAt: new Date().toISOString(),
    user: getCurrentUser(),
    collections: {
      containers: safeGet<any[]>(STORAGE_KEYS.CONTAINERS, []),
      movies: safeGet<any[]>(STORAGE_KEYS.MOVIES, []),
      texts: safeGet<any[]>(STORAGE_KEYS.TEXTS, []),
      snippets: safeGet<any[]>(STORAGE_KEYS.SNIPPETS, []),
      travels: safeGet<any[]>(STORAGE_KEYS.TRAVELS, []),
      study: safeGet<any[]>(STORAGE_KEYS.STUDY, []),
      audios: safeGet<any[]>(STORAGE_KEYS.AUDIOS, []),
      media: safeGet<any[]>(STORAGE_KEYS.MEDIA, []),
      files: safeGet<any[]>(STORAGE_KEYS.FILES, []),
    },
    trash: getTrashItems(),
    sharedLinks: getSharedLinks(),
    masterPin: getMasterPin(),
  };

  return JSON.stringify(backup, null, 2);
}

export function importFullArchive(jsonString: string): {
  success: boolean;
  message: string;
  restoredCount?: number;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== "object" || !parsed.collections) {
      return {
        success: false,
        message: "Geçersiz yedek dosyası formatı: 'collections' alanı bulunamadı.",
      };
    }

    const cols = parsed.collections;
    let totalItems = 0;

    if (Array.isArray(cols.containers)) {
      safeSet(STORAGE_KEYS.CONTAINERS, cols.containers);
      totalItems += cols.containers.length;
    }
    if (Array.isArray(cols.movies)) {
      safeSet(STORAGE_KEYS.MOVIES, cols.movies);
      totalItems += cols.movies.length;
    }
    if (Array.isArray(cols.texts)) {
      safeSet(STORAGE_KEYS.TEXTS, cols.texts);
      totalItems += cols.texts.length;
    }
    if (Array.isArray(cols.snippets)) {
      safeSet(STORAGE_KEYS.SNIPPETS, cols.snippets);
      totalItems += cols.snippets.length;
    }
    if (Array.isArray(cols.travels)) {
      safeSet(STORAGE_KEYS.TRAVELS, cols.travels);
      totalItems += cols.travels.length;
    }
    if (Array.isArray(cols.study)) {
      safeSet(STORAGE_KEYS.STUDY, cols.study);
      totalItems += cols.study.length;
    }
    if (Array.isArray(cols.audios)) {
      safeSet(STORAGE_KEYS.AUDIOS, cols.audios);
      totalItems += cols.audios.length;
    }
    if (Array.isArray(cols.media)) {
      safeSet(STORAGE_KEYS.MEDIA, cols.media);
      totalItems += cols.media.length;
    }
    if (Array.isArray(cols.files)) {
      safeSet(STORAGE_KEYS.FILES, cols.files);
      totalItems += cols.files.length;
    }
    if (Array.isArray(parsed.trash)) {
      safeSet(STORAGE_KEYS.TRASH, parsed.trash);
    }
    if (Array.isArray(parsed.sharedLinks)) {
      safeSet(STORAGE_KEYS.SHARED, parsed.sharedLinks);
    }
    if (parsed.masterPin && typeof parsed.masterPin === "string") {
      safeSet(PIN_STORAGE_KEY, parsed.masterPin);
    }

    notifyStoreUpdate();
    return {
      success: true,
      message: `Yedek başarıyla geri yüklendi (${totalItems} kayıt güncellendi).`,
      restoredCount: totalItems,
    };
  } catch {
    return {
      success: false,
      message: "JSON dosyası okunamadı. Lütfen geçerli bir yedek dosyası seçin.",
    };
  }
}

/* ========================================================================== */
/* GLOBAL ARAMA & KOMUT PALETİ İNDEKSİ (TÜM 8 DEPO)                           */
/* ========================================================================== */

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  containerName: string;
  type: "container" | "movie" | "text" | "code" | "travel" | "study" | "audio" | "image" | "file";
  href: string;
  badge: string;
  keywords: string;
}

const DEFAULT_GLOBAL_ITEMS: GlobalSearchResult[] = [
  // Depolar
  {
    id: "g-c1",
    title: "Sinema Kulübü & Başyapıtlar",
    subtitle: "Akıllı Özel Depo • Film & Dizi İzleme Listesi",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/movie",
    badge: "Film Deposu",
    keywords: "sinema film dizi izleme nolan mubi",
  },
  {
    id: "g-c2",
    title: "Gece Düşünceleri & Şiirlerim",
    subtitle: "Standart Depo • Metin & Notlar",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/text",
    badge: "Metin Deposu",
    keywords: "metin şiir yazı not makale",
  },
  {
    id: "g-c3",
    title: "Frontend & Fullstack Snippet'lar",
    subtitle: "Akıllı Özel Depo • Kod Parçacıkları",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/code",
    badge: "Kod Deposu",
    keywords: "kod snippet python sql react docker typescript",
  },
  {
    id: "g-c4",
    title: "Gezi & Seyahat Anıları",
    subtitle: "Akıllı Özel Depo • Gezi & Seyahat Planı",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/travel",
    badge: "Gezi Deposu",
    keywords: "gezi seyahat rota tatil kaş italya japonya kapadokya",
  },
  {
    id: "g-c5",
    title: "Yapay Zekâ & Algoritmalar Dersi",
    subtitle: "Akıllı Özel Depo • Ders & Çalışma Notları",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/study",
    badge: "Ders Deposu",
    keywords: "ders sınav vize final algoritma yapay zeka",
  },
  {
    id: "g-c6",
    title: "Sesli Notlar & Podcast Fikirleri",
    subtitle: "Standart Depo • Ses Kayıtları",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/audio",
    badge: "Ses Deposu",
    keywords: "ses podcast kayıt mp3 wav toplantı",
  },
  {
    id: "g-c7",
    title: "Tasarım İlhamları & Fotoğraf Arşivi",
    subtitle: "Standart Depo • Görüntü & Galeri",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/media",
    badge: "Görüntü Deposu",
    keywords: "görüntü fotoğraf galeri tasarım mimari kamera",
  },
  {
    id: "g-c8",
    title: "Sözleşmeler, Faturalar & Belgelerim",
    subtitle: "Standart Depo • Dosya & Belge",
    containerName: "Ana Sayfa",
    type: "container",
    href: "/containers/files",
    badge: "Belge Deposu",
    keywords: "dosya belge pdf xlsx zip sözleşme fatura sunum",
  },
  // 1. Filmler
  {
    id: "g-m1",
    title: "Inception (2010)",
    subtitle: "Christopher Nolan • Bilim Kurgu, Aksiyon • ★ 8.8",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    href: "/containers/movie",
    badge: "Film • 2010",
    keywords: "inception christopher nolan rüya bilim kurgu dicaprio",
  },
  {
    id: "g-m2",
    title: "Interstellar (2014)",
    subtitle: "Christopher Nolan • Bilim Kurgu, Macera • ★ 8.7",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    href: "/containers/movie",
    badge: "Film • 2014",
    keywords: "interstellar yıldızlararası nolan uzay karadelik",
  },
  {
    id: "g-m3",
    title: "Dune: Part Two (2024)",
    subtitle: "Denis Villeneuve • Bilim Kurgu • ★ 8.5",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    href: "/containers/movie",
    badge: "Film • 2024",
    keywords: "dune çöl gezegeni villeneuve paul atreides fremen",
  },
  {
    id: "g-m4",
    title: "Kış Uykusu (2014)",
    subtitle: "Nuri Bilge Ceylan • Dram • ★ 8.1",
    containerName: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    href: "/containers/movie",
    badge: "Film • 2014",
    keywords: "kış uykusu nuri bilge ceylan altın palmiye kapadokya",
  },
  // 2. Metinler & Şiirler
  {
    id: "g-t1",
    title: "Mavi Bir Akşamüstü",
    subtitle: "Şiirlerim & Dizeler • Rüzgâr estiğinde deniz fısıldar...",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    href: "/containers/text",
    badge: "Şiir / Metin",
    keywords: "mavi bir akşamüstü şiir deniz rüzgar",
  },
  {
    id: "g-t2",
    title: "Kişisel Depo — Mimari Düşünceler",
    subtitle: "Proje Fikirleri • Dağınık dijital varlıkları tek merkezde toplamak...",
    containerName: "Gece Düşünceleri & Şiirlerim",
    type: "text",
    href: "/containers/text",
    badge: "Proje Notu",
    keywords: "mimari düşünceler proje fikirleri tasarım",
  },
  // 3. Kod Parçacıkları
  {
    id: "g-sn1",
    title: "Supabase RLS Policy with Auth Check",
    subtitle: "SQL • Kullanıcının sadece kendi depolarını görmesini sağlayan RLS kuralı",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "code",
    href: "/containers/code",
    badge: "SQL",
    keywords: "supabase rls policy sql database güvenlik",
  },
  {
    id: "g-sn2",
    title: "FastAPI JWT Bearer Middleware",
    subtitle: "Python • Bearer token kontrolü yapan 401 dependency fonksiyonu",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "code",
    href: "/containers/code",
    badge: "Python",
    keywords: "fastapi jwt bearer auth python token middleware",
  },
  {
    id: "g-sn3",
    title: "Docker Multi-Stage Next.js Build",
    subtitle: "Dockerfile • Next.js standalone üretim konteyneri",
    containerName: "Frontend & Fullstack Snippet'lar",
    type: "code",
    href: "/containers/code",
    badge: "Dockerfile",
    keywords: "docker nextjs build alpine container devops",
  },
  // 4. Gezi Rotaları
  {
    id: "g-tr1",
    title: "Yaz 2026 Ege & Akdeniz Gezisi",
    subtitle: "Kaş, Kalkan & Fethiye • Türkiye 🇹🇷 • 8 Gün",
    containerName: "Gezi & Seyahat Anıları",
    type: "travel",
    href: "/containers/travel",
    badge: "Gezi • 8 Gün",
    keywords: "kaş kalkan fethiye ege akdeniz kaputaş kekova patara",
  },
  {
    id: "g-tr2",
    title: "Floransa & Toskana Vadisi Rotası",
    subtitle: "Floransa, Siena & Val d'Orcia • İtalya 🇮🇹 • 7 Gün",
    containerName: "Gezi & Seyahat Anıları",
    type: "travel",
    href: "/containers/travel",
    badge: "Gezi • 7 Gün",
    keywords: "floransa toskana italya siena uffizi rönesans",
  },
  {
    id: "g-tr3",
    title: "Kyoto & Tokyo — Kiraz Çiçekleri Dönemi",
    subtitle: "Kyoto & Tokyo • Japonya 🇯🇵 • 11 Gün",
    containerName: "Gezi & Seyahat Anıları",
    type: "travel",
    href: "/containers/travel",
    badge: "Gezi • 11 Gün",
    keywords: "kyoto tokyo japonya sakura shibuya fushimi inari",
  },
  // 5. Ders Notları
  {
    id: "g-st1",
    title: "A* Arama & Heuristic Fonksiyonları",
    subtitle: "CENG 451 • Yapay Zekâ • Vize Hazırlık + 28 syf PDF",
    containerName: "Yapay Zekâ & Algoritmalar Dersi",
    type: "study",
    href: "/containers/study",
    badge: "CENG 451 • Vize",
    keywords: "a star arama heuristic admissibility manhattan yapay zeka",
  },
  {
    id: "g-st2",
    title: "Gradient Descent & Backpropagation Temelleri",
    subtitle: "CENG 451 • Yapay Sinir Ağları • Vize Hazırlık + 34 syf PDF",
    containerName: "Yapay Zekâ & Algoritmalar Dersi",
    type: "study",
    href: "/containers/study",
    badge: "CENG 451 • Vize",
    keywords: "gradient descent backpropagation sinir ağları overfitting",
  },
  {
    id: "g-st3",
    title: "Dinamik Programlama: Sırt Çantası & LCS",
    subtitle: "CENG 301 • Algoritma Analizi • Final Hazırlık",
    containerName: "Yapay Zekâ & Algoritmalar Dersi",
    type: "study",
    href: "/containers/study",
    badge: "CENG 301 • Final",
    keywords: "dinamik programlama knapsack lcs algoritma memoization",
  },
  // 6. Ses Kayıtları
  {
    id: "g-au1",
    title: "Bölüm 12: Yapay Zekâ Çağında Kişisel Hafıza",
    subtitle: "Podcast Taslakları • WAV • 04:32",
    containerName: "Sesli Notlar & Podcast Fikirleri",
    type: "audio",
    href: "/containers/audio",
    badge: "WAV • 04:32",
    keywords: "podcast bölüm 12 yapay zeka kişisel hafıza ses kaydı",
  },
  {
    id: "g-au2",
    title: "Q4 Ürün Yol Haritası Beyin Fırtınası",
    subtitle: "Toplantı Kayıtları • M4A • 08:38",
    containerName: "Sesli Notlar & Podcast Fikirleri",
    type: "audio",
    href: "/containers/audio",
    badge: "M4A • 08:38",
    keywords: "toplantı q4 yol haritası beyin fırtınası ses",
  },
  // 7. Görseller
  {
    id: "g-im1",
    title: "Nordik Minimalist Mimari & Işık Etüdü",
    subtitle: "Mimari & İç Mekan • 3840 × 2160 RAW • Sony A7IV",
    containerName: "Tasarım İlhamları & Fotoğraf Arşivi",
    type: "image",
    href: "/containers/media",
    badge: "RAW • 4K",
    keywords: "nordik minimalist mimari ışık sony fotoğraf",
  },
  {
    id: "g-im2",
    title: "Sıcak Krem & Taş Tonları UI Renk Paleti",
    subtitle: "UI / UX İlhamları • 2560 × 1440 PNG • Figma Export",
    containerName: "Tasarım İlhamları & Fotoğraf Arşivi",
    type: "image",
    href: "/containers/media",
    badge: "PNG • UI/UX",
    keywords: "renk paleti ui ux figma tasarım krem",
  },
  // 8. Dosya & Belgeler
  {
    id: "g-fl1",
    title: "2026 SaaS Yazılım Geliştirme Sözleşmesi.pdf",
    subtitle: "Sözleşmeler & Hukuk • PDF • 2.4 MB • v2.1 İmzalı",
    containerName: "Sözleşmeler, Faturalar & Belgelerim",
    type: "file",
    href: "/containers/files",
    badge: "PDF • 2.4 MB",
    keywords: "saas yazılım sözleşme hukuk nda pdf",
  },
  {
    id: "g-fl2",
    title: "Q3-Q4 Gelir Gider ve Bütçe Projeksiyonu.xlsx",
    subtitle: "Finans & Faturalar • XLSX • 4.8 MB • v4.0 Final",
    containerName: "Sözleşmeler, Faturalar & Belgelerim",
    type: "file",
    href: "/containers/files",
    badge: "XLSX • 4.8 MB",
    keywords: "gelir gider bütçe finans excel xlsx fatura",
  },
  {
    id: "g-fl3",
    title: "Kişisel Depo Yatırımcı Sunumu (Pitch Deck).pptx",
    subtitle: "Sunum & Raporlar • PPTX • 18.6 MB",
    containerName: "Sözleşmeler, Faturalar & Belgelerim",
    type: "file",
    href: "/containers/files",
    badge: "PPTX • 18.6 MB",
    keywords: "yatırımcı sunumu pitch deck pptx rapor",
  },
];

export function searchAllItems(query: string): GlobalSearchResult[] {
  const trashTitles = new Set(
    getTrashItems().map((t) => t.title.toLowerCase().trim())
  );

  // Dinamik olarak eklenen öğeleri de arama indeksine dahil et
  const dynamicItems: GlobalSearchResult[] = [];
  const seenTitles = new Set(
    DEFAULT_GLOBAL_ITEMS.map((d) => d.title.toLowerCase().trim())
  );

  const pushDynamic = (
    items: any[],
    type: GlobalSearchResult["type"],
    containerName: string,
    href: string,
    badgePrefix: string
  ) => {
    items.forEach((it, idx) => {
      const title = (it.title || it.name || "").trim();
      if (!title || seenTitles.has(title.toLowerCase())) return;
      seenTitles.add(title.toLowerCase());
      dynamicItems.push({
        id: `dyn-${type}-${it.id || idx}`,
        title,
        subtitle:
          it.overview ||
          it.summary ||
          it.description ||
          it.transcript ||
          it.content ||
          containerName,
        containerName,
        type,
        href,
        badge: badgePrefix,
        keywords: `${title} ${it.tags ? it.tags.join(" ") : ""} ${containerName}`,
      });
    });
  };

  pushDynamic(safeGet<any[]>(STORAGE_KEYS.MOVIES, []), "movie", "Sinema Kulübü & Başyapıtlar", "/containers/movie", "Film");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.TEXTS, []), "text", "Gece Düşünceleri & Şiirlerim", "/containers/text", "Metin");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.SNIPPETS, []), "code", "Frontend & Fullstack Snippet'lar", "/containers/code", "Kod");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.TRAVELS, []), "travel", "Gezi & Seyahat Anıları", "/containers/travel", "Gezi");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.STUDY, []), "study", "Yapay Zekâ & Algoritmalar Dersi", "/containers/study", "Ders Notu");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.AUDIOS, []), "audio", "Sesli Notlar & Podcast Fikirleri", "/containers/audio", "Ses");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.MEDIA, []), "image", "Tasarım İlhamları & Fotoğraf Arşivi", "/containers/media", "Görsel");
  pushDynamic(safeGet<any[]>(STORAGE_KEYS.FILES, []), "file", "Sözleşmeler, Faturalar & Belgelerim", "/containers/files", "Belge");

  const combined = [...dynamicItems, ...DEFAULT_GLOBAL_ITEMS].filter(
    (item) => !trashTitles.has(item.title.toLowerCase().trim())
  );

  const q = query.toLowerCase().trim();
  if (!q) {
    return combined.slice(0, 12);
  }

  return combined.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.containerName.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
  );
}

/* ========================================================================== */
/* DİNAMİK DEPO MASTER PIN YÖNETİMİ                                           */
/* ========================================================================== */

const PIN_STORAGE_KEY = "psc_master_pin";
const PIN_ATTEMPTS_KEY = "psc_pin_attempts_info";

interface PinAttemptsInfo {
  failedCount: number;
  lockedUntil: number; // ms timestamp
}

export function hasMasterPin(): boolean {
  const pin = getMasterPin();
  return Boolean(pin && pin.trim().length >= 4);
}

export function getMasterPin(): string | null {
  return safeGet<string | null>(PIN_STORAGE_KEY, null);
}

export function setMasterPin(pin: string): { success: boolean; message: string } {
  const clean = pin.trim();
  if (!/^\d{4,6}$/.test(clean)) {
    return { success: false, message: "PIN sadece 4 ile 6 haneli rakamlardan oluşmalıdır." };
  }
  safeSet(PIN_STORAGE_KEY, clean);
  // Hatalı deneme sayacını sıfırla
  safeSet(PIN_ATTEMPTS_KEY, { failedCount: 0, lockedUntil: 0 });
  notifyStoreUpdate();
  return { success: true, message: "Kişisel Depo Master PIN'iniz başarıyla kaydedildi." };
}

export function verifyMasterPin(inputPin: string): {
  valid: boolean;
  isLockedOut: boolean;
  lockSecondsRemaining: number;
  remainingAttempts: number;
  message?: string;
} {
  const now = Date.now();
  const attempts: PinAttemptsInfo = safeGet<PinAttemptsInfo>(PIN_ATTEMPTS_KEY, {
    failedCount: 0,
    lockedUntil: 0,
  });

  // Kilitlenme kontrolü
  if (attempts.lockedUntil > now) {
    const diffSec = Math.ceil((attempts.lockedUntil - now) / 1000);
    return {
      valid: false,
      isLockedOut: true,
      lockSecondsRemaining: diffSec,
      remainingAttempts: 0,
      message: `Çok fazla hatalı deneme! Lütfen ${diffSec} saniye bekleyin.`,
    };
  }

  const currentPin = getMasterPin();
  // Eğer henüz PIN belirlenmemişse varsayılan "1234" ile de geçici olarak eşleşebilir
  const effectivePin = currentPin || "1234";

  if (inputPin.trim() === effectivePin) {
    // Başarılı: sıfırla
    safeSet(PIN_ATTEMPTS_KEY, { failedCount: 0, lockedUntil: 0 });
    return {
      valid: true,
      isLockedOut: false,
      lockSecondsRemaining: 0,
      remainingAttempts: 5,
    };
  }

  // Hatalı giriş
  const newFailedCount = (attempts.failedCount || 0) + 1;
  if (newFailedCount >= 5) {
    const lockTime = now + 30 * 1000; // 30 saniye kilit
    safeSet(PIN_ATTEMPTS_KEY, { failedCount: newFailedCount, lockedUntil: lockTime });
    return {
      valid: false,
      isLockedOut: true,
      lockSecondsRemaining: 30,
      remainingAttempts: 0,
      message: "5 kez hatalı PIN girildi! Güvenlik nedeniyle sistem 30 saniye kilitlendi.",
    };
  }

  safeSet(PIN_ATTEMPTS_KEY, { failedCount: newFailedCount, lockedUntil: 0 });
  const remaining = 5 - newFailedCount;
  return {
    valid: false,
    isLockedOut: false,
    lockSecondsRemaining: 0,
    remainingAttempts: remaining,
    message: `Hatalı PIN! ${remaining} deneme hakkınız kaldı.`,
  };
}

export function changeMasterPin(oldPin: string, newPin: string): { success: boolean; message: string } {
  const currentPin = getMasterPin() || "1234";
  if (oldPin.trim() !== currentPin) {
    return { success: false, message: "Mevcut PIN hatalı! Lütfen kontrol edin." };
  }
  return setMasterPin(newPin);
}

export function resetMasterPinForDemo(): void {
  safeSet(PIN_STORAGE_KEY, "1234");
  safeSet(PIN_ATTEMPTS_KEY, { failedCount: 0, lockedUntil: 0 });
  notifyStoreUpdate();
}




