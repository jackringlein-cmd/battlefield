'use strict';
// Everything runs in the browser. No accounts, downloads, or paid services.
const TYPES={jet:{name:'Fighter jet',tag:'AIR SUPERIORITY',desc:'Slippery flight. A sky full of missiles.',weapon:'Missiles',color:'#37eadb',hp:110,speed:330,damage:20,rate:.64,shotSpeed:590,r:28},person:{name:'Person',tag:'THE CHALLENGE',desc:'Just you, your legs, and weaponized spit.',weapon:'Weaponized spit',color:'#d5fb64',hp:85,speed:310,damage:7,rate:.38,shotSpeed:610,r:20},car:{name:'Car',tag:'STREET MENACE',desc:'Drift into trouble. Laser your way out.',weapon:'Continuous laser',color:'#ff242c',hp:125,speed:370,damage:15,rate:.48,shotSpeed:1100,r:27},mech:{name:'Mech',tag:'HEAVY METAL',desc:'Heavy footsteps. Very loud machine guns.',weapon:'Machine guns',color:'#ff8b22',hp:155,speed:210,damage:5,rate:.16,shotSpeed:930,r:29}};
const upgrades=[];
function upgrade(id,name,desc,icon,apply,types=null,parent=null){upgrades.push({id,name,desc,icon,apply,types,parent});}
upgrade('armor','Scrap armor','25 more health.','#',f=>f.maxHp+=25);
upgrade('power','Hot shots','Your attacks hit 18% harder.','✦',f=>f.damage*=1.18);
upgrade('reload','Quick hands','Fire 15% faster.','↻',f=>f.rate*=.85);
upgrade('speed','Overdrive','Move 15% faster.','»',f=>f.speed*=1.15);
upgrade('shield','Energy shell','Block the first 25 damage each battle.','◇',f=>f.shieldMax+=25);
upgrade('regen','Repair kit','Slowly heal during battle.','+',f=>f.regen+=1.6);
upgrade('heavy','Heavy hits','Shots push enemies farther.','➜',f=>f.knock+=180);
upgrade('range','Fast projectiles','Shots travel 25% faster.','↗',f=>f.shotSpeed*=1.25);
upgrade('spread','Twin shot','Two shots, each at 65% power.','⋔',f=>{f.count++;f.damage*=.65;});
upgrade('size','Big shots','Larger shots are easier to land.','●',f=>f.shotSize+=3);
upgrade('leech','Energy thief','Heal for 12% of damage you deal.','♥',f=>f.leech+=.12);
upgrade('bounce','Ricochet','Shots bounce off one surface.','⌁',f=>f.bounces++);
upgrade('acid','Acidic spit','Spit burns for extra damage over time.','☄',f=>f.poison+=4,['person']);
upgrade('punch','Punch attack','E: land a strong punch at close range.','✊',f=>f.special='punch',['person']);
upgrade('grab','Grab attack','E: grab a nearby enemy and throw them.','↔',f=>f.special='grab',['person'],'punch');
upgrade('longspit','Long-distance spit','Spit flies 40% faster.','➶',f=>f.shotSpeed*=1.4,['person']);
upgrade('boots','Spring shoes','Jump much higher.','↑',f=>f.jump*=1.3,['person']);
upgrade('acidrain','Acid rain','Acid lasts longer and burns harder.','☂',f=>f.poison+=5,['person'],'acid');
upgrade('acidburst','Acid burst','Spit bursts when it hits.','✺',f=>f.explosion+=65,['person'],'acid');
upgrade('longarms','Long arms','Your special attack reaches farther.','↔',f=>f.reach+=65,['person'],'punch');
upgrade('jumper','Jump','W now makes your car jump.','↑',f=>f.canJump=true,['car']);
upgrade('sticky','Wall grip + air spin','Stick to walls with A/D; aim to spin in the air.','⟳',f=>f.sticky=true,['car'],'jumper');
upgrade('blast','Explosive laser beams','Laser hits explode in a small area.','✺',f=>f.explosion+=65,['car']);
upgrade('holo','Hologram shield','A shimmering shield blocks 45 damage.','⬡',f=>f.shieldMax+=45,['car']);
upgrade('tires','Grip tires','Keep your speed, with sharper stopping.','◎',f=>f.grip=true,['car']);
upgrade('ram','Reinforced bumper','Crashing into the enemy does damage.','▰',f=>f.ram+=18,['car']);
upgrade('bigblast','Chain blast','Larger, stronger laser explosions.','✹',f=>{f.explosion+=40;f.damage*=1.2;},['car'],'blast');
upgrade('holoheal','Holo recharge','Your shield slowly recharges.','◇',f=>f.shieldRegen+=3,['car'],'holo');
upgrade('spring','Jump springs','Jump 35% higher.','⇈',f=>f.jump*=1.35,['car'],'jumper');
upgrade('homing','Homing missiles','Missiles curve toward the enemy.','⌖',f=>f.homing+=2,['jet']);
upgrade('split','Split missiles','On contact, split into two smaller homing missiles.','⋔',f=>f.split=true,['jet']);
upgrade('poison','Poison missiles','Missiles deal extra damage over time.','☣',f=>f.poison+=4,['jet']);
upgrade('jets','Afterburner','Fly 20% faster.','»',f=>f.speed*=1.2,['jet']);
upgrade('payload','Big payload','Missiles explode across a wider area.','✺',f=>f.explosion+=70,['jet']);
upgrade('tracking','Smart tracking','Homing missiles turn more sharply.','⌖',f=>f.homing+=2,['jet'],'homing');
upgrade('swarm','Missile swarm','Fire an extra missile with each shot.','⋇',f=>{f.count++;f.damage*=.8;},['jet'],'split');
upgrade('venom','Deep venom','Poison burns twice as hard.','☣',f=>f.poison+=5,['jet'],'poison');
upgrade('throw','Pick up and throw','E: throw a nearby enemy or a crate.','↗',f=>f.special='throw',['mech']);
upgrade('belt','Faster reload','Machine guns fire 25% faster.','↻',f=>f.rate*=.75,['mech']);
upgrade('slow','Slowing bullets','Hits briefly slow the enemy.','❄',f=>f.slowPower=.5,['mech']);
upgrade('stomp','Steel ram','Colliding with the enemy deals damage.','▣',f=>f.ram+=20,['mech']);
upgrade('legs','Powered legs','Move 20% faster and jump higher.','↑',f=>{f.speed*=1.2;f.jump*=1.2;},['mech']);
upgrade('ice','Deep freeze','Slowing bullets also deal more damage.','❄',f=>{f.slowPower=.7;f.damage*=1.2;},['mech'],'slow');
upgrade('belt2','Endless belt','Machine guns fire even faster.','∞',f=>f.rate*=.8,['mech'],'belt');
upgrade('bigthrow','Giant throw','Throw farther and hit much harder.','⇗',f=>{f.reach+=55;f.specialDamage+=25;},['mech'],'throw');
// Branches keep five distinct choices available throughout a long match.
const followupNames={
 armor:['Steel plating','Fortress armor'],power:['Supercharged shots','Maximum impact'],
 reload:['Rapid fire','Trigger frenzy'],speed:['Turbo drive','Full throttle'],
 shield:['Force field','Energy fortress'],regen:['Repair crew','Rebuild system'],
 heavy:['Knockback blast','Wrecking shots'],range:['Speed rounds','Lightning rounds'],
 spread:['Triple threat','Four-way fury'],size:['Mega shots','Giant shots'],
 leech:['Life siphon','Vampire strikes'],bounce:['Double Bounce','Pinball Shots']
};
for(const root of ['armor','power','reload','speed','shield','regen','heavy','range','spread','size','leech','bounce']){
 const base=upgrades.find(u=>u.id===root);
 const descriptions=root==='bounce'?['Shots can bounce off two surfaces.','Shots can bounce off three surfaces.']:['A stronger follow-up: '+base.desc,'The final step: '+base.desc];
 upgrade(root+'2',followupNames[root][0],descriptions[0],base.icon,base.apply,null,root);
 upgrade(root+'3',followupNames[root][1],descriptions[1],base.icon,base.apply,null,root+'2');
}
function eligible(f){return upgrades.filter(u=>!f.owned.has(u.id)&&(!u.types||u.types.includes(f.type))&&(!u.parent||f.owned.has(u.parent)));}
function offer(f,rng=Math.random){const pool=eligible(f),out=[];while(pool.length&&out.length<5){const weights=pool.map(u=>u.parent===f.lastUpgrade?7:u.parent?3:1);let pick=rng()*weights.reduce((a,b)=>a+b,0),i=0;while(i<pool.length-1&&pick>=weights[i]){pick-=weights[i];i++;}out.push(pool.splice(i,1)[0]);}return out;}
function applyUpgrade(f,u){if(!eligible(f).includes(u))return false;u.apply(f);f.owned.add(u.id);f.lastUpgrade=u.id;return true;}
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
const W=1440,H=800,FLOOR=735,keys=new Set(),mouse={x:900,y:400,down:false};
let selected='jet',mode='menu',fighters=[],bullets=[],particles=[],blocks=[],score=[0,0],battle=1,difficulty='medium',lastTime=0,time=0,phaseTime=0,loser=0,soundOn=false,audio=null,jumpPressed=false,specialPressed=false,prePause='battle';
const previews=[];
function makeFighter(type,team){const t=TYPES[type];return {type,team,x:team?1190:250,y:300,vx:0,vy:0,angle:team?Math.PI:0,bodyAngle:team?Math.PI:0,target:0,r:t.r,hp:t.hp,maxHp:t.hp,speed:t.speed,damage:t.damage,rate:t.rate,shotSpeed:t.shotSpeed,owned:new Set(),lastUpgrade:null,canJump:type!=='car',jump:580,grip:false,sticky:false,count:1,shotSize:0,bounces:0,explosion:0,homing:0,poison:0,slowPower:0,shieldMax:0,shield:0,shieldRegen:0,regen:0,leech:0,knock:110,ram:0,special:null,reach:95,specialDamage:32,split:false,cool:0,specialCool:0,hit:0,slow:0,poisonTime:0,poisonDps:0,poisonOwner:null,ground:false,wall:false,walk:0,muzzle:0,action:0,ramCool:0,aiTimer:0,aiAim:0,laserCharge:3,laserRecharge:0,laserRechargeLength:2,laserSparks:0,laserActive:false,beams:[],route:[],routeTimer:0};}
function resetArena(){blocks=[{x:425,y:540,w:170,h:22,hp:Infinity},{x:845,y:540,w:170,h:22,hp:Infinity},{x:630,y:380,w:180,h:22,hp:Infinity}];for(const x of [345,1060,665,730])blocks.push({x,y:FLOOR-64,w:60,h:64,hp:65});for(const x of [445,925])blocks.push({x,y:476,w:48,h:64,hp:50});blocks.push(...cityRamps());bullets=[];particles=[];fighters.forEach((f,i)=>{f.x=i?1190:250;f.y=f.type==='jet'?340:FLOOR-f.r-1;f.vx=f.vy=0;f.hp=f.maxHp;f.shield=f.shieldMax;f.cool=.6;f.angle=i?Math.PI:0;f.bodyAngle=f.angle;f.hit=f.slow=f.poisonTime=f.specialCool=f.ramCool=0;f.ground=false;f.laserCharge=3;f.laserRecharge=0;f.beams=[];f.route=[];f.routeTimer=0;});phaseTime=1.7;mode='countdown';$('overlay').hidden=true;mouse.down=false;updateHUD();}
function start(){difficulty=$('difficulty').value;fighters=[makeFighter(selected,0),makeFighter(randomOpponent(),1)];score=[0,0];battle=1;offeredUpgradeIds=[];computerUpgradeId=null;$('menu').hidden=true;$('play').hidden=false;$('player-name').textContent=TYPES[selected].name;$('bot-name').textContent=TYPES[fighters[1].type].name;$('difficulty-label').textContent=' / '+difficulty.toUpperCase();keys.clear();resetArena();saveMatch();}
function updateHUD(){fighters.forEach((f,i)=>{$(i?'hp-bot':'hp-player').style.width=Math.max(0,f.hp/f.maxHp*100)+'%';$(i?'bot-upgrades':'player-upgrades').textContent=Math.ceil(Math.max(0,f.hp))+' HP'+(f.shield>0?' + '+Math.ceil(f.shield)+' shield':'')+' · '+f.owned.size+' upgrades'+(f.type==='car'?(f.laserRecharge>0?' · Recharging '+f.laserRecharge.toFixed(1)+'s':' · Laser '+Math.round(f.laserCharge/3*100)+'%'):'');});$('score-player').textContent=score[0];$('score-bot').textContent=score[1];$('round-label').textContent='BATTLE '+battle;}
function tone(freq=220,length=.06,kind='square',volume=.035){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=kind;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.45,audio.currentTime+length);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+length);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+length);}catch{}}
function burst(x,y,color,n=12,power=180){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*power;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.3+Math.random()*.5,max:.8,color,size:2+Math.random()*5});}}
function damage(f,amount,owner){if(f.hp<=0)return;const absorbed=Math.min(f.shield,amount);f.shield-=absorbed;amount-=absorbed;f.hp-=amount;f.hit=.13;if(owner&&owner!==f)owner.hp=Math.min(owner.maxHp,owner.hp+amount*owner.leech);burst(f.x,f.y,absorbed?'#44ecdb':TYPES[f.type].color,6,100);}
function shoot(f){
 if(f.type==='car'||f.cool>0)return;
 f.cool=Math.max(.055,f.rate);f.muzzle=.1;tone(f.type==='person'?360:130,.045);
 for(let i=0;i<f.count;i++){
  const a=f.angle+(i-(f.count-1)/2)*.14;
  const b={x:f.x+Math.cos(a)*(f.r+13),y:f.y+Math.sin(a)*(f.r+13),vx:Math.cos(a)*f.shotSpeed,vy:Math.sin(a)*f.shotSpeed,owner:f,life:3,age:0,damage:f.damage,r:(f.type==='jet'?6:f.type==='person'?5:3)+f.shotSize,bounces:f.bounces,split:f.split,color:f.type==='person'?'#279bff':TYPES[f.type].color};
  // Close cover must not be skipped just because the muzzle sticks through it.
  let nearest=null;for(const box of blocks){if(box.hp<=0)continue;const hit=platformContact(f.x,f.y,b.x,b.y,b.r,box);if(hit&&(!nearest||hit.t<nearest.t))nearest=hit;}
  if(nearest){b.x=f.x+(b.x-f.x)*nearest.t+nearest.nx*.2;b.y=f.y+(b.y-f.y)*nearest.t+nearest.ny*.2;}
  bullets.push(b);
 }
}
function special(f,other){if(!f.special||f.specialCool>0)return;f.specialCool=1.7;f.action=.35;const dx=other.x-f.x,dy=other.y-f.y,d=Math.hypot(dx,dy);if(d<f.reach+other.r){damage(other,f.specialDamage,f);if(f.special!=='punch'){other.vx=(dx>=0?1:-1)*700;other.vy=-570;other.ground=false;}else other.vx+=(dx>=0?1:-1)*380;burst(other.x,other.y,'#d5fb64',20,240);tone(90,.2);}else if(f.special==='throw'){const box=blocks.find(b=>Number.isFinite(b.hp)&&Math.hypot(b.x+b.w/2-f.x,b.y+b.h/2-f.y)<f.reach);if(box){box.hp=0;bullets.push({x:f.x+Math.cos(f.angle)*50,y:f.y+Math.sin(f.angle)*50,vx:Math.cos(f.angle)*700,vy:Math.sin(f.angle)*700,owner:f,life:2,age:0,damage:45,r:22,bounces:0,split:false,color:'#e5ad6b',crate:true});}}}
function move(f,dx,dy,jump,dt){const oldX=f.x,oldY=f.y,wasGround=f.ground;const slow=f.slow>0?1-f.slowPowerApplied:1;const jet=f.type==='jet',responsive=f.type==='person'||f.type==='mech'||f.grip,acc=responsive?12:3.3;f.vx+=(dx*f.speed*slow-f.vx)*Math.min(1,dt*acc);if(jet)f.vy+=(dy*f.speed*slow-f.vy)*Math.min(1,dt*3.3);else{if(jump&&f.canJump&&(f.ground||f.wall)){f.vy=-f.jump;if(f.wall)f.vx=(f.x<W/2?1:-1)*380;tone(280,.08,'sine');burst(f.x,f.y+f.r,'#b3cdbb',8,100);}f.vy+=1250*dt;if(f.sticky&&f.wall&&dx!==0&&!jump)f.vy=0;}
 f.ground=false;f.wall=false;f.x+=f.vx*dt;for(const b of blocks){if(b.hp<=0||b.ramp)continue;if(f.x+f.r>b.x&&f.x-f.r<b.x+b.w&&f.y+f.r>b.y+3&&f.y-f.r<b.y+b.h-3){if(f.vx>0)f.x=b.x-f.r;else if(f.vx<0)f.x=b.x+b.w+f.r;f.vx=0;f.wall=true;}}
 f.y+=f.vy*dt;for(const b of blocks){if(b.hp<=0||b.ramp)continue;if(f.x+f.r>b.x+2&&f.x-f.r<b.x+b.w-2&&f.y+f.r>b.y&&f.y-f.r<b.y+b.h){if(f.vy>=0){f.y=b.y-f.r;f.ground=true;}else f.y=b.y+b.h+f.r;f.vy=0;}}
 if(f.y+f.r>=FLOOR){f.y=FLOOR-f.r;f.vy=0;f.ground=true;}if(f.y<f.r+30){f.y=f.r+30;f.vy=Math.max(0,f.vy);}if(f.x<f.r+15||f.x>W-f.r-15){f.x=Math.max(f.r+15,Math.min(W-f.r-15,f.x));f.vx=0;f.wall=true;}rideRamps(f,oldX,oldY,wasGround);f.walk+=Math.abs(f.vx)*dt*.045;
}
function ai(f,p,dt){const cfg={easy:{wait:.7,error:.3,fire:.62},medium:{wait:.3,error:.13,fire:.9},hard:{wait:.13,error:.035,fire:1}}[difficulty];f.aiTimer-=dt;if(f.aiTimer<=0){f.aiTimer=cfg.wait;const lead=difficulty==='hard'?Math.hypot(p.x-f.x,p.y-f.y)/f.shotSpeed*.75:0;f.aiAim=Math.atan2(p.y+p.vy*lead-f.y,p.x+p.vx*lead-f.x)+(Math.random()-.5)*cfg.error*2;f.aiFire=Math.random()<cfg.fire;}f.target=f.aiAim;f.laserAimDistance=Math.hypot(p.x-f.x,p.y-f.y);const distance=p.x-f.x;navigateAI(f,p,dt);if(f.aiFire)shoot(f);if(Math.hypot(distance,p.y-f.y)<f.reach)special(f,p);}
function segmentHit(x1,y1,x2,y2,x,y,r){const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x1+dx*t-x,y1+dy*t-y)<r;}
// Find the first face crossed, including the projectile's radius. This also
// catches fast shots and shallow side hits without guessing from the old Y.
function platformContact(ox,oy,x,y,r,box){if(box.ramp)return rampContact(ox,oy,x,y,r,box);
 const dx=x-ox,dy=y-oy;
 if(ox>box.x-r&&ox<box.x+box.w+r&&oy>box.y-r&&oy<box.y+box.h+r){
  return {t:0,nx:Math.abs(dx)>=Math.abs(dy)?-Math.sign(dx):0,ny:Math.abs(dy)>Math.abs(dx)?-Math.sign(dy):0,box};
 }
 let enter=-Infinity,leave=Infinity,nx=0,ny=0;
 for(const axis of [{start:ox,delta:dx,min:box.x-r,max:box.x+box.w+r,x:1,y:0},{start:oy,delta:dy,min:box.y-r,max:box.y+box.h+r,x:0,y:1}]){
  if(Math.abs(axis.delta)<1e-9){if(axis.start<axis.min||axis.start>axis.max)return null;continue;}
  const a=(axis.min-axis.start)/axis.delta,b=(axis.max-axis.start)/axis.delta,near=Math.min(a,b),far=Math.max(a,b);
  if(near>enter){enter=near;nx=axis.x*-Math.sign(axis.delta);ny=axis.y*-Math.sign(axis.delta);}
  leave=Math.min(leave,far);
  if(enter>leave)return null;
 }
 if(enter<0||enter>1||leave<0)return null;
 return {t:enter,nx,ny,box};
}
function platformHit(b,ox,oy,additions){
 let hit=null;
 for(const box of blocks){if(box.hp<=0)continue;const contact=platformContact(ox,oy,b.x,b.y,b.r,box);if(contact&&(!hit||contact.t<hit.t))hit=contact;}
 if(!hit)return false;
 b.x=ox+(b.x-ox)*hit.t+hit.nx*.1;b.y=oy+(b.y-oy)*hit.t+hit.ny*.1;
 hit.box.hp-=b.damage;
 if(b.bounces>0&&!b.split){
  b.bounces--;const dot=b.vx*hit.nx+b.vy*hit.ny;b.vx-=2*dot*hit.nx;b.vy-=2*dot*hit.ny;
  burst(b.x,b.y,'#efffa4',7,100);
 }else impact(b,null,additions);
 if(hit.box.hp<=0)burst(hit.box.x+hit.box.w/2,hit.box.y+hit.box.h/2,'#deac71',22,220);
 return true;
}
function splitOnContact(b,target,additions){
 if(!b.split)return;
 b.split=false;
 const speed=Math.hypot(b.vx,b.vy),away=Math.atan2(-b.vy,-b.vx),r=b.r*.65;
 // Start outside the thing we hit, so the new missiles can fan out and turn back.
 const x=target?target.x+Math.cos(away)*(target.r+r+8):(b.previousX??b.x)+Math.cos(away)*(r+8);
 const y=target?target.y+Math.sin(away)*(target.r+r+8):(b.previousY??b.y)+Math.sin(away)*(r+8);
 for(const offset of [-.7,.7]){
  const a=away+offset;
  additions.push({...b,x,y,vx:Math.cos(a)*speed*.8,vy:Math.sin(a)*speed*.8,r,damage:b.damage*.65,life:3,age:0,split:false,fragment:true,homing:Math.max(3,b.owner.homing),bounces:0,previousX:x,previousY:y});
 }
 burst(b.x,b.y,'#70fff0',16,190);
}
function impact(b,target,additions){splitOnContact(b,target,additions);const f=b.owner;if(target){damage(target,b.damage,f);target.vx+=Math.sign(b.vx)*f.knock;target.vy+=Math.sign(b.vy)*f.knock*.3;if(f.poison){target.poisonTime=3;target.poisonDps=f.poison;target.poisonOwner=f;}if(f.slowPower){target.slow=2;target.slowPowerApplied=f.slowPower;}}
 if(f.explosion){burst(b.x,b.y,'#ffbe5b',25,f.explosion*3);for(const other of fighters)if(other!==f&&other!==target&&Math.hypot(other.x-b.x,other.y-b.y)<f.explosion+other.r)damage(other,b.damage*.7,f);for(const box of blocks)if(Number.isFinite(box.hp)&&Math.hypot(box.x+box.w/2-b.x,box.y+box.h/2-b.y)<f.explosion+30)box.hp-=b.damage;}burst(b.x,b.y,b.color,8,120);b.life=0;}
