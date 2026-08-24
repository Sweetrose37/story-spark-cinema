const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('js/app-v2.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');
const html = fs.readFileSync('index.html','utf8');
const worker = fs.readFileSync('sw.js','utf8');

assert(app.includes('id="drivePdfUrl"'), 'Google Drive link field is missing');
assert(app.includes('id="drivePdfImport"'), 'Google Drive import button is missing');
assert(app.includes('function googleDrivePdfId(value)'), 'Google Drive file ID parser is missing');
assert(app.includes("url.pathname.match(/\\/file\\/d\\/([^/]+)/)"), 'Standard Drive sharing links are not recognized');
assert(app.includes("url.searchParams.get('id')"), 'Drive download-style links are not recognized');
assert(app.includes('https://drive.usercontent.google.com/download?id='), 'Drive links are not converted to downloadable PDF URLs');
assert(app.includes("fetch(downloadUrl,{mode:'cors',credentials:'omit',redirect:'follow'})"), 'Drive PDF download is not mobile-safe');
assert(app.includes("signature.startsWith('%PDF')"), 'Non-PDF Drive responses are not rejected');
assert(app.includes("blob.size>30*1024*1024"), 'Drive PDFs do not use the upload size safety limit');
assert(app.includes("PdfStoryReader.extract(file"), 'Drive PDFs do not use the locked PDF reader');
assert(app.includes("MovieStudio.importPages(result.pages"), 'Drive PDF pages are not turned into movie scenes');
assert(app.includes("source:'google-drive'"), 'Drive imports are not identified in movie source data');
assert(app.includes("classList.add('file-import-active')"), 'App updates can interrupt an active Drive import');
assert(app.includes("'storyspark-import-finished'"), 'Deferred app refresh is not resumed after a Drive import');
assert(app.includes('Anyone with the link'), 'Drive sharing instructions are missing');
assert(styles.includes('@media(max-width:520px){.drive-link-row{grid-template-columns:1fr}'), 'Drive link controls do not stack on narrow phones');
assert(html.includes('css/styles.css?v=5.5'), 'Drive link mobile styling is not cache-busted');
assert(html.includes('js/app-v2.js?v=5.8'), 'Drive link controller is not cache-busted');
assert(worker.includes("const CACHE='story-spark-mobile-v18'"), 'Installed phones will not receive Drive link imports');

console.log('Google Drive PDF smoke passed: public link parsing, safe download, PDF validation, movie conversion, mobile layout, and offline updates are connected.');
