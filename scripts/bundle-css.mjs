// Joins the design stylesheets into one file so pages make one request instead of nine (runs before every build).
import fs from 'node:fs';
const files=['intro','style','story','editorial','shop','shop-menu','commercial','commercial-motion','heritage'];
const out=files.map(f=>`/* ${f}.css */\n`+fs.readFileSync(`public/design/${f}.css`,'utf8')).join('\n');
fs.writeFileSync('public/design/site.css',out);console.log('site.css',out.length,'bytes');
