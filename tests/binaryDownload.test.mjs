import { test } from 'node:test';
import assert from 'node:assert';
import {
  createZipUint8Array,
  createMinimalPptx,
  createMinimalDocx,
  createMinimalXlsx,
  createMinimalZip,
  computeCrc32,
} from '../src/lib/exportUtils.ts';

test('BIN-01: createZipUint8Array produces valid ZIP magic bytes PK\\x03\\x04', () => {
  const zip = createZipUint8Array([
    { name: 'test.txt', data: 'Deneme metni' },
  ]);
  assert.ok(zip instanceof Uint8Array);
  assert.ok(zip.length > 50);

  // PK\x03\x04 magic bytes
  assert.strictEqual(zip[0], 0x50); // 'P'
  assert.strictEqual(zip[1], 0x4b); // 'K'
  assert.strictEqual(zip[2], 0x03);
  assert.strictEqual(zip[3], 0x04);
});

test('BIN-02: computeCrc32 generates consistent 32-bit checksum', () => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode('123456789');
  const crc = computeCrc32(bytes);
  // Standard CRC-32 for '123456789' is 0xCBF43926 (3421514790)
  assert.strictEqual(crc, 0xcbf43926);
});

test('BIN-03: createMinimalPptx produces valid OOXML package with presentation XML', () => {
  const pptxBytes = createMinimalPptx('Yatirimci Sunumu', '16 slaytlik vizyon sunumu');
  assert.ok(pptxBytes instanceof Uint8Array);
  // Magic bytes
  assert.strictEqual(pptxBytes[0], 0x50);
  assert.strictEqual(pptxBytes[1], 0x4b);
  assert.strictEqual(pptxBytes[2], 0x03);
  assert.strictEqual(pptxBytes[3], 0x04);

  // Check that PPTX internal paths exist in the binary data
  const str = Buffer.from(pptxBytes).toString('utf-8');
  assert.ok(str.includes('[Content_Types].xml'));
  assert.ok(str.includes('ppt/presentation.xml'));
  assert.ok(str.includes('ppt/slides/slide1.xml'));
  assert.ok(str.includes('Yatirimci Sunumu'));
});

test('BIN-04: createMinimalDocx produces valid Word OOXML package with document XML', () => {
  const docxBytes = createMinimalDocx('Hizmet Sozlesmesi', 'Maddeler ve gizlilik');
  assert.ok(docxBytes instanceof Uint8Array);
  assert.strictEqual(docxBytes[0], 0x50);
  assert.strictEqual(docxBytes[1], 0x4b);

  const str = Buffer.from(docxBytes).toString('utf-8');
  assert.ok(str.includes('[Content_Types].xml'));
  assert.ok(str.includes('word/document.xml'));
  assert.ok(str.includes('Hizmet Sozlesmesi'));
});

test('BIN-05: createMinimalXlsx produces valid Excel OOXML package with sheet XML', () => {
  const xlsxBytes = createMinimalXlsx('Gelir Tablosu', 'Q3-Q4 Butce');
  assert.ok(xlsxBytes instanceof Uint8Array);
  assert.strictEqual(xlsxBytes[0], 0x50);
  assert.strictEqual(xlsxBytes[1], 0x4b);

  const str = Buffer.from(xlsxBytes).toString('utf-8');
  assert.ok(str.includes('[Content_Types].xml'));
  assert.ok(str.includes('xl/workbook.xml'));
  assert.ok(str.includes('xl/worksheets/sheet1.xml'));
  assert.ok(str.includes('Gelir Tablosu'));
});

test('BIN-06: createMinimalZip produces valid archive with README and metadata', () => {
  const zipBytes = createMinimalZip('Tasarim Arsivi', 'SVG ikonlar ve logolar');
  assert.ok(zipBytes instanceof Uint8Array);
  assert.strictEqual(zipBytes[0], 0x50);
  assert.strictEqual(zipBytes[1], 0x4b);

  const str = Buffer.from(zipBytes).toString('utf-8');
  assert.ok(str.includes('README.txt'));
  assert.ok(str.includes('metadata.json'));
  assert.ok(str.includes('Tasarim Arsivi'));
});
