const fs = require('fs');
let c = fs.readFileSync('src/engine/ai/brandSystemPrompt.ts', 'utf8');
c = c.replace(/`/g, '\\`');
// Wait, the outer backticks should NOT be escaped!
// Let's just find all backticks and escape them, EXCEPT the first and last one.
let first = c.indexOf('`');
let last = c.lastIndexOf('`');
let middle = c.substring(first + 1, last);
middle = middle.replace(/`/g, '\\`');
// Wait, some are already escaped!
middle = middle.replace(/\\\\`/g, '\\`'); // unescape first
middle = middle.replace(/`/g, '\\`'); // escape all
c = c.substring(0, first + 1) + middle + c.substring(last);
fs.writeFileSync('src/engine/ai/brandSystemPrompt.ts', c);
