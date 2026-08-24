const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('js/app-v2.js','utf8');
const player = fs.readFileSync('js/moviePlayer.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');
const html = fs.readFileSync('index.html','utf8');

for (const age of ['toddler','preschool','kid','tween','teen']) {
  assert(styles.includes(`html[data-age="${age}"]`), `Missing ${age} visual adaptation`);
}
for (const width of ['320px','375px','390px','430px','760px','1100px']) {
  assert(styles.includes(`max-width:${width}`), `Missing responsive check for ${width}`);
}
assert(styles.includes('button:focus-visible'), 'Keyboard focus styling is missing');
assert(styles.includes('@media(prefers-reduced-motion:reduce)'), 'Reduced-motion support is missing');
assert(styles.includes('.player-page.controls-idle'), 'Cinema control auto-hide styling is missing');
assert(player.includes('showControls()'), 'Cinema control activity behavior is missing');
assert(app.includes('document.documentElement.dataset.age=state.age'), 'Age mode is not applied to the interface');
assert(app.includes("setAttribute('aria-current','page')"), 'Active navigation semantics are missing');
assert(app.includes("setAttribute('role','switch')"), 'Settings switch semantics are missing');
assert(app.includes('Saved ✨') || html.includes('Saved ✨'), 'Save feedback is missing');
assert(app.includes('home-journey'), 'Home create/movie/watch journey is missing');
assert(app.includes('director-panels'), 'Organized Director Mode panels are missing');
assert(app.includes('featured-premiere'), 'Featured Theater premiere is missing');
assert(app.includes('rewards-marquee'), 'Cinematic rewards treatment is missing');
assert(app.includes('Your theater is waiting.'), 'Theater empty state is missing');
assert(app.includes('Your cast is waiting in the wings.'), 'Character empty state is missing');
assert(app.includes('function polishHome'), 'Home empty-state polish is missing');
assert(html.includes('role="status" aria-live="polite"'), 'Screen-reader status regions are missing');

const openBraces=(styles.match(/{/g)||[]).length,closeBraces=(styles.match(/}/g)||[]).length;
assert.equal(openBraces,closeBraces,'CSS braces are unbalanced');
console.log('Step 4 polish smoke passed: age modes, responsive breakpoints, accessibility, feedback, player, studio, libraries, and empty states are connected.');
