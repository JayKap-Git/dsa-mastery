// Authoring helper: dumps the book's text, one file per chapter, into .book-text/ (gitignored).
// Uses macOS PDFKit through JXA, so it needs no npm dependencies. Not part of the site build.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const pdf = resolve(process.argv[2] ?? 'book.pdf');
if (!existsSync(pdf)) {
  console.error(`No PDF at ${pdf}`);
  process.exit(1);
}

const jxa = `
ObjC.import('PDFKit');
function run(argv) {
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  const pages = [];
  for (let i = 0; i < doc.pageCount; i++) {
    const page = doc.pageAtIndex(i);
    const s = page ? page.string : null;
    pages.push(s && s.js ? s.js : '');
  }
  return JSON.stringify(pages);
}`;

const pages = JSON.parse(
  execFileSync('osascript', ['-l', 'JavaScript', '-e', jxa, pdf], { maxBuffer: 64 * 1024 * 1024 }).toString(),
);

// Book page N is PDF page N + 10. Chapter start pages come from the table of contents.
const OFFSET = 10;
const starts = [3, 17, 25, 35, 47, 57, 65, 77, 83, 95, 109, 117, 123, 133, 141, 149, 157, 163, 173, 181, 197, 207, 217, 225, 235, 243, 251, 257, 265, 275];
const END = 281; // bibliography

mkdirSync('.book-text', { recursive: true });
starts.forEach((start, i) => {
  const end = (starts[i + 1] ?? END) - 1;
  const parts = [];
  for (let p = start; p <= end; p++) parts.push(`--- page ${p} ---\n${pages[p + OFFSET - 1]}`);
  const file = `.book-text/ch${String(i + 1).padStart(2, '0')}.txt`;
  writeFileSync(file, parts.join('\n\n'));
  console.log(`${file}  pages ${start}-${end}`);
});
writeFileSync('.book-text/bibliography.txt', pages.slice(END + OFFSET - 1).join('\n\n'));
