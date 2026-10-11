const SAVE_KEY='battlefield-save-v1';
let offeredUpgradeIds=[],computerUpgradeId=null,saveElapsed=0;
function readSavedGame(){try{const data=JSON.parse(localStorage.getItem(SAVE_KEY));if(data?.version!==1||!Array.isArray(data.fighters)||data.fighters.length!==2||data.fighters.some(f=>!TYPES[f.type]||!Number.isFinite(f.hp)||!Array.isArray(f.owned))||!Array.isArray(data.score)||data.score.length!==2||data.score.some(n=>!Number.isInteger(n)||n<0||n>8)||!['easy','medium','hard'].includes(data.difficulty))return null;return data;}catch{return null;}}
function saveMatch(){
 if(!fighters.length||['menu','complete'].includes(mode))return false;
 const data={version:1,selected,difficulty,score,battle,time,phaseTime,loser,mode:mode==='paused'?prePause:mode,offeredUpgradeIds,computerUpgradeId,
  fighters:fighters.map(f=>({...f,owned:[...f.owned],poisonOwner:f.poisonOwner?.team??null,beams:[]})),
  bullets:bullets.map(b=>({...b,owner:b.owner.team})),blocks:blocks.map(b=>({...b,hp:Number.isFinite(b.hp)?b.hp:null})),mouse:{x:mouse.x,y:mouse.y}};
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch{$('save-status').textContent='Could not save: browser storage is unavailable.';return false;}
}
function updateContinueButton(){const saved=readSavedGame();$('continue-game').hidden=!saved;if(saved)$('continue-game').textContent='CONTINUE SAVED GAME · '+saved.score.join(' — ');}
function saveAndExit(){if(saveMatch()){backMenu();updateContinueButton();$('save-status').textContent='Game saved on this browser.';}}
function continueGame(){
 const data=readSavedGame();if(!data)return;
 selected=data.selected;difficulty=data.difficulty;score=data.score;battle=data.battle;time=data.time;phaseTime=data.phaseTime;loser=data.loser;
 fighters=data.fighters.map((f,i)=>({...makeFighter(f.type,i),...f,team:i,owned:new Set(f.owned),beams:[]}));
 fighters.forEach((f,i)=>f.poisonOwner=data.fighters[i].poisonOwner===null?null:fighters[data.fighters[i].poisonOwner]);
 bullets=data.bullets.map(b=>({...b,owner:fighters[b.owner]}));blocks=data.blocks.map(b=>({...b,hp:b.hp===null?Infinity:b.hp}));particles=[];keys.clear();mouse.down=false;mouse.x=data.mouse.x;mouse.y=data.mouse.y;jumpPressed=specialPressed=false;
 offeredUpgradeIds=data.offeredUpgradeIds||[];computerUpgradeId=data.computerUpgradeId;mode=data.mode;
 $('menu').hidden=true;$('play').hidden=false;$('overlay').hidden=true;$('announcement').textContent='';$('player-name').textContent=TYPES[fighters[0].type].name;$('bot-name').textContent=TYPES[fighters[1].type].name;$('difficulty-label').textContent=' / '+difficulty.toUpperCase();$('pause').textContent='Pause';updateHUD();
 if(mode==='upgrade')chooseUpgrade(true);
 else if(mode==='battle'||mode==='countdown')pause();
 else if(mode==='roundover')$('announcement').textContent=loser===-1?'DRAW — TRY AGAIN':loser===1?'YOU WIN THIS BATTLE':'COMPUTER WINS THIS BATTLE';
}
function autoSave(dt){if(mode==='menu'||mode==='complete')return;saveElapsed+=dt;if(saveElapsed>=1){saveElapsed=0;saveMatch();}}
function installSaving(){
 $('save-exit').onclick=saveAndExit;$('continue-game').onclick=continueGame;updateContinueButton();
 window.addEventListener('pagehide',saveMatch);
 document.addEventListener?.('visibilitychange',()=>{if(document.hidden)saveMatch();});
}
