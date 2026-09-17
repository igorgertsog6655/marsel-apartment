import * as THREE from 'three';
export function addHall({furniture,decor,ceiling,lamps,data,m,b,rounded,framedPanel,prism,point,cylinder}){
  const width=1.488,height=2.823,benchX=9.71216+width/2;
  const mirror=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({name:'Зеркало прихожей',color:'#f2f4f3',metalness:1,roughness:.015,side:THREE.DoubleSide}));
  mirror.name='Зеркало прихожей';mirror.position.set(benchX,height/2,-3.35);mirror.userData={type:'fullHeightMirror',width,height};decor.add(mirror);
  for(const x of [benchX-width/2,benchX+width/2])b(decor,'Латунная кромка зеркала',.012,height,.018,x,height/2,-3.33,m.metal);
  const bench=furniture.children.find(g=>g.name==='Пуф');bench.clear();bench.name='Банкетка прихожей';bench.position.set(benchX,0,-3.09);bench.rotation.y=0;
  const bw=width;bench.userData={width:bw,mirrorWidth:width,widthRatio:1,wardrobeWallX:9.71216};
  b(bench,'Цоколь банкетки',bw-.04,.09,.39,0,.055,0,m.cabinet);
  b(bench,'Корпус банкетки',bw,.32,.42,0,.25,0,m.cabinet);
  for(const x of [-bw/3,0,bw/3]){framedPanel(bench,x,.25,.222,bw/3-.065,.24,m.cabinet);b(bench,'Латунная ручка',.095,.013,.025,x,.34,.24,m.metal);}
  rounded(bench,'Льняное сиденье',bw,.11,.43,0,.465,0,m.cloth,.035);
  const g=furniture.children.find(g=>g.name==='Шкаф прихожей'),f=g.userData,w=f.w,d=.40;
  g.clear();g.rotation.y=Math.PI;g.position.z=f.z+f.d/2-d/2;
  g.userData={...f,d,originalDepth:f.d,depthMetres:.40,frontDirection:'north, into corridor'};
  b(g,'Корпус шкафа прихожей',w,2.70,d,0,1.35,0,m.cabinet);
  for(const x of [-w/4,w/4]){b(g,'Дверь к коридору',w/2-.012,2.60,.018,x,1.35,d/2+.009,m.cabinet);framedPanel(g,x,1.42,d/2+.024,w/2-.09,2.34,m.cabinet);b(g,'Латунная ручка шкафа',.018,.23,.025,x+(x<0?.20:-.20),1.05,d/2+.046,m.metal);}
  b(g,'Карниз шкафа',w+.025,.08,d+.018,0,2.74,0,m.white);
  for(const name of ['Вешалка и обувь','Стеллаж прихожей']){
    const s=furniture.children.find(o=>o.name===name),a=s.userData,sw=a.d;
    s.clear();s.name='Вешалки для пальто · '+name;s.rotation.y=-Math.PI/2;s.position.x=a.x+a.w/2-.025;
    s.userData={...a,kind:'coatHooks',depth:.10,hookCount:3,frontDirection:'west, into corridor'};
    rounded(s,'Бежевая панель под вешалками',sw,2.10,.025,0,1.17,0,m.cabinet,.01);
    for(const x of [-sw*.30,0,sw*.30]){
      rounded(s,'Латунное основание крючка',.035,.095,.016,x,1.65,.020,m.metal,.006);
      rounded(s,'Крючок для пальто',.018,.018,.075,x,1.635,.062,m.metal,.006);
      rounded(s,'Загиб крючка вверх',.018,.048,.018,x,1.651,.098,m.metal,.006);
    }
  }
  for(const x of [9.05,9.48])framedPanel(decor,x,1.45,-3.35,.31,2.25,m.white);
  b(decor,'Карниз прихожей',2.80,.085,.09,10.14,2.75,-3.32,m.white);
  const room=data.floors.find(f=>f.name==='Прихожая');if(room)prism(ceiling,'Потолок прихожей',room.points,.045,2.823,m.white);
  cylinder(lamps,'Латунный плафон прихожей',.23,.09,11.65,2.73,-2.90,m.metal);
  cylinder(lamps,'Рассеиватель прихожей',.21,.025,11.65,2.67,-2.90,m.linen);point('Свет прихожей',11.65,2.50,-2.90,5);
  // Low, shielded guidance lights on solid corridor wall sections.
  const guideMat=new THREE.MeshStandardMaterial({name:'Ночная подсветка прохода 2700К',color:'#ffe6bf',emissive:'#ffc47d',emissiveIntensity:1.2});
  for(const [x,z,turn=0] of [[9.71216+.0175,-.37],[9.71216+.0175,-1.668551],[11.28,-1.979057-.0175,Math.PI/2]]){
    const fixture=new THREE.Group();fixture.name='Ночной фонарь коридора';fixture.position.set(x,.23,z);fixture.rotation.y=turn;fixture.userData.pathGuide=true;lamps.add(fixture);
    b(fixture,'Бежевый корпус ночника',.035,.10,.16,0,0,0,m.cabinet);
    b(fixture,'Нижний рассеиватель ночника',.025,.018,.12,.013,-.038,0,guideMat);
    const light=point('Ночная дорожка коридора',x+Math.cos(turn)*.12,.16,z-Math.sin(turn)*.12,.28);light.color.set('#ffd09a');light.distance=1.8;light.userData.pathGuide=true;
  }
  return mirror;
}










