const fs = require('fs');
const path = require('path');
const d = path.join(process.cwd(), 'src/components');

function extractClassAndVal(line) {
  if(!line.includes('[class.') || !line.includes('dark:')) return null;
  // look for [class.something]="val dark:something"
  // or [class.something]='val dark:something'
  const matchDbl = /\[class\.([^\]]+)\]=\"([^\"]+)\"/.exec(line);
  if(matchDbl && matchDbl[2].includes(' dark:')) {
     const split = matchDbl[2].split(' dark:');
     return line.replace(matchDbl[0], `[class.${matchDbl[1]}]="${split[0]}"`);
  }
  
  const matchSgl = /\[class\.([^\]]+)\]=\'([^\']+)\'/.exec(line);
  if(matchSgl && matchSgl[2].includes(' dark:')) {
     const split = matchSgl[2].split(' dark:');
     return line.replace(matchSgl[0], `[class.${matchSgl[1]}]="${split[0]}"`);
  }
  return null;
}

const fixInFile = (file) => {
  let c = fs.readFileSync(file, 'utf8');
  let lines = c.split('\n');
  let modified = false;
  for(let i = 0; i < lines.length; i++) {
     let l = lines[i];
     let fixedL = extractClassAndVal(l);
     if (fixedL) {
       lines[i] = fixedL;
       modified = true;
     }
  }
  if(modified) {
     fs.writeFileSync(file, lines.join('\n'));
     console.log('Fixed ', file);
  }
};

const walk = (dir) => {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.ts') || p.endsWith('.html')) fixInFile(p);
  });
};
walk(d);
console.log('Done scanning components');
