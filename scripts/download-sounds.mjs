import { createWriteStream, existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');

const sounds = [
  {
    name: 'tick.mp3',
    url: 'https://freesound.org/data/previews/259/259723_4486188-lq.mp3',
    fallback: 'https://www.soundjay.com/misc/sounds/clock-ticking-1.mp3',
  },
  {
    name: 'bell.mp3',
    url: 'https://freesound.org/data/previews/411/411642_5121236-lq.mp3',
    fallback: 'https://www.soundjay.com/buttons/sounds/button-09.mp3',
  },
  {
    name: 'break-start.mp3',
    url: 'https://freesound.org/data/previews/341/341695_5858296-lq.mp3',
    fallback: 'https://www.soundjay.com/buttons/sounds/button-37.mp3',
  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => resolve());
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

async function main() {
  await mkdir(SOUNDS_DIR, { recursive: true });
  for (const sound of sounds) {
    const dest = path.join(SOUNDS_DIR, sound.name);
    if (existsSync(dest)) {
      console.log(`⏭️ ${sound.name} already exists`);
      continue;
    }
    console.log(`⬇️ Downloading ${sound.name}...`);
    try {
      await download(sound.url, dest);
      console.log(`✅ ${sound.name} saved`);
    } catch {
      try {
        await download(sound.fallback, dest);
        console.log(`✅ ${sound.name} saved (fallback)`);
      } catch (e) {
        console.error(`❌ Failed: ${sound.name}`, e.message);
      }
    }
  }
}
main();
