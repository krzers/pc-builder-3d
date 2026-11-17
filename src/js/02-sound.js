/* ---------- sound: synthesised, no audio files ---------- */
const SND={on:true,ctx:null};try{SND.on=localStorage.getItem('pcb3d-snd')==='1'}catch(e){}
function actx(){if(!SND.on)return null;try{if(!SND.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;SND.ctx=new C()}if(SND.ctx.state==='suspended')SND.ctx.resume();return SND.ctx}catch(e){return null}}
function tone(f,t,d,type,vol,f2){const c=actx();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t0=c.currentTime+(t||0);o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+d);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol||.08,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+d+.03)}
function hiss(t,d,vol,f1,f2){const c=actx();if(!c)return;const n=Math.floor(c.sampleRate*d),buf=c.createBuffer(1,n,c.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=Math.random()*2-1;const src=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain(),t0=c.currentTime+(t||0);src.buffer=buf;bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(f1,t0);if(f2)bp.frequency.exponentialRampToValueAtTime(f2,t0+d);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);src.connect(bp);bp.connect(g);g.connect(c.destination);src.start(t0)}
const sfx={
 tick:()=>tone(900,0,.05,'triangle',.035),
 step:()=>{tone(520,0,.08,'sine',.045,760)},
 grab:()=>tone(420,0,.06,'sine',.04,620),
 place:t=>{tone(170,t,.2,'sine',.2,55);hiss(t,.06,.09,2400,900);tone(1180,t+.06,.16,'triangle',.05);tone(1770,t+.1,.2,'sine',.03)},
 bad:()=>{tone(170,0,.13,'sawtooth',.05,120);tone(130,.11,.2,'sawtooth',.05,85)},
 remove:()=>{hiss(0,.24,.08,700,2600);tone(380,0,.2,'sine',.05,150)},
 fold:()=>hiss(0,.14,.04,1200,500),
 win:()=>{[523.25,659.25,783.99,1046.5].forEach((f,i)=>{tone(f,i*.085,.5,'triangle',.06);tone(f*2,i*.085,.3,'sine',.02)})}
};
function fx(kind){const e=$('fx');e.className='';void e.offsetWidth;e.className=kind}
let celebrated='';
function confetti(){if(reduceUI)return;const cv=$('confetti'),x=cv.getContext('2d'),W=cv.width=innerWidth,H=cv.height=innerHeight,cols=Object.values(ACC).map(a=>a[0]);cv.hidden=false;
 const ps=[...Array(150)].map((_,i)=>({x:W*(.25+Math.random()*.5),y:H*.55,vx:(Math.random()-.5)*14,vy:-(8+Math.random()*13),w:6+Math.random()*7,h:9+Math.random()*9,r:Math.random()*6,vr:(Math.random()-.5)*.5,c:cols[i%cols.length]}));
 let t0=performance.now();(function f(now){const t=(now-t0)/1000;x.clearRect(0,0,W,H);for(const p of ps){p.vy+=.42;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.globalAlpha=Math.max(0,1-t/2.4);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*1.7)));x.restore()}if(t<2.4)requestAnimationFrame(f);else cv.hidden=true})(t0)}
const thumbs=new Map();
const APP=document.querySelector('.app');
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mm=v=>(Math.round(v*10)/10).toLocaleString('th-TH');
const reduceUI=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG={
 lock:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.6"/><path d="M5.3 7V5a2.7 2.7 0 0 1 5.4 0v2"/></svg>',
 warn:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 2.2 14.3 13H1.7L8 2.2Z"/><path d="M8 6.5v3M8 11.3v.2"/></svg>',
 ok:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.8"/></svg>'
};
