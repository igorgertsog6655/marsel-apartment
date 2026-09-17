import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import data from './model-data.json';
import { addInterior, applyPhysicalUV, makeMaterialSet } from './interior.js';

export { data };
export function createModel(textures={}) {
  const model=new THREE.Group(); model.name='Марсель — обмер и вариант 5';
  const walls=new THREE.Group(), furniture=new THREE.Group(), floors=new THREE.Group(), openings=new THREE.Group();
  walls.name='Стены · H 2823 мм'; furniture.name='Мебель варианта 5'; floors.name='Полы'; openings.name='Двери и окна';
  model.add(floors,walls,furniture,openings);
  const mat=(color,roughness=.7,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
  const m=makeMaterialSet(textures);
  const exteriorWallMaterial=m.wall.clone();
  exteriorWallMaterial.name='Наружные стены · постоянный серый';
  exteriorWallMaterial.color.set('#b7bab8');
  function box(parent,name,w,h,d,x,y,z,material,round=0){
    const geo=round?new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d);
    applyPhysicalUV(geo,material);const mesh=new THREE.Mesh(geo,material); mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function cylinder(parent,name,r,h,x,y,z,material){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),material);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function prism(parent,name,points,height,y,material){
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
    applyPhysicalUV(geo,material);const mesh=new THREE.Mesh(geo,material);mesh.name=name;mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function isInsideApartment(x,z){
    return data.floors.some(({points})=>{
      let inside=false;
      for(let i=0,j=points.length-1;i<points.length;j=i++){
        const [xi,zi]=points[i],[xj,zj]=points[j];
        if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))inside=!inside;
      }
      return inside;
    });
  }
  function keepExteriorWallFacesGray(mesh){
    const original=mesh.geometry,geometry=original.index?original.toNonIndexed():original;
    if(geometry!==original){mesh.geometry=geometry;original.dispose();}
    geometry.clearGroups();mesh.updateWorldMatrix(true,false);
    const positions=geometry.attributes.position,normals=geometry.attributes.normal;
    const center=new THREE.Vector3(),normal=new THREE.Vector3(),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    for(let i=0;i<positions.count;i+=3){
      center.set(0,0,0);normal.set(0,0,0);
      for(let k=0;k<3;k++){
        center.x+=positions.getX(i+k);center.y+=positions.getY(i+k);center.z+=positions.getZ(i+k);
        normal.x+=normals.getX(i+k);normal.y+=normals.getY(i+k);normal.z+=normals.getZ(i+k);
      }
      center.multiplyScalar(1/3).applyMatrix4(mesh.matrixWorld);normal.normalize().applyMatrix3(normalMatrix).normalize();
      let exterior=false;
      if(Math.abs(normal.y)<.45){
        const outward=center.clone().addScaledVector(normal,.42),inward=center.clone().addScaledVector(normal,-.42);
        exterior=!isInsideApartment(outward.x,outward.z)&&isInsideApartment(inward.x,inward.z);
      }
      geometry.addGroup(i,3,exterior?1:0);
    }
    mesh.material=[m.wall,exteriorWallMaterial];
  }
  for(const f of data.floors) prism(floors,f.name,f.points,.14,-.14,m[f.kind]);
  for(const w of data.walls) prism(walls,w.name,w.points,data.height,0,m.wall);
  for(const d of data.doors){
    const along=d.axis==='x', width=d.width, thick=d.thickness;
    const balconyWindow={
      'Южная дверь гостиной':'Южное окно гостиной',
      'Южная дверь спальни':'Южное окно у двери',
      'Западная дверь спальни':'Западное окно',
    }[d.name];
    const adjacentWindow=data.windows.find(w=>w.name===balconyWindow);
    const doorHeight=adjacentWindow?adjacentWindow.sill+adjacentWindow.height:2.1;
    box(floors,`Порог · ${d.name}`,along?width:thick,.12,along?thick:width,d.x,-.06,d.z,m.tile);
    const header=box(walls,`Перемычка · ${d.name}`,along?width:thick,data.height-doorHeight,along?thick:width,d.x,(data.height+doorHeight)/2,d.z,m.wall);header.userData.header=true;
    const frame=new THREE.Group();frame.position.set(d.x,0,d.z);if(!along)frame.rotation.y=Math.PI/2;frame.name=d.name;openings.add(frame);
    if(adjacentWindow){
      frame.userData={type:'balconyDoor',height:doorHeight,adjacentWindow:balconyWindow,opening:'inward'};
      for(const x of [-width/2,width/2])box(frame,'Балконная коробка',.04,doorHeight,.07,x,doorHeight/2,0,m.white);
      for(const y of [.02,doorHeight-.02])box(frame,'Балконная коробка',width,.04,.07,0,y,0,m.white);
      const leafDirection=['Южная дверь спальни','Западная дверь спальни'].includes(d.name)?-1:1;
      const hinge=new THREE.Group();hinge.name='Балконная створка · внутрь';hinge.position.x=leafDirection*(-width/2+.025);hinge.rotation.y=leafDirection*(along?1:-1)*Math.PI*.4;frame.add(hinge);
      frame.userData.hingeSide=leafDirection===-1?'right':'left';
      const leafWidth=width-.05,leafHeight=doorHeight-.08;
      const glass=box(hinge,'Прозрачное остекление балконной двери',leafWidth-.08,leafHeight-.08,.016,leafDirection*leafWidth/2,doorHeight/2,0,m.glass);
      glass.castShadow=false;
      for(const x of [.02,leafWidth-.02])box(hinge,'Рама балконной створки',.04,leafHeight,.055,leafDirection*x,doorHeight/2,0,m.white);
      for(const y of [.06,doorHeight-.06])box(hinge,'Рама балконной створки',leafWidth,.04,.055,leafDirection*leafWidth/2,y,0,m.white);
      box(hinge,'Балконная ручка',.025,.14,.065,leafDirection*(leafWidth-.075),1.05,.03,m.white);
      continue;
    }
    for(const x of [-width/2,width/2])box(frame,'Дверная коробка',.035,2.12,.1,x,1.06,0,m.oak);
    box(frame,'Дверная коробка',width,.04,.1,0,2.1,0,m.oak);
    const hinge=new THREE.Group();hinge.position.x=-width/2;hinge.rotation.y=(d.name==='Кабинет'||d.name==='Вход'?1:-1)*Math.PI*.4;frame.add(hinge);if(d.name==='Вход')frame.userData={...frame.userData,opening:'outward',hingeSide:'original'};if(d.name==='Кабинет')frame.userData={...frame.userData,opening:'inward',hingeSide:'original'};
    box(hinge,'Дверное полотно',width-.04,2.04,.035,(width-.04)/2,1.03,0,d.external?m.oak:m.white);
    box(hinge,'Ручка',.11,.025,.065,width-.14,1.02,.025,m.metal);
  }
  for(const originalWindow of data.windows){
    const w=['Западное окно','Южное окно спальни'].includes(originalWindow.name)?originalWindow:{...originalWindow,sill:0,height:originalWindow.sill+originalWindow.height};
    if(w.sill>0){box(walls,'Подоконная стена · '+w.name,w.w,w.sill,w.d,w.x,w.sill/2,w.z,m.wall);box(openings,'Подоконник · '+w.name,w.w+.05,.035,w.d+.05,w.x,w.sill,w.z,m.white);}
    box(floors,'Пол оконной ниши',w.w,.12,w.d,w.x,-.06,w.z,m.wood);

    box(walls,'Надоконная перемычка',w.w,data.height-w.sill-w.height,w.d,w.x,(data.height+w.sill+w.height)/2,w.z,m.wall).userData.header=true;

    const along=w.axis==='x',width=along?w.w:w.d;
    const frame=new THREE.Group();frame.name=w.name;frame.userData={type:w.sill===0?'floorWindow':'window',sill:w.sill,height:w.height};frame.position.set(w.x,w.sill,w.z);if(!along)frame.rotation.y=Math.PI/2;openings.add(frame);
    box(frame,'Остекление',width,w.height,.016,0,w.height/2,0,m.glass);
    for(const x of [-width/2,0,width/2])box(frame,'Оконная рама',.04,w.height,.07,x,w.height/2,0,m.white);
    for(const y of [0,w.height])box(frame,'Оконная рама',width,.04,.07,0,y,0,m.white);
  }
  walls.updateMatrixWorld(true);walls.traverse(o=>{if(o.isMesh)keepExteriorWallFacesGray(o);});
  // Balcony footprints reconstructed from the user's supplementary diagram.
  // 3.54 and 2.07 are area labels, not dimension chains. Unspecified depths are approximate.
  const balconies=new THREE.Group();balconies.name='Балконы по дополнительной схеме';model.add(balconies);
  const px=x=>(x-data.origin[0])/data.scale,pz=z=>(z-data.origin[1])/data.scale;
  const west=px(119.67),south=pz(702.85),east=px(242.84),depth=.61,top=4.0;
  const leftOutline=[[west-depth,top],[west,top],[west,south],[east,south],[east,south+depth],[west-depth,south+depth]];
  const rightX0=px(480.2),rightX1=px(660.978),rightZ=pz(651.51),rightDepth=.612;
  const rightOutline=[[rightX0,rightZ],[rightX1,rightZ],[rightX1,rightZ+rightDepth],[rightX0,rightZ+rightDepth]];
  const railingMat=mat('#4d686b',.4,{metalness:.5});
  const balconyGlass=mat('#c0d9db',.15,{transparent:true,opacity:.16,depthWrite:false});
  function rail(points,parent){
    for(let i=0;i<points.length-1;i++){
      const [ax,az]=points[i],[bx,bz]=points[i+1],length=Math.hypot(bx-ax,bz-az);
      const segment=new THREE.Group();segment.position.set((ax+bx)/2,0,(az+bz)/2);segment.rotation.y=-Math.atan2(bz-az,bx-ax);parent.add(segment);
      for(const y of [.08,1.10])box(segment,'Поручень ограждения',length,.035,.035,0,y,0,railingMat);
      const count=Math.ceil(length/.85);
      for(let j=0;j<=count;j++)box(segment,'Стойка ограждения',.035,1.13,.035,-length/2+j*length/count,.545,0,railingMat);
      for(let j=0;j<count;j++){const panel=box(segment,'Заполнение ограждения',length/count-.05,.94,.012,-length/2+(j+.5)*length/count,.58,0,balconyGlass);panel.castShadow=false;}
    }
  }
  const leftBalcony=new THREE.Group();leftBalcony.name='Балкон спальни · Г-образный';leftBalcony.userData={referenceArea:3.54,depthApprox:depth,railHeightApprox:1.1};balconies.add(leftBalcony);
  prism(leftBalcony,'Плита Г-образного балкона',leftOutline,.16,-.19,m.tile);
  rail([[west,top],[west-depth,top],[west-depth,south+depth],[east,south+depth],[east,south]],leftBalcony);
  const rightBalcony=new THREE.Group();rightBalcony.name='Балкон гостиной';rightBalcony.userData={referenceArea:2.07,depthApprox:rightDepth,railHeightApprox:1.1};balconies.add(rightBalcony);
  prism(rightBalcony,'Плита балкона гостиной',rightOutline,.16,-.19,m.tile);
  rail([[rightX0,rightZ],[rightX0,rightZ+rightDepth],[rightX1,rightZ+rightDepth],[rightX1,rightZ]],rightBalcony);
  // Connect the slabs to the recessed balcony-door thresholds without filling the facade.
  for(const d of data.doors.filter(d=>['Южная дверь спальни','Южная дверь гостиной','Западная дверь спальни'].includes(d.name))){
    if(d.axis==='x'){
      const outer=d.name==='Южная дверь спальни'?south:rightZ,start=d.z+d.thickness/2;
      if(outer>start)box(balconies,'Подход к балконной двери',d.width,.16,outer-start,d.x,-.11,(start+outer)/2,m.tile);
    }else{
      const edge=d.x-d.thickness/2;
      if(edge>west)box(balconies,'Подход к западной балконной двери',edge-west,.16,d.width,(edge+west)/2,-.11,d.z,m.tile);
    }
  }
  // Floor only in the short connectors between rooms and the hall.
  for(const [x0,z0,x1,z1] of [[9.46,-.2,9.72,1.31],[9.7,-1.36,10.9,-1.11]])box(floors,'Переход',x1-x0,.12,z1-z0,(x0+x1)/2,-.06,(z0+z1)/2,m.tile);
  for(const f of data.furniture){
    if(f.kind==='fireplace')continue;
    const g=new THREE.Group();g.name=f.name;g.position.set(f.x,0,f.z);g.userData={...f};furniture.add(g);
    const {w,d,h,kind}=f;
    const b=(n,W,H,D,x,y,z,M=m.oak,r=0)=>box(g,n,W,H,D,x,y,z,M,r);
    const leg=(x,z,hh)=>b('Ножка',.04,hh,.04,x,hh/2,z,m.dark);
    if(kind==='bed'){
      b('Основание кровати',w,.22,d,0,.19,0,m.oak,.035);b('Матрас',w-.05,.22,d-.05,0,.4,0,m.linen,.07);
      if(f.rot){b('Изголовье',.09,.95,d, w/2-.05,.51,0,m.cloth,.025);b('Плед',w*.58,.035,d-.07,-w*.15,.535,0,m.cloth,.01);for(const z of [-d*.24,d*.24])b('Подушка',.42,.14,d*.40,w/2-.34,.57,z,m.white,.06);}
      else{b('Изголовье',w,.95,.09,0,.51,-d/2+.05,m.cloth,.025);b('Плед',w-.07,.035,d*.55,0,.535,d*.18,m.cloth,.01);for(const x of [-w*.25,w*.25])b('Подушка',w*.42,.14,.42,x,.57,-d/2+.35,m.white,.06);}
    }else if(kind==='sofa'){
      b('Цоколь',w,.18,d,0,.15,0,m.dark,.035);b('Диван',w,.30,d,0,.36,0,m.cloth,.09);b('Спинка',.18,.75,d,-w/2+.09,.53,0,m.cloth,.07);
      for(const z of [-d/2+.08,d/2-.08])b('Подлокотник',w,.46,.16,0,.5,z,m.cloth,.06);
      for(const z of [-d*.3,0,d*.3])b('Подушка сиденья',w-.23,.13,d*.27,.08,.58,z,m.linen,.05);
    }else if(['desk','table','roundtable'].includes(kind)){
      if(kind==='table'||kind==='roundtable'){const top=cylinder(g,'Столешница',w/2,.055,0,h,0,m.white);top.scale.z=d/w;for(const x of [-w*.3,w*.3])leg(x,0,h-.02);}
      else{b('Столешница',w,.05,d,0,h,0,m.oak);for(const x of [-w/2+.06,w/2-.06])for(const z of [-d/2+.06,d/2-.06])leg(x,z,h);}
    }else if(kind==='chair'){
      b('Сиденье',w,.09,d,0,.46,0,m.cloth,.035);b('Спинка',w,.4,.07,0,.71,d/2-.035,m.cloth,.035);for(const x of [-w*.36,w*.36])for(const z of [-d*.36,d*.36])leg(x,z,.44);
    }else if(kind==='bath'){
      b('Корпус ванны',w,.56,d,0,.3,0,m.white,.14);b('Чаша',w-.12,.04,d-.12,0,.587,0,m.blue,.15);b('Внутренняя чаша',w-.19,.012,d-.19,0,.61,0,m.white,.16);b('Смеситель',.08,.24,.08,w/2-.1,.72,0,m.metal);
    }else if(kind==='shower'){
      b('Поддон',w,.09,d,0,.045,0,m.white,.03);b('Стекло',.012,h,d,-w/2+.015,h/2,0,m.glass);b('Стекло',w,h,.012,0,h/2,d/2-.015,m.glass);b('Душевая стойка',.025,1.5,.025,-w/2+.12,1.15,-d/2+.05,m.metal);b('Верхний душ',.22,.025,.22,-w/2+.12,1.9,-d/2+.14,m.metal);
    }else if(kind==='toilet'){
      b('Инсталляция',.12,1.12,d,-f.rot*(w/2-.06),.56,0,m.tile);const bowl=cylinder(g,'Чаша унитаза',d*.46,.30,0,.32,0,m.white);bowl.scale.x=w/d*.72;const seat=cylinder(g,'Сиденье',d*.43,.04,.02,.49,0,m.linen);seat.scale.x=w/d*.72;
    }else if(kind==='sink'){
      b('Тумба',w,.68,d,0,.4,0,m.oak);b('Столешница',w,.04,d,0,h,0,m.white);b('Чаша',w*.75,.07,d*.65,0,h+.045,0,m.blue,.08);b('Кран',.025,.22,.025,0,h+.11,-d*.38,m.metal);
    }else if(kind==='washer'){
      b('Стиральная машина',w,h,d,0,h/2,0,m.white,.02);const drum=cylinder(g,'Люк',w*.31,.035,0,h*.46,d/2+.018,m.dark);drum.rotation.x=Math.PI/2;const glass=cylinder(g,'Стекло люка',w*.23,.04,0,h*.46,d/2+.04,m.blue);glass.rotation.x=Math.PI/2;
    }else if(kind==='tv'){
      b('Экран ТВ',w, .63,d,0,1.3,0,m.dark,.008);
    }else if(kind==='exercise'){
      b('Коврик велотренажёра',.57,.018,.85,0,.012,0,m.dark);
      for(const z of [-.32,.32])b('Поперечная опора',.50,.055,.065,0,.055,z,m.dark);
      const flywheel=cylinder(g,'Маховик',.22,.085,0,.32,-.17,m.dark);flywheel.rotation.z=Math.PI/2;
      const rim=cylinder(g,'Стальной обод маховика',.19,.09,0,.32,-.17,m.metal);rim.rotation.z=Math.PI/2;
      const tube=(name,a,c,r=.027)=>{const va=new THREE.Vector3(...a),vc=new THREE.Vector3(...c),v=vc.clone().sub(va),o=cylinder(g,name,r,v.length(),...(va.clone().add(vc).multiplyScalar(.5).toArray()),m.dark);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());};
      tube('Рама',[0,.09,.31],[0,.63,-.17]);tube('Нижняя рама',[0,.10,-.32],[0,.40,.15]);tube('Подседельная труба',[0,.22,.18],[0,.85,.16]);
      b('Седло',.23,.06,.25,0,.88,.18,m.dark,.025);
      tube('Стойка руля',[0,.37,-.23],[0,1.03,-.28]);tube('Руль',[-.20,1.04,-.28],[.20,1.04,-.28],.02);
      for(const x of [-.20,.20])tube('Рукоятка',[x,1.04,-.28],[x,1.12,-.20],.018);
      b('Дисплей',.14,.10,.035,0,1.07,-.28,m.dark);
      const crank=cylinder(g,'Ось педалей',.065,.24,0,.30,.12,m.dark);crank.rotation.z=Math.PI/2;
      for(const x of [-.15,.15]){tube('Шатун',[x,.30,.12],[x,.30+(x<0?-.10:.10),.12],.014);b('Педаль',.13,.025,.07,x,.30+(x<0?-.10:.10),.12,m.dark);}
    }else if(kind==='shelf'){
      for(const x of [-w/2+.015,w/2-.015])b('Боковина',.03,h,d,x,h/2,0,m.oak);for(let y=.04;y<h;y+=.4)b('Полка',w,.03,d,0,y,0,m.oak);
    }else{
      const material=kind==='ottoman'?m.cloth:kind==='fridge'?m.white:kind==='safe'?m.dark:m.oak;
      b(f.name,w,h,d,0,h/2,0,material,kind==='ottoman'?.07:.008);
      if(['wardrobe','cabinet','fridge','appliance','oven'].includes(kind)){
        const n=Math.max(1,Math.round(w/.55));for(let i=0;i<n;i++){const x=-w/2+(i+.5)*w/n;b('Фасад',w/n-.008,h-.10,.022,x,h/2,d/2+.012,kind==='wardrobe'?m.linen:m.white);b('Ручка',.014,.16,.03,x+w/n*.29,h*.6,d/2+.04,m.metal);}
      }
      if(kind==='hob'){b('Варочная поверхность',w*.88,.025,d*.84,0,h+.02,0,m.dark);for(const x of [-w*.23,w*.23])for(const z of [-d*.22,d*.22])cylinder(g,'Конфорка',.085,.008,x,h+.04,z,m.metal);}
      if(kind==='oven')for(const y of [.85,1.55])b('Дверца техники',w*.88,.42,.025,0,y,d/2+.04,m.dark);
      if(kind==='fireplace')b('Топка',.02,h*.62,d*.75,-w/2-.015,h*.5,0,m.dark);
    }
  }
  // Kitchen and living room are open to each other; no sliding partition or track.
  const interior=addInterior({model,walls,furniture,floors,openings,data,m,box,cylinder,prism});
  // Mirrors shown on the plan; reflective appearance is schematic.

  model.userData={units:'metres',height:2.823,sources:['Обмерный план.pdf','Вариант 5.pdf'],assumptions:'Балконные двери: прозрачные, верх по соседним окнам (2468 мм). Остальные двери 2100 мм. Высоты мебели условные. Отметки окна 802/1666 мм распространены на остальные окна без отдельных подписей.'};
  model.userData.design='ImageGen materials · warm neoclassical · no fireplace · open kitchen/living';
  return {model,walls,furniture,floors,openings,...interior};
}







