/* ---------- UI ---------- */
function toast(msg,canUndo){const t=$('toast');t.innerHTML=esc(msg)+(canUndo?'<button type="button" id="undo">เลิกทำ</button>':'');t.classList.toggle('act',!!canUndo);t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on','act'),canUndo?8000:4200)}
let undoSnap=null;
const snap=()=>{undoSnap={build:{...build},step,isSample}};
function undo(){if(!undoSnap)return;build=undoSnap.build;step=undoSnap.step;isSample=undoSnap.isSample;undoSnap=null;preview=null;$('toast').classList.remove('on','act');save();sfx.step();render(true)}
function save(){try{localStorage.setItem('pcb3d',JSON.stringify(Object.fromEntries(Object.entries(build).map(([k,v])=>[k,v.id]))))}catch(e){}
 try{history.replaceState(null,'','#'+buildHash())}catch(e){}}
function select(k,it,dropped){
 const r=check(k,it);
 if(r.block.length){preview={k,it};if(dropped)toast(r.block[0]);sfx.bad();fx('bad');render();return}
 snap();preview=null;build[k]=it;isSample=false;
 const gone=[];let guard=0;
 for(;;){const ps=pairs(build);if(!ps.length||guard++>12)break;const p=ps[0];const later=idx(p.x)>idx(p.y)?p.x:p.y;gone.push(META[later].t);delete build[later]}
 if(gone.length)toast(`นำ${[...new Set(gone)].join(' และ')}ออกแล้ว เพราะใส่กับ${META[k].t}ชิ้นใหม่ไม่ได้ เลือกใหม่ได้ในขั้นถัดไป`,true);
 save();sfx.place(build.case&&k!=='case'&&!reduceUI?.3:0);if(k==='case')fx('ok');justSel=true;render();justSel=false;
}
function removePart(k){if(!build[k])return;snap();sfx.remove();if(window.scene3d)scene3d.burst(k);delete build[k];isSample=false;preview=null;save();step=Math.min(step,maxStep());toast(`ถอด${META[k].t}ออกแล้ว ลากการ์ดจากชั้นวางมาใส่ชิ้นใหม่ได้เลย`,true);render()}
function goPart(k){if(idx(k)!==step)go(idx(k))}
function go(i){const was=step;step=Math.max(0,Math.min(i,maxStep()));preview=null;userMoved=false;render(true);
 if(step!==was){if(step===ORDER.length){const sig=ORDER.map(k=>build[k]?build[k].id:'').join();if(sig!==celebrated){celebrated=sig;sfx.win();confetti();fx('ok')}else sfx.step()}else sfx.step()}}
let justSel=false,railIds={},pickerDismissed=false;
function openPicker(){$('pks').innerHTML=presetsHTML();$('picker').hidden=false}
function paintThumbs(){document.querySelectorAll('img[data-thumb]:not([src])').forEach(im=>{const key=im.dataset.thumb,u=thumbs.get(key);if(u){im.src=u;if(im.parentNode.classList.contains('pic'))im.parentNode.classList.add('ready')}else if(window.scene3d){const[k,id]=key.split(':');const it=DATA[k].find(x=>x.id===id);if(it)scene3d.wantThumb(k,it)}})}
function renderRail(){
 const ms=maxStep();
 $('rail').innerHTML=ORDER.map((k,i)=>{const it=build[k];const jn=it&&railIds[k]!==undefined&&railIds[k]!==it.id;return `<button class="slot ${i===step?'cur':''} ${it?'full':''} ${jn?'just':''}" style="--c:${ACC[k][0]}" type="button" data-i="${i}" ${i>ms?'disabled':''} ${i===step?'aria-current="step"':''} aria-label="ขั้นที่ ${i+1} ${META[k].t}${it?' ใส่แล้ว':''}"><span class="sq">${it?`<img data-thumb="${k}:${it.id}" alt="">`:''}<b>${i+1}</b></span><span class="lb">${META[k].s}</span></button>`}).join('')
  +`<button class="slot ${step===ORDER.length?'cur':''}" style="--c:${ACC.sum[0]}" type="button" data-i="${ORDER.length}" ${ms<ORDER.length?'disabled':''}><span class="sq"><b>${ORDER.length+1}</b></span><span class="lb">สรุป</span></button>`;
 railIds=Object.fromEntries(ORDER.map(k=>[k,build[k]?build[k].id:'']));
 const cur=$('rail').querySelector('.cur');if(cur&&cur.scrollIntoView&&innerWidth<=980)cur.scrollIntoView({block:'nearest',inline:'center'});
}
let io=null;
function renderPanel(fresh){
 const k=step<ORDER.length?ORDER[step]:'sum',m=META[k],L=$('list');
 const tot=ORDER.length+1,pool=k==='sum'?[]:DATA[k].filter(it=>passAll(k,it)),nb=pool.filter(it=>check(k,it).block.length).length,na=pool.length-nb;
 $('ph').innerHTML=`<div class="prog" aria-hidden="true">${[...Array(tot).keys()].map(i=>`<i class="${i===step?'c':(i<ORDER.length&&build[ORDER[i]])?'d':''}"></i>`).join('')}</div>${isSample?'<div class="eb"><em>สเปคตัวอย่าง</em></div>':''}<h1>${m.h}</h1><p>${m.p}</p>${k==='sum'?'':`<div class="cnt"><span><b>${na}</b>รุ่นที่ใส่ได้</span>${nb?`<span class="x"><b>${nb}</b>รุ่นใส่ไม่ได้</span>`:''}</div>`}${fmtBar(k)}`;
 APP.style.setProperty('--acc',ACC[k][0]);APP.style.setProperty('--acc-ink',ACC[k][1]);
 if(fresh){const ph=$('ph');ph.classList.remove('enter');void ph.offsetWidth;ph.classList.add('enter')}
 const tl=$('tools');tl.hidden=k==='sum';if(k!=='sum'&&tl.dataset.k!==k){tl.dataset.k=k;$('q').value=qs[k]||'';$('sort').innerHTML='<option value="">เรียงตามค่าเริ่มต้น</option>'+SORTS[k].map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('');$('sort').value=sorts[k]||''}
 const SC=$('scroll'),keep=fresh?0:SC.scrollTop;
 if(k==='sum'){L.innerHTML=summaryHTML()}
 else{
  const ok=[],bad=[];
  DATA[k].forEach((it,i)=>{if(!passAll(k,it))return;const r=check(k,it);(r.block.length?bad:ok).push({it,i,r})});
  const card=({it,i,r})=>{
   const d=describe(k,it),sel=build[k]&&build[k].id===it.id,lock=r.block.length>0,pv=preview&&preview.k===k&&preview.it.id===it.id;
   let extra='';
   if(lock)extra=`<div class="why">${SVG.lock}<span>${esc(r.block[0])}</span></div>${pv?'':'<div class="see">แตะเพื่อดูว่าติดตรงไหน</div>'}`;
   else{
    if(r.removes.length&&!sel)extra+=`<div class="note">${SVG.warn}<span>ถ้าเลือกชิ้นนี้ ต้องเลือก${r.removes.map(x=>META[x].t).join(' และ')}ใหม่</span></div>`;
    for(const[,msg]of notes(k,it))extra+=`<div class="note">${SVG.warn}<span>${esc(msg)}</span></div>`;
   }
   return `<div class="card ${sel?'sel':''} ${lock?'lock':''} ${pv?'pv':''}" role="button" tabindex="0" data-k="${k}" data-i="${i}" aria-pressed="${!!sel}"><div class="pic"><img data-thumb="${k}:${it.id}" alt="" draggable="false">${k==='case'?`<span class="fmt">${it.mb.length>1?NAME[it.mb[0]]+' ถึง '+NAME[it.mb[it.mb.length-1]]:NAME[it.mb[0]]}</span>`:k==='mb'||k==='psu'?`<span class="fmt">${NAME[it.ff]||it.ff}</span>`:''}${sel?'<span class="tag on">ใส่อยู่</span>':lock?`<span class="tag no">${SVG.lock}ใส่ไม่ได้</span>`:'<span class="grip">ลากไปวาง</span>'}</div><div class="tx"><div class="n">${esc(d.n)}</div><div class="sub">${esc(d.sub)}</div><dl>${d.sp.map(s=>`<dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd>`).join('')}</dl>${it.p?`<div class="pr">${baht(it.p)}</div>`:''}${extra}</div></div>`;
  };
  if(sorts[k]&&CMP[sorts[k]]){const f=(a,b)=>CMP[sorts[k]](a.it,b.it);ok.sort(f);bad.sort(f)}
  let h='<div class="grid">';
  if(!ok.length&&!bad.length)h+=`<div class="none"><span>ไม่พบรุ่นที่ตรงกับ${qs[k]?` "${esc(qs[k])}"`:'ตัวกรองนี้'}</span><button type="button" data-act="clearq">ล้างการค้นหาและตัวกรอง</button></div>`;
  if(optional(k))h+=`<div class="skip">${SVG.ok}<span>${k==='gpu'?'ซีพียูที่เลือกมีกราฟิกในตัว ข้ามขั้นนี้ได้ถ้าไม่เล่นเกมหนัก':'ซีพียูที่เลือกมีพัดลมแถมในกล่อง ข้ามขั้นนี้ได้'}</span></div>`;
  h+=ok.map(card).join('');
  if(bad.length)h+=`<div class="sec">${SVG.lock} ใส่กับเครื่องนี้ไม่ได้ ${bad.length} รุ่น</div>`+bad.map(card).join('');
  L.innerHTML=h+'</div>';
 }
 SC.scrollTop=keep;
 if(io)io.disconnect();
 if(fresh&&!reduceUI&&window.IntersectionObserver&&k!=='sum'){
  let first=true;io=new IntersectionObserver(es=>{let n=0;for(const e of es)if(e.isIntersecting){e.target.style.setProperty('--d',(first?n*55:(n%2)*60)+'ms');n++;e.target.classList.add('in');io.unobserve(e.target)}first=false},{root:SC,rootMargin:'0px 0px -6% 0px',threshold:.08});
  L.querySelectorAll('.card').forEach(c=>{c.classList.add('pre');io.observe(c)});
 }
 const nx=$('next');$('back').style.visibility=step?'visible':'hidden';nx.classList.remove('go');nx.classList.toggle('cp',k==='sum');if(justSel){void nx.offsetWidth;nx.classList.add('go')}
 if(k==='sum'){nx.textContent='แชร์ลิงก์สเปคนี้';nx.disabled=false}
 else{const nk=step+1<ORDER.length?ORDER[step+1]:'sum';nx.disabled=!filled(k);nx.textContent=!build[k]&&optional(k)?'ข้ามขั้นนี้':build[k]?(nk==='sum'?'ดูสรุปเครื่อง':`ถัดไป: ${META[nk].t}`):`เลือก${META[k].t}ก่อน`}
}
function summaryHTML(){
 const b=build,p=power(b),c=b.case;
 const rows=ORDER.map((k,i)=>{const it=b[k];const d=it?describe(k,it):null;return `<div class="row"><span class="th">${it?`<img data-thumb="${k}:${it.id}" alt="">`:''}</span><span class="x">${it?esc(k==='ram'?it.n+' '+ramName(it):d.n):'ไม่ได้ใส่'+META[k].t}<small>${it?esc(META[k].t+' · '+(k==='ram'?it.sp+' MHz':d.sub)):(k==='gpu'?'ใช้กราฟิกในตัวซีพียู':'ใช้พัดลมที่แถมมากับซีพียู')}</small></span><button type="button" data-go="${i}">เปลี่ยน</button></div>`}).join('');
 const ck=[];
 if(b.mb&&c)ck.push(`เมนบอร์ดขนาด ${NAME[b.mb.ff]} อยู่ในขนาดที่เคสรองรับ (${c.mb.map(f=>NAME[f]).join(' / ')})`);
 if(b.cpu&&b.mb)ck.push(`ซีพียูกับเมนบอร์ดใช้ช่องเสียบ ${b.mb.sock} ตรงกัน`);
 if(b.ram&&b.mb)ck.push(`แรม ${b.ram.type} ตรงกับเมนบอร์ด ใช้ ${b.ram.q} จาก ${b.mb.rs} ช่อง`);
 if(b.ssd&&b.mb&&b.mb.m2l&&b.mb.m2l.length)ck.push(`SSD ขนาด M.2 22${b.ssd.len} อยู่ในความยาวที่ช่องบนเมนบอร์ดรองรับ`);
 if(b.gpu&&c)ck.push(`การ์ดจอยาว ${mm(b.gpu.len)} มม. เคสรับได้ ${mm(c.gpuMax)} มม. เหลือที่ว่าง ${mm(c.gpuMax-b.gpu.len)} มม.`);
 if(b.cool&&!b.cool.aio&&c)ck.push(`ฮีทซิงก์สูง ${mm(b.cool.h)} มม. เคสรับได้ ${mm(c.coolMax)} มม.`);
 if(b.psu)ck.push(`เครื่องใช้ไฟประมาณ ${p.load} วัตต์ พาวเวอร์ซัพพลายจ่ายได้ ${b.psu.w} วัตต์`);
 const warn=b.cool&&b.cool.aio?`<div class="note">${SVG.warn}<span>ยังไม่ได้เช็กตำแหน่งติดตั้งหม้อน้ำกับเคส ควรดูคู่มือเคสประกอบ</span></div>`:'';
 return `<div class="sum"><div class="verdict">${SVG.ok}<span>ทุกชิ้นใส่ด้วยกันได้ ผ่านการเช็ก ${ck.length} ข้อ</span></div>${warn}<div class="acts">${CTA.url?`<a class="btn" href="${esc(CTA.url)}" target="_blank" rel="noopener">${esc(CTA.label)}</a>`:''}<button type="button" class="btn ${CTA.url?'sec2':''}" data-act="link">แชร์ลิงก์สเปคนี้</button><button type="button" class="btn sec2" data-act="list">คัดลอกรายการ</button></div><div>${rows}</div>${(()=>{const ps=ORDER.filter(k=>b[k]&&b[k].p);if(!ps.length)return'';const t=ps.reduce((a,k)=>a+b[k].p,0),miss=ORDER.filter(k=>b[k]&&!b[k].p).length;return `<div class="total"><span>รวม${miss?` (ยังไม่รวม ${miss} ชิ้นที่ไม่มีราคา)`:''}</span><b>${baht(t)}</b></div>`})()}<h2>สิ่งที่ระบบเช็กให้แล้ว</h2><ul class="checks">${ck.map(x=>`<li>${SVG.ok}<span>${esc(x)}</span></li>`).join('')}</ul><p class="fine">ค่ากินไฟเป็นค่าประมาณตอนใช้งานหนักสุด คิดจากกำลังไฟสูงสุดของซีพียูและการ์ดจอ บวกชิ้นส่วนอื่นอีก 75 วัตต์ แล้วเผื่อ 20% ต้นแบบนี้ยังไม่มีราคาและสต็อกของร้านในไทย รูปบนการ์ดถ่ายจากโมเดล 3D ไม่ใช่รูปสินค้าจริง</p><p class="fine">ข้อมูลสเปค ${Object.values(DATA).reduce((a,v)=>a+v.length,0)} รายการ คัดมาจาก <a href="https://github.com/buildcores/buildcores-open-db">BuildCores OpenDB</a> สัญญาอนุญาต <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> ตั้งชื่อย่อและแปลคำอธิบายเป็นภาษาไทย ใช้เพื่อการสาธิต ไม่ใช่เชิงพาณิชย์</p></div>`;
}
function gauge(label,val,max,unit,state,sub){const pct=Math.min(100,val/max*100);return `<div class="gauge ${state||''}"><div class="l">${label}</div><div class="v">${mm(val)} <small>/ ${mm(max)} ${unit}</small></div><div class="bar"><span style="width:${pct}%"></span></div>${sub?`<div class="s">${sub}</div>`:''}</div>`}
function renderHud(){
 $('foldtx').textContent=step<ORDER.length?'เลือก'+META[ORDER[step]].t:'สรุป';
 const k=step<ORDER.length?ORDER[step]:'sum',c=build.case;let h='';
 const pv=preview&&preview.k===k?preview.it:null,it=pv||build[k];
 if(k==='gpu'&&it&&c){const over=it.len>c.gpuMax;h+=gauge('ความยาวการ์ดจอ เทียบกับที่เคสรับได้',it.len,c.gpuMax,'มม.',over?'bad':c.gpuMax-it.len<15?'warn':'',over?`ยาวเกิน ${mm(it.len-c.gpuMax)} มม. ใส่ไม่ได้`:`เหลือที่ว่าง ${mm(c.gpuMax-it.len)} มม.`)}
 if(k==='cool'&&it&&!it.aio&&c){const over=it.h>c.coolMax;h+=gauge('ความสูงฮีทซิงก์ เทียบกับที่เคสรับได้',it.h,c.coolMax,'มม.',over?'bad':'',over?`สูงเกิน ${mm(it.h-c.coolMax)} มม. ฝาข้างปิดไม่ลง`:`เหลือที่ว่าง ${mm(c.coolMax-it.h)} มม.`)}
 if(k==='ram'&&it&&build.mb&&it.type===build.mb.ram){const over=it.q>build.mb.rs;h+=gauge('ช่องแรมที่ใช้',it.q,build.mb.rs,'ช่อง',over?'bad':'',over?'แถวแรมมากกว่าช่องบนเมนบอร์ด':`รวม ${it.q*it.gb}GB`)}
 if((k==='psu'||k==='sum')&&(build.cpu||build.gpu)){const b2=pv?{...build,psu:pv}:build,p=power(b2),ps=b2.psu;if(ps){const bad=ps.w<p.need;h+=gauge('ไฟที่เครื่องใช้ เทียบกับที่จ่ายได้',p.load,ps.w,'วัตต์',bad?'bad':'',bad?`ควรใช้ ${p.need} วัตต์ขึ้นไป`:`เผื่อไว้ ${ps.w-p.load} วัตต์`)}else h+=`<div class="gauge plain"><div class="l">ไฟที่เครื่องนี้ใช้โดยประมาณ</div><div class="v">${p.load} <small>วัตต์</small></div><div class="s">ควรเลือกรุ่น ${p.need} วัตต์ขึ้นไป</div></div>`}
 if(k==='case'&&c)h+=`<div class="gauge plain"><div class="l">ขนาดเคส (ลึก × กว้าง × สูง)</div><div class="v">${Math.round(c.D/10)} × ${Math.round(c.W/10)} × ${Math.round(c.H/10)} <small>ซม.</small></div></div>`;
 $('hud').innerHTML=h;
}
function render(fresh){renderRail();renderPanel(fresh);renderHud();if(!build.case&&!pickerDismissed)openPicker();if(window.scene3d)scene3d.sync();paintThumbs()}

/* clicks */
$('ph').addEventListener('click',e=>{const b=e.target.closest('.fm');if(!b||b.disabled)return;const k=ORDER[step];fmt[k]=fmt[k]===b.dataset.f?null:b.dataset.f;preview=null;sfx.tick();render(true)});
let suppressClick=false;
$('rail').addEventListener('click',e=>{const b=e.target.closest('.slot');if(!b||b.disabled)return;const i=+b.dataset.i;if(i===step)setFold(!APP.classList.contains('fold'));else{setFold(false);go(i)}});
const LIST=$('list');
function cardItem(c){return{k:c.dataset.k,it:DATA[c.dataset.k][+c.dataset.i]}}
LIST.addEventListener('click',e=>{if(suppressClick){suppressClick=false;return}const g=e.target.closest('[data-go]');if(g){go(+g.dataset.go);return}const ac=e.target.closest('[data-act]');if(ac){sfx.tick();if(ac.dataset.act==='clearq'){const k=ORDER[step];qs[k]='';fmt[k]=null;$('q').value='';render(true);return}if(ac.dataset.act==='link')copyText(shareUrl(),'คัดลอกลิงก์แล้ว ส่งให้ใครก็เปิดเห็นสเปคนี้');else copyText(listText(),'คัดลอกรายการสเปคแล้ว');return}const c=e.target.closest('.card');if(c){const{k,it}=cardItem(c);select(k,it)}});
LIST.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const c=e.target.closest('.card');if(c){e.preventDefault();const{k,it}=cardItem(c);select(k,it)}});
$('back').addEventListener('click',()=>go(step-1));
$('q').addEventListener('input',()=>{qs[ORDER[step]]=$('q').value.trim();renderPanel(false);$('scroll').scrollTop=Math.min($('scroll').scrollTop,$('ph').offsetHeight);paintThumbs()});
$('sort').addEventListener('change',()=>{sorts[ORDER[step]]=$('sort').value;sfx.tick();renderPanel(true);paintThumbs()});
$('picker').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(b){applyPreset(+b.dataset.preset);return}if(e.target.id==='pkx'||e.target===$('picker')){$('picker').hidden=true;pickerDismissed=true;sfx.tick()}});
$('pkopen').addEventListener('click',()=>{sfx.tick();pickerDismissed=false;openPicker()});
$('toast').addEventListener('click',e=>{if(e.target.id==='undo')undo()});
/* never leave a card hidden while it is on screen, even if the observer is late */
$('scroll').addEventListener('scroll',()=>{const b=$('scroll').getBoundingClientRect().bottom;LIST.querySelectorAll('.card.pre:not(.in)').forEach(c=>{if(c.getBoundingClientRect().top<b)c.classList.add('in')})},{passive:true});
$('next').addEventListener('click',()=>{
 if(step<ORDER.length){go(step+1);return}
 sfx.tick();copyText(shareUrl(),'คัดลอกลิงก์แล้ว ส่งให้ใครก็เปิดเห็นสเปคนี้');
});
function sndLabel(){$('snd').textContent=SND.on?'เสียง เปิด':'เสียง ปิด';$('snd').setAttribute('aria-pressed',String(SND.on))}
sndLabel();$('snd').addEventListener('click',()=>{SND.on=!SND.on;try{localStorage.setItem('pcb3d-snd',SND.on?'1':'0')}catch(e){}sndLabel();if(SND.on)sfx.tick()});
$('reset').addEventListener('click',()=>{pickerDismissed=false;snap();sfx.remove();build={};preview=null;isSample=false;step=0;save();render(true);toast('ล้างสเปคแล้ว เริ่มจากเลือกเคสได้เลย',true)});

