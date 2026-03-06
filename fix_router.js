const fs = require('fs');
let c = fs.readFileSync('src/engine/ai/promptRouter.ts', 'utf8');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('src/engine/ai/promptRouter.ts', c);
