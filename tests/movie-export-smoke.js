const fs = require('fs');
const assert = require('assert');

const exporter = fs.readFileSync('js/movieExporter.js','utf8');
const player = fs.readFileSync('js/moviePlayer.js','utf8');
const timeline = fs.readFileSync('js/timelineEditor.js','utf8');
const app = fs.readFileSync('js/app-v2.js','utf8');
const html = fs.readFileSync('index.html','utf8');

assert(/js\/movieExporter\.js\?v=\d+(?:\.\d+)*/.test(html), 'Movie exporter is not loaded');
assert(exporter.includes('WIDTH=1280,HEIGHT=720,FPS=30'), 'Export is not configured for 1280x720');
assert(exporter.includes("canvas.captureStream(FPS)"), 'Canvas is not connected to a video stream');
assert(exporter.includes('new MediaRecorder'), 'Video recording is missing');
assert(exporter.includes("a.download=escFile(comp.title)+'.webm'"), 'WebM download is missing');
assert(exporter.includes('musicTrack(comp)'), 'Local music is not connected to export');
assert(exporter.includes('comp.scenes'), 'Timeline scenes are not rendered');
assert(exporter.includes("scene.background?.image"), 'Imported story artwork is not rendered');
assert(exporter.includes('coverScale=Math.max(WIDTH/img.width,HEIGHT/img.height)'), 'Export does not fill unused space behind differently sized pages');
assert(exporter.includes('fitScale=Math.min(WIDTH/img.width,HEIGHT/img.height)'), 'Export can crop differently sized book pages');
assert(exporter.includes('CANCEL EXPORT'), 'Export cancellation is missing');
assert(exporter.includes('Keep this tab open'), 'Real-time export guidance is missing');
assert(player.includes('data-export-movie'), 'Player export button is missing');
assert(timeline.includes('data-export-movie'), 'Editor export button is missing');
assert(app.includes('function bindMovieExports()'), 'Export button handler is missing');
assert(app.includes('CinemaPlayer.active?.pause()'), 'Playback is not paused before export');

console.log('Movie export smoke passed: editor/player buttons, 720p rendering, music, progress, cancellation, and WebM download are connected.');
