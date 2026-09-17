import * as THREE from 'three';
export function createExterior(){
  const group=new THREE.Group();group.name='Вид с шестого этажа · двор на западе, река на юге';
  const groundY=-17;
  function plane(name,w,d,x,z,color){const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);const o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({name,color,roughness:.96}));o.name=name;o.position.set(x,groundY,z);group.add(o);return o;}
  plane('Берег перед рекой',400,50,6,31,'#91a179');
  const water=plane('Река · ближний берег в 50 м от южного фасада',200,32,100,72,'#769ea9');water.position.y-=.12;water.material.roughness=.24;water.material.metalness=.28;
  plane('Двор за окном детской · без реки',190,180,-95,0,'#98a383');
  const path=plane('Дорожка во дворе',4,160,-20,0,'#c6bfb0');path.position.y+=.025;
  const crossPath=plane('Поперечная дорожка двора',65,3,-36,8,'#c6bfb0');crossPath.position.y+=.03;
  plane('Дальний берег',400,140,6,158,'#697c56');
  const bark=new THREE.MeshStandardMaterial({color:'#71674d',roughness:1});
  const leaves=[0x566c47,0x617e50,0x7c9062,0x4f6645].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
  let seed=418;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<28;i++){
    const x=-28-rand()*55,z=-60+rand()*115,h=5+rand()*6;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.22,h,5),bark);trunk.position.set(x,groundY+h/2,z);group.add(trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),leaves[i%4]);crown.scale.set(2.4,h*.45,2.4);crown.position.set(x,groundY+h*.78,z);group.add(crown);
  }
  for(let i=0;i<200;i++){
    const x=-165+rand()*340,z=94+rand()*80,h=7+rand()*9;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.28,h,5),bark);trunk.position.set(x,groundY+h/2,z);group.add(trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),leaves[i%4]);crown.scale.set(2+rand()*2,h*.46,2+rand()*2);crown.position.set(x,groundY+h*.75,z);group.add(crown);
  }
  group.userData={floor:6,approximateFloorElevation:17,nearRiverBankDistance:50,riverWidthAssumed:32,forestBeyondRiver:true,childWindowView:'west courtyard, no river',courtyardLayout:'illustrative'};
  return group;
}
