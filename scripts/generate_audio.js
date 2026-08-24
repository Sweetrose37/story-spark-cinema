/* Generate Story Spark Cinema's tiny original offline WAV library. */
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const root = path.join(__dirname, '..', 'assets', 'audio');
const musicDir = path.join(root, 'music');
const sfxDir = path.join(root, 'sfx');
fs.mkdirSync(musicDir, { recursive: true });
fs.mkdirSync(sfxDir, { recursive: true });

function wav(file, seconds, sample) {
  const count = Math.floor(RATE * seconds);
  const data = Buffer.alloc(count * 2);
  for (let i = 0; i < count; i += 1) {
    const fade = Math.min(1, i / 300, (count - i) / 700);
    const value = Math.max(-1, Math.min(1, sample(i / RATE) * fade));
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(RATE, 24); header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
}

const notes = {
  magical: [261.6, 329.6, 392, 523.3], adventure: [196, 246.9, 293.7, 392],
  mystery: [220, 261.6, 311.1, 370], comedy: [293.7, 370, 440, 587.3],
  space: [174.6, 261.6, 349.2, 523.3], epic: [146.8, 220, 293.7, 440],
  calm: [220, 277.2, 329.6, 415.3], happy: [261.6, 329.6, 392, 659.3],
  'spooky-cute': [196, 233.1, 293.7, 349.2], emotional: [196, 246.9, 329.6, 392],
  victory: [261.6, 392, 523.3, 659.3]
};

Object.entries(notes).forEach(([name, chord], themeIndex) => {
  wav(path.join(musicDir, `${name}.wav`), 4, (t) => {
    const beat = Math.floor(t * 3) % chord.length;
    const f = chord[beat];
    const pad = chord.reduce((sum, n) => sum + Math.sin(2 * Math.PI * n * t), 0) / chord.length;
    const bell = Math.sin(2 * Math.PI * f * t) * Math.exp(-(t % (1 / 3)) * 4);
    return (pad * .20 + bell * .13 + Math.sin(2 * Math.PI * (f * 2 + themeIndex) * t) * .08) * .72;
  });
});

const effects = {
  sparkle: t => Math.sin(2 * Math.PI * (650 + t * 1100) * t) * Math.exp(-t * 4),
  door: t => (Math.sin(2 * Math.PI * 85 * t) + Math.sin(2 * Math.PI * 122 * t) * .5) * Math.exp(-t * 3),
  whoosh: t => (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.min(1, t / .7)) * .45,
  footsteps: t => Math.sin(2 * Math.PI * 75 * t) * (Math.sin(2 * Math.PI * 4 * t) > .7 ? .7 : .03),
  magic: t => Math.sin(2 * Math.PI * (300 + 900 * t) * t) * Math.exp(-t * 1.8),
  robot: t => Math.sign(Math.sin(2 * Math.PI * (170 + 80 * Math.sin(t * 18)) * t)) * .25 * Math.exp(-t),
  dragon: t => (Math.sin(2 * Math.PI * 55 * t) + (Math.random() * 2 - 1) * .25) * Math.exp(-t * 1.5),
  crowd: t => (Math.random() * 2 - 1) * (.15 + .1 * Math.sin(t * 20)) * Math.exp(-t * .7),
  wind: t => (Math.random() * 2 - 1) * (.25 + .15 * Math.sin(t * 5)),
  rain: () => (Math.random() * 2 - 1) * .25,
  victory: t => Math.sin(2 * Math.PI * [392, 523.3, 659.3, 784][Math.min(3, Math.floor(t * 4))] * t) * .45,
  mystery: t => Math.sin(2 * Math.PI * (220 - t * 70) * t) * .35 * Math.exp(-t),
  treasure: t => Math.sin(2 * Math.PI * [523.3, 659.3, 784][Math.min(2, Math.floor(t * 5))] * t) * Math.exp(-t * 1.2),
  countdown: t => Math.sin(2 * Math.PI * 440 * t) * (t % .3 < .10 ? .38 : 0)
};

Object.entries(effects).forEach(([name, sound]) => wav(path.join(sfxDir, `${name}.wav`), 1.2, sound));
console.log(`Created ${Object.keys(notes).length} music loops and ${Object.keys(effects).length} sound effects.`);
