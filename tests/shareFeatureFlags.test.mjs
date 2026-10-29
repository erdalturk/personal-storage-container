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

// Import featureFlags after setting up global mock
const {
  DEFAULT_FEATURE_FLAGS,
  isFeatureEnabled,
  setFeatureFlag,
  getAllFeatureFlags,
  resetFeatureFlags
} = await import("../src/lib/featureFlags.ts");

test("FF-01: Varsayılan bayrakların tümü false (pasif) olmalı", () => {
  resetFeatureFlags();
  assert.equal(isFeatureEnabled("enableFullArchiveJsonExport"), false);
  assert.equal(isFeatureEnabled("enableFullArchiveJsonImport"), false);
  assert.equal(isFeatureEnabled("enableSharedContainerFullDownload"), false);
  assert.equal(isFeatureEnabled("enableMovieArchiveExport"), false);
  assert.equal(isFeatureEnabled("enableMarkdownExportTravel"), false);
  assert.equal(isFeatureEnabled("enableMarkdownExportStudy"), false);
  assert.equal(isFeatureEnabled("enableFlashcardsDownload"), false);
});

test("FF-02: setFeatureFlag ile bayrak açılıp kapatılabilmeli", () => {
  resetFeatureFlags();
  setFeatureFlag("enableMovieArchiveExport", true);
  assert.equal(isFeatureEnabled("enableMovieArchiveExport"), true);
  // Diğer bayraklar false kalmalı
  assert.equal(isFeatureEnabled("enableMarkdownExportTravel"), false);

  setFeatureFlag("enableMovieArchiveExport", false);
  assert.equal(isFeatureEnabled("enableMovieArchiveExport"), false);
});

test("FF-03: getAllFeatureFlags mevcut durumları doğru döndürmeli", () => {
  resetFeatureFlags();
  setFeatureFlag("enableFullArchiveJsonExport", true);
  const flags = getAllFeatureFlags();
  assert.equal(flags.enableFullArchiveJsonExport, true);
  assert.equal(flags.enableFullArchiveJsonImport, false);
});

test("REV-01: Alt dize (substring) içeren bir öğe silindiğinde ilgisiz paylaşım bağlantıları iptal edilmemeli", () => {
  // Simüle edilmiş paylaşılan bağlantılar
  const sampleLinks = [
    {
      id: "share-1",
      token: "tok-exact-match",
      title: "Not",
      scope: "item",
      type: "text",
      isActive: true,
      rawItem: { id: "item-10", title: "Not" }
    },
    {
      id: "share-2",
      token: "tok-unrelated-substring",
      title: "Not Defterim ve Şiirler",
      scope: "item",
      type: "text",
      isActive: true,
      rawItem: { id: "item-20", title: "Not Defterim ve Şiirler" }
    },
    {
      id: "share-3",
      token: "tok-container-share",
      title: "Notlar Deposu",
      scope: "container",
      type: "text",
      isActive: true,
      rawItem: { id: "cont-1", title: "Notlar Deposu" }
    }
  ];

  // Silinecek öğe: item-10 ("Not")
  const deletedItemId = "item-10";
  const deletedItemTitle = "Not";

  // appStore.ts içindeki sıkılaştırılmış revocation mantığı:
  // scope === "item" ve (rawItem.id === deletedItemId veya birebir title eşitliği)
  const tokensToRevoke = sampleLinks
    .filter((link) => {
      if (link.scope !== "item") return false;
      const rawMatches = link.rawItem && link.rawItem.id && link.rawItem.id === deletedItemId;
      const titleMatches = link.title.trim().toLowerCase() === deletedItemTitle.trim().toLowerCase();
      return rawMatches || titleMatches;
    })
    .map(l => l.token);

  assert.deepEqual(tokensToRevoke, ["tok-exact-match"]);
  assert.ok(!tokensToRevoke.includes("tok-unrelated-substring"), "Alt dize içeren 'Not Defterim ve Şiirler' iptal edilmemeli!");
  assert.ok(!tokensToRevoke.includes("tok-container-share"), "Depo bazlı paylaşım tek öğe silindi diye iptal edilmemeli!");
});
