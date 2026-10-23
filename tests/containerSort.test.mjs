import test from "node:test";
import assert from "node:assert/strict";
import {
  sortContainers,
  parseTimeWeight,
  moveContainerInOrder,
} from "../src/lib/containerSortUtils.ts";

const MOCK_CONTAINERS = [
  { id: "c1", title: "Sinema Kulübü & Başyapıtlar", itemCount: 38, lastUpdated: "2 saat önce" },
  { id: "c2", title: "Frontend & Fullstack Snippet'lar", itemCount: 54, lastUpdated: "Dün" },
  { id: "c3", title: "Yaz 2026 Ege & Akdeniz Gezisi", itemCount: 124, lastUpdated: "3 gün önce" },
  { id: "c4", title: "Yapay Zekâ & Algoritmalar Dersi", itemCount: 16, lastUpdated: "5 gün önce" },
  { id: "c5", title: "Gece Düşünceleri & Şiirlerim", itemCount: 22, lastUpdated: "Geçen hafta" },
  { id: "c6", title: "Sesli Notlar & Podcast Fikirleri", itemCount: 4, lastUpdated: "Bugün" },
  { id: "c7", title: "Tasarım İlhamları & Fotoğraf Arşivi", itemCount: 8, lastUpdated: "10 dakika önce" },
];

test("SORT-01: Alfabetik (A-Z) sıralama Türkçe harfleri doğru dizer", () => {
  const sorted = sortContainers(MOCK_CONTAINERS, "alpha");
  const titles = sorted.map((c) => c.title);
  // F, G, S, S, T, Y, Y
  assert.equal(titles[0], "Frontend & Fullstack Snippet'lar");
  assert.equal(titles[1], "Gece Düşünceleri & Şiirlerim");
  assert.equal(titles[titles.length - 1], "Yaz 2026 Ege & Akdeniz Gezisi");
});

test("SORT-02: Alfabetik (Z-A) ters sıralama doğru çalışır", () => {
  const sorted = sortContainers(MOCK_CONTAINERS, "alpha-desc");
  const titles = sorted.map((c) => c.title);
  assert.equal(titles[0], "Yaz 2026 Ege & Akdeniz Gezisi");
  assert.equal(titles[titles.length - 1], "Frontend & Fullstack Snippet'lar");
});

test("SORT-03: İçerik sayısına göre azalan sıralama (count) en doluyu başa alır", () => {
  const sorted = sortContainers(MOCK_CONTAINERS, "count");
  assert.equal(sorted[0].id, "c3"); // 124 öğe
  assert.equal(sorted[1].id, "c2"); // 54 öğe
  assert.equal(sorted[sorted.length - 1].id, "c6"); // 4 öğe
});

test("SORT-04: Son güncellenen (updated) göreceli zaman skoruna göre en yeniyi başa alır", () => {
  const sorted = sortContainers(MOCK_CONTAINERS, "updated");
  assert.equal(sorted[0].id, "c7"); // 10 dakika önce
  assert.equal(sorted[1].id, "c1"); // 2 saat önce
  assert.equal(sorted[2].id, "c6"); // Bugün
  assert.equal(sorted[3].id, "c2"); // Dün
});

test("SORT-05: Manuel sıralama ve moveContainerInOrder elemanları doğru kaydırır", () => {
  const initialOrder = ["c1", "c2", "c3", "c4"];
  // c3'ü sola taşı
  const movedLeft = moveContainerInOrder(initialOrder, "c3", "left");
  assert.deepEqual(movedLeft, ["c1", "c3", "c2", "c4"]);

  // c1'i sağa taşı
  const movedRight = moveContainerInOrder(movedLeft, "c1", "right");
  assert.deepEqual(movedRight, ["c3", "c1", "c2", "c4"]);

  // En baştakini sola taşıma sınır kontrolü
  const boundaryCheck = moveContainerInOrder(movedRight, "c3", "left");
  assert.deepEqual(boundaryCheck, ["c3", "c1", "c2", "c4"]);

  // Sıralama fonksiyonu bu manuel dizilimi uygular
  const sorted = sortContainers(MOCK_CONTAINERS.slice(0, 4), "manual", movedRight);
  assert.equal(sorted[0].id, "c3");
  assert.equal(sorted[1].id, "c1");
  assert.equal(sorted[2].id, "c2");
  assert.equal(sorted[3].id, "c4");
});
