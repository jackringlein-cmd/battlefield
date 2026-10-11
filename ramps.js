function cityRamps(){return [
 {ramp:true,x:430,y:635,w:210,h:100,peak:600,hp:Infinity},
 {ramp:true,x:800,y:635,w:210,h:100,peak:840,hp:Infinity}
];}
function rampHeight(b,x){
 if(x<b.x||x>b.x+b.w)return b.y+b.h;
 return x<=b.peak?b.y+b.h-(x-b.x)*b.h/(b.peak-b.x):b.y+(x-b.peak)*b.h/(b.x+b.w-b.peak);
}
function rampSlope(b,x){return x<b.peak?-b.h/(b.peak-b.x):b.h/(b.x+b.w-b.peak);}
function rampContact(ox,oy,x,y,r,b){
 const points=[[b.x,b.y+b.h],[b.peak,b.y],[b.x+b.w,b.y+b.h]],dx=x-ox,dy=y-oy;
 let enter=0,leave=1,nx=0,ny=0,inside=true,closest=-Infinity;
 for(let i=0;i<3;i++){
  const a=points[i],p=points[(i+1)%3],ex=p[0]-a[0],ey=p[1]-a[1],len=Math.hypot(ex,ey),normalX=ey/len,normalY=-ex/len;
  const start=(ox-a[0])*normalX+(oy-a[1])*normalY-r,velocity=dx*normalX+dy*normalY;
  if(start>0)inside=false;
  if(start>closest){closest=start;if(inside){nx=normalX;ny=normalY;}}
  if(Math.abs(velocity)<1e-9){if(start>0)return null;continue;}
  const t=-start/velocity;
  if(velocity<0){if(t>enter){enter=t;nx=normalX;ny=normalY;}}
  else leave=Math.min(leave,t);
  if(enter>leave)return null;
 }
 if(leave<0||enter>1)return null;
 return {t:Math.max(0,enter),nx,ny,box:b};
}
function rideRamps(f,oldX,oldY,wasGround){
 f.groundSlope=0;
 for(const b of blocks){if(!b.ramp)continue;
  const oldSurface=rampHeight(b,oldX),surface=rampHeight(b,f.x),oldFoot=oldY+f.r;
  const riding=wasGround&&Math.abs(oldFoot-oldSurface)<6;
  const crossed=(oldX<b.peak&&f.x>=b.peak)||(oldX>b.peak&&f.x<=b.peak);
  if(f.type==='car'&&riding&&crossed&&Math.abs(f.vx)>130&&f.vx*rampSlope(b,oldX)<0){
   f.y=b.y-f.r-1;f.vy=Math.max(-420,f.vx*rampSlope(b,oldX));f.ground=false;
   burst(f.x,f.y+f.r,'#ffe14f',8,100);return;
  }
  if(f.x<b.x||f.x>b.x+b.w)continue;
  if(f.vy>=0&&((riding&&f.type!=='jet')||(oldFoot<=surface+3&&f.y+f.r>=surface))){
   f.y=surface-f.r;f.vy=0;f.ground=true;f.groundSlope=rampSlope(b,f.x);return;
  }
 }
}
function drawRamp(c,b){
 path(c,[[b.x,FLOOR],[b.peak,b.y],[b.x+b.w,FLOOR]],'#ffbc43','#101c24',4);
 path(c,[[b.x+15,FLOOR-3],[b.peak,b.y+11],[b.x+b.w-12,FLOOR-3]],'#213b50','#101c24',2);
 inkLine(c,[[b.x,FLOOR],[b.peak,b.y],[b.x+b.w,FLOOR]],7,'#111c22');
 inkLine(c,[[b.x,FLOOR-2],[b.peak,b.y-2],[b.x+b.w,FLOOR-2]],3,'#fff090');
 const dir=b.peak>b.x+b.w/2?1:-1,cx=b.x+b.w/2,cy=FLOOR-24;
 for(let i=-1;i<=1;i++)inkLine(c,[[cx+i*22-dir*6,cy-7],[cx+i*22+dir*3,cy],[cx+i*22-dir*6,cy+7]],3,'#ffe252');
 for(const x of [b.x+35,b.x+b.w-35])circle(c,x,FLOOR-8,2,'#ffe252','#101c24',1);
}