function setFold(f){if(APP.classList.contains('fold')===f)return;APP.classList.toggle('fold',f);$('fold').setAttribute('aria-expanded',String(!f));$('fold').setAttribute('aria-label',f?'แสดงรายการชิ้นส่วน':'ซ่อนรายการชิ้นส่วน');$('shelf').inert=f;sfx.fold();userMoved=false;if(window.scene3d)scene3d.sync()}
$('fold').addEventListener('click',()=>setFold(!APP.classList.contains('fold')));
$('fold').setAttribute('aria-label','ซ่อนรายการชิ้นส่วน');
/* drag a card onto the stage */
let drag=null;const BENCH=$('bench');
function overBench(x,y){const r=BENCH.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom}
function startDrag(x,y){drag.on=true;sfx.grab();const d=describe(drag.k,drag.it),g=document.createElement('div');g.id='dragghost';const u=thumbs.get(drag.k+':'+drag.it.id);
 g.innerHTML=u?`<img src="${u}" alt="">`:`<span class="nm">${esc(d.n)}</span>`;document.body.appendChild(g);drag.g=g;document.body.classList.add('dragging');
 drag.blocked=check(drag.k,drag.it).block.length>0;moveDrag(x,y)}
function moveDrag(x,y){drag.g.style.transform=`translate(${x}px,${y}px) translate(-50%,-55%)`;const ov=overBench(x,y);if(ov===drag.over)return;drag.over=ov;
 BENCH.classList.toggle('drop',ov);$('stagemsg').textContent=drag.blocked?'ชิ้นนี้ใส่กับเครื่องนี้ไม่ได้':`ปล่อยเพื่อใส่${META[drag.k].t}`;BENCH.classList.toggle('eject',ov&&drag.blocked);
 if(drag.k!=='case'){preview=ov?{k:drag.k,it:drag.it}:null;renderHud();if(window.scene3d)scene3d.sync()}}
