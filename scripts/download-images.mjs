import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const imgDir = path.join(root, 'public/images');
const iconDir = path.join(root, 'public/icons');
fs.mkdirSync(imgDir, { recursive: true });
fs.mkdirSync(iconDir, { recursive: true });

const svg = fs.readFileSync(path.join(iconDir, 'icon.svg'));
async function icons() {
  for (const size of [192, 512]) {
    const out = path.join(iconDir, `icon-${size}.png`);
    if (!fs.existsSync(out)) await sharp(svg).resize(size, size).png().toFile(out);
  }
  const apple = path.join(iconDir, 'apple-touch-icon.png');
  if (!fs.existsSync(apple)) await sharp(svg).resize(180, 180).png().toFile(apple);
}

async function commons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&gsrnamespace=6&prop=imageinfo&iiprop=url|mime&iiurlwidth=960&format=json&origin=*`;
  const res = await fetch(url, { headers: { 'User-Agent': 'HBG-Events-PWA/1.0' } });
  if (!res.ok) return null;
  const data = await res.json();
  for (const p of Object.values(data.query?.pages || {})) {
    const info = p.imageinfo?.[0];
    if (info?.mime?.startsWith('image/') && !info.mime.includes('svg')) return info.thumburl || info.url;
  }
  return null;
}

async function save(id, url) {
  const out = path.join(imgDir, `${id}.webp`);
  if (fs.existsSync(out) && fs.statSync(out).size > 800) return;
  const res = await fetch(url, { headers: { 'User-Agent': 'HBG-Events-PWA/1.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error(String(res.status));
  await sharp(Buffer.from(await res.arrayBuffer())).resize(960, 600, { fit: 'cover' }).webp({ quality: 76 }).toFile(out);
}

const queries = {
  'foodtruck-festival': 'Helsingborg city', 'magnus-betner': 'Helsingborgs Konserthus',
  'valles-kompislopp': 'Helsingborg harbour', 'blinkningar': 'Dunkers kulturhus',
  'blomstrande-host': 'Sofiero slott', 'sjalvplock-dahlior': 'Sofiero garden',
  'hso-surprise': 'Helsingborgs Konserthus', 'billy-elliot': 'Helsingborgs stadsteater',
  'oasis-tribute': 'Hamntorget Helsingborg', 'hif-dam-zenith': 'Olympia Helsingborg',
  'marias-marknad': 'Mariakyrkan Helsingborg', 'brukets-marknad': 'Helsingborg street',
  'hif-norrby': 'Olympia Helsingborg', 'johnny-delaware': 'Hamntorget Helsingborg',
  'hso-klassiker': 'Helsingborgs Konserthus', 'appelguidning': 'Sofiero slott',
  'standup-martin': 'Hamntorget Helsingborg', 'henrik-nyblom': 'The Tivoli Helsingborg',
  'per-andersson': 'Helsingborgs Konserthus', 'stockholm-jazz': 'Dunkers kulturhus',
  'big-aw-snsb': 'Hamntorget Helsingborg', 'kulturnatten-hbg': 'Helsingborg Kärnan',
  'dan-hylander': 'Hamntorget Helsingborg', 'rosa-catwalk': 'Kullagatan Helsingborg',
  'lang-lordag': 'Kullagatan Helsingborg', 'sofiero-smaklig': 'Sofiero slott',
  'oktoberfest-fabriken': 'Landskrona', 'tycho-by-night': 'Ven island',
  'magnus-carlson': 'Ängelholm', 'kafferep-hasse': 'Norrvikens trädgårdar',
  'frank-sinatra': 'Höganäs', 'kulturnatten-lund': 'Lund cathedral',
  'helt-off': 'Lund Sweden', 'lustans-lakejer': 'Lund Sweden',
  'smash-into-pieces': 'Malmö Live', 'david-urwitz': 'Malmö',
  'olof-wallberg': 'Malmö', 'louisa-lyne': 'Malmö',
  'broadway-duvemala': 'Malmö Live', 'milling-molbech': 'Kulturværftet',
};

await icons();
for (const [id, q] of Object.entries(queries)) {
  try {
    const url = await commons(q);
    if (url) await save(id, url);
    else console.warn('no image', id);
  } catch (e) {
    console.warn('fail', id, e.message);
  }
}
console.log('images done');
