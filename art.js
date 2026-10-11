// Original animated drawings following the player's car and mech sketches.
function inkLine(c,points,width=3,color='#080e14'){
 c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.stroke();
}
function roughWheel(c,x,y,spin){
 c.save();c.translate(x,y);c.rotate(spin);
 path(c,[[-12,-5],[-7,-12],[3,-13],[11,-7],[13,3],[7,11],[-3,12],[-11,7]],'#171c22','#05090d',3);
 circle(c,0,0,6,'#fff7db','#05090d',3);inkLine(c,[[-9,-7],[8,7]],2);inkLine(c,[[-8,8],[7,-8]],2);c.restore();
}
function seatedPilot(c,x,y,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 circle(c,0,-7,5,'#fffbed','#090e13',1.8);
 inkLine(c,[[0,-2],[1,7],[8,9],[11,14]],1.8);
 inkLine(c,[[1,7],[-4,11],[2,15]],1.8);
 inkLine(c,[[0,1],[6,4],[10,0]],1.8);
 c.restore();
}
function drawCar(c,f,a,t){
 const moving=Math.abs(f.vx||0)>5,spin=moving?f.walk:0,bob=moving?Math.sin(t*22)*1.2:Math.sin(t*3)*.5;
 roughWheel(c,-18,16,spin);roughWheel(c,37,15,spin);
 c.save();c.translate(0,bob);
 path(c,[[-44,6],[-44,-15],[-38,-28],[-28,-37],[-6,-40],[10,-37],[22,-32],[36,-22],[43,-5],[37,8]],'#ff171e','#070c10',3.5);
 path(c,[[1,-38],[20,-38],[33,-33],[42,-23],[45,-17],[21,-17],[8,-23]],'#20eff4','#070c10',3);
 path(c,[[1,-38],[6,-18],[15,-3],[24,7],[38,7],[44,-13],[45,-17],[22,-17],[8,-23]],'#8d9495','#070c10',3);
 seatedPilot(c,20,-24,.9);
 inkLine(c,[[25,-20],[30,-13],[34,-13]],2);
 circle(c,35,-13,6,'#83979a','#070c10',2);
 inkLine(c,[[31,-17],[39,-9]],2);inkLine(c,[[31,-9],[39,-17]],2);
 inkLine(c,[[35,-7],[30,3]],3);
 inkLine(c,[[-20,-41],[-11,-42],[1,-40]],2);
 // The exposed front laser follows the cursor separately from the chassis.
 c.save();c.rotate(((f.angle||0)-a)*(Math.cos(a)<0?-1:1));
 path(c,[[-1,-7],[18,-8],[25,-4],[25,4],[15,6],[-1,4]],'#656f76','#070c10',3);
 circle(c,23,0,5,f.laserRecharge>0?'#ffad24':'#25ffff','#070c10',2);c.restore();
 c.restore();roughWheel(c,-34,17,spin);roughWheel(c,24,20,spin);
 if(f.sticky){inkLine(c,[[-44,30],[-29,32],[-23,28]],3,'#00d9dc');inkLine(c,[[14,31],[29,33],[35,28]],3,'#00d9dc');}
}
function drawStickman(c,f,t){
 const step=Math.abs(f.vx||0)>5?Math.sin(f.walk)*8:Math.sin(t*2)*.7;
 c.save();c.translate(0,Math.abs(step)*.15);
 inkLine(c,[[0,-19],[-1,-5],[0,8]],4);
 inkLine(c,[[0,7],[-9-step*.6,18],[-14-step,30]],4);
 inkLine(c,[[0,7],[8+step*.6,18],[15+step,30]],4);
 inkLine(c,[[-1,-12],[-12,-1],[-18,5-step]],4);
 inkLine(c,[[0,-12],[11,-2],[f.action>0?46:20,f.action>0?-8:3+step]],4);
 circle(c,0,-32,13,'#fffbed','#090e13',3.5);
 if(f.muzzle>0){circle(c,12,-27,4,'#87eb56','#090e13',2);inkLine(c,[[18,-29],[25,-32]],2,'#4baf42');}
 if(f.action>0)inkLine(c,[[45,-10],[50,-8],[46,-5]],3);
 c.restore();
}
function drawMech(c,f,t){
 const stride=Math.abs(f.vx||0)>5?Math.sin(f.walk)*5:0,orange='#ff8b22',blue='#183b64',light='#c5ff40';
 c.save();c.scale(.86,.86);
 // Wide, jointed legs and oversized boots match the silhouette in the sketch.
 path(c,[[-18,3],[-3,6],[-6,25+stride],[-18,40+stride],[-26,35+stride]],blue);
 path(c,[[3,6],[18,3],[25,29-stride],[22,39-stride],[12,40-stride],[1,21]],blue);
 path(c,[[-23,32+stride],[-40,39+stride],[-48,48+stride],[-47,57+stride],[-32,59+stride],[-12,56+stride],[-13,39+stride]],orange);
 path(c,[[18,34-stride],[36,36-stride],[47,44-stride],[52,55-stride],[38,58-stride],[21,55-stride],[11,42-stride]],orange);
 inkLine(c,[[-47,48+stride],[-28,52+stride],[-17,38+stride]],2);inkLine(c,[[22,38-stride],[34,48-stride],[49,51-stride]],2);
 // Open square chest frame. The actual stickman pilot remains visible.
 path(c,[[-21,-35],[21,-34],[22,2],[-20,3]],blue);
 path(c,[[-16,-29],[16,-29],[16,-3],[-16,-2]],'#fff8e8','#080e14',2);
 for(const side of [-1,1]){
  path(c,[[side*17,-34],[side*23,-29],[side*23,-6],[side*17,1]],orange);
  circle(c,side*19,-29,1.8,light,'#080e14',1);circle(c,side*19,-3,1.8,light,'#080e14',1);
  // Twin pistons, knee guards, ankle bolts, and treaded soles.
  inkLine(c,[[side*16,8],[side*22,27+stride*side]],6,blue);
  inkLine(c,[[side*16,10],[side*21,25+stride*side]],2,'#8dd9df');
  path(c,[[side*14,22+stride*side],[side*24,23+stride*side],[side*27,31+stride*side],[side*17,34+stride*side]],orange);
  circle(c,side*20,28+stride*side,2,light,'#080e14',1);
  for(let i=0;i<4;i++)inkLine(c,[[side*(22+i*7),53-stride*side],[side*(24+i*7),57-stride*side]],2,blue);
 }
 circle(c,-2,-52,10,'#fff8e8','#080e14',2.8);
 // Clear head cover: an outline only, with the stickman visible through it.
 inkLine(c,[[-16,-43],[-17,-60],[-10,-68],[3,-68],[13,-60],[14,-43]],2,'#159ba5');
 inkLine(c,[[-13,-59],[-9,-64],[-4,-65]],1.5,'#8adee5');
 inkLine(c,[[-2,-42],[-1,-30],[0,-17],[0,-4]],2.8);
 inkLine(c,[[0,-22],[-10,-14],[-15,-12]],2.8);inkLine(c,[[0,-22],[10,-14],[15,-12]],2.8);
 inkLine(c,[[0,-4],[-7,6],[-13,19]],2.8);inkLine(c,[[0,-4],[7,6],[13,19]],2.8);
 path(c,[[-21,-1],[-6,2],[0,0],[7,2],[22,-1],[20,7],[-19,7]],orange);
 const recoil=f.muzzle>0?3:0;
 for(const side of [-1,1]){
  c.save();c.scale(side,1);c.rotate((f.action>0?-.35:0)+Math.sin(t*2)*.015);
  path(c,[[20,-31],[32,-24],[48,-13],[42,5],[23,-5]],orange);
  path(c,[[23,-27],[32,-21],[43,-13],[40,-6],[26,-13]],'#ffbb42','#080e14',1.5);
  inkLine(c,[[26,-8],[41,0]],3,blue);circle(c,44,-6,5,blue);circle(c,44,-6,2,light,'#080e14',1);
  path(c,[[45,-14],[51,-2],[43,8],[36,4]],blue);
  path(c,[[45,1],[55-recoil,7],[57-recoil,16],[48,12],[40,6]],orange);
  path(c,[[52-recoil,8],[63-recoil,14],[62-recoil,21],[53-recoil,16]],blue);
  inkLine(c,[[49,7],[58-recoil,12]],2,'#97dee2');
  for(let barrel=0;barrel<3;barrel++)inkLine(c,[[54-recoil,11+barrel*3],[65-recoil,17+barrel*3]],2,blue);
  if(f.muzzle>0)path(c,[[63,15],[73,17],[68,20],[73,25],[62,22]],'#ffe741','#080e14',1);
  c.restore();
 }
 c.restore();
}
function drawCity(c){
 rect(c,0,0,W,H,'#e8f8f5',null);
 circle(c,1110,132,54,'#ffe36a','#18262a',4);
 for(let n=0;n<4;n++){const x=(n*420+time*3)%(W+230)-120;c.save();c.globalAlpha=.85;path(c,[[x,175],[x+16,159],[x+40,157],[x+48,143],[x+76,142],[x+91,155],[x+111,158],[x+124,178]],'#fffef4','#aecac8',2);c.restore();}
 const colors=['#73c8cf','#ffbd6d','#f69782','#78c5b3','#93b9d1'];
 for(let i=0;i<15;i++){
  const x=i*105-24,h=145+(i*73%180),y=FLOOR-h;
  path(c,[[x,y+4],[x+36,y],[x+88,y+2],[x+91,FLOOR],[x-2,FLOOR]],colors[i%colors.length],'#233941',3);
  for(let row=0;row<Math.floor(h/40)-1;row++)for(let col=0;col<3;col++)path(c,[[x+13+col*25,y+20+row*38],[x+28+col*25,y+19+row*38],[x+29+col*25,y+39+row*38],[x+12+col*25,y+40+row*38]],'#eafff1','#2b4046',2);
 }
 rect(c,65,515,153,42,'#ff3038','#0b151b',4);c.fillStyle='#fff8d8';c.font='bold 23px monospace';c.fillText('NEON / 08',78,544);
 rect(c,1215,520,132,42,'#ffe06a','#0b151b',4);c.fillStyle='#10212c';c.fillText('GARAGE',1238,549);
 rect(c,0,FLOOR,W,H-FLOOR,'#41566a','#111b23',4);
 for(let i=0;i<15;i++)path(c,[[i*110+15,FLOOR+30],[i*110+70,FLOOR+28],[i*110+71,FLOOR+34],[i*110+14,FLOOR+35]],'#fff2b2','#111b23',1);
}
