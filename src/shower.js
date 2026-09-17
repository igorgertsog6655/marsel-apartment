import * as THREE from 'three';
export function addShower({furniture,floors,decor,ceiling,lamps,data,m,b,prism,point,cylinder,framedPanel,applyPhysicalUV}){
 const room=data.floors.find(f=>f.name==='Душевая');
 const floor=floors.getObjectByName(room.name);floor.material=m.bathroomStone;applyPhysicalUV(floor.geometry,m.bathroomStone);
 prism(ceiling,'Потолок душевой',room.points,.045,2.823,m.white);
 b(decor,'Камень душевой запад',.018,2.823,1.506,7.730,1.4115,-.943,m.bathroomStone);
 for(const z of [-1.682,-.204])b(decor,'Камень душевой',1.746,2.823,.018,8.589,1.4115,z,m.bathroomStone);
 const shower=furniture.getObjectByName('Душ 850 × 850');
 for(const o of shower.children.slice())if(o.name==='Стекло')shower.remove(o);
 for(const [w,d,x,z] of [[.012,.83,.412,0],[.83,.012,0,-.412]]){
  const glass=b(shower,'Стекло душевой',w,2.10,d,x,1.12,z,m.glass);glass.castShadow=false;
 }
 for(const [x,z] of [[.412,-.412],[.412,.412],[-.412,-.412]])b(shower,'Латунный профиль душевой',.018,2.14,.018,x,1.12,z,m.metal);
 b(shower,'Верхняя обвязка душевой',.84,.025,.025,0,2.19,-.412,m.metal);
 b(shower,'Верхняя обвязка душевой',.025,.025,.84,.412,2.19,0,m.metal);
 b(shower,'Ручка двери душевой',.025,.22,.025,.435,1.05,.22,m.metal);
 b(shower,'Смеситель душа',.13,.06,.06,-.30,1.03,-.32,m.metal);
 furniture.getObjectByName('Унитаз душевой').traverse(o=>{if(o.isMesh&&o.name==='Сиденье')o.material=m.white;});
 const vanity=furniture.getObjectByName('Раковина душевой');
 vanity.traverse(o=>{if(o.isMesh&&o.name==='Тумба')o.material=m.cabinet;if(o.isMesh&&o.name==='Чаша')o.material=m.white;});
 const tap=vanity.getObjectByName('Кран');tap.position.z=.14;
 b(vanity,'Излив раковины душевой',.025,.025,.14,0,1.02,.08,m.metal);
 framedPanel(decor,8.9798,.44,-.600,.38,.54,m.cabinet,Math.PI);
 b(decor,'Ручка тумбы душевой',.16,.018,.025,8.9798,.66,-.625,m.metal);
 const mirror=new THREE.Mesh(new THREE.PlaneGeometry(.46,1.20),new THREE.MeshStandardMaterial({color:'#eff2ef',metalness:1,roughness:.015}));mirror.name='Зеркало над раковиной душевой';mirror.position.set(8.98,1.65,-.220);mirror.rotation.y=Math.PI;decor.add(mirror);
 const led=new THREE.MeshStandardMaterial({name:'Подсветка душевой 3000К',color:'#fff0d8',emissive:'#ffd3a1',emissiveIntensity:2});
 for(const x of [8.74,9.22]){b(decor,'Кромка зеркала душевой',.012,1.23,.015,x,1.65,-.224,m.metal);b(lamps,'LED душевой зеркало',.012,1.18,.018,x,1.65,-.228,led);}
 b(decor,'Шкаф над инсталляцией душевой',.25,1.00,.43,7.86,2.10,-1.337,m.cabinet);
 const panel=new THREE.Group();panel.position.set(8.00,2.10,-1.337);panel.rotation.y=Math.PI/2;decor.add(panel);framedPanel(panel,0,0,0,.36,.89,m.cabinet);
 b(decor,'Ручка шкафа душевой',.025,.20,.015,8.025,1.90,-1.20,m.metal);
 b(decor,'Полка над инсталляцией душевой',.27,.025,.43,7.87,1.35,-1.337,m.bathroomStone);
 b(decor,'Клавиша смыва душевой',.020,.16,.23,8.048,1.05,-1.337,m.metal);
 b(lamps,'LED душевой шкаф',.015,.012,.38,7.99,1.58,-1.337,led);
 for(const [x,z] of [[8.23,-.58],[8.93,-1.14]]){cylinder(lamps,'Спот душевой',.045,.025,x,2.79,z,m.metal);cylinder(lamps,'LED душевой спот',.032,.026,x,2.78,z,led);point('Душевая основной',x,2.57,z,3.5);}
 point('Душевая подсветка зеркала',8.98,1.65,-.50,1.4);point('Душевая подсветка шкафа',8.12,1.52,-1.337,1.2);
}

