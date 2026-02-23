const fs = require('fs');
const path = require('path');

function fixDuplicateUrls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  const patterns = [
    { 
      regex: /https:\/\/davidchoc\.com\/https:\/\/pub-73649d5be63240648a58ace4d4c57318\.r2\.dev/g,
      replacement: 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev'
    },
    {
      regex: /src="\/https:\/\/pub-73649d5be63240648a58ace4d4c57318\.r2\.dev/g,
      replacement: 'src="https://pub-73649d5be63240648a58ace4d4c57318.r2.dev'
    },
    {
      regex: /href="\/https:\/\/pub-73649d5be63240648a58ace4d4c57318\.r2\.dev/g,
      replacement: 'href="https://pub-73649d5be63240648a58ace4d4c57318.r2.dev'
    }
  ];

  patterns.forEach(({ regex, replacement }) => {
    if (content.match(regex)) {
      content = content.replace(regex, replacement);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Opraveno: ${filePath}`);
    return true;
  }
  return false;
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

console.log('🔧 Opravuji duplicitní URL v HTML souborech...\n');

const projectRoot = path.join(__dirname, '..');
const htmlFiles = findHtmlFiles(projectRoot);

let fixedCount = 0;
htmlFiles.forEach(file => {
  if (fixDuplicateUrls(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Hotovo! Opraveno ${fixedCount} souborů.`);
