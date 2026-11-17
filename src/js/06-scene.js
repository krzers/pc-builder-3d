/* ---------- 3D ---------- */
let userMoved=false;
(function(){
 if(!window.THREE){$('loading').innerHTML='<div class="fail"><b>โหลดโมเดล 3D ไม่สำเร็จ</b>ยังเลือกชิ้นส่วนและดูผลการเช็กทางขวาได้ตามปกติ</div>';return}
 const T=THREE,cv=$('cv'),bench=$('bench');let renderer;
 try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){$('loading').innerHTML='<div class="fail"><b>อุปกรณ์นี้แสดงโมเดล 3D ไม่ได้</b>ยังเลือกชิ้นส่วนและดูผลการเช็กได้ตามปกติ</div>';return}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),cam=new T.PerspectiveCamera(30,1,20,8000);
 (function(){const env=new T.Scene(),bm=v=>{const m=new T.MeshBasicMaterial({side:T.DoubleSide});m.color.setRGB(v,v,v*1.06);return m};
  env.add(new T.Mesh(new T.BoxGeometry(20,12,20),bm(.42)));
  const pn=(w,h,d,x,y,z,v)=>{const q=new T.Mesh(new T.BoxGeometry(w,h,d),bm(v));q.position.set(x,y,z);env.add(q)};
  pn(9,.2,9,0,5.8,0,8);pn(.2,5,8,-9.8,1,2,5);pn(8,4,.2,3,1,9.8,6);pn(.2,3,5,9.8,0,-3,3);pn(6,.2,6,0,-5.8,0,1.2);
  try{const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.03).texture;pm.dispose()}catch(e){}})();
 scene.add(new T.HemisphereLight(0xffffff,0x7b869c,.3));
 const dl=new T.DirectionalLight(0xffffff,.85);dl.position.set(450,950,800);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);dl.shadow.bias=-.0006;dl.shadow.normalBias=1.2;
 Object.assign(dl.shadow.camera,{left:-650,right:650,top:750,bottom:-350,near:100,far:3200});scene.add(dl);
 const floor=new T.Mesh(new T.PlaneGeometry(4000,4000),new T.ShadowMaterial({opacity:.2}));floor.rotation.x=-Math.PI/2;floor.position.y=-10;floor.receiveShadow=true;scene.add(floor);
 const root=new T.Group();scene.add(root);
 /* stage dressing: fading floor grid + coloured glow under the case, and a layer for one-shot effects */
 const deco=new T.Group(),fxRoot=new T.Group();scene.add(deco);scene.add(fxRoot);
 const mkTex=draw=>{const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const t=new T.CanvasTexture(c);return t};
 const glowTex=mkTex(x=>{const g=x.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,512,512)});
 const gridTex=mkTex(x=>{x.strokeStyle='#fff';x.lineWidth=1;for(let i=0;i<=512;i+=16){x.globalAlpha=i%64?.45:1;x.beginPath();x.moveTo(i+.5,0);x.lineTo(i+.5,512);x.moveTo(0,i+.5);x.lineTo(512,i+.5);x.stroke()}x.globalAlpha=1;x.globalCompositeOperation='destination-in';const g=x.createRadialGradient(256,256,30,256,256,256);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,512,512)});
 const gridMat=new T.MeshBasicMaterial({map:gridTex,transparent:true,opacity:.16,depthWrite:false,toneMapped:false}),grid=new T.Mesh(new T.PlaneGeometry(3200,3200),gridMat);grid.rotation.x=-Math.PI/2;grid.position.y=-11;deco.add(grid);
 const glowMat=new T.MeshBasicMaterial({map:glowTex,transparent:true,opacity:.55,depthWrite:false,toneMapped:false}),glow=new T.Mesh(new T.PlaneGeometry(1500,1500),glowMat);glow.rotation.x=-Math.PI/2;glow.position.y=-10.6;deco.add(glow);
 const accCol=new T.Color(ACC.case[0]),accGoal=new T.Color(ACC.case[0]);
 const isDark=()=>{const d=document.documentElement.dataset.theme;return d?d==='dark':!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)};
 const centers={},bursts=[],flashes=[];
 function burst(k,colHex){const c=centers[k];if(!c||reduce)return;const n=46,pos=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pos[i*3]=c.x;pos[i*3+1]=c.y;pos[i*3+2]=c.z;const a=Math.random()*6.283,u=Math.random()*2-1,q=Math.sqrt(1-u*u),sp=160+Math.random()*420;vel.push(q*Math.cos(a)*sp,u*sp+120,q*Math.sin(a)*sp+160)}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));const m=new T.PointsMaterial({size:26,map:glowTex,color:colHex||ACC[k][0],transparent:true,depthWrite:false,toneMapped:false}),pts=new T.Points(geo,m);fxRoot.add(pts);
  const ring=new T.Mesh(new T.RingGeometry(.86,1,56),new T.MeshBasicMaterial({color:colHex||ACC[k][0],transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));ring.position.copy(c);fxRoot.add(ring);
  bursts.push({pts,vel,ring,t:0})}
 function flash(g,k){if(reduce)return;const col=new T.Color(ACC[k][0]),ms=[];g.traverse(n=>{if(n.isMesh&&n.material&&n.material.emissive&&!ms.some(q=>q.m===n.material))ms.push({m:n.material,c:n.material.emissive.clone(),i:n.material.emissiveIntensity})});for(const q of ms)q.m.emissive.copy(col);flashes.push({ms,t:0})}
 const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const COL={BLACK:0x191b20,WHITE:0xe9edf3,GREY:0x8f96a3,GOLD:0xc7aa66,BROWN:0x7b5c45,RED:0xb5423f,BLUE:0x3d6fd6,ORANGE:0xd9792b,GREEN:0x4f8f6a,PINK:0xd98aa8};
 const col=c=>COL[c]||COL.BLACK;
 const M=(color,o)=>{if(ghostMat)return ghostMat;const m=new T.MeshStandardMaterial(Object.assign({color,roughness:.6,metalness:.1},o||{}));m.color.convertSRGBToLinear();if(o&&o.emissive!==undefined)m.emissive.convertSRGBToLinear();return m};
 const add=(g,geo,m,x,y,z)=>{const q=new T.Mesh(geo,m);q.position.set(x||0,y||0,z||0);g.add(q);return q};
 function rr(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 const ext=(s,d,bv)=>new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:!!bv,bevelThickness:bv||0,bevelSize:bv||0,bevelSegments:2,curveSegments:12});
 const texCache={};
 function text(g,str,w,x,y,z,fg){if(ghostMat)return null;const key=str+'|'+fg;if(!texCache[key]){const c=document.createElement('canvas');c.width=512;c.height=96;const q=c.getContext('2d');q.font='700 62px Arial,Helvetica,sans-serif';q.fillStyle=fg;q.textBaseline='middle';q.textAlign='center';q.fillText(str,256,52,492);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;texCache[key]=t}
  const m=new T.Mesh(new T.PlaneGeometry(w,w*96/512),new T.MeshBasicMaterial({map:texCache[key],transparent:true,depthWrite:false,toneMapped:false}));m.position.set(x,y,z);g.add(m);return m}
 const YZX=new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0));
 let ghostMat=null,ghostEdge=0xe2433d,partGroups=[],spinners=[],anims=[];
 function box(g,w,h,d,x,y,z,m,edge){const geo=new T.BoxGeometry(w,h,d),mesh=new T.Mesh(geo,ghostMat||m);mesh.position.set(x,y,z);g.add(mesh);if(edge!==undefined||ghostMat){const l=new T.LineSegments(new T.EdgesGeometry(geo),new T.LineBasicMaterial({color:ghostMat?ghostEdge:edge,transparent:true,opacity:ghostMat?.9:.55}));l.position.copy(mesh.position);g.add(l)}return mesh}
 function fan(g,r,axis,x,y,z,ringCol,o){o=o||{};const f=new T.Group(),dp=o.depth||24,bz=o.frame?-dp*.45:2;
  if(o.frame){const s=rr(2*r+9,2*r+9,7),h=new T.Path();h.absarc(0,0,r+1.5,0,Math.PI*2,true);s.holes.push(h);add(f,ext(s,dp-1.2,.6),M(o.frameCol||0x1a1c21,{roughness:.5}),0,0,-dp+.6);
   for(let i=0;i<4;i++){const st=add(f,new T.BoxGeometry(r+2,3.5,2.5),M(o.frameCol||0x1a1c21,{roughness:.5}),Math.cos(i*Math.PI/2+.5)*r*.62,Math.sin(i*Math.PI/2+.5)*r*.62,-dp+2.5);st.rotation.z=i*Math.PI/2+.5}}
  else{if(!o.open){const disc=add(f,new T.CylinderGeometry(r,r,3,40),M(0x15181e,{roughness:.8}));disc.rotation.x=Math.PI/2}
   add(f,new T.TorusGeometry(r+.5,r*.045,10,56),M(ringCol||0x4a505c,{metalness:.5,roughness:.4}),0,0,2)}
  const bl=new T.Group(),bs=new T.Shape(),r0=r*.25,r1=r*.95;bs.moveTo(r0,0);bs.quadraticCurveTo(r*.62,r*.02,r1*Math.cos(.6),r1*Math.sin(.6));bs.lineTo(r1*Math.cos(1.1),r1*Math.sin(1.1));bs.quadraticCurveTo(r*.48,r*.44,r0*Math.cos(.75),r0*Math.sin(.75));bs.lineTo(r0,0);
  const bg=ext(bs,1.6,0),bm=M(o.blade||0x2b2f37,{roughness:.38,metalness:.05});for(let i=0;i<9;i++){const q=new T.Mesh(bg,bm);q.rotation.z=i*Math.PI*2/9;q.position.z=bz;bl.add(q)}
  const hub=add(bl,new T.CylinderGeometry(r*.28,r*.28,6,28),bm,0,0,bz+2);hub.rotation.x=Math.PI/2;
  const cap=add(bl,new T.CylinderGeometry(r*.2,r*.2,.6,28),M(o.cap||0x9aa1ad,{metalness:.9,roughness:.3}),0,0,bz+5.2);cap.rotation.x=Math.PI/2;
  f.add(bl);spinners.push(bl);
  if(axis==='y-')f.rotation.x=Math.PI/2;if(axis==='x+')f.rotation.y=Math.PI/2;if(axis==='y+')f.rotation.x=-Math.PI/2;
  f.position.set(x,y,z);g.add(f)}
 const BOARD={EATX:[277,305],ATX:[244,305],mATX:[244,244],ITX:[170,170]};
 function layout(b){
  const c=b.case;if(!c)return null;const D=c.D,W=c.W,H=c.H,rear=-D/2,zb=-W/2;
  const ff=b.mb&&BOARD[b.mb.ff]?b.mb.ff:(c.mb.includes('ATX')?'ATX':c.mb.includes('mATX')?'mATX':'ITX'),itx=ff==='ITX',[bw,bh]=BOARD[ff];
  const bx=rear+18,by=H-28,zs=zb+22,L={c,D,W,H,rear,zb,ff,itx,bw,bh,bx,by,zs};
  L.sx=bx+(itx?72:96);L.sy=by-(itx?60:78);L.rx=bx+(itx?126:170);L.gy=by-(itx?148:118);L.mx=bx+(itx?70:112);L.my=by-(itx?112:222);
  const psu=b.psu,pw=psu&&psu.ff==='SFX'?[psu.len||100,63.5,125]:[psu?psu.len||150:150,86,150];
  L.psuFront=bh+pw[1]+45>H;L.pw=pw;
  return L;
 }
 const parts={};
 function buildCase(g,L){const c=L.c,cc=col(c.col),body=M(cc),soft=M(cc,{transparent:true,opacity:.2,depthWrite:false}),t=3,{D,W,H}=L,e=c.col==='WHITE'?0x8f98a8:0x9aa3b5;
  box(g,D,t,W,0,t/2,0,body,e);box(g,D,H,t,0,H/2,-W/2+t/2,body,e);box(g,t,H,W,-D/2+t/2,H/2,0,body,e);
  box(g,D,t,W,0,H-t/2,0,soft,e);box(g,t,H,W,D/2-t/2,H/2,0,soft,e);
  box(g,D,H,2,0,H/2,W/2-1,M(c.glass?0xbfd4ff:cc,{transparent:true,opacity:c.glass?.07:.05,depthWrite:false}),e);
  for(const sx of[-1,1])for(const sz of[-1,1])box(g,36,10,22,sx*(D/2-45),-5,sz*(W/2-24),M(0x1b1e24));}
 function buildMb(g,L,b,ghost){const pcb=M(ghost?0x5b6475:0x18222f,ghost?{transparent:true,opacity:.35}:{}),{bx,by,bw,bh,zs}=L;
  box(g,bw,bh,3,bx+bw/2,by-bh/2,zs-1.5,pcb,0x5d6b84);
  box(g,46,46,4,L.sx,L.sy,zs+2,M(0xcfd5df,{metalness:.5,roughness:.35}),0x8992a3);
  const n=b.mb?b.mb.rs:(L.itx?2:4);for(let i=0;i<n;i++)box(g,5,136,5,L.rx+i*9.5,by-12-68,zs+2.5,M(i%2?0x3b4352:0x596276));
  box(g,L.itx?90:92,7,9,bx+10+46,L.gy,zs+4.5,M(0x596276));
  box(g,L.itx?44:60,56,22,bx+(L.itx?26:34),by-(L.itx?36:44),zs+11,M(0x303745),0x596276);
  box(g,10,L.itx?60:90,14,bx+bw-12,by-bh*.55,zs+7,M(0x303745));
  if(!L.itx)box(g,60,52,8,bx+bw-70,by-bh+50,zs+4,M(0x303745),0x596276);}
 function buildCpu(g,L,b){box(g,38,38,4,L.sx,L.sy,L.zs+6,M(0xdde2ea,{metalness:.7,roughness:.25}),0x7d8696)}
 function buildRam(g,L,b){const r=b.ram,n=b.mb?b.mb.rs:(L.itx?2:4);let slots=[];if(r.q>=n)slots=[...Array(r.q).keys()];else if(r.q===2&&n===4)slots=[1,3];else slots=[...Array(r.q).keys()].map(i=>Math.min(n-1,i+(n===4?1:0)));
  const rgb=/RGB|LED/i.test(r.full||''),hs=new T.Shape();[[-66.5,4],[66.5,4],[66.5,29],[59,36.5],[22,36.5],[16,32.5],[-16,32.5],[-22,36.5],[-59,36.5],[-66.5,29]].forEach((p,i)=>i?hs.lineTo(p[0],p[1]):hs.moveTo(p[0],p[1]));
  const dark=r.col==='BLACK'||r.col==='GREY';
  for(const i of slots){const s=new T.Group();s.position.set(L.rx+i*9.5,L.by-12-68,L.zs+5);g.add(s);
   box(s,1.4,133,32,0,0,16,M(0x0c1712,{roughness:.5}));box(s,1.7,126,3.4,0,0,1.6,M(0xd4af37,{metalness:1,roughness:.3}));
   const geo=ext(hs,6.4,.5);geo.translate(0,0,-3.2);geo.applyMatrix4(YZX);add(s,geo,M(r.col==='GREY'?0x3a3e47:col(r.col),{metalness:.85,roughness:.34}));
   box(s,7.5,60,1.2,0,0,24,M(dark?0x8f96a3:0x22252b,{metalness:.9,roughness:.3}));
   if(rgb){box(s,5.4,128,6.5,0,0,39.5,M([0x6f8dff,0x8f7bff,0x59b8ff,0xa070ff][i%4],{emissive:[0x6f8dff,0x8f7bff,0x59b8ff,0xa070ff][i%4],emissiveIntensity:.75,roughness:.3}))}
   const t=text(s,`${r.type}  ${r.sp}`,46,4.1,-36,14,dark?'#e3e8f1':'#1c1f25');if(t)t.geometry.applyMatrix4(YZX)}}
 function buildGpu(g,L,b){const u=b.gpu,th=u.sw*20.32,hz=u.len<180?112:128,len=u.len,x0=L.rear+8,y1=L.gy+8,cx=x0+len/2,cy=y1-th/2,cz=L.zs+8+hz/2;
  const white=u.col==='WHITE',noct=u.col==='BROWN',gold=u.col==='GOLD';
  const shC=white?0xe4e7ec:noct?0x6b5445:gold?0x2b2d31:0x1b1d22,accC=gold?0xbfa46a:white?0xaeb5c2:noct?0xd8c7a6:0x424753,bpC=white?0xdfe3e9:0x25282e,fg=white?'#2c3038':'#e6eaf2';
  const c=new T.Group();c.position.set(cx,cy,cz);g.add(c);
  box(c,len-4,1.6,hz-12,0,th/2-6,-5,M(0x0d1116,{roughness:.5}));
  box(c,86,1.6,9,-len/2+54,th/2-6,-hz/2-3,M(0xd4af37,{metalness:1,roughness:.3}));
  const bp=add(c,ext(rr(len,hz,5),2,.5),M(bpC,{metalness:.9,roughness:.36}),0,th/2-2.4,0);bp.rotation.x=-Math.PI/2;
  for(let i=0;i<5;i++){const sl=add(c,new T.BoxGeometry(hz*.34,.5,3.2),M(0x08090b,{roughness:.9}),-len*.38+i*9,th/2+.9,hz*.12);sl.rotation.y=.9}
  box(c,len*.3,.5,hz*.32,len*.3,th/2+.8,hz*.12,M(0x08090b,{roughness:.9}));
  const tb=text(c,u.chip,Math.min(105,len*.36),-len*.02,th/2+1.2,-hz*.16,fg);if(tb)tb.rotation.x=-Math.PI/2;
  const nfin=Math.max(8,Math.floor((len-30)/2.7)),im=new T.InstancedMesh(new T.BoxGeometry(.7,Math.max(6,th-17),hz-9),M(0xb3b9c4,{metalness:.95,roughness:.32}),nfin),mt=new T.Matrix4();
  for(let i=0;i<nfin;i++){mt.makeTranslation(-len/2+15+i*2.7,-.5,0);im.setMatrixAt(i,mt)}c.add(im);
  for(const dz of[-hz*.28,0,hz*.28]){const hp=add(c,new T.CylinderGeometry(3,3,len-40,12),M(0xb87333,{metalness:1,roughness:.3}),0,th/2-10,dz);hp.rotation.z=Math.PI/2}
  const nf=u.fans||0,r=nf?Math.min(hz*.44,(len-14)/(nf*2.1)):0,s=rr(len,hz,9),xs=[];
  for(let i=0;i<nf;i++){const xi=-len/2+len*(i+.5)/nf;xs.push(xi);const h=new T.Path();h.absarc(xi,0,r+1.2,0,Math.PI*2,true);s.holes.push(h)}
  const shM=M(shC,{roughness:.4,metalness:.25}),sh=add(c,ext(s,7,1),shM,0,-th/2+9,0);sh.rotation.x=Math.PI/2;
  box(c,len-12,th*.52,3,0,-th*.2,hz/2-1.5,shM);box(c,len-12,th*.52,3,0,-th*.2,-hz/2+1.5,shM);box(c,3,th*.52,hz-10,len/2-1.5,-th*.2,0,shM);
  box(c,len*.4,2,1,-len*.16,-th*.2+th*.17,hz/2+.5,M(noct?0xd8c7a6:0x7fa0ff,{emissive:noct?0xd8c7a6:0x7fa0ff,emissiveIntensity:noct?.1:.7}));
  text(c,u.chip,Math.min(110,len*.38),len*.22,-th*.21,hz/2+.7,fg);
  for(let i=1;i<nf;i++){const gx=-len/2+len*i/nf;for(const sg of[-1,1]){const a=add(c,new T.BoxGeometry(hz*.3,2.2,3.5),M(accC,{metalness:.8,roughness:.35}),gx,-th/2+.6,sg*hz*.3);a.rotation.y=sg*1.05}}
  for(const xi of xs)fan(c,r,'y-',xi,-th/2+6,0,accC,{open:true,blade:noct?0x86644f:white?0xd5dae2:0x2a2d34});
  if(!nf){for(const dz of[-14,14]){const tu=add(c,new T.CylinderGeometry(6,6,40,14),M(0x111317,{roughness:.7}),len/2+18,0,dz);tu.rotation.z=Math.PI/2}}
  box(c,1.6,th+4,hz+12,-len/2-.8,0,-2,M(0xcdd2da,{metalness:1,roughness:.26}));
  box(c,24,9,7,len/2-74,th/2-11,hz/2-2,M(0x0b0c0f,{roughness:.6}));
  parts.gpuBox={x0,x1:x0+len,y:cy,z:cz,th,hz};}
 function finStack(g,w,hy,z0,z1,x,y,m){const n=Math.max(3,Math.floor((z1-z0)/2.3)),im=new T.InstancedMesh(new T.BoxGeometry(w,hy,.55),m,n),mt=new T.Matrix4();for(let i=0;i<n;i++){mt.makeTranslation(x,y,z0+i*2.3);im.setMatrixAt(i,mt)}g.add(im);add(g,ext(rr(w+1,hy+1,3),2,.4),m,x,y,z1)}
 function pipes(g,xs,ys,z0,z1,x,y,m){for(const dx of xs)for(const dy of ys){const q=add(g,new T.CylinderGeometry(3,3,z1-z0,14),m,x+dx,y+dy,(z0+z1)/2);q.rotation.x=Math.PI/2;add(g,new T.SphereGeometry(3.1,14,10),m,x+dx,y+dy,z1)}}
 function buildCool(g,L,b){const k=b.cool,z0=L.zs+8,noct=/Noctua/.test(k.n),blk=k.col==='BLACK',wht=k.col==='WHITE';
  const fin=M(blk?0x25282e:wht?0xe9ecf1:0xc3c8d1,{metalness:blk?.7:wht?.2:.95,roughness:blk?.45:.34}),pipe=M(blk?0x2e3138:0xd3d7de,{metalness:1,roughness:.25});
  const fo={frame:true,frameCol:noct?0xd8c7a6:wht?0xe6e9ee:0x1a1c21,blade:noct?0x7b5a47:wht?0xdfe3ea:0x2a2d34,cap:noct?0xb9a27f:0x9aa1ad};
  if(k.aio){const cyl=add(g,new T.CylinderGeometry(33,33,40,48),M(0x1c1e23,{roughness:.4,metalness:.3}),L.sx,L.sy,z0+20);cyl.rotation.x=Math.PI/2;
   const cap=add(g,new T.CylinderGeometry(28,28,2,48),M(0x0c0d10,{emissive:0x5f7dff,emissiveIntensity:.9,roughness:.2}),L.sx,L.sy,z0+41);cap.rotation.x=Math.PI/2;
   const rg=add(g,new T.TorusGeometry(31,1.6,10,56),M(0xcdd2da,{metalness:1,roughness:.25}),L.sx,L.sy,z0+40);
   const len=k.rad+35,top=len<=L.D-24,n=Math.round(k.rad/120),zc=Math.min(L.W/2-68,L.zs+110),rm=M(0x17191d,{roughness:.55,metalness:.4});
   if(top){const xc=L.rear+12+len/2+(L.D-24-len)/2;box(g,len,27,120,xc,L.H-8-13.5,zc,rm,0x596276);for(let i=0;i<n;i++)fan(g,56,'y-',xc-len/2+17+60+i*120,L.H-8-27-25,zc,0,fo)}
   else box(g,27,Math.min(len,L.H-16),120,L.D/2-8-13.5,L.H/2,zc,rm,0x596276);
   return}
  box(g,42,42,9,L.sx,L.sy,z0+4.5,M(0xcfd3da,{metalness:1,roughness:.22}));box(g,86,11,3,L.sx,L.sy,z0+10,M(0x8d939e,{metalness:.9,roughness:.4}));
  if(k.h<80){const fd=k.h<50?14:15,z1=z0+k.h-fd-2;finStack(g,92,92,z0+13,z1,L.sx,L.sy,fin);pipes(g,[-30,-10,10,30],[0],z0+8,z0+14,L.sx,L.sy,pipe);fan(g,43,'z',L.sx,L.sy,z0+k.h,0,Object.assign({depth:fd},fo));return}
  const hz=k.h-8,zt=z0+hz-3,fz=z0+hz-62,dual=k.h>=158;
  if(dual){for(const sg of[-1,1]){finStack(g,42,124,z0+26,zt,L.sx+sg*38,L.sy,fin);pipes(g,[-12,12],[-42,-14,14,42],z0+9,zt+3,L.sx+sg*38,L.sy,pipe)}fan(g,57,'x+',L.sx+12.5,L.sy,fz,0,fo)}
  else{finStack(g,48,124,z0+26,zt,L.sx-6,L.sy,fin);pipes(g,[-14,14],[-42,-14,14,42],z0+9,zt+3,L.sx-6,L.sy,pipe);fan(g,57,'x+',L.sx+43,L.sy,fz,0,fo)}}
 function buildSsd(g,L,b){box(g,80,22,3.5,L.mx,L.my,L.zs+3,M(0x1f6f55),0x7fd4b4);box(g,26,16,2,L.mx-12,L.my,L.zs+5.5,M(0x101318))}
 function buildPsu(g,L,b){const[pl,ph,pz]=L.pw,m=M(0x23272f),zc=Math.min(0,L.W/2-pz/2-6);
  if(L.psuFront){const x=L.D/2-8-ph/2;box(g,ph,pl,pz,x,8+pl/2,zc,m,0x6a7180);parts.psuC=[x,8+pl/2,zc]}
  else{const x=L.rear+8+pl/2;box(g,pl,ph,pz,x,6+ph/2,zc,m,0x6a7180);fan(g,Math.min(60,pl*.42),'z',x,6+ph/2,zc+pz/2+1,0x6a7180);box(g,pl*.5,10,1,x,6+ph-10,zc+pz/2+1,M(0xdfe6f5));parts.psuC=[x,6+ph/2,zc]}}
 const BUILDERS={mb:buildMb,cpu:buildCpu,ram:buildRam,gpu:buildGpu,cool:buildCool,ssd:buildSsd,psu:buildPsu};
 let shown=false;const caseRad=Math.max(...DATA.case.map(c=>Math.hypot(c.D,c.W,c.H)))/2;
 let lastIds={},L0=null,shakers=[],swayK=0,clock=0;
 function dispose(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)n.material.dispose()})}
 function sync(){
  while(root.children.length){const ch=root.children.pop();dispose(ch)}spinners=[];anims=[];shakers=[];
  const b=build,L=layout(b);L0=L;if(!L){lastIds={};return}
  const g=new T.Group();buildCase(g,L);root.add(g);
  const pvK=preview?preview.k:null,need=b.mb||b.cpu||b.ram||b.gpu||b.cool||b.ssd||(pvK&&pvK!=='case'&&pvK!=='psu');
  if(!b.mb&&need&&pvK!=='mb'){const gm=new T.Group();buildMb(gm,L,b,true);root.add(gm)}
  partGroups=[];for(const k of ORDER.slice(1)){if(!b[k]||(preview&&preview.k===k))continue;const gp=new T.Group();gp.userData.k=k;BUILDERS[k](gp,L,b);root.add(gp);partGroups.push(gp);
   centers[k]=new T.Box3().setFromObject(gp).getCenter(new T.Vector3());
   if(lastIds[k]!==b[k].id&&!reduce&&Object.keys(lastIds).length){gp.userData.t=0;gp.position.z=160;anims.push(gp)}}
  if(preview&&preview.k!=='case'){const b2={...b,[preview.k]:preview.it},L2=layout(b2),gp=new T.Group();const pvBad=check(preview.k,preview.it).block.length>0;ghostEdge=pvBad?0xe2433d:new T.Color(ACC[preview.k][0]).multiplyScalar(.7).getHex();ghostMat=new T.MeshStandardMaterial({color:pvBad?0xe2433d:ACC[preview.k][0],transparent:true,opacity:pvBad?.42:.5,depthWrite:false,roughness:.7});
   BUILDERS[preview.k](gp,L2,b2);ghostMat=null;root.add(gp);if(pvBad&&!reduce){gp.userData.shake=1;shakers.push(gp)}}
  accGoal.set(ACC[curKey()][0]);const dk=isDark();gridMat.color.set(dk?0xffffff:0x1a1c22);gridMat.opacity=dk?.1:.16;glowMat.opacity=dk?.55:.7;glow.scale.setScalar(Math.max(L.D,L.W*2)/430);
  const cur=ORDER[step],gk=preview&&preview.k==='gpu'?preview.it:b.gpu;
  if(cur==='gpu'&&gk){const over=gk.len>L.c.gpuMax,x=L.rear+8+L.c.gpuMax,pm=new T.MeshBasicMaterial({color:over?0xe2433d:0x121310,transparent:true,opacity:over?.28:.13,side:T.DoubleSide,depthWrite:false});
   const pl=new T.Mesh(new T.PlaneGeometry(Math.min(L.W-10,190),150),pm);pl.rotation.y=Math.PI/2;pl.position.set(Math.min(x,L.D/2+ (over?0:-4)),L.gy-30,L.zs+75);root.add(pl);
   const ln=new T.LineSegments(new T.EdgesGeometry(pl.geometry),new T.LineBasicMaterial({color:over?0xe2433d:0x121310}));ln.rotation.copy(pl.rotation);ln.position.copy(pl.position);root.add(ln)}
  root.traverse(n=>{if(n.isMesh){const tr=n.material.transparent;n.castShadow=!tr;n.receiveShadow=!tr}});
  lastIds=Object.fromEntries(Object.entries(b).map(([k,v])=>[k,v.id]));
  focus();
 }
 /* camera */
 let started=false,last=0;const PH_MIN=.04,PH_MAX=1.2;const view={th:.55,ph:.26,r:1400,tx:0,ty:230,tz:0},goal={...view};
 function focus(){const L=L0;if(!L)return;const k=document.querySelector('.app').classList.contains('fold')?'sum':step<ORDER.length?ORDER[step]:'sum',big=Math.max(L.D,L.H,L.W*1.4);let t=[0,L.H/2,0],r=big*2.45,th=.55,ph=.22;
  const near=(x,y,z,rr,a,p)=>{t=[x,y,z];r=rr;th=a;ph=p};
  if(k==='mb')near(L.bx+L.bw/2,L.by-L.bh/2,L.zs,big*1.75,.3,.14);
  if(k==='cpu')near(L.sx,L.sy,L.zs,big*1.25,.28,.16);
  if(k==='ram')near(L.rx,L.by-80,L.zs+20,big*1.25,.5,.16);
  if(k==='gpu')near(0,L.gy-30,L.zs+50,big*2.6,.32,.1);
  if(k==='cool')near(L.sx,L.sy,L.zs+60,big*1.6,.75,.3);
  if(k==='ssd')near(L.mx,L.my,L.zs,big*1.3,.25,.14);
  if(k==='psu')near(0,L.H*.3,0,big*2,.45,.12);
  const asp=cam.aspect||1;r*=Math.max(1,1.15/asp);
  goal.tx=t[0];goal.ty=t[1];goal.tz=t[2];goal.r=r;if(!userMoved){goal.th=th;goal.ph=Math.max(PH_MIN,Math.min(PH_MAX,ph))}
  if(reduce){Object.assign(view,goal);started=true}else if(!started){Object.assign(view,goal);view.th=goal.th+1.5;view.r=goal.r*1.7;view.ph=goal.ph+.35;started=true}}
 function place(){const cp=Math.cos(view.ph),th=view.th+Math.sin(clock*.33)*.07*swayK;cam.position.set(view.tx+view.r*Math.sin(th)*cp,view.ty+view.r*Math.sin(Math.max(PH_MIN,view.ph+Math.sin(clock*.21)*.02*swayK)),view.tz+view.r*Math.cos(th)*cp);cam.lookAt(view.tx,view.ty,view.tz)}
 function size(){const w=bench.clientWidth,h=bench.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();focus()}
 if(window.ResizeObserver)new ResizeObserver(size).observe(bench);else addEventListener('resize',size);
 const ptr=new Map();let pinch=0,pull=null;const ray=new T.Raycaster(),v2=new T.Vector2();
 function pick(e){const r=cv.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);const h=ray.intersectObjects(partGroups,true)[0];if(!h)return null;let o=h.object;while(o&&!o.userData.k)o=o.parent;return o?{g:o,k:o.userData.k,d:h.distance}:null}
 cv.addEventListener('pointerdown',e=>{ptr.set(e.pointerId,[e.clientX,e.clientY]);try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(ptr.size===1){const h=pick(e);pull=h?Object.assign(h,{x:e.clientX,y:e.clientY,on:false,can:h.k===ORDER[step]}):null}else pull=null});
 cv.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId)){if(e.pointerType==='mouse'){const h=pick(e);cv.style.cursor=h?(h.k===ORDER[step]?'move':'pointer'):''}return}
  const p=ptr.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];ptr.set(e.pointerId,[e.clientX,e.clientY]);
  if(pull&&ptr.size===1&&pull.can){const mx=e.clientX-pull.x,my=e.clientY-pull.y,far=Math.hypot(mx,my);
   if(!pull.on&&far>8){pull.on=true;bench.classList.add('pull')}
   if(pull.on){const wpp=2*pull.d*Math.tan(cam.fov*Math.PI/360)/cv.clientHeight,rt=new T.Vector3().setFromMatrixColumn(cam.matrixWorld,0),upv=new T.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
    pull.g.position.copy(rt.multiplyScalar(mx*wpp)).addScaledVector(upv,-my*wpp);const ej=far>90;bench.classList.toggle('eject',ej);$('stagemsg').textContent=ej?`ปล่อยเพื่อถอด${META[pull.k].t}ออก`:'ลากออกมาอีกนิดเพื่อถอด';return}}
  if(ptr.size===1){userMoved=true;goal.th-=dx*.008;goal.ph=Math.max(PH_MIN,Math.min(PH_MAX,goal.ph+dy*.008));view.th=goal.th;view.ph=goal.ph}
  else if(ptr.size===2){const a=[...ptr.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch)goal.r=Math.max(250,Math.min(4000,goal.r*pinch/d));pinch=d}});
 const up=e=>{ptr.delete(e.pointerId);pinch=0;if(pull){const mx=e.clientX-pull.x,my=e.clientY-pull.y,far=Math.hypot(mx,my),pl=pull;pull=null;
   if(pl.on){bench.classList.remove('pull','eject');if(far>90&&e.type==='pointerup')removePart(pl.k);else pl.g.position.set(0,0,0)}else if(far<5&&e.type==='pointerup')goPart(pl.k)}};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();goal.r=Math.max(250,Math.min(4000,goal.r*(1+Math.sign(e.deltaY)*.09)))},{passive:false});
 $('view').addEventListener('click',()=>{userMoved=false;focus()});
 const thumbQ=[],tcam=new T.PerspectiveCamera(26,4/3,5,6000),tcv=document.createElement('canvas');
 const DUMMY={n:'',D:450,W:230,H:470,mb:['ATX','mATX','ITX'],gpuMax:999,coolMax:999,slots:7,psu:[],col:'BLACK',glass:true};
 const TDIR={case:[.8,.32,1],mb:[.28,.22,1],cpu:[.35,.55,1],ram:[1,.4,.75],gpu:[.55,-.62,1],cool:[1,.42,.8],ssd:[.25,.6,1],psu:[.7,.42,1]};
 function wantThumb(k,it){const key=k+':'+it.id;if(thumbs.has(key)||thumbQ.some(q=>q.key===key))return;thumbQ.push({key,k,it})}
 function makeThumb(q){const pr=renderer.getPixelRatio(),tw=Math.min(480,cv.width),th=Math.min(360,cv.height,Math.round(tw*.75));if(tw<120||th<90)return false;
  const b=q.k==='case'?{case:q.it}:{case:DUMMY,[q.k]:q.it},L=layout(b),tg=new T.Group(),sp=spinners.length;
  if(q.k==='case'){buildCase(tg,L);buildMb(tg,L,b,true)}else BUILDERS[q.k](tg,L,b);spinners.length=sp;
  tg.traverse(n=>{if(n.isMesh){const tr=n.material.transparent;n.castShadow=!tr;n.receiveShadow=!tr}});
  const bb=new T.Box3().setFromObject(tg),c=bb.getCenter(new T.Vector3()),rad=q.k==='case'?caseRad*.86:bb.getSize(new T.Vector3()).length()/2,d=TDIR[q.k],dir=new T.Vector3(d[0],d[1],d[2]).normalize();
  tcam.aspect=tw/th;tcam.updateProjectionMatrix();tcam.position.copy(c).addScaledVector(dir,rad/Math.sin(tcam.fov*Math.PI/360)*1.04);tcam.lookAt(c);
  root.visible=false;floor.visible=false;deco.visible=false;fxRoot.visible=false;scene.add(tg);
  renderer.setViewport(0,0,tw/pr,th/pr);renderer.setScissor(0,0,tw/pr,th/pr);renderer.setScissorTest(true);renderer.clear();renderer.render(scene,tcam);
  tcv.width=tw;tcv.height=th;const x=tcv.getContext('2d');x.clearRect(0,0,tw,th);x.drawImage(cv,0,cv.height-th,tw,th,0,0,tw,th);
  let url='';try{url=tcv.toDataURL('image/png')}catch(e){}
  renderer.setScissorTest(false);renderer.setViewport(0,0,cv.width/pr,cv.height/pr);scene.remove(tg);dispose(tg);root.visible=true;floor.visible=true;deco.visible=true;fxRoot.visible=true;
  if(url)thumbs.set(q.key,url);return true}
 function tick(now){requestAnimationFrame(tick);
  if(thumbQ.length){let n=0,did=false;while(thumbQ.length&&n<2){if(!makeThumb(thumbQ[0]))break;thumbQ.shift();n++;did=true}if(did)paintThumbs()}const dt=Math.min(.1,((now||0)-last)/1000||.016);last=now||0;const a=1-Math.exp(-dt*7);
  for(const key of['th','ph','r','tx','ty','tz'])view[key]+=(goal[key]-view[key])*a;
  clock+=dt;swayK+=(((ptr.size||pull||reduce)?0:1)-swayK)*Math.min(1,dt*2);
  for(const g of anims){const was=g.userData.t;g.userData.t=Math.min(1,was+dt*2.9);const u=g.userData.t,e=u<.82?1-Math.pow(1-u/.82,3):1+Math.sin((u-.82)/.18*Math.PI)*.035;g.position.z=160*(1-e);if(was<.82&&u>=.82){burst(g.userData.k);flash(g,g.userData.k)}}
  for(const g of shakers){g.userData.shake=Math.max(0,g.userData.shake-dt*2.4);g.position.x=Math.sin(clock*55)*9*g.userData.shake}
  for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.t+=dt;const p=b.pts.geometry.attributes.position;for(let j=0;j<b.vel.length;j+=3){b.vel[j+1]-=900*dt;p.array[j]+=b.vel[j]*dt;p.array[j+1]+=b.vel[j+1]*dt;p.array[j+2]+=b.vel[j+2]*dt}p.needsUpdate=true;const k=Math.max(0,1-b.t/.75);b.pts.material.opacity=k;b.ring.scale.setScalar(30+b.t*520);b.ring.material.opacity=Math.max(0,1-b.t/.5);b.ring.lookAt(cam.position);
   if(b.t>.8){fxRoot.remove(b.pts);fxRoot.remove(b.ring);b.pts.geometry.dispose();b.pts.material.dispose();b.ring.geometry.dispose();b.ring.material.dispose();bursts.splice(i,1)}}
  for(let i=flashes.length-1;i>=0;i--){const f=flashes[i];f.t+=dt;const k=Math.max(0,1-f.t/.55);for(const q of f.ms)q.m.emissiveIntensity=q.i+k*.9;if(k<=0){for(const q of f.ms){q.m.emissive.copy(q.c);q.m.emissiveIntensity=q.i}flashes.splice(i,1)}}
  accCol.lerp(accGoal,Math.min(1,dt*4));glowMat.color.copy(accCol);
  if(!reduce)for(const s of spinners)s.rotation.z+=dt*3;
  place();renderer.render(scene,cam);if(!shown){shown=true;$('loading').hidden=true}}
 window.scene3d={sync,wantThumb,burst};size();tick();
})();

render(true);
