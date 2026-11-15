import json,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB=sys.argv[1] if len(sys.argv)>1 else os.environ.get('OPENDB','')
if not os.path.isdir(DB): sys.exit('usage: python3 scripts/build_data.py <path-to>/buildcores-open-db/open-db')
def load(cat):
    out=[]
    for f in os.listdir(f'{DB}/{cat}'):
        try: out.append(json.load(open(f'{DB}/{cat}/{f}')))
        except: pass
    return out
nm=lambda d:d['metadata']['name']
def pick(rows,key,exact=False):
    c=[x for x in rows if (nm(x).strip().lower()==key.lower() if exact else key.lower() in nm(x).lower())]
    if not c: sys.exit('MISSING '+key)
    return sorted(c,key=lambda x:len(nm(x)))[0]
FF={'Micro ATX':'mATX','Mini-ITX':'ITX','ATX':'ATX','EATX':'EATX','Mini DTX':'DTX'}
out={}
C=load('PCCase'); L=[]
for key,short in [('Fractal Design North ATX Mid Tower Charcoal','Fractal Design North'),('NZXT H5 Flow (2022) ATX Mid Tower White','NZXT H5 Flow'),('O11 Dynamic EVO ATX Mid Tower Gray','Lian Li O11 Dynamic EVO'),('Corsair 4000D AIRFLOW Tempered','Corsair 4000D Airflow'),('AIR 903 BASE ATX Mid Tower White','Montech AIR 903 Base'),('H6 Flow ATX Mid Tower Black','NZXT H6 Flow'),('A3-mATX Micro ATX Mini Tower Black','Lian Li A3-mATX'),('Q300L V2 MicroATX Mini Tower Black','Cooler Master Q300L V2'),('MasterBox NR200P Mini-ITX Desktop Black','Cooler Master NR200P')]:
    x=pick(C,key); d=x['dimensions_mm']
    L.append(dict(id=x['opendb_id'][:8],n=short,mb=[FF[f] for f in x['supported_motherboard_form_factors'] if f in FF],gpuMax=x['max_video_card_length'],coolMax=x['max_cpu_cooler_height'],slots=x['expansion_slots'],psu=x['supported_power_supply_form_factors'],psuMax=x.get('max_psu_length'),D=d['depth'],W=d['width'],H=d['height'],col=(x.get('color') or ['BLACK'])[0],glass='Glass' in (x.get('side_panel') or '')))
out['case']=L
M=load('Motherboard'); L=[]
for key,short in [('ASRock B650M Pro RS WiFi','ASRock B650M Pro RS WiFi'),('MSI MAG B650 TOMAHAWK WIFI','MSI MAG B650 Tomahawk WiFi'),('Gigabyte X870 EAGLE WIFI7','Gigabyte X870 Eagle WiFi7'),('ASRock B850 M-X R2.0','ASRock B850M-X'),('MSI MPG B650I EDGE WIFI','MSI MPG B650I Edge WiFi'),('ASRock B760M Pro-A D4 WiFi','ASRock B760M Pro-A D4 WiFi'),('Gigabyte B760 GAMING X WIFI6E GEN5','Gigabyte B760 Gaming X WiFi6E'),('Gigabyte B760I AORUS PRO DDR5','Gigabyte B760I Aorus Pro'),('MSI MAG B860 TOMAHAWK WIFI','MSI MAG B860 Tomahawk WiFi'),('B860M-VC WIFI','MSI Pro B860M-VC WiFi'),('ASRock B860I WiFi','ASRock B860I WiFi'),('Gigabyte B550M K','Gigabyte B550M K'),('AORUS B550I PRO AX','Gigabyte B550I Aorus Pro AX')]:
    x=pick(M,key)
    L.append(dict(id=x['opendb_id'][:8],n=short,sock=x['socket'],ff=FF[x['form_factor']],chip=x.get('chipset'),ram=x['memory']['ram_type'],rs=x['memory']['slots'],rmax=x['memory']['max'],m2=len(x.get('m2_slots') or []),wifi=bool(x.get('wireless_networking') and 'Wi-Fi' in x['wireless_networking'])))
