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
assert(app.includes('.pdf,.txt,.md,.json'), 'PDF is missing from the story file picker');
assert(app.includes("PdfStoryReader.extract(file"), 'PDF upload is not connected to text extraction');
assert(app.includes("MovieStudio.importText(result.text"), 'Extracted PDF text is not connected to movie composition');
assert(app.includes("route('editor')"), 'PDF import does not open the timeline editor');
assert(reader.includes("pdf.getPage(number)"), 'Reader does not process PDF pages');
assert(reader.includes("page.getTextContent()"), 'Reader does not extract page text');
assert(reader.includes('pageArtwork(page)'), 'PDF pages are not rendered as scene artwork');
assert(reader.includes("canvas.toDataURL('image/jpeg',.62)"), 'PDF artwork is not compressed for local storage');
assert(reader.includes('pageImages.length<8'), 'PDF artwork count limit is missing');
assert(reader.includes('artworkSize<1500000'), 'PDF artwork storage limit is missing');
assert(reader.includes('pdfjsPromise=null;throw error'), 'A failed PDF library load cannot be retried');
assert(reader.includes('artwork recovery:'), 'One difficult PDF image can still cancel the whole upload');
assert(reader.includes('text recovery:'), 'One difficult PDF text layer can still cancel the whole upload');
assert(app.includes("input.value=''"), 'Selecting the same PDF again will not trigger another upload');
assert(reader.includes('30*1024*1024'), 'PDF size safety limit is missing');
assert(reader.includes('pageCount>150'), 'PDF page safety limit is missing');
assert(reader.includes("typeof pdf.destroy==='function'"), 'PDF cleanup is not guarded for browser compatibility');
assert(reader.includes('return {text,pageCount,fileName:file.name,pageImages'), 'Page count and artwork are not preserved before PDF cleanup');
assert(app.includes('scene.background={...scene.background'), 'PDF artwork is not assigned to movie scenes');
assert(fs.readFileSync('js/timelineEditor.js','utf8').includes('preview-pdf-art'), 'PDF artwork is missing from the timeline preview');
assert(fs.readFileSync('js/moviePlayer.js','utf8').includes('movie-pdf-art'), 'PDF artwork is missing from movie playback');
assert(fs.readFileSync('js/timelineEditor.js','utf8').includes("art?'':`<div class=\"preview-stars\""), 'Editor decorations are not hidden over PDF artwork');
assert(fs.readFileSync('js/moviePlayer.js','utf8').includes('caption&&!art'), 'Movie captions are not hidden over PDF artwork');

console.log('PDF import smoke passed: local reader, worker, limits, extraction, recovery, and movie conversion are connected.');
