const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('js/app-v2.js', 'utf8');
const styles = fs.readFileSync('css/styles.css', 'utf8');

assert(app.includes('📖 UPLOAD STORY'), 'Sidebar upload shortcut is missing');
assert(app.includes('UPLOAD / PASTE YOUR STORY'), 'My Movies upload action is missing');
assert(app.includes("a==='surprise-project')return shakeMovieBox()"), 'Shake action is not connected');
assert(app.includes("setTimeout(buildSurpriseMovie,650)"), 'Shake animation does not complete into a movie');
assert(app.includes("while(steps++<12)"), 'Shake does not build a complete story path');
assert(app.includes("const movie=buildComposition(true)"), 'Shake does not create a playable composition');
assert(app.includes("route('player')"), 'Shake does not open the movie player');
assert(app.includes('data-delete-movie'), 'Created movie delete control is missing');
assert(app.includes('data-delete-composition'), 'Imported movie delete control is missing');
assert(app.includes('data-duplicate-composition'), 'Imported movie duplicate control is missing');
assert(app.includes('if(!confirm(`Delete'), 'Delete confirmation is missing');
assert(app.includes("state.compositions.filter(c=>!c.projectId||!state.movies.some"), 'Imported compositions are not included in My Movies');
assert(styles.includes('.movie-box.shaking'), 'Shake animation styles are missing');
assert(styles.includes('.danger-btn'), 'Delete button styles are missing');

console.log('Library actions smoke passed: upload, shake, imported cards, duplicate, and confirmed delete are connected.');