out['mb']=L
P=load('CPU'); L=[]
for key in ['AMD Ryzen 5 5600','AMD Ryzen 5 5600G','AMD Ryzen 5 7600','AMD Ryzen 5 9600X','AMD Ryzen 7 7800X3D','AMD Ryzen 7 9800X3D','AMD Ryzen 9 9950X3D','Intel Core i5 12400F','Intel Core i5 14400F','Intel Core i5 14600K','Intel Core i7 14700K','Intel Core Ultra 5 245K','Intel Core Ultra 7 265K']:
    x=pick(P,key,True); s=x['specifications']; ig=s.get('integratedGraphics') or {}
    L.append(dict(id=x['opendb_id'][:8],n=nm(x),sock=x['socket'],c=x['cores']['total'],t=x['cores']['threads'],tdp=s['tdp'],ig=('' if (ig.get('model') or 'None')=='None' else ig['model']),fan=bool(s.get('includesCooler')),ram=s['memory']['types']))
out['cpu']=L
R=load('RAM'); L=[]
def ram(t,q,c,sp,pref):
    c_=[x for x in R if x.get('form_factor')=='288-pin DIMM' and x.get('modules') and (x['ram_type'],x['modules']['quantity'],x['modules']['capacity_gb'],x['speed'])==(t,q,c,sp) and pref.lower() in nm(x).lower()]
    if not c_: sys.exit(f'MISSING RAM {t} {q}x{c} {sp} {pref}')
    x=sorted(c_,key=lambda x:len(nm(x)))[0]
    L.append(dict(id=x['opendb_id'][:8],n=f"{x['metadata']['manufacturer']} {x['metadata'].get('series') or ''}".strip(),full=nm(x),type=t,q=q,gb=c,sp=sp,cl=x.get('cas_latency'),rgb=bool(x.get('rgb')),col=(x.get('color') or ['BLACK'])[0]))
ram('DDR5',2,8,5600,'');ram('DDR5',2,16,6000,'Corsair Vengeance');ram('DDR5',2,16,6000,'G.Skill Trident');ram('DDR5',2,32,6000,'G.Skill');ram('DDR5',4,16,6000,'')
ram('DDR4',2,8,3200,'Corsair Vengeance');ram('DDR4',2,16,3200,'Corsair Vengeance');ram('DDR4',2,16,3600,'G.Skill');ram('DDR4',4,8,3200,'')
out['ram']=L
G=load('GPU'); L=[]
for key,short in [('Gigabyte GeForce RTX 5050 D6 8GB','Gigabyte RTX 5050 D6'),('MSI GeForce RTX 5060 8G INSPIRE ITX OC','MSI RTX 5060 Inspire ITX'),('ASUS Dual GeForce RTX 5060 8GB GDDR7 OC','ASUS Dual RTX 5060'),('PowerColor Reaper Radeon RX 9060 XT 16GB','PowerColor Reaper RX 9060 XT'),('MSI GeForce RTX 5060 Ti 16G INSPIRE 2X','MSI RTX 5060 Ti Inspire 2X'),('MSI GeForce RTX 5060 Ti 16G VANGUARD OC','MSI RTX 5060 Ti Vanguard'),('MSI SHADOW 3X GeForce RTX 5070 12GB','MSI RTX 5070 Shadow 3X'),('GIGABYTE Radeon RX 9070 XT GAMING 16G','Gigabyte RX 9070 XT Gaming'),('Sapphire NITRO+ Radeon RX 9070 XT OC 16GB GDDR6 Phantom','Sapphire Nitro+ RX 9070 XT'),('GIGABYTE GeForce RTX 5070 Ti WINDFORCE OC V2','Gigabyte RTX 5070 Ti Windforce'),('GIGABYTE AORUS GeForce RTX 5070 Ti MASTER 16G','Gigabyte Aorus RTX 5070 Ti Master'),('PNY GeForce RTX 5080 16GB ARGB EPIC-X','PNY RTX 5080 Epic-X'),('ASUS Noctua OC Edition GeForce RTX 5080','ASUS RTX 5080 Noctua'),('Palit GameRock GeForce RTX 5090','Palit RTX 5090 GameRock')]:
    x=pick(G,key); fans=int(x['cooling'][0]) if x['cooling'][0].isdigit() else 0
    L.append(dict(id=x['opendb_id'][:8],n=short,chip=x['chipset'].replace('GeForce ','').replace('Radeon ','').replace(' 16 GB',''),len=x['length'],sw=x['total_slot_width'],fans=fans,tdp=x['tdp'],vram=x['memory'],col=(x.get('color') or ['BLACK'])[0]))
