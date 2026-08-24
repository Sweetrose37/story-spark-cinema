const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('js/app-v2.js','utf8');
const idb = fs.readFileSync('js/idb.js','utf8');

assert(app.includes('type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp'), 'Story picker does not allow ordered multi-image selection');
assert(app.includes('function prepareSceneImage(file,targetSize=180000)'), 'Mobile image compression is missing');
assert(app.includes('function prepareImagePages(files,onProgress)'), 'Image pages are not prepared sequentially');
assert(app.includes('if(images.length>24)'), 'Image page count protection is missing');
assert(app.includes('totalSize>2200000'), 'Image story storage protection is missing');
assert(app.includes("files.every(isImage)"), 'Multi-image input is not validated as one image-only batch');
assert(app.includes("MovieStudio.importPages(pages,state.age,{type:'images'"), 'Images are not converted to page-by-page scenes');
assert(app.includes("input.value=''"), 'Same-file mobile retry protection is missing');
assert(app.includes("classList.add('file-import-active')"), 'Import lifecycle does not protect against mobile refresh');
assert(app.includes("window.dispatchEvent(new CustomEvent('storyspark-import-finished'))"), 'Import lifecycle completion is missing');
assert(idb.includes('async function clear()'), 'Reset cannot clear uploaded media storage');
assert(app.includes('removeCompositionAssets'), 'Deleting a movie does not clean unused uploaded media');

console.log('Image page smoke passed: PNG/JPG/WebP batches, ordered scenes, mobile limits, retries, lifecycle, and asset cleanup are connected.');
