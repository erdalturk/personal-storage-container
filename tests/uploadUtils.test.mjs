import test from "node:test";
import assert from "node:assert/strict";
import { formatBytes, getFileExtension } from "../src/lib/uploadUtils.ts";

test("UPLOAD-01: formatBytes converts byte integers into readable units", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(500), "500 B");
  assert.equal(formatBytes(1024), "1 KB");
  assert.equal(formatBytes(1048576), "1 MB");
  assert.equal(formatBytes(5242880), "5 MB");
});

test("UPLOAD-02: getFileExtension correctly extracts and capitalizes file extensions", () => {
  assert.equal(getFileExtension("sozlesme.pdf"), "PDF");
  assert.equal(getFileExtension("tablo.xlsx"), "XLSX");
  assert.equal(getFileExtension("resim.png"), "PNG");
  assert.equal(getFileExtension("arsiv.zip"), "ZIP");
  assert.equal(getFileExtension("uzantisiz-dosya"), "DOSYA");
});