function update(dt){time+=dt;if(mode==='countdown'){phaseTime-=dt;$('announcement').textContent=phaseTime>.7?'BATTLE '+battle:'FIGHT!';if(phaseTime<=0){mode='battle';$('announcement').textContent='';}return;}if(mode==='roundover'){phaseTime-=dt;if(phaseTime<=0)chooseUpgrade();return;}if(mode!=='battle')return;
 const p=fighters[0];p.target=Math.atan2(mouse.y-p.y,mouse.x-p.x);move(p,(keys.has('d')?1:0)-(keys.has('a')?1:0),(keys.has('s')?1:0)-(keys.has('w')?1:0),jumpPressed,dt);if(mouse.down)shoot(p);if(specialPressed)special(p,fighters[1]);jumpPressed=specialPressed=false;ai(fighters[1],p,dt);
 for(const f of fighters){let delta=Math.atan2(Math.sin(f.target-f.angle),Math.cos(f.target-f.angle));f.angle+=delta*Math.min(1,dt*15);const bodyTarget=f.type==='car'&&!(f.sticky&&!f.ground)?(Math.cos(f.angle)<0?Math.PI:0)+Math.atan(f.groundSlope||0):f.angle;f.bodyAngle+=Math.atan2(Math.sin(bodyTarget-f.bodyAngle),Math.cos(bodyTarget-f.bodyAngle))*Math.min(1,dt*15);for(const k of ['cool','specialCool','hit','slow','muzzle','action','ramCool'])f[k]=Math.max(0,f[k]-dt);f.hp=Math.min(f.maxHp,f.hp+f.regen*dt);f.shield=Math.min(f.shieldMax,f.shield+f.shieldRegen*dt);if(f.poisonTime>0){f.poisonTime-=dt;damage(f,f.poisonDps*dt,f.poisonOwner);}if(f.ram&&f.ramCool<=0){const other=fighters[1-f.team];if(Math.hypot(f.x-other.x,f.y-other.y)<f.r+other.r+10&&Math.abs(f.vx)>100){damage(other,f.ram,f);other.vx+=Math.sign(f.vx)*400;f.ramCool=1;}}}
 for(const f of fighters)updateLaser(f,f.team?f.aiFire:mouse.down,dt);
 const additions=[];for(const b of bullets){b.life-=dt;b.age+=dt;if(b.life<=0)continue;const target=fighters[1-b.owner.team],homing=b.homing??b.owner.homing;if(homing){const speed=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx),goal=Math.atan2(target.y-b.y,target.x-b.x),diff=Math.atan2(Math.sin(goal-a),Math.cos(goal-a)),next=a+Math.max(-homing*dt,Math.min(homing*dt,diff));b.vx=Math.cos(next)*speed;b.vy=Math.sin(next)*speed;}
 const ox=b.x,oy=b.y;b.previousX=ox;b.previousY=oy;b.x+=b.vx*dt;b.y+=b.vy*dt;
 const travel=Math.hypot(b.x-ox,b.y-oy),enemyDistance=circleContact(ox,oy,b.vx/(Math.hypot(b.vx,b.vy)||1),b.vy/(Math.hypot(b.vx,b.vy)||1),target.x,target.y,target.r+b.r);
 let firstWall=Infinity;for(const box of blocks){if(box.hp<=0)continue;const hit=platformContact(ox,oy,b.x,b.y,b.r,box);if(hit)firstWall=Math.min(firstWall,hit.t*travel);}
 if(enemyDistance!==null&&enemyDistance<=travel&&enemyDistance<firstWall){b.x=ox+b.vx*dt*(enemyDistance/(travel||1));b.y=oy+b.vy*dt*(enemyDistance/(travel||1));impact(b,target,additions);continue;}
 platformHit(b,ox,oy,additions);
 if(b.life>0&&(b.x<10||b.x>W-10||b.y<20||b.y>FLOOR)){if(b.bounces>0&&!b.split){b.bounces--;if(b.x<10||b.x>W-10)b.vx*=-1;else b.vy*=-1;b.x=ox;b.y=oy;}else impact(b,null,additions);}if(b.owner.type==='jet'&&Math.random()<.6)particles.push({x:b.x,y:b.y,vx:-b.vx*.06,vy:-b.vy*.06,life:.25,max:.25,color:'#ffbd69',size:3});}
 bullets=bullets.filter(b=>b.life>0).concat(additions);for(const q of particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=200*dt;q.life-=dt;}particles=particles.filter(q=>q.life>0).slice(-650);updateHUD();if(fighters.some(f=>f.hp<=0))endRound();
}
function endRound(){mouse.down=false;const dead=fighters.map(f=>f.hp<=0);if(dead[0]&&dead[1]){$('announcement').textContent='DRAW — TRY AGAIN';mode='roundover';phaseTime=1.4;loser=-1;return;}loser=dead[0]?0:1;score[1-loser]++;mode='roundover';phaseTime=1.7;$('announcement').textContent=loser===1?'YOU WIN THIS BATTLE':'COMPUTER WINS THIS BATTLE';tone(loser===1?600:120,.35,'triangle');updateHUD();}
function chooseUpgrade(restoring=false){if(loser===-1){resetArena();return;}if(score.some(s=>s>=8)){mode='complete';try{localStorage.removeItem(SAVE_KEY);}catch{}updateContinueButton();$('announcement').textContent='';showOverlay(`<p class="eyebrow">MATCH COMPLETE · ${score[0]} — ${score[1]}</p><h2>${score[0]>=8?'THE CITY IS YOURS.':'THE COMPUTER TAKES THE CITY.'}</h2><p>New match, fresh upgrades. Try a different fighter or build.</p><div class="button-row"><button class="primary" id="again">PLAY AGAIN ↗</button><button class="quiet" id="menu-button">Choose fighter</button></div>`);$('again').onclick=start;$('menu-button').onclick=backMenu;return;}
 mode='upgrade';$('announcement').textContent='';const f=fighters[loser],choices=restoring?offeredUpgradeIds.map(id=>upgrades.find(u=>u.id===id)).filter(Boolean):offer(f);offeredUpgradeIds=choices.map(u=>u.id);if(loser===0){showOverlay(`<p class="eyebrow">A LOSS IS A NEW OPPORTUNITY</p><h2>PICK YOUR NEXT UPGRADE.</h2><p>Choose one. Keep it for the whole match. Related upgrades are more likely next time.</p><div class="upgrade-grid">${choices.map((u,i)=>`<button class="upgrade" data-choice="${i}"><span class="symbol">${u.icon}</span><b>${u.name}</b><small>${u.desc}</small>${u.parent?'<small class="follow">↳ Builds on your upgrades</small>':''}</button>`).join('')}</div>`);document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{applyUpgrade(f,choices[Number(b.dataset.choice)]);battle++;resetArena();});}else{const u=restoring?upgrades.find(u=>u.id===computerUpgradeId):choices[Math.floor(Math.random()*choices.length)];if(!restoring)applyUpgrade(f,u);computerUpgradeId=u.id;showOverlay(`<p class="eyebrow">YOU WON · THE COMPUTER GETS AN UPGRADE</p><h2>${u.name}</h2><p>${u.desc}</p><button class="primary" id="next">NEXT BATTLE ↗</button>`);$('next').onclick=()=>{battle++;resetArena();};}}
