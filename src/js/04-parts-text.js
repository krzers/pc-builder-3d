/* ---------- item text ---------- */
const SIZE={ITX:'เล็ก',mATX:'กลาง',ATX:'มาตรฐาน',EATX:'ใหญ่พิเศษ'};
const NAME={ITX:'Mini-ITX',mATX:'Micro-ATX',ATX:'ATX',EATX:'E-ATX',SFX:'SFX','SFX-L':'SFX-L'};
/* standard formats: [code, width mm, height mm] used for the filter bar and its to-scale icons */
const FORMATS={case:[['ITX',170,170],['mATX',244,244],['ATX',244,305],['EATX',277,305]],mb:[['ITX',170,170],['mATX',244,244],['ATX',244,305],['EATX',277,305]],psu:[['SFX',125,63.5],['ATX',150,86]]};
const FLABEL={case:'ใส่เมนบอร์ดขนาด',mb:'ขนาดเมนบอร์ด',psu:'ขนาดพาวเวอร์ซัพพลาย'};
const fmt={case:null,mb:null,psu:null};
const qs={},sorts={};
const SORTS={case:[['gpuMax','การ์ดจอยาวได้มากสุด'],['vol','เล็กสุดก่อน']],mb:[['m2','ช่อง SSD มากสุด']],cpu:[['c','คอร์มากสุด'],['tdp','กินไฟน้อยสุด']],ram:[['cap','ความจุมากสุด'],['sp','เร็วสุด']],gpu:[['len','สั้นสุดก่อน'],['vram','หน่วยความจำภาพมากสุด'],['tdp','กินไฟน้อยสุด']],cool:[['h','เตี้ยสุดก่อน']],ssd:[['gb','ความจุมากสุด']],psu:[['w','วัตต์มากสุด'],['wlow','วัตต์น้อยสุด']]};
const CMP={gpuMax:(a,b)=>b.gpuMax-a.gpuMax,vol:(a,b)=>a.D*a.W*a.H-b.D*b.W*b.H,m2:(a,b)=>b.m2-a.m2,c:(a,b)=>b.c-a.c,tdp:(a,b)=>a.tdp-b.tdp,cap:(a,b)=>b.q*b.gb-a.q*a.gb,sp:(a,b)=>b.sp-a.sp,len:(a,b)=>a.len-b.len,vram:(a,b)=>b.vram-a.vram,h:(a,b)=>(a.aio?999:a.h)-(b.aio?999:b.h),gb:(a,b)=>b.gb-a.gb,w:(a,b)=>b.w-a.w,wlow:(a,b)=>a.w-b.w};
const hay=(k,it)=>{const d=describe(k,it);return [d.n,d.sub,it.n,it.full,it.chip,it.sock,it.ff&&NAME[it.ff],it.type].filter(Boolean).join(' ').toLowerCase()};
const passQ=(k,it)=>!qs[k]||qs[k].toLowerCase().split(/\s+/).every(w=>hay(k,it).includes(w));
const passAll=(k,it)=>passFmt(k,it)&&passQ(k,it);
const passFmt=(k,it)=>!fmt[k]||(k==='case'?it.mb.includes(fmt[k]):it.ff===fmt[k]);
function fmtBar(k){if(!FORMATS[k])return'';const c=build.case;
 return `<div class="fmts" role="group" aria-label="${FLABEL[k]}"><span class="fl">${FLABEL[k]}</span>`+FORMATS[k].map(([f,w,h])=>{const n=DATA[k].filter(it=>k==='case'?it.mb.includes(f):it.ff===f).length,na=k==='mb'&&c&&!c.mb.includes(f)||k==='psu'&&c&&c.psu.length&&!c.psu.includes(f),sc=k==='psu'?7:13;
  return `<button type="button" class="fm ${fmt[k]===f?'on':''} ${na?'na':''}" data-f="${f}" ${n?'':'disabled'} aria-pressed="${fmt[k]===f}"><i style="width:${Math.round(w/sc)}px;height:${Math.round(h/sc)}px"></i><b>${NAME[f]||f}</b><small>${na?'เคสนี้ไม่รองรับ':`${(w/10).toLocaleString('th-TH')} × ${(h/10).toLocaleString('th-TH')} ซม.`}</small></button>`}).join('')+'</div>'}
function describe(k,it){
 switch(k){
 case'case':return{n:it.n,sub:`${Math.round(it.D/10)} × ${Math.round(it.W/10)} × ${Math.round(it.H/10)} ซม. · ${it.mb.includes('EATX')?'เคสขนาดใหญ่':it.mb.includes('ATX')?'เคสขนาดกลาง':it.mb.includes('mATX')?'เคสขนาดเล็ก':'เคสจิ๋ว'}`,sp:[['การ์ดจอยาวได้',`${mm(it.gpuMax)} มม.`],['ฮีทซิงก์สูงได้',`${mm(it.coolMax)} มม.`],['เมนบอร์ดใหญ่สุด',NAME[it.mb[it.mb.length-1]]]]};
 case'mb':return{n:it.n,sub:`สำหรับซีพียู ${it.sock.startsWith('AM')?'AMD':'Intel'} (${it.sock})`,sp:[['ขนาด',`${NAME[it.ff]} (${SIZE[it.ff]})`],['แรม',`${it.ram} · ${it.rs} ช่อง`],['ช่อง SSD',`${it.m2} ช่อง`]]};
 case'cpu':return{n:it.n,sub:`${it.c} คอร์ ${it.t} เธรด`,sp:[['กราฟิกในตัว',it.ig?'มี':'ไม่มี'],['พัดลมแถม',it.fan?'มี':'ไม่มี'],['กินไฟสูงสุด',`~${it.ppt||it.tdp} W`]]};
 case'ram':return{n:`${it.q*it.gb}GB (${it.q} แถว × ${it.gb}GB)`,sub:it.n,sp:[['ชนิด',it.type],['ความเร็ว',`${it.sp} MHz`]]};
 case'gpu':return{n:it.n,sub:`${it.chip} · หน่วยความจำภาพ ${it.vram}GB`,sp:[['ยาว',`${mm(it.len)} มม.`],['หนา',`${it.sw} ช่อง`],['กินไฟ',`~${it.tdp} W`]]};
 case'cool':return{n:it.n,sub:it.aio?'แบบหม้อน้ำ':it.h<80?'แบบพัดลม ทรงเตี้ย':'แบบพัดลม ทรงทาวเวอร์',sp:it.aio?[['หม้อน้ำ',`${it.rad} มม.`]]:[['สูง',`${mm(it.h)} มม.`]]};
 case'ssd':return{n:it.n,sub:`ความจุ ${it.gb>=1000?it.gb/1000+'TB':it.gb+'GB'}`,sp:[['ขนาด',`M.2 22${it.len}`],['ยาว',`${it.len} มม.`],['ความเร็ว',it.iface]]};
 case'psu':return{n:it.n,sub:`จ่ายไฟได้ ${it.w} วัตต์`,sp:[['ขนาด',it.ff],...(it.eff?[['มาตรฐาน',it.eff]]:[]),['สาย',it.mod==='Full'?'ถอดได้':'ติดตัวเครื่อง']]};
 }
}
