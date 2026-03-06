const fs = require('fs');
let c = fs.readFileSync('src/engine/orchestrators.ts', 'utf8');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('src/engine/orchestrators.ts', c);
