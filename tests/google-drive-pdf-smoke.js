const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

const app = fs.readFileSync('js/app-v2.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');
const html = fs.readFileSync('index.html','utf8');
const worker = fs.readFileSync('sw.js','utf8');

assert(app.includes('id="drivePdfUrl"'), 'Google Drive link field is missing');
assert(app.includes('id="drivePdfImport"'), 'Google Drive import button is missing');
assert(app.includes('function googleDrivePdfId(value)'), 'Google Drive file ID parser is missing');
assert(app.includes("url.pathname.match(/\\/d\\/([^/]+)/i)"), 'Standard and mobile Drive file links are not recognized');
assert(app.includes("url.searchParams.get('id')"), 'Drive download-style links are not recognized');
assert(app.includes("if(/\\/folders?\\//i.test(url.pathname))"), 'Drive folder links do not receive a clear file-link instruction');
assert(app.includes("raw.match(/https?:\\/\\/[^\\s]+/i)"), 'Drive links copied with surrounding text are not normalized');
assert(app.includes("if(/^[a-z0-9_-]{10,}$/i.test(candidate))return candidate"), 'A pasted Drive file ID is not accepted');
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
assert(html.includes('js/app-v2.js?v=5.9'), 'Drive link controller is not cache-busted');
assert(worker.includes("const CACHE='story-spark-mobile-v19'"), 'Installed phones will not receive Drive link imports');

const parserStart=app.indexOf('function googleDrivePdfId(value)');
const parserEnd=app.indexOf('\nasync function importGoogleDrivePdf',parserStart);
const parseDriveId=vm.runInNewContext(`(${app.slice(parserStart,parserEnd)})`,{URL});
const sampleId='18cpd_3kqi6SPsIVMKklmd3EGgE_sDFFC';
assert.equal(parseDriveId(`https://drive.google.com/file/d/${sampleId}/view?usp=sharing`),sampleId,'Standard Drive file link failed');
assert.equal(parseDriveId(`https://drive.google.com/file/u/0/d/${sampleId}/view?usp=drivesdk`),sampleId,'Mobile/account Drive file link failed');
assert.equal(parseDriveId(`https://drive.google.com/open?id=${sampleId}`),sampleId,'Query-style Drive file link failed');
assert.equal(parseDriveId(`Here is my book: https://drive.google.com/file/d/${sampleId}/view`),sampleId,'Drive link copied with text failed');
assert.equal(parseDriveId(sampleId),sampleId,'Bare Drive file ID failed');
assert.throws(()=>parseDriveId(`https://drive.google.com/drive/folders/${sampleId}`),/folder link/i,'Folder link did not receive a clear error');

console.log('Google Drive PDF smoke passed: public link parsing, safe download, PDF validation, movie conversion, mobile layout, and offline updates are connected.');
