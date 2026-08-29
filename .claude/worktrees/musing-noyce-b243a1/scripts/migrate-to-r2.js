const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

require('dotenv').config({ path: '.env.local' });

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

const mediaFiles = [
  { local: 'file.mp4', r2: 'videos/file.mp4' },
  { local: 'fileagent.mp4', r2: 'videos/fileagent.mp4' },
  { local: 'fileprohlidka.mp4', r2: 'videos/fileprohlidka.mp4' },
  { local: '1668580559-1667892790-Jiří Beroun spolehlivý oblíbený nejlepší profesionál specialista rea.jpg.avif', r2: 'images/jiri-beroun.avif' },
  { local: 'David Choc realitní agent důvěryhodný spolehlivý nejlepší profesionál realitní makléř real.jpg.avif', r2: 'images/david-choc-agent.avif' },
  { local: 'Proahlídka domu.jpg.avif', r2: 'images/prohlidka-domu.avif' },
  { local: 'Získat odhad zdarma David choc.png.avif', r2: 'images/ziskat-odhad.avif' },
  { local: 'davidchocagent logo.avif', r2: 'images/davidchocagent-logo.avif' },
  { local: 'davidchocagent.avif', r2: 'images/davidchocagent.avif' },
  { local: 'logo ptf aktuální průhledné.png.avif', r2: 'images/logo-ptf.avif' },
  { local: 'misa_beranova.jpg.avif', r2: 'images/misa-beranova.avif' },
  { local: 'petr windsedl ptf reality.png.avif', r2: 'images/petr-windsedl.avif' },
  { local: 'recenze google.png.avif', r2: 'images/recenze-google.avif' },
  { local: 'recenze prodej byt Plzeň Slovany realitní kancelář RK PTF reality oblíbený spolehlivý nejlepší .jpg.avif', r2: 'images/recenze-slovany.avif' },
  { local: 'recenze005A5886.jpg.avif', r2: 'images/recenze-005A5886.avif' },
  { local: 'recenze1_ prodej bytu 1+1, Plzeň - Bory, ulice Skupova, realitní kancelář (RK) PTF reality, finan.jpg.avif', r2: 'images/recenze-bory.avif' },
  { local: 'recenzeBlatenska obyvaci pokoj 004.jpg.avif', r2: 'images/recenze-blatenska.avif' },
  { local: 'recenzeprodej-bytu-3-1-84-m2-plzen-bolevec-2-prodej-byt-3-1-plzen-plaska-rk-ptf-reality-obli-bena.jpg.avif', r2: 'images/recenze-bolevec.avif' },
  { local: 'davidchocome.png', r2: 'images/davidchocome.png' },
  { local: 'favicon.png', r2: 'images/favicon.png' },
  { local: 'heromobile.png', r2: 'images/heromobile.png' },
  { local: 'logo.png', r2: 'images/logo.png' },
  { local: 'makler.png', r2: 'images/makler.png' },
  { local: 'makler1.png', r2: 'images/makler1.png' },
  { local: 'ocenit-online.png', r2: 'images/ocenit-online.png' },
  { local: 'u9534644866_An_elegant_real_estate_manager_in_a_suit_stands_i_674dc6bc-f8d6-449d-8b78-43c84ae62584_1.png', r2: 'images/real-estate-manager.png' },
  { local: 'Vizitka David Choc.png', r2: 'images/vizitka-david-choc.png' },
];

const blogImages = [
  'clanek40.png', 'clanek41.png', 'clanek42.png', 'clanek43.png', 'clanek44.png',
  'clanek45.png', 'clanek46.png', 'clanek47.png', 'clanek48.png', 'clanek49.png',
  'clanek50.png', 'clanek51.png', 'clanek52.png', 'clanek58.png', 'clanek61.png',
  'clanek72.png', 'clanek89.png', 'hypoteka.jpg', 'investice.jpg', 'rekonstrukce.jpg',
  'placeholder.jpg'
];

const stepsImages = [
  'step-bonus.png', 'step01.png', 'step02.png', 'step04.png', 'step06.png', 'step07.png',
  'step-bonus2.avif', 'step03.avif', 'step05.avif'
];

blogImages.forEach(img => {
  mediaFiles.push({ local: `images/blog/${img}`, r2: `images/blog/${img}` });
});

stepsImages.forEach(img => {
  mediaFiles.push({ local: `images/steps/${img}`, r2: `images/steps/${img}` });
});

async function uploadFile(localPath, r2Path) {
  const fullPath = path.join(__dirname, '..', localPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Soubor neexistuje: ${localPath}`);
    return;
  }

  const fileContent = fs.readFileSync(fullPath);
  const contentType = mime.lookup(localPath) || 'application/octet-stream';

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Path,
        Body: fileContent,
        ContentType: contentType,
      })
    );
    console.log(`✅ Nahráno: ${localPath} → ${r2Path}`);
  } catch (error) {
    console.error(`❌ Chyba při nahrávání ${localPath}:`, error.message);
  }
}

async function migrateAll() {
  console.log('🚀 Začínám migraci médií do Cloudflare R2...\n');
  
  for (const file of mediaFiles) {
    await uploadFile(file.local, file.r2);
  }
  
  console.log('\n✨ Migrace dokončena!');
  console.log(`\n📦 Veřejná URL: ${PUBLIC_URL}`);
  console.log('\nPříklady URL:');
  console.log(`- ${PUBLIC_URL}/videos/file.mp4`);
  console.log(`- ${PUBLIC_URL}/images/davidchocagent.avif`);
  console.log(`- ${PUBLIC_URL}/images/blog/clanek49.png`);
}

migrateAll();
