const fs = require('fs');
const path = require('path');

function walk(d) {
  let r = [];
  fs.readdirSync(d).forEach(f => {
    f = path.join(d, f);
    if (fs.statSync(f).isDirectory()) r = r.concat(walk(f));
    else r.push(f);
  });
  return r;
}

walk('src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('\\`')) {
    fs.writeFileSync(f, c.replace(/\\`/g, '`'));
    console.log('Fixed ' + f);
  }
});
