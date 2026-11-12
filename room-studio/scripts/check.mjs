import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const file of ['dist/index.html','dist/logo.png','dist/font.woff','dist/real-assets/room.glb','dist/real-assets/studio.hdr','dist/real-assets/modern-room-render.png',...['arrow','broadleaf','calathea','pachira'].flatMap(n=>['dist/real-assets/'+n+'-foliage.glb','dist/real-assets/'+n+'-thumb.png'])])if(!existsSync(root+file))throw Error('Missing file: '+file);
for(const file of ['dist/real-studio.js','dist/room-state.js'])execFileSync(process.execPath,['--check',root+file],{stdio:'inherit'});
execFileSync(process.execPath,[root+'tools/test-room-state.mjs'],{stdio:'inherit'});
console.log('Static site ready in dist/ — no compilation or environment variables required.');