function showOverlay(html){$('overlay').innerHTML=html;$('overlay').hidden=false;}
function backMenu(){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});mode='menu';mouse.down=false;keys.clear();$('menu').hidden=false;$('play').hidden=true;$('overlay').hidden=true;$('pause').textContent='Pause';}
function pause(){if(mode==='paused'){mode=prePause;$('overlay').hidden=true;$('pause').textContent='Pause';return;}if(!['battle','countdown'].includes(mode))return;prePause=mode;mode='paused';mouse.down=false;keys.clear();$('pause').textContent='Resume';showOverlay('<p class="eyebrow">TAKE A BREATHER</p><h2>PAUSED</h2><p>WASD moves. Hold the mouse button to shoot.<br>E uses punch, grab, or throw after you unlock it.</p><div class="button-row"><button class="primary" id="resume">BACK TO BATTLE ↗</button><button class="quiet" id="menu-button">Choose fighter</button></div>');$('resume').onclick=pause;$('menu-button').onclick=backMenu;}
// Original animated drawings. The jet's flame is a painted emblem, not exhaust.
function path(c,points,fill,stroke='#080f13',width=3){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}
function rect(c,x,y,w,h,fill,stroke='#080f13',width=3){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.strokeRect(x,y,w,h);}}
function circle(c,x,y,r,color,stroke='#080f13',width=3){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function sprite(c,f,x,y,scale=1,t=time){c.save();c.translate(x,y);c.scale(scale,scale);const col=TYPES[f.type].color,step=Math.sin(f.walk||t*5),a=(f.type==='car'?f.bodyAngle:f.angle)||0;c.rotate(a);if(Math.cos(a)<0)c.scale(1,-1);if(f.hit>0)c.globalAlpha=.6;
 if(f.type==='jet'){for(let i=-1;i<=1;i++)path(c,[[-42,i*11-4],[-54,i*11-5],[-54,i*11+4],[-41,i*11+5]],'#a8e465');path(c,[[-43,-15],[-22,-23],[12,-19],[42,-8],[76,1],[38,9],[-31,15],[-44,8]],'#101418');path(c,[[-43,-15],[-20,-23],[8,-19],[2,-10],[-25,-8],[-31,10],[-42,8]],col);seatedPilot(c,-29,-8,.9);circle(c,-16,-2,4,'#54eee4','#080e14',1.5);inkLine(c,[[-19,-5],[-13,1]],1.5);inkLine(c,[[-19,1],[-13,-5]],1.5);path(c,[[-8,-1],[9,1],[19,-10],[31,-5],[28,0],[44,1],[29,8],[6,7]],'#ffef43','#080f13',2);path(c,[[2,3],[20,0],[22,-5],[29,2],[37,3],[26,5]],'#ff643f',null,0);if(Math.abs(f.vx||0)+Math.abs(f.vy||0)>30){for(let i=-1;i<=1;i++)rect(c,-64-Math.sin(t*35+i)*4,i*11-2,8,3,'#8affd4',null);}}
 if(f.type==='car')drawCar(c,f,a,t);
 if(f.type==='person')drawStickman(c,f,t);
 if(f.type==='mech')drawMech(c,f,t);
 if(f.muzzle>0&&f.type!=='person')path(c,[[48,-6],[65,-11],[61,-2],[76,0],[61,4],[64,12],[48,6]],'#ecff94',null,0);c.restore();
 if(f.shield>0){c.save();c.strokeStyle='#65ffe6';c.lineWidth=2;c.globalAlpha=.35+Math.sin(t*5)*.15;c.beginPath();c.ellipse(x,y,(f.r+20)*scale,(f.r+20)*scale,0,0,Math.PI*2);c.stroke();c.restore();}if(f.poisonTime>0)circle(c,x,y-f.r-10,4,'#a4ff50',null);
}
function background(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1f393d');g.addColorStop(1,'#657a67');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);circle(ctx,1110,140,62,'#d5efae',null);for(let layer=0;layer<2;layer++){for(let i=0;i<17;i++){const bx=i*98-30+layer*30,bh=120+((i*73+layer*47)%230),by=FLOOR-bh-50;rect(ctx,bx,by,80,bh+50,layer?'#294345':'#3b5450',null);if(layer)for(let row=0;row<Math.floor(bh/30);row++)for(let col=0;col<3;col++){if((i+row+col)%4!==0)rect(ctx,bx+12+col*22,by+14+row*29,9,13,(i+row)%3?'#527568':'#afc782',null);}}}
 ctx.strokeStyle='#5c847d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,230);ctx.quadraticCurveTo(700,330,1440,210);ctx.stroke();rect(ctx,65,455,155,49,'#152c2d');ctx.font='bold 23px monospace';ctx.fillStyle='#8ce7cb';ctx.fillText('NEON / 08',78,487);rect(ctx,1215,475,130,42,'#243330');ctx.fillStyle='#d3ef94';ctx.font='bold 20px monospace';ctx.fillText('GARAGE',1235,503);rect(ctx,0,FLOOR,W,H-FLOOR,'#18292b',null);rect(ctx,0,FLOOR,W,7,'#899880',null);for(let i=0;i<15;i++)rect(ctx,i*110+15,FLOOR+36,52,3,'#47564b',null);ctx.fillStyle='#b6c9ad';ctx.font='11px monospace';ctx.fillText('WEST BLOCK',40,712);ctx.fillText('EAST BLOCK',1280,712);}
function render(){if(mode==='menu')return;drawCity(ctx);for(const b of blocks){if(b.hp<=0)continue;if(b.ramp){drawRamp(ctx,b);continue;}if(!Number.isFinite(b.hp)){rect(ctx,b.x,b.y,b.w,b.h,'#8d9d85');rect(ctx,b.x+5,b.y+5,b.w-10,5,'#c7d7ac',null);for(let i=0;i<b.w;i+=25)path(ctx,[[b.x+i,b.y+b.h],[b.x+i+10,b.y+b.h],[b.x+i+22,b.y+10],[b.x+i+12,b.y+10]],'#3f5550',null,0);}else{rect(ctx,b.x,b.y,b.w,b.h,'#aa8156');rect(ctx,b.x+7,b.y+7,b.w-14,b.h-14,'#d1ac72');ctx.strokeStyle='#74543b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(b.x+8,b.y+8);ctx.lineTo(b.x+b.w-8,b.y+b.h-8);ctx.moveTo(b.x+b.w-8,b.y+8);ctx.lineTo(b.x+8,b.y+b.h-8);ctx.stroke();if(b.hp<35){ctx.strokeStyle='#202b27';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x+20,b.y);ctx.lineTo(b.x+30,b.y+25);ctx.lineTo(b.x+18,b.y+40);ctx.stroke();}}}
 for(const f of fighters){ctx.globalAlpha=.2;ctx.fillStyle='#030b10';ctx.beginPath();ctx.ellipse(f.x,FLOOR+6,f.r*1.3,5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;sprite(ctx,f,f.x,f.y,f.type==='jet'?.65:1);ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillStyle=f.team?'#ffaf77':'#d5fb64';ctx.fillText(f.team?'COMPUTER':'YOU',f.x,f.y-f.r-24);ctx.textAlign='left';}
 for(const b of bullets){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));if(b.crate){ctx.rotate(time*7);rect(ctx,-17,-17,34,34,b.color);}else if(b.owner.type==='jet'){if(b.fragment)ctx.scale(.65,.65);path(ctx,[[-12,-5],[6,-5],[15,0],[6,5],[-12,5]],'#e8eed4');path(ctx,[[-13,-4],[-22-Math.random()*9,0],[-13,4]],'#ffb64c',null,0);}else if(b.owner.type==='car'){ctx.shadowColor=b.color;ctx.shadowBlur=12;rect(ctx,-18,-b.r,34,b.r*2,b.color,null);rect(ctx,-15,-1,29,2,'#fff9d5',null);}else if(b.owner.type==='person'){circle(ctx,0,0,b.r,b.owner.poison?'#19cfff':'#279bff','#263932',1);circle(ctx,-7,2,2,'#83dbff',null);}else rect(ctx,-9,-b.r,17,b.r*2,'#ffeeb0',null);ctx.restore();}
 drawLasers(ctx);for(const q of particles){ctx.globalAlpha=Math.max(0,q.life/q.max);rect(ctx,q.x,q.y,q.size,q.size,q.color,null);}ctx.globalAlpha=1;
 if(mode==='battle'||mode==='countdown'){ctx.save();ctx.translate(mouse.x,mouse.y);ctx.strokeStyle='#eaffbd';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){ctx.moveTo(Math.cos(a)*14,Math.sin(a)*14);ctx.lineTo(Math.cos(a)*20,Math.sin(a)*20);}ctx.stroke();ctx.fillStyle='#eaffbd';ctx.fillRect(-1,-1,2,2);ctx.restore();} }
function loop(now){const dt=Math.min(.025,(now-lastTime)/1000||.016);lastTime=now;update(dt);autoSave(dt);render();if(mode==='menu')previews.forEach(({c,type},i)=>{c.clearRect(0,0,300,190);c.strokeStyle='#3a504a';c.lineWidth=1;c.beginPath();c.ellipse(150,155,90,12,0,0,Math.PI*2);c.stroke();const f={...makeFighter(type,0),angle:-.12+Math.sin(now*.0007+i)*.06,walk:now*.003,vx:type==='jet'?50:0};sprite(c,f,150,type==='jet'?98:108+Math.sin(now*.002+i)*3,type==='jet'?1.65:type==='person'?1.5:type==='mech'?1.35:1.7,now/1000);});requestAnimationFrame(loop);}
for(const [type,t] of Object.entries(TYPES)){const button=document.createElement('button');button.className='fighter-card'+(type===selected?' selected':'');button.dataset.type=type;button.setAttribute('aria-pressed',String(type===selected));button.innerHTML=`<span class="tag">${t.tag}</span><span class="selected-mark">${type===selected?'✓':''}</span><canvas width="300" height="190" aria-hidden="true"></canvas><div class="fighter-text"><h2>${t.name}</h2><p>${t.desc}</p><div class="weapon"><span>${t.weapon}</span><span>↗</span></div></div>`;button.onclick=()=>{selected=type;document.querySelectorAll('.fighter-card').forEach(el=>{const active=el.dataset.type===type;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));el.querySelector('.selected-mark').textContent=active?'✓':'';});};$('fighters').appendChild(button);previews.push({c:button.querySelector('canvas').getContext('2d'),type});}
$('start').onclick=start;$('pause').onclick=pause;$('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent='Sound: '+(soundOn?'on':'off');$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)tone(500,.12,'sine');};
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','e','escape',' '].includes(k)&&mode!=='menu')e.preventDefault();if(k==='escape'&&!e.repeat)pause();if(mode!=='battle')return;if(k==='w'&&!keys.has(k))jumpPressed=true;if(k==='e'&&!keys.has(k))specialPressed=true;keys.add(k);});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();mouse.down=false;if(['battle','countdown'].includes(mode))pause();});
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height;});canvas.addEventListener('pointerdown',e=>{if(e.button===0&&mode==='battle'){mouse.down=true;canvas.setPointerCapture(e.pointerId);}});window.addEventListener('pointerup',()=>mouse.down=false);canvas.addEventListener('contextmenu',e=>e.preventDefault());
requestAnimationFrame(loop);

if(document.fullscreenEnabled){$('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else $('play').requestFullscreen().catch(()=>{});};}else $('fullscreen').hidden=true;
installSaving();
