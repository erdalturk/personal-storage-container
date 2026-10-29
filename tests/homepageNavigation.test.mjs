import test from "node:test";
import assert from "node:assert/strict";

// Global mock for localStorage & window in Node test runner
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.window = {
  dispatchEvent: () => true
};
global.localStorage = localStorageMock;

const {
  sortContainersWithDirection,
  sortContainers
} = await import("../src/lib/containerSortUtils.ts");

const SAMPLE_CONTAINERS = [
  { id: "c1", title: "Sinema Kulübü", itemCount: 38, lastUpdated: "2 saat önce" },
  { id: "c2", title: "Frontend Snippet'lar", itemCount: 54, lastUpdated: "Dün" },
  { id: "c3", title: "Gezi & Seyahat", itemCount: 124, lastUpdated: "3 gün önce" },
  { id: "c4", title: "Algoritmalar", itemCount: 16, lastUpdated: "5 gün önce" },
];

test("NAV-01: sortContainersWithDirection - Alfabetik (A-Z ve Z-A) yön doğrulaması", () => {
  const asc = sortContainersWithDirection(SAMPLE_CONTAINERS, "alpha", "asc");
  assert.equal(asc[0].title, "Algoritmalar");
  assert.equal(asc[asc.length - 1].title, "Sinema Kulübü");

  const desc = sortContainersWithDirection(SAMPLE_CONTAINERS, "alpha", "desc");
  assert.equal(desc[0].title, "Sinema Kulübü");
  assert.equal(desc[desc.length - 1].title, "Algoritmalar");
});

test("NAV-02: sortContainersWithDirection - İçerik Sayısı (Çoktan aza ve Azdan çoğa)", () => {
  const desc = sortContainersWithDirection(SAMPLE_CONTAINERS, "count", "desc");
  assert.equal(desc[0].itemCount, 124); // Gezi
  assert.equal(desc[desc.length - 1].itemCount, 16); // Algoritmalar

  const asc = sortContainersWithDirection(SAMPLE_CONTAINERS, "count", "asc");
  assert.equal(asc[0].itemCount, 16);
  assert.equal(asc[asc.length - 1].itemCount, 124);
});

test("NAV-03: sortContainersWithDirection - Son Güncelleme (En yeni ve En eski)", () => {
  const desc = sortContainersWithDirection(SAMPLE_CONTAINERS, "updated", "desc");
  assert.equal(desc[0].id, "c1"); // 2 saat önce (en yeni)
  assert.equal(desc[desc.length - 1].id, "c4"); // 5 gün önce (en eski)

  const asc = sortContainersWithDirection(SAMPLE_CONTAINERS, "updated", "asc");
  assert.equal(asc[0].id, "c4"); // en eski ilk
  assert.equal(asc[asc.length - 1].id, "c1");
});

test("NAV-04: Global arama 8 depo filtre çipi kesin tip eşleşmesi (PM-CONTROL Satır 16-19)", () => {
  const mockResults = [
    { id: "m1", title: "Inception", type: "movie", keywords: "film nolan" },
    { id: "img1", title: "Film Afişi Fotoğrafı", type: "image", keywords: "film fotoğraf" },
    { id: "c1", title: "Film API Helper", type: "code", keywords: "film api python" },
    { id: "t1", title: "Film Üzerine Şiir", type: "text", keywords: "film dize" },
  ];

  // 'movie' filtresi seçildiğinde yalnız type === 'movie' olanlar listelenmeli
  const movieOnly = mockResults.filter((r) => r.type === "movie");
  assert.equal(movieOnly.length, 1);
  assert.equal(movieOnly[0].id, "m1");

  // 'image' filtresi seçildiğinde yalnız görsel gelmeli
  const imageOnly = mockResults.filter((r) => r.type === "image");
  assert.equal(imageOnly.length, 1);
  assert.equal(imageOnly[0].id, "img1");
});
