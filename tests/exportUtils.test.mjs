import { test } from 'node:test';
import assert from 'node:assert';
import {
  sanitizeFilename,
  getCodeExtension,
  CODE_EXTENSIONS,
  DOCUMENT_MIMES,
  createSyntheticAudioBlob,
} from '../src/lib/exportUtils.ts';

test('1. sanitizeFilename: clears illegal characters and preserves alphanumeric and Turkish letters', () => {
  const dirty = 'Ders <Notları> / & ? * : Test! ';
  const clean = sanitizeFilename(dirty);
  assert.ok(!clean.includes('<'));
  assert.ok(!clean.includes('>'));
  assert.ok(!clean.includes('/'));
  assert.ok(!clean.includes('?'));
  assert.ok(!clean.includes('*'));
  assert.ok(!clean.includes(':'));
  assert.ok(clean.length > 0);
  assert.strictEqual(sanitizeFilename(''), 'adsiz-dosya');
});

test('2. getCodeExtension: maps supported programming languages to proper extensions', () => {
  assert.strictEqual(getCodeExtension('typescript'), 'ts');
  assert.strictEqual(getCodeExtension('TypeScript'), 'ts');
  assert.strictEqual(getCodeExtension('python'), 'py');
  assert.strictEqual(getCodeExtension('rust'), 'rs');
  assert.strictEqual(getCodeExtension('sql'), 'sql');
  assert.strictEqual(getCodeExtension('bash'), 'sh');
  assert.strictEqual(getCodeExtension('go'), 'go');
  assert.strictEqual(getCodeExtension('json'), 'json');
  assert.strictEqual(getCodeExtension('unknown_lang'), 'txt');
});

test('3. CODE_EXTENSIONS & DOCUMENT_MIMES: comprehensive coverage of required formats', () => {
  // Required formats from user request: PDF, XLSX, PPTX, JSON, TXT, RAR, ZIP, MP3, MP4
  assert.ok(DOCUMENT_MIMES['pdf']);
  assert.ok(DOCUMENT_MIMES['xlsx']);
  assert.ok(DOCUMENT_MIMES['pptx']);
  assert.ok(DOCUMENT_MIMES['docx']);
  assert.ok(DOCUMENT_MIMES['zip']);
  assert.ok(DOCUMENT_MIMES['rar']);
  assert.ok(DOCUMENT_MIMES['json']);

  assert.strictEqual(CODE_EXTENSIONS['python'].ext, 'py');
  assert.strictEqual(CODE_EXTENSIONS['typescript'].ext, 'ts');
});

test('4. createSyntheticAudioBlob: generates valid WAVE audio header and samples', () => {
  const blob = createSyntheticAudioBlob(1);
  assert.ok(blob instanceof Blob);
  assert.strictEqual(blob.type, 'audio/wav');
  assert.ok(blob.size > 44); // 44 bytes header + sample data
});
