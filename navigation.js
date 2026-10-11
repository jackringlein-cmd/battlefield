let opponentBag=[];
function randomOpponent(){
 if(!opponentBag.length){opponentBag=Object.keys(TYPES);for(let i=opponentBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opponentBag[i],opponentBag[j]]=[opponentBag[j],opponentBag[i]];}}
 return opponentBag.pop();
}
function clearBodyLine(f,x,y,xx,yy){return !blocks.some(b=>b.hp>0&&platformContact(x,y,xx,yy,f.r+2,b));}
function jetRoute(f,target){
 const size=48,cols=Math.ceil(W/size),rows=Math.ceil(FLOOR/size),id=(x,y)=>y*cols+x;
 const cell=(x,y)=>({cx:Math.max(1,Math.min(cols-2,Math.floor(x/size))),cy:Math.max(1,Math.min(rows-2,Math.floor(y/size)))});
 const start=cell(f.x,f.y),goal=cell(target.x,target.y),open=[start],seen=new Set([id(start.cx,start.cy)]),parents=new Map();let end=start,best=Infinity;
 while(open.length){const n=open.shift(),x=n.cx*size+size/2,y=n.cy*size+size/2,dist=Math.hypot(n.cx-goal.cx,n.cy-goal.cy);if(dist<best){best=dist;end=n;}if(dist===0)break;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){
   const cx=n.cx+dx,cy=n.cy+dy,k=id(cx,cy);if(cx<1||cx>=cols-1||cy<1||cy>=rows-1||seen.has(k))continue;
   if(!clearBodyLine(f,x,y,cx*size+size/2,cy*size+size/2))continue;
   seen.add(k);parents.set(k,n);open.push({cx,cy});
  }
 }
 const path=[];while(end.cx!==start.cx||end.cy!==start.cy){path.unshift({x:end.cx*size+size/2,y:end.cy*size+size/2});end=parents.get(id(end.cx,end.cy));if(!end)break;}
 return path;
}
function groundRoute(f,target){
 const nodes=[{x:f.x,y:f.y}],surfaces=[{x:f.r+16,y:FLOOR,w:W-2*f.r-32},...blocks.filter(b=>b.hp>0)];
 const bodyBlocked=(x,y)=>blocks.some(b=>b.hp>0&&(b.ramp?(x>=b.x&&x<=b.x+b.w&&y+f.r>rampHeight(b,x)+2):(x+f.r>b.x&&x-f.r<b.x+b.w&&y+f.r>b.y&&y-f.r<b.y+b.h)));
 function canWalk(a,b){
  if(Math.abs(b.x-a.x)>170)return false;
  if(blocks.some(box=>!box.ramp&&box.hp>0&&platformContact(a.x,a.y,b.x,b.y,f.r-.5,box)))return false;
  for(let k=0;k<=12;k++){
   const x=a.x+(b.x-a.x)*k/12,y=a.y+(b.y-a.y)*k/12,foot=y+f.r+1;
   if(bodyBlocked(x,y))return false;
   const supported=Math.abs(foot-FLOOR)<5||blocks.some(box=>box.hp>0&&x>=box.x&&x<=box.x+box.w&&Math.abs(foot-(box.ramp?rampHeight(box,x):box.y))<5);
   if(!supported)return false;
  }
  return true;
 }
 for(const s of surfaces){const left=s.x+f.r+3,right=s.x+s.w-f.r-3;if(left>right)continue;const positions=[left,right,Math.max(left,Math.min(right,target.x))];for(let x=left;x<right;x+=80)positions.push(x);
  if(s.ramp)positions.push(s.x,s.peak,s.x+s.w);
  for(const x of positions){const y=(s.ramp?rampHeight(s,x):s.y)-f.r-1;if(y<50||bodyBlocked(x,y))continue;nodes.push({x,y});}
 }
 const distance=nodes.map(()=>Infinity),prev=new Map(),closed=new Set();distance[0]=0;
 for(let step=0;step<nodes.length;step++){
  let i=-1;for(let n=0;n<nodes.length;n++)if(!closed.has(n)&&(i<0||distance[n]<distance[i]))i=n;
  if(i<0||distance[i]===Infinity)break;closed.add(i);const a=nodes[i];
  for(let j=1;j<nodes.length;j++){if(i===j||closed.has(j))continue;const b=nodes[j],dx=b.x-a.x,dy=b.y-a.y;
   let jump=false,cost=0;
   if(canWalk(a,b))cost=Math.hypot(dx,dy);
   else if(f.canJump){
    const disc=f.jump*f.jump+2*1250*dy;if(disc<0)continue;const duration=(f.jump+Math.sqrt(disc))/1250;
    if(duration<=0||duration>1.6||Math.abs(dx)>f.speed*duration*.8)continue;
    let clear=true;for(let k=1;k<20;k++){const t=duration*k/20,x=a.x+dx*k/20,y=a.y-f.jump*t+625*t*t;if(y<f.r+30||bodyBlocked(x,y)){clear=false;break;}}
    if(!clear)continue;jump=true;cost=duration*f.speed+50;
   }else continue;
   if(distance[i]+cost<distance[j]){distance[j]=distance[i]+cost;prev.set(j,{index:i,jump});}
  }
 }
 let goal=0,best=Infinity;for(let i=0;i<nodes.length;i++)if(distance[i]<Infinity){const score=Math.hypot(nodes[i].x-target.x,nodes[i].y-target.y)+distance[i]*.025;if(score<best){best=score;goal=i;}}
 const route=[];while(goal!==0){const p=prev.get(goal);if(!p)break;route.unshift({...nodes[goal],jump:p.jump});goal=p.index;}
 return route;
}
function navigateAI(f,target,dt){
 // Cars can drive onto a nearby launch ramp without owning Jump.
 if(f.type==='car'){
  const direction=Math.sign(target.x-f.x);
  const ramp=blocks.find(b=>b.ramp&&f.x>=b.x-25&&f.x<=b.x+b.w+25&&f.y+f.r>=b.y-10&&((direction>0&&b.peak>b.x+b.w/2&&f.x<b.peak+15)||(direction<0&&b.peak<b.x+b.w/2&&f.x>b.peak-15)));
  if(ramp){f.route=[];f.routeTimer=0;move(f,direction,0,false,dt);return;}
 }
 f.routeTimer-=dt;
 if(f.routeTimer<=0&&(f.type==='jet'||f.ground||!f.route.length)){f.route=f.type==='jet'?jetRoute(f,target):groundRoute(f,target);f.routeTimer=.7;}
 while(f.route.length&&Math.hypot(f.route[0].x-f.x,f.route[0].y-f.y)<30)f.route.shift();
 const next=f.route[0];let dx=0,dy=0,jump=false;
 if(next){dx=Math.abs(next.x-f.x)>12?Math.sign(next.x-f.x):0;dy=Math.abs(next.y-f.y)>15?Math.sign(next.y-f.y):0;jump=next.jump&&f.ground;}
 else if(f.type==='jet'){dx=Math.abs(target.x-f.x)>280?Math.sign(target.x-f.x):0;dy=Math.abs(target.y-90-f.y)>40?Math.sign(target.y-90-f.y):0;}
 // A grounded car cannot leap over cover. Aim at breakable cover in its way.
 if(!next&&Math.abs(target.x-f.x)>250){const direction=Math.sign(target.x-f.x),box=blocks.find(b=>b.hp>0&&Number.isFinite(b.hp)&&Math.sign(b.x+b.w/2-f.x)===direction&&Math.abs(b.x+b.w/2-f.x)<220&&f.y+f.r>b.y&&f.y-f.r<b.y+b.h);if(box){f.laserAimDistance=Math.hypot(box.x+box.w/2-f.x,box.y+box.h/2-f.y);f.aiAim=Math.atan2(box.y+box.h/2-f.y,box.x+box.w/2-f.x);f.aiFire=true;f.target=f.aiAim;}}
 move(f,dx,dy,jump,dt);
}
