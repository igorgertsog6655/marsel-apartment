import * as THREE from 'three';
export function addChild({furniture,details,decor,ceiling,lamps,data,m,b,rounded,framedPanel,prism,point,cylinder,curtain}){
 const find=n=>furniture.children.find(g=>g.name===n);
 const bed=find('Кровать 2000 × 1200');bed.clear();bed.position.set(2.88,0,.68);bed.rotation.y=-Math.PI/2;
 rounded(bed,'Основание детской кровати',1.20,.32,2,0,.23,0,m.cloth,.04);rounded(bed,'Матрас и покрывало',1.20,.20,2,0,.49,0,m.linen,.04);
 rounded(bed,'Мягкое изголовье',1.25,1.12,.12,0,.63,-.96,m.cloth,.03);
 rounded(bed,'Подушка',.84,.32,.18,0,.76,-.72,m.linen,.04);rounded(bed,'Плед детской',1.21,.035,.80,0,.61,.44,m.throw,.01);
 const wardrobe=find('Шкаф кабинета 1200 × 600');wardrobe.clear();wardrobe.position.set(3.26,0,2.698);wardrobe.rotation.y=Math.PI;wardrobe.userData.frontDirection='north, into child room';
 b(wardrobe,'Корпус детского шкафа',1.20,2.70,.60,0,1.35,0,m.cabinet);
 for(const x of [-.3,.3]){b(wardrobe,'Фасад в детскую',.588,2.61,.02,x,1.35,.31,m.cabinet);framedPanel(wardrobe,x,1.53,.334,.49,2.15,m.cabinet);b(wardrobe,'Латунная ручка',.017,.24,.03,x+(x<0?.19:-.19),1.03,.36,m.metal);}
 const desk=find('Рабочий стол 1400 × 900');desk.clear();desk.position.set(1.68,0,2.68);desk.rotation.y=Math.PI;
 b(desk,'Столешница',1.85,.035,.62,0,.755,0,m.stone);b(desk,'Тумба письменного стола',.44,.71,.56,.67,.36,0,m.cabinet);
 for(const y of [.18,.42,.63])framedPanel(desk,.67,y,.30,.37,.16,m.cabinet);
 b(desk,'Опора стола',.035,.73,.55,-.89,.365,0,m.cabinet);
 for(const y of [1.36,1.82,2.28]){b(decor,'Полка над столом',1.85,.04,.25,1.68,y,2.86,m.cabinet);for(let i=0;i<5;i++)b(decor,'Книга',.06,.19+i*.009,.13,1+i*.12,y+.12,2.84,i%2?m.linen:m.oak);}
 const childMirror=new THREE.Mesh(new THREE.PlaneGeometry(.735,2.6475),new THREE.MeshStandardMaterial({name:'Зеркало детской',color:'#f2f4f3',metalness:1,roughness:.015,side:THREE.DoubleSide}));
 childMirror.name='Зеркало детской между столом и окном';childMirror.position.set(.3875,2.6475/2,2.975);childMirror.rotation.y=Math.PI;decor.add(childMirror);
 const chair=find('Рабочее кресло');chair.clear();chair.position.set(1.65,0,1.93);chair.rotation.y=Math.PI;
 rounded(chair,'Льняное сиденье',.50,.12,.50,0,.45,0,m.cloth,.04);rounded(chair,'Мягкая спинка',.50,.48,.10,0,.73,.22,m.cloth,.04);for(const x of [-.2,.2])for(const z of [-.2,.2])b(chair,'Ножка',.035,.40,.035,x,.20,z,m.oak);
 const chest=find('Тумба с зеркалом');chest.clear();chest.position.set(3.35,0,.28);chest.rotation.y=0;b(chest,'Комод',.90,.83,.48,0,.415,0,m.cabinet);for(const y of [.17,.43,.69]){framedPanel(chest,0,y,.25,.81,.20,m.cabinet);b(chest,'Ручка',.10,.012,.03,0,y+.05,.275,m.metal);}b(chest,'Крышка комода',.94,.03,.51,0,.85,0,m.stone);
 furniture.remove(chest);
 const bike=find('Велотренажёр');bike.position.set(.63,0,.85);bike.rotation.y=0;bike.userData={...bike.userData,x:.63,z:.85};
 rounded(details,'Ковёр детской',2.45,.016,1.25,2.50,.023,.90,m.rug,.008);
 for(const x of [1.30,2.40,3.42])framedPanel(decor,x,1.70,.035,.85,1.80,m.white);
 b(decor,'Карниз детской',3.94,.08,.08,1.97,2.75,.04,m.white);
 for(const z of [.32,2.54]){const c=curtain(0,.30,0,m.curtain,'Штора детской');c.rotation.y=Math.PI/2;c.position.x=.05;c.position.z=z;}
 b(decor,'Римская штора',.04,.40,1.82,-.10,2.25,1.434,m.curtain);
 const room=data.floors.find(f=>f.name==='Кабинет');prism(ceiling,'Потолок детской',room.points,.045,2.823,m.white);
 cylinder(lamps,'Плафон детской',.26,.20,2,2.50,1.50,m.linen);point('Свет детской',2,2.28,1.50,5);
 cylinder(lamps,'Лампа стола',.10,.16,1.05,1.04,2.69,m.metal);point('Свет стола',1.05,.96,2.58,1);
}

