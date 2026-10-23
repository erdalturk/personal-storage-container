export type SortOption = "updated" | "alpha" | "alpha-desc" | "count" | "manual";

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
 * Depoları seçilen kritere göre sıralar.
 */
export function sortContainers<T extends SortableContainer>(
  items: T[],
  sortBy: SortOption,
  manualOrder?: string[]
): T[] {
  const cloned = [...items];

  switch (sortBy) {
    case "alpha":
      return cloned.sort((a, b) => a.title.localeCompare(b.title, "tr", { sensitivity: "base" }));

    case "alpha-desc":
      return cloned.sort((a, b) => b.title.localeCompare(a.title, "tr", { sensitivity: "base" }));

    case "count":
      return cloned.sort((a, b) => b.itemCount - a.itemCount);

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
      return cloned.sort((a, b) => parseTimeWeight(a.lastUpdated) - parseTimeWeight(b.lastUpdated));
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
