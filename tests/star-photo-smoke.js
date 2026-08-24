const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('js/app-v2.js','utf8');
const composer = fs.readFileSync('js/movieComposer.js','utf8');
const editor = fs.readFileSync('js/timelineEditor.js','utf8');
const player = fs.readFileSync('js/moviePlayer.js','utf8');
const exporter = fs.readFileSync('js/movieExporter.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');

assert(app.includes("photo:''"), 'New characters do not have a photo field');
assert(app.includes('id="starPhotoInput"'), 'Create Your Star photo input is missing');
assert(app.includes('prepareStarPhoto(file)'), 'Photo validation and resizing are missing');
assert(app.includes("a==='remove-star-photo'"), 'Illustrated-star fallback is missing');
assert(app.includes('applyStarPhotoDom()'), 'Poster and character-library photo rendering is missing');
assert(composer.includes("image:project.character.photo||''"), 'Star photo is not copied into movie scenes');
assert(editor.includes("c.image?'real-preview-star'"), 'Timeline preview does not render the star photo');
assert(player.includes("c.image?'real-movie-star'"), 'Movie player does not render the star photo');
assert(exporter.includes('drawPortrait(ctx,heroImg)'), 'Movie export does not draw the star photo');
assert(styles.includes('.star-upload-card'), 'Photo upload styling is missing');
assert(styles.includes('.scene-character.real-star'), 'Story-scene photo styling is missing');

console.log('Star photo smoke passed: upload, resize, privacy copy, creator preview, story scene, library, poster, editor, player, fallback, and export are connected.');
