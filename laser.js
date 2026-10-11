// The car's held laser: three seconds of power, then a two-second recharge.
function circleContact(x,y,dx,dy,cx,cy,r){
 const px=x-cx,py=y-cy,b=px*dx+py*dy,c=px*px+py*py-r*r,d=b*b-c;
 if(c<=0)return 0;
 if(d<0)return null;
 const distance=-b-Math.sqrt(d);return distance>=0?distance:null;
}
function traceLaser(f,angle){
 const enemy=fighters[1-f.team],segments=[];
 const aimDistance=f.team?(f.laserAimDistance??Math.hypot(enemy.x-f.x,enemy.y-f.y)):Math.hypot(mouse.x-f.x,mouse.y-f.y);
 let x=f.x,y=f.y,dx=Math.cos(angle),dy=Math.sin(angle),range=Math.min(aimDistance,1600*f.shotSpeed/TYPES.car.shotSpeed);
 for(let bounce=0;bounce<=f.bounces&&range>0;bounce++){
  let length=range,nx=0,ny=0,hitBox=null,hitEnemy=false;
  for(const edge of [{distance:dx>0?(W-10-x)/dx:dx<0?(10-x)/dx:Infinity,nx:-Math.sign(dx),ny:0},{distance:dy>0?(FLOOR-y)/dy:dy<0?(20-y)/dy:Infinity,nx:0,ny:-Math.sign(dy)}]){
   if(edge.distance>=0&&edge.distance<length){length=edge.distance;nx=edge.nx;ny=edge.ny;}
  }
  for(const box of blocks){if(box.hp<=0)continue;const contact=platformContact(x,y,x+dx*range,y+dy*range,2+f.shotSize*.5,box);if(contact&&contact.t*range<length){length=contact.t*range;nx=contact.nx;ny=contact.ny;hitBox=box;}}
  const distance=circleContact(x,y,dx,dy,enemy.x,enemy.y,enemy.r+2+f.shotSize*.5);
  if(distance!==null&&distance<length){length=distance;hitEnemy=true;hitBox=null;}
  const endX=x+dx*length,endY=y+dy*length,startOffset=bounce===0?Math.min(23,length):0;
  segments.push({x:x+dx*startOffset,y:y+dy*startOffset,endX,endY,hitBox,hitEnemy});
  if(hitEnemy||(!nx&&!ny))break;
  range-=length;x=endX+nx*.2;y=endY+ny*.2;
  const dot=dx*nx+dy*ny;dx-=2*dot*nx;dy-=2*dot*ny;
 }
 if(segments.length)segments[segments.length-1].tip=true;
 return segments;
}
function updateLaser(f,held,dt){
 if(f.type!=='car')return;
 f.beams=[];f.laserActive=false;f.laserSparks=Math.max(0,f.laserSparks-dt);
 if(f.laserRecharge>0){
  f.laserRecharge=Math.max(0,f.laserRecharge-dt);
  f.laserCharge=3*(1-f.laserRecharge/f.laserRechargeLength);
  if(f.laserRecharge<.000001){f.laserRecharge=0;f.laserCharge=3;}
  return;
 }
 if(!held||f.cool>0){f.laserCharge=Math.min(3,f.laserCharge+dt*1.5);return;}
 const duration=Math.min(dt,f.laserCharge);
 if(duration<=0)return;
 f.laserActive=true;f.laserCharge=Math.max(0,f.laserCharge-duration);
 const amount=f.damage/f.rate*(5/3)*duration,enemy=fighters[1-f.team];
 const spark=f.laserSparks<=0;
 for(let i=0;i<f.count;i++){
  const beam=traceLaser(f,f.angle+(i-(f.count-1)/2)*.14);f.beams.push(...beam);
  for(const segment of beam){
   if(segment.hitEnemy){damage(enemy,amount,f);enemy.vx+=Math.cos(f.angle)*f.knock*duration;}
   if(segment.hitBox){segment.hitBox.hp-=amount;if(segment.hitBox.hp<=0)burst(segment.endX,segment.endY,'#d69b52',18,160);}
   if(segment.tip){
    const radius=10+f.shotSize*.5;
    // The bright focus point adds 50% damage; intact cover still blocks it.
    const nearby=Math.hypot(enemy.x-segment.endX,enemy.y-segment.endY)<=enemy.r+radius;
    const obstructed=blocks.some(box=>box.hp>0&&platformContact(segment.endX,segment.endY,enemy.x,enemy.y,0,box));
    if(nearby&&!obstructed)damage(enemy,amount*.5,f);
    if(segment.hitBox)segment.hitBox.hp-=amount*.5;
   }
   if(spark&&(segment.hitEnemy||segment.hitBox)){
    burst(segment.endX,segment.endY,f.explosion?'#ff9645':'#28f4ef',f.explosion?20:5,f.explosion?220:80);
    if(f.explosion){
     if(!segment.hitEnemy&&Math.hypot(enemy.x-segment.endX,enemy.y-segment.endY)<f.explosion+enemy.r)damage(enemy,f.damage*.35,f);
     for(const box of blocks)if(box!==segment.hitBox&&Number.isFinite(box.hp)&&Math.hypot(box.x+box.w/2-segment.endX,box.y+box.h/2-segment.endY)<f.explosion+30)box.hp-=f.damage*.35;
    }
   }
  }
 }
 if(spark){f.laserSparks=.12;tone(200,.13,'sawtooth',.013);}
 if(f.laserCharge<=.000001){f.laserCharge=0;f.laserRechargeLength=Math.max(.3,2*f.rate/TYPES.car.rate);f.laserRecharge=f.laserRechargeLength;}
}
function drawLasers(c){
 for(const f of fighters){if(f.type!=='car')continue;
  for(const beam of f.beams){
   c.save();c.lineCap='round';
   for(const [color,width] of [['#111920',12+f.shotSize],['#00e9ef',8+f.shotSize],['#efffff',3+Math.sin(time*40)*.6]]){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(beam.x,beam.y);c.lineTo(beam.endX,beam.endY);c.stroke();
   }
   c.restore();
   if(beam.tip){
    const radius=10+f.shotSize*.5;
    circle(c,beam.endX,beam.endY,radius+Math.sin(time*28)*1.3,'#45ffff','#112b34',2);
    circle(c,beam.endX,beam.endY,radius*.55,'#ffffff',null);
   }
  }
  const x=f.x-25,y=f.y+f.r+12;
  rect(c,x,y,50,6,'#fff3d2','#111920',2);
  rect(c,x+1,y+1,48*f.laserCharge/3,4,f.laserRecharge>0?'#ff9b38':'#00cdd3',null);
 }
}
