const fs = require('fs');
let c = fs.readFileSync('src/engine/ai/brandSystemPrompt.ts', 'utf8');
c = c.replace(/\\\\`/g, '\\`');
fs.writeFileSync('src/engine/ai/brandSystemPrompt.ts', c);
