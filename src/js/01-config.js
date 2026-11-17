const DATA=/*DATA*/;
const ORDER=['case','mb','cpu','ram','gpu','cool','ssd','psu'];
const META={
 case:{t:'เคส',s:'เคส',h:'เลือกเคส',p:'กล่องที่ใส่ทุกชิ้นส่วน ขนาดเคสกำหนดว่าชิ้นส่วนใหญ่แค่ไหนถึงจะใส่ได้'},
 mb:{t:'เมนบอร์ด',s:'เมนบอร์ด',h:'เลือกเมนบอร์ด',p:'แผงวงจรหลักที่ทุกชิ้นมาเสียบ เป็นตัวกำหนดว่าใช้ซีพียูและแรมแบบไหนได้'},
 cpu:{t:'ซีพียู',s:'ซีพียู',h:'เลือกซีพียู',p:'สมองของเครื่อง ยิ่งมีคอร์มาก ยิ่งทำงานหลายอย่างพร้อมกันได้ดี'},
 ram:{t:'แรม',s:'แรม',h:'เลือกแรม',p:'พื้นที่ทำงานชั่วคราวของเครื่อง ยิ่งมาก ยิ่งเปิดหลายโปรแกรมพร้อมกันได้ลื่น'},
 gpu:{t:'การ์ดจอ',s:'การ์ดจอ',h:'เลือกการ์ดจอ',p:'ตัวสร้างภาพขึ้นจอ สำคัญที่สุดสำหรับเล่นเกมและงานกราฟิก'},
 cool:{t:'ชุดระบายความร้อน',s:'ระบายร้อน',h:'เลือกชุดระบายความร้อน',p:'ช่วยไม่ให้ซีพียูร้อนเกินไป มีทั้งแบบพัดลมและแบบหม้อน้ำ'},
 ssd:{t:'SSD',s:'SSD',h:'เลือก SSD',p:'ที่เก็บ Windows เกม และไฟล์ทั้งหมดของคุณ'},
 psu:{t:'พาวเวอร์ซัพพลาย',s:'จ่ายไฟ',h:'เลือกพาวเวอร์ซัพพลาย',p:'ตัวจ่ายไฟให้ทั้งเครื่อง ต้องมีกำลังวัตต์มากพอสำหรับชิ้นส่วนที่เลือกไว้'},
 sum:{t:'สรุป',s:'สรุป',h:'เครื่องของคุณ',p:'ตรวจรายการทั้งหมดอีกครั้ง กด "เปลี่ยน" เพื่อกลับไปแก้ชิ้นไหนก็ได้'}
};
const SAMPLE={case:'Corsair 4000D Airflow',mb:'MSI MAG B650 Tomahawk WiFi',cpu:'AMD Ryzen 5 7600',ram:'Corsair Vengeance',gpu:'MSI RTX 5070 Shadow 3X',cool:'Thermalright Peerless Assassin 120 SE',ssd:'WD Black SN770',psu:'Corsair RM750e'};
let build={},step=0,preview=null,isSample=false;
/* starter builds, one per size class; ids come from data/parts.json and are checked against the rules before being offered */
const PRESETS=[
 {t:'เครื่องจิ๋ว',f:'Mini-ITX',ids:{case:'cae5e2f6',mb:'ae88902f',cpu:'6b03b443',ram:'693db7cd',gpu:'1c4e2e82',cool:'06e32f2e',ssd:'eebdf290',psu:'3efcca16'}},
 {t:'เครื่องขนาดมาตรฐาน',f:'ATX',ids:{case:'ec96cfae',mb:'e8a66e2e',cpu:'6b03b443',ram:'693db7cd',gpu:'36483a70',cool:'c252fb6f',ssd:'eebdf290',psu:'48e491cd'}},
 {t:'เครื่องใหญ่จัดเต็ม',f:'E-ATX',ids:{case:'e6a5b74e',mb:'e4afac11',cpu:'7ab840c3',ram:'20297c9b',gpu:'16b8e64f',cool:'9834e59d',ssd:'87e049f2',psu:'47b52ade'}}];
function presetBuild(p){const b={};for(const k of ORDER){const it=DATA[k].find(x=>x.id===p.ids[k]);if(!it)return null;b[k]=it}return pairs(b).length?null:b}
function presetsHTML(){return PRESETS.map((p,i)=>{const b=presetBuild(p);return b?`<button type="button" class="preset" data-preset="${i}"><span class="fmt">${p.f}</span><b>${p.t}</b><small>${esc(b.case.n)}<br>${esc(b.cpu.n.replace(/^(AMD|Intel) /,''))} · ${esc(b.gpu.chip)}</small></button>`:''}).join('')}
function applyPreset(i){const b=presetBuild(PRESETS[i]);if(!b)return;snap();build=b;isSample=true;preview=null;step=0;$('picker').hidden=true;save();sfx.place(0);fx('ok');render(true);toast(`ใส่สเปคตัวอย่าง "${PRESETS[i].t}" แล้ว เปลี่ยนชิ้นไหนก็ได้`,true)}
/* Business hook: set url to an order / quote / chat link to show a primary button on the summary. Empty = hidden. */
const CTA={label:'ขอใบเสนอราคา',url:''};
/* Prices: add a numeric field "p" (baht) to an item in data/parts.json and it shows on cards and in the total. */
const baht=n=>'฿'+Math.round(n).toLocaleString('th-TH');
const buildHash=()=>'b-'+ORDER.map(k=>build[k]?build[k].id:'0').join('-');
function readHash(){const m=/^#b-([0-9a-f-]+)$/.exec(location.hash||'');if(!m)return null;const ids=m[1].split('-');if(ids.length!==ORDER.length)return null;const b={};ORDER.forEach((k,i)=>{const it=DATA[k].find(x=>x.id===ids[i]);if(it)b[k]=it});return b.case?b:null}
function shareUrl(){return location.href.split('#')[0]+'#'+buildHash()}
function copyText(txt,okMsg){const fail=()=>toast('คัดลอกไม่สำเร็จ ลองคัดลอกจากแถบที่อยู่ของเบราว์เซอร์แทน');try{navigator.clipboard.writeText(txt).then(()=>toast(okMsg),fail)}catch(e){fail()}}
const listText=()=>ORDER.map(k=>build[k]?`${META[k].t}: ${build[k].full||build[k].n}`:null).filter(Boolean).join('\n');
/* one accent colour per part category: [colour, readable text colour on it] */
const ACC={case:['#5b6cff','#fff'],mb:['#00a39b','#fff'],cpu:['#ff6a3d','#111'],ram:['#b05cff','#fff'],gpu:['#2fbf5f','#111'],cool:['#1aa7ff','#111'],ssd:['#e0478f','#fff'],psu:['#f5a300','#111'],sum:['#ffd60a','#111']};
const curKey=()=>step<ORDER.length?ORDER[step]:'sum';
