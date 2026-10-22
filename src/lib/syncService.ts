import { getSupabase, isSupabaseConfigured } from "./supabaseClient";
import {
  getStoredCollection,
  saveStoredCollection,
  getTrashItems,
  getSharedLinks,
  getCurrentUser,
  CollectionKey,
} from "./appStore";

export interface SyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  lastSyncedAt: string | null;
  pendingItemsCount: number;
}

const SYNC_STORAGE_KEY = "psc_last_synced_at";

export function getLastSyncTime(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_STORAGE_KEY);
}

export function setLastSyncTime(): void {
  if (typeof window === "undefined") return;
  const now = new Date().toLocaleString("tr-TR");
  localStorage.setItem(SYNC_STORAGE_KEY, now);
}

export function getSyncStatus(): SyncStatus {
  const isConfigured = isSupabaseConfigured();
  const lastSynced = getLastSyncTime();
  return {
    isConfigured,
    isConnected: isConfigured,
    lastSyncedAt: lastSynced,
    pendingItemsCount: 0,
  };
}

// Yerel verileri Supabase'e toplu aktar (Local -> Cloud)
export async function syncLocalDataToCloud(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    setLastSyncTime();
    return {
      success: true,
      message: "Yerel mod aktif: Verileriniz yerel tarayıcı hafızasında güncellendi.",
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: "Supabase istemcisi başlatılamadı." };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, message: "Lütfen önce Supabase ile giriş yapın." };
    }

    const userId = session.user.id;

    // 8 Depodaki öğeleri toparla
    const containerKeys: CollectionKey[] = [
      "texts",
      "movies",
      "snippets",
      "travels",
      "study",
      "audios",
      "media",
      "files",
    ];
    const allItems: any[] = [];

    for (const key of containerKeys) {
      const items = getStoredCollection<any>(key, []);
      for (const item of items) {
        allItems.push({
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: userId,
          title: item.title || "Adsız",
          item_type: key,
          metadata: item,
          is_favorite: Boolean(item.isFavorite),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (allItems.length > 0) {
      const { error } = await supabase.from("container_items").upsert(allItems, { onConflict: "id" });
      if (error) throw error;
    }

    setLastSyncTime();
    return {
      success: true,
      message: `${allItems.length} adet içerik bulut veritabanına başarıyla eşitlendi.`,
    };
  } catch (err: any) {
    console.error("Bulut eşitleme hatası:", err);
    return {
      success: false,
      message: err.message || "Buluta eşitleme sırasında bir hata oluştu.",
    };
  }
}

// Buluttaki verileri yerel hafızaya çek (Cloud -> Local)
export async function pullCloudDataToLocal(): Promise<{ success: boolean; message: string; count?: number }> {
  if (!isSupabaseConfigured()) {
    return { success: true, message: "Yerel mod aktif. Buluttan çekilecek kayıt yok." };
  }

  const supabase = getSupabase();
  if (!supabase) return { success: false, message: "Supabase başlatılamadı." };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, message: "Oturum açık değil." };
    }

    const { data, error } = await supabase
      .from("container_items")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) throw error;

    if (data && data.length > 0) {
      // Verileri türlerine göre ayırıp local koleksiyonlara yaz
      const byType: Record<string, any[]> = {};
      for (const row of data) {
        const type = row.item_type || "texts";
        if (!byType[type]) byType[type] = [];
        byType[type].push(row.metadata || row);
      }

      for (const [type, items] of Object.entries(byType)) {
        saveStoredCollection(type as CollectionKey, items);
      }

      setLastSyncTime();
      return { success: true, message: `${data.length} kayıt buluttan yerel depoya aktarıldı.`, count: data.length };
    }

    return { success: true, message: "Bulutta henüz kaydedilmiş içerik yok." };
  } catch (err: any) {
    return { success: false, message: err.message || "Buluttan veri çekilemedi." };
  }
}
