export type SortOption = "updated" | "alpha" | "alpha-desc" | "count" | "manual";
export type SortCriterion = "updated" | "alpha" | "count";
export type SortDirection = "asc" | "desc";

export interface SortableContainer {
  id: string;
  title: string;
  formatTitle?: string;
  itemCount: number;
  lastUpdated: string;
  [key: string]: any;
}

/**
 * Göreceli Türkçe zaman ifadelerini kronolojik ağırlık skoruna dönüştürür.
 * Sayı ne kadar küçükse o kadar yenidir (artan sıralama ile en güncel en başa gelir).
 */
export function parseTimeWeight(timeStr: string): number {
  if (!timeStr) return 999999;
  const s = timeStr.toLowerCase().trim();

  // Çok yeni ifadeler
  if (s.includes("dakika") || s.includes("az önce") || s.includes("şimdi")) {
    const match = s.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }
  if (s.includes("saat")) {
    const match = s.match(/\d+/);
    const hours = match ? parseInt(match[0], 10) : 1;
    return 60 + hours * 60;
  }
  if (s.includes("bugün")) {
    return 1440; // 1 gün
  }
  if (s.includes("dün")) {
    return 2880; // 2 gün
  }
  if (s.includes("gün")) {
    const match = s.match(/\d+/);
    const days = match ? parseInt(match[0], 10) : 3;
    return days * 1440;
  }
  if (s.includes("hafta")) {
    const match = s.match(/\d+/);
    const weeks = match ? parseInt(match[0], 10) : 1;
    return weeks * 7 * 1440;
  }
  if (s.includes("ay")) {
    const match = s.match(/\d+/);
    const months = match ? parseInt(match[0], 10) : 1;
    return months * 30 * 1440;
  }
  return 99999;
}

/**
 * Depoları seçilen kriter ve yöne göre sıralar.
 */
export function sortContainersWithDirection<T extends SortableContainer>(
  items: T[],
  criterion: SortCriterion,
  direction: SortDirection = "asc"
): T[] {
  const cloned = [...items];

  switch (criterion) {
    case "alpha":
      return cloned.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title, "tr", { sensitivity: "base" });
        return direction === "asc" ? cmp : -cmp;
      });

    case "count":
      return cloned.sort((a, b) => {
        // asc: azdan çoğa (1, 2, 3), desc: çoktan aza (54, 38, 4)
        const diff = a.itemCount - b.itemCount;
        return direction === "asc" ? diff : -diff;
      });

    case "updated":
    default:
      return cloned.sort((a, b) => {
        // parseTimeWeight: küçük olan daha yenidir
        // desc: en güncel en başta (küçük timeWeight başta)
        // asc: en eski en başta (büyük timeWeight başta)
        const diff = parseTimeWeight(a.lastUpdated) - parseTimeWeight(b.lastUpdated);
        return direction === "desc" ? diff : -diff;
      });
  }
}

/**
 * Depoları seçilen kritere göre sıralar (Geriye dönük uyumluluk).
 */
export function sortContainers<T extends SortableContainer>(
  items: T[],
  sortBy: SortOption,
  manualOrder?: string[]
): T[] {
  const cloned = [...items];

  switch (sortBy) {
    case "alpha":
      return sortContainersWithDirection(cloned, "alpha", "asc");

    case "alpha-desc":
      return sortContainersWithDirection(cloned, "alpha", "desc");

    case "count":
      return sortContainersWithDirection(cloned, "count", "desc");

    case "manual":
      if (!manualOrder || manualOrder.length === 0) return cloned;
      return cloned.sort((a, b) => {
        const idxA = manualOrder.indexOf(a.id);
        const idxB = manualOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });

    case "updated":
    default:
      return sortContainersWithDirection(cloned, "updated", "desc");
  }
}

/**
 * Manuel sırada bir deponun indeksini sola veya sağa kaydırır.
 */
export function moveContainerInOrder(
  currentOrder: string[],
  containerId: string,
  direction: "left" | "right"
): string[] {
  const index = currentOrder.indexOf(containerId);
  if (index === -1) return currentOrder;

  const targetIndex = direction === "left" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= currentOrder.length) return currentOrder;

  const updated = [...currentOrder];
  const [removed] = updated.splice(index, 1);
  updated.splice(targetIndex, 0, removed);
  return updated;
}