function stopDrag(){if(drag&&drag.g)drag.g.remove();document.body.classList.remove('dragging');BENCH.classList.remove('drop','eject')}
LIST.addEventListener('pointerdown',e=>{const c=e.target.closest('.card');if(!c||e.button>0)return;const{k,it}=cardItem(c);drag={k,it,x:e.clientX,y:e.clientY,on:false,touch:e.pointerType!=='mouse',id:e.pointerId,over:false};
 if(drag.touch)drag.timer=setTimeout(()=>{if(drag&&!drag.on)startDrag(drag.x,drag.y)},330)});
addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(!drag.on){if(drag.touch){if(Math.hypot(dx,dy)>10){clearTimeout(drag.timer);drag=null}return}if(Math.hypot(dx,dy)<8)return;startDrag(e.clientX,e.clientY)}
 moveDrag(e.clientX,e.clientY)});
function endDrag(e,cancel){if(!drag)return;clearTimeout(drag.timer);const d=drag;if(d.on){stopDrag();drag=null;suppressClick=true;setTimeout(()=>suppressClick=false,60);
  if(!cancel&&overBench(e.clientX,e.clientY)){preview=null;select(d.k,d.it,true)}else{preview=null;renderHud();if(window.scene3d)scene3d.sync()}}drag=null}
addEventListener('pointerup',e=>endDrag(e,false));addEventListener('pointercancel',e=>endDrag(e,true));
LIST.addEventListener('touchmove',e=>{if(drag&&drag.on)e.preventDefault()},{passive:false});
LIST.addEventListener('contextmenu',e=>{if(drag)e.preventDefault()});

(function init(){
 const shared=readHash();let saved=null;try{saved=JSON.parse(localStorage.getItem('pcb3d')||'null')}catch(e){}
 if(shared){build=shared;if(pairs(build).length)build={};else step=maxStep()}
 else if(saved&&Object.keys(saved).length){for(const k of ORDER){const it=DATA[k].find(x=>x.id===saved[k]);if(it)build[k]=it}}
 else{for(const k of ORDER)build[k]=DATA[k].find(x=>x.n===SAMPLE[k]);isSample=true}
 if(pairs(build).length){build={};isSample=false}
 let seen=false;try{seen=!!localStorage.getItem('pcb3d-seen')}catch(e){}
 if(!seen&&!shared)$('coach').hidden=false;
 $('coachok').addEventListener('click',()=>{$('coach').hidden=true;try{localStorage.setItem('pcb3d-seen','1')}catch(e){}});
})();

