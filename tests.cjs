// Run with: node tests.cjs. Exercises the real game logic without a browser.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context2d=new Proxy({}, {get:(_,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
const elements=new Map();
function element(){return {style:{},dataset:{},hidden:false,value:'medium',textContent:'',innerHTML:'',classList:{toggle(){}},setAttribute(){},addEventListener(){},appendChild(){},getContext:()=>context2d,querySelector:()=>element()};}
const sandbox={console,Math,Set,document:{getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,querySelectorAll:()=>[]},window:{addEventListener(){}},requestAnimationFrame(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
run("var carTest=makeFighter('car',0); blocks=[]; carTest.y=FLOOR-carTest.r; carTest.ground=true; move(carTest,0,0,true,.016)");
assert.equal(run('carTest.vy'),0,'Car cannot jump before upgrade');
assert.equal(run("eligible(carTest).some(u=>u.id==='sticky')"),false,'Wall grip is locked');
assert.equal(run("applyUpgrade(carTest,upgrades.find(u=>u.id==='jumper'))"),true);
assert.equal(run("eligible(carTest).some(u=>u.id==='sticky')"),true,'Jump unlocks wall grip');
assert.equal(run("applyUpgrade(carTest,upgrades.find(u=>u.id==='jumper'))"),false,'No repeat picks');
run('carTest.ground=true; move(carTest,0,0,true,.016)');assert.ok(run('carTest.vy')<0,'Jump now works');
run("var poolCounts={}; for(const type of Object.keys(TYPES)){const f=makeFighter(type,0);poolCounts[type]=eligible(f).length;for(let n=0;n<14;n++){const choices=offer(f);if(choices.length!==5||new Set(choices.map(u=>u.id)).size!==5)throw Error('Invalid five choices: '+type);if(choices.some(u=>f.owned.has(u.id)))throw Error('Repeated upgrade');applyUpgrade(f,choices[0]);}} ");
assert.ok(Object.values(run('poolCounts')).every(n=>n>=15),'Many upgrades available from the start');
run("var weighted=makeFighter('car',0);applyUpgrade(weighted,upgrades.find(u=>u.id==='jumper'));var followCount=0;var plainCount=0;var seed=17;function rng(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}for(let n=0;n<10000;n++){const ids=offer(weighted,rng).map(u=>u.id);if(ids.includes('sticky'))followCount++;if(ids.includes('armor'))plainCount++;}");
assert.ok(run('followCount')>run('plainCount')*2,'Related upgrades have greater chance');
run("var targetTest=makeFighter('mech',1),sourceTest=makeFighter('jet',0);targetTest.shield=25;damage(targetTest,20,sourceTest)");assert.equal(run('targetTest.hp'),155);assert.equal(run('targetTest.shield'),5);
assert.equal(run('segmentHit(0,0,1000,0,500,0,25)'),true,'Fast shots cannot skip an enemy');
run("fighters=[makeFighter('car',0),makeFighter('mech',1)];score=[7,0];fighters[1].hp=0;endRound();chooseUpgrade()");assert.equal(run('mode'),'complete','Eight battle wins ends match');
// Simulate all 16 matchups at every difficulty. Catch invalid physics or hung rounds.
const report=run(`(()=>{const report=[];for(const level of ['easy','medium','hard'])for(const a of Object.keys(TYPES))for(const b of Object.keys(TYPES)){difficulty=level;fighters=[makeFighter(a,0),makeFighter(b,1)];score=[0,0];resetArena();mode='battle';let finished=false;for(let frame=0;frame<7200;frame++){const p=fighters[0],enemy=fighters[1];mouse.x=enemy.x;mouse.y=enemy.y;mouse.down=true;if(frame%120===0)jumpPressed=true;if(frame%240<120){keys.add('d');keys.delete('a');}else{keys.add('a');keys.delete('d');}update(1/60);if(fighters.some(f=>!Number.isFinite(f.x+f.y+f.hp)))throw Error('Invalid fighter state');if(mode!=='battle'){finished=true;break;}}report.push({level,a,b,finished});keys.clear();}return report;})()`);
assert.ok(report.filter(x=>x.finished).length>=40,'Most matchups resolve during a two-minute moving battle');
console.log('Passed: jump lock, upgrade prerequisites, no repeats, five choices through 14 losses, weighted follow-ups, shields, fast-shot collision, eight-win match, and 48 simulated battles.');
console.log('Starting choices:',run('poolCounts'));console.log('Battles resolved:',report.filter(x=>x.finished).length+'/48');
