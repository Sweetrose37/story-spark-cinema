const fs = require('fs');
const assert = require('assert');

const reader = fs.readFileSync('js/pdfStoryReader.js', 'utf8');
const app = fs.readFileSync('js/app-v2.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

for (const file of ['assets/vendor/pdfjs/pdf.min.mjs', 'assets/vendor/pdfjs/pdf.worker.min.mjs', 'assets/vendor/pdfjs/LICENSE']) {
  assert(fs.existsSync(file), `Missing local PDF dependency: ${file}`);
  assert(fs.statSync(file).size > 1000, `PDF dependency is unexpectedly empty: ${file}`);
}
assert(html.includes('js/pdfStoryReader.js'), 'PDF reader is not loaded by the app');
assert(app.includes('.pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.json'), 'PDF and image formats are missing from the story file picker');
assert(app.includes("PdfStoryReader.extract(file"), 'PDF upload is not connected to text extraction');
assert(app.includes("MovieStudio.importPages(result.pages"), 'Extracted PDF pages are not connected one-to-one to movie composition');
assert(app.includes("route('editor')"), 'PDF import does not open the timeline editor');
assert(reader.includes("pdf.getPage(number)"), 'Reader does not process PDF pages');
assert(reader.includes("page.getTextContent()"), 'Reader does not extract page text');
assert(reader.includes('pageArtwork(page,pageBudget)'), 'PDF pages are not rendered as scene artwork');
assert(reader.includes('page.render({canvas,canvasContext:context,viewport})'), 'Android PDF rendering is missing its explicit canvas target');
assert(reader.includes('fallbackArtwork(text,number,pageBudget)'), 'A failed Android PDF render has no visible book-page recovery');
assert(reader.includes("current.toDataURL('image/jpeg',quality)"), 'PDF artwork is not adaptively compressed for local storage');
assert(reader.includes('importCount=Math.min(pageCount,24)'), 'PDF artwork count limit is missing');
assert(reader.includes('pageBudget=Math.floor(2050000/importCount)'), 'Each PDF page does not receive a mobile storage budget');
assert(reader.includes('artworkSize<2200000'), 'PDF artwork storage limit is missing');
assert(reader.includes('pdfjsPromise=null;throw error'), 'A failed PDF library load cannot be retried');
assert(reader.includes('artwork recovery:'), 'One difficult PDF image can still cancel the whole upload');
assert(reader.includes('text recovery:'), 'One difficult PDF text layer can still cancel the whole upload');
assert(app.includes("input.value=''"), 'Selecting the same PDF again will not trigger another upload');
assert(reader.includes('30*1024*1024'), 'PDF size safety limit is missing');
assert(reader.includes('pageCount>150'), 'PDF page safety limit is missing');
assert(reader.includes("typeof pdf.destroy==='function'"), 'PDF cleanup is not guarded for browser compatibility');
assert(reader.includes('pages:pages.map'), 'Ordered PDF page records are not preserved before cleanup');
assert(reader.includes('page.text||`Illustrated page ${page.pageNumber}`'), 'A difficult PDF page can disappear instead of becoming a placeholder scene');
assert(reader.includes('pages.push({pageNumber:number,text,image})'), 'PDF page text and artwork can drift out of alignment');
assert(app.includes("{type:'pdf',title:result.fileName}"), 'PDF source data is not assigned to page scenes');
assert(fs.readFileSync('js/movieComposer.js','utf8').includes('importPagesWithCover'), 'Imported books do not open on their actual cover artwork');
assert(fs.readFileSync('js/timelineEditor.js','utf8').includes('preview-pdf-art'), 'PDF artwork is missing from the timeline preview');
assert(fs.readFileSync('js/moviePlayer.js','utf8').includes('movie-pdf-art'), 'PDF artwork is missing from movie playback');
assert(fs.readFileSync('js/timelineEditor.js','utf8').includes("art?'':`<div class=\"preview-stars\""), 'Editor decorations are not hidden over PDF artwork');
assert(fs.readFileSync('js/moviePlayer.js','utf8').includes('caption&&!art'), 'Movie captions are not hidden over PDF artwork');

console.log('PDF import smoke passed: local reader, worker, limits, extraction, recovery, and movie conversion are connected.');
