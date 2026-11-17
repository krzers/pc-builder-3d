/* ---------- compatibility rules ---------- */
/* peak draw: CPU peak package power + GPU board power + 75 W for everything else, then 20% headroom */
function power(b){const load=(b.cpu?(b.cpu.ppt||b.cpu.tdp):0)+(b.gpu?b.gpu.tdp:0)+75;return{load,need:Math.ceil(load*1.2/50)*50}}
function ramName(r){return `${r.q*r.gb}GB (${r.q}×${r.gb}GB) ${r.type}`}
function pairs(b){
 const o=[],add=(x,y,msg)=>o.push({x,y,msg});const c=b.case,{mb,cpu,ram,gpu,cool,ssd,psu}=b;
 if(c&&mb&&!c.mb.includes(mb.ff))add('case','mb',`เมนบอร์ดขนาด ${NAME[mb.ff]} ใส่ในเคส ${c.n} ไม่ได้ เคสนี้รับได้เฉพาะขนาด ${c.mb.map(f=>NAME[f]).join(' / ')}`);
 if(c&&gpu&&gpu.len>c.gpuMax)add('case','gpu',`การ์ดจอยาว ${mm(gpu.len)} มม. แต่เคส ${c.n} ใส่ได้ยาวสุด ${mm(c.gpuMax)} มม. (ยาวเกิน ${mm(gpu.len-c.gpuMax)} มม.)`);
 if(c&&gpu&&gpu.sw>c.slots)add('case','gpu',`การ์ดจอหนา ${gpu.sw} ช่อง แต่เคส ${c.n} มีช่องการ์ดด้านหลังแค่ ${c.slots} ช่อง`);
 if(c&&cool&&!cool.aio&&cool.h>c.coolMax)add('case','cool',`ฮีทซิงก์สูง ${mm(cool.h)} มม. แต่เคส ${c.n} รับได้สูงสุด ${mm(c.coolMax)} มม. ฝาข้างจะปิดไม่ลง`);
 if(c&&psu&&c.psu.length&&!c.psu.includes(psu.ff))add('case','psu',`เคส ${c.n} ใส่ได้เฉพาะพาวเวอร์ซัพพลายขนาด ${c.psu.join(' / ')} แต่รุ่นนี้เป็นขนาด ${psu.ff}`);
 if(c&&psu&&c.psuMax&&psu.len>c.psuMax)add('case','psu',`พาวเวอร์ซัพพลายยาว ${psu.len} มม. แต่เคส ${c.n} ใส่ได้ยาวสุด ${c.psuMax} มม.`);
 if(mb&&cpu&&mb.sock!==cpu.sock)add('mb','cpu',`ซีพียูใช้ช่องเสียบแบบ ${cpu.sock} แต่เมนบอร์ดเป็นแบบ ${mb.sock} เสียบกันไม่ได้`);
 if(mb&&ram&&mb.ram!==ram.type)add('mb','ram',`เมนบอร์ดนี้ใช้แรม ${mb.ram} แต่แรมชุดนี้เป็น ${ram.type} ร่องไม่ตรงกัน เสียบไม่ได้`);
 else if(mb&&ram&&ram.q>mb.rs)add('mb','ram',`แรมชุดนี้มี ${ram.q} แถว แต่เมนบอร์ดมีช่องแรม ${mb.rs} ช่อง`);
 else if(mb&&ram&&ram.q*ram.gb>mb.rmax)add('mb','ram',`เมนบอร์ดรองรับแรมรวมสูงสุด ${mb.rmax}GB`);
 if(!mb&&cpu&&ram&&!cpu.ram.includes(ram.type))add('cpu','ram',`ซีพียูนี้ใช้ได้กับแรม ${cpu.ram.join(' / ')} เท่านั้น`);
 const sock=mb?mb.sock:cpu?cpu.sock:null;
 if(cool&&sock&&!cool.socks.includes(sock))add(mb?'mb':'cpu','cool',`ชุดระบายความร้อนรุ่นนี้ยึดกับช่องเสียบซีพียูแบบ ${sock} ไม่ได้`);
 if(mb&&ssd&&mb.m2<1)add('mb','ssd','เมนบอร์ดนี้ไม่มีช่อง M.2 สำหรับ SSD แบบนี้');
 else if(mb&&ssd&&ssd.len&&mb.m2l&&mb.m2l.length&&!mb.m2l.includes(ssd.len))add('mb','ssd',`SSD ตัวนี้ยาว ${ssd.len} มม. แต่ช่อง M.2 ของเมนบอร์ดนี้รองรับความยาว ${mb.m2l.join(' / ')} มม.`);
 if(psu&&(cpu||gpu)){const p=power(b);if(psu.w<p.need)add(gpu?'gpu':'cpu','psu',`เครื่องนี้ใช้ไฟสูงสุดประมาณ ${p.load} วัตต์ ควรใช้พาวเวอร์ซัพพลาย ${p.need} วัตต์ขึ้นไป แต่รุ่นนี้จ่ายได้ ${psu.w} วัตต์`)}
 return o;
}
const idx=k=>ORDER.indexOf(k);
function check(k,item){
 const ps=pairs({...build,[k]:item}).filter(p=>p.x===k||p.y===k),block=[],removes=[];
 for(const p of ps){const other=p.x===k?p.y:p.x;if(idx(other)<idx(k))block.push(p.msg);else if(!removes.includes(other))removes.push(other)}
 return{block,removes};
}
function notes(k,it){
 const c=build.case,o=[];
 if(k==='gpu'&&c){const m=c.gpuMax-it.len;if(m>=0&&m<15)o.push(['warn',`ใส่ได้ แต่พอดีมาก เหลือที่ว่างแค่ ${mm(m)} มม.`])}
 if(k==='cool'&&it.aio)o.push(['warn','ระบบยังไม่ได้เช็กตำแหน่งติดตั้งหม้อน้ำกับเคส ควรดูคู่มือเคสประกอบ']);
 if(k==='cool'&&!it.aio&&c){const m=c.coolMax-it.h;if(m>=0&&m<5)o.push(['warn',`ใส่ได้ แต่พอดีมาก เหลือที่ว่าง ${mm(m)} มม.`])}
 return o;
}
const optional=k=>(k==='gpu'&&build.cpu&&!!build.cpu.ig)||(k==='cool'&&build.cpu&&build.cpu.fan);
const filled=k=>!!build[k]||optional(k);
const maxStep=()=>{for(let i=0;i<ORDER.length;i++)if(!filled(ORDER[i]))return i;return ORDER.length};


