const fs = require('fs');
let c = fs.readFileSync('src/engine/persona/personaStore.ts', 'utf8');
c = c.replace(/\\\\'/g, "\\'");
fs.writeFileSync('src/engine/persona/personaStore.ts', c);