out['gpu']=L
K=load('CPUCooler'); L=[]
aio240=sorted([x for x in K if x.get('water_cooled') and x.get('radiator_size')==240 and 'ARCTIC Liquid Freezer III' in nm(x)],key=lambda x:len(nm(x)))
print('aio240',[nm(x) for x in aio240][:3])
for key,short in [('Thermalright Peerless Assassin 120 SE Air','Thermalright Peerless Assassin 120 SE'),('Deepcool AK400 ZERO DARK','DeepCool AK400'),('Deepcool AK620 Air 160mm White','DeepCool AK620'),('Noctua NH-D15 Air 165','Noctua NH-D15'),('Noctua NH-L12S Air 70mm','Noctua NH-L12S'),('Thermalright AXP90-X47 Air Gray','Thermalright AXP90-X47'),('Noctua NH-L9A-AM5','Noctua NH-L9a-AM5'),('ARCTIC Liquid Freezer III 360 A-RGB','Arctic Liquid Freezer III 360')]+([(nm(aio240[0]),'Arctic Liquid Freezer III 240')] if aio240 else []):
    x=pick(K,key)
    L.append(dict(id=x['opendb_id'][:8],n=short,h=x.get('height'),aio=bool(x.get('water_cooled')),rad=x.get('radiator_size'),socks=x['cpu_sockets'],col=(x.get('color') or ['GREY'])[0]))
out['cool']=L
S=load('Storage'); L=[]
for key,short in [('Kingston NV2 1TB SSD M.2-2280','Kingston NV2'),('Western Digital Black SN770 1TB','WD Black SN770'),('Crucial T500 1 TB SSD M.2-2280','Crucial T500'),('Samsung 990 Pro 1TB SSD M.2','Samsung 990 Pro'),('Western Digital Black SN850X 2TB SSD M.2','WD Black SN850X')]:
    x=pick(S,key); L.append(dict(id=x['opendb_id'][:8],n=short,gb=x['capacity'],iface=x['interface'].replace('M.2 ','')))
out['ssd']=L
U=load('PSU'); L=[]
for key,short in [('MSI MAG A550BN Black 550W','MSI MAG A550BN'),('MSI MAG A650BNL Black','MSI MAG A650BNL'),('Corsair RM750e (2025) Black','Corsair RM750e'),('Corsair RM850x (2024) Black','Corsair RM850x'),('Corsair RM1000x (2024) Black','Corsair RM1000x'),('Corsair SF750 (2024) SFX','Corsair SF750'),('Cooler Master V850 SFX Gold 850W','Cooler Master V850 SFX'),('Corsair SF1000 (2024) Black SFX','Corsair SF1000')]:
    x=pick(U,key); L.append(dict(id=x['opendb_id'][:8],n=short,w=x['wattage'],ff=x['form_factor'],eff=x.get('efficiency_rating'),mod=x.get('modular'),len=x.get('length')))
out['psu']=L
json.dump(out,open(os.path.join(ROOT,'data','parts.json'),'w'),ensure_ascii=False,separators=(',',':'))
for k,v in out.items():
    print(k,len(v))
    for r in v: print('  ',json.dumps(r,ensure_ascii=False)[:230])
