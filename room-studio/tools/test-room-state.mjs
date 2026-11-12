import assert from 'node:assert/strict';
import {sanitize,defaults,dimensions,PLANTS} from '../dist/room-state.js';
assert.equal(PLANTS.length,4);assert.equal(defaults().length,3);
assert.equal(sanitize([{type:'fake'}]).length,0);
const item=sanitize([{type:'arrow',x:100,z:-100,height:100,potScale:99,pot:'invalid',finish:'invalid'}])[0];
assert.equal(item.x,3.25);assert.equal(item.z,-3.1);assert.equal(item.height,2.6);assert.equal(item.pot,'tapered');assert.equal(item.finish,'chalk');
assert.equal(sanitize(Array.from({length:20},()=>({type:'arrow'}))).length,12);
for(const h of [.4,1,2.6])for(const scale of [.7,1.4]){const d=dimensions({height:h,potScale:scale});assert.ok(d.foliageHeight>0);assert.ok(Math.abs(d.foliageHeight+d.potHeight*.93-h)<.00001)}
assert.deepEqual(sanitize(JSON.parse(JSON.stringify(defaults()))),defaults());
console.log('Room state checks passed: bounds, valid plant types, size geometry, 12-plant limit and saved-layout round trip.');
