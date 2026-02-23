const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const PUBLIC_URL = process.env.R2_PUBLIC_URL;

const pathMappings = {
  'file.mp4': `${PUBLIC_URL}/videos/file.mp4`,
  'fileagent.mp4': `${PUBLIC_URL}/videos/fileagent.mp4`,
  'fileprohlidka.mp4': `${PUBLIC_URL}/videos/fileprohlidka.mp4`,
  '1668580559-1667892790-Jiří Beroun spolehlivý oblíbený nejlepší profesionál specialista rea.jpg.avif': `${PUBLIC_URL}/images/jiri-beroun.avif`,
  'David Choc realitní agent důvěryhodný spolehlivý nejlepší profesionál realitní makléř real.jpg.avif': `${PUBLIC_URL}/images/david-choc-agent.avif`,
  'Proahlídka domu.jpg.avif': `${PUBLIC_URL}/images/prohlidka-domu.avif`,
  'Získat odhad zdarma David choc.png.avif': `${PUBLIC_URL}/images/ziskat-odhad.avif`,
  'davidchocagent logo.avif': `${PUBLIC_URL}/images/davidchocagent-logo.avif`,
  'davidchocagent.avif': `${PUBLIC_URL}/images/davidchocagent.avif`,
  'logo ptf aktuální průhledné.png.avif': `${PUBLIC_URL}/images/logo-ptf.avif`,
  'misa_beranova.jpg.avif': `${PUBLIC_URL}/images/misa-beranova.avif`,
  'petr windsedl ptf reality.png.avif': `${PUBLIC_URL}/images/petr-windsedl.avif`,
  'recenze google.png.avif': `${PUBLIC_URL}/images/recenze-google.avif`,
  'recenze prodej byt Plzeň Slovany realitní kancelář RK PTF reality oblíbený spolehlivý nejlepší .jpg.avif': `${PUBLIC_URL}/images/recenze-slovany.avif`,
  'recenze005A5886.jpg.avif': `${PUBLIC_URL}/images/recenze-005A5886.avif`,
  'recenze1_ prodej bytu 1+1, Plzeň - Bory, ulice Skupova, realitní kancelář (RK) PTF reality, finan.jpg.avif': `${PUBLIC_URL}/images/recenze-bory.avif`,
  'recenzeBlatenska obyvaci pokoj 004.jpg.avif': `${PUBLIC_URL}/images/recenze-blatenska.avif`,
  'recenzeprodej-bytu-3-1-84-m2-plzen-bolevec-2-prodej-byt-3-1-plzen-plaska-rk-ptf-reality-obli-bena.jpg.avif': `${PUBLIC_URL}/images/recenze-bolevec.avif`,
  'davidchocome.png': `${PUBLIC_URL}/images/davidchocome.png`,
  'favicon.png': `${PUBLIC_URL}/images/favicon.png`,
  'heromobile.png': `${PUBLIC_URL}/images/heromobile.png`,
  'logo.png': `${PUBLIC_URL}/images/logo.png`,
  'makler.png': `${PUBLIC_URL}/images/makler.png`,
  'makler1.png': `${PUBLIC_URL}/images/makler1.png`,
  'ocenit-online.png': `${PUBLIC_URL}/images/ocenit-online.png`,
  'u9534644866_An_elegant_real_estate_manager_in_a_suit_stands_i_674dc6bc-f8d6-449d-8b78-43c84ae62584_1.png': `${PUBLIC_URL}/images/real-estate-manager.png`,
  'Vizitka David Choc.png': `${PUBLIC_URL}/images/vizitka-david-choc.png`,
  'images/vizitka-david-choc.png': `${PUBLIC_URL}/images/vizitka-david-choc.png`,
};

function updateHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  Object.entries(pathMappings).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newPath);
      updated = true;
    }
  });

  content = content.replace(/\/images\/blog\//g, `${PUBLIC_URL}/images/blog/`);
  content = content.replace(/\/images\/steps\//g, `${PUBLIC_URL}/images/steps/`);

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Aktualizováno: ${filePath}`);
  }
}

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

console.log('🔄 Aktualizuji cesty k médiím v HTML souborech...\n');

const projectRoot = path.join(__dirname, '..');
const htmlFiles = findHtmlFiles(projectRoot);

htmlFiles.forEach(updateHtmlFile);

console.log('\n✨ Aktualizace dokončena!');
console.log(`\nCelkem aktualizováno: ${htmlFiles.length} HTML souborů`);
