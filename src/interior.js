import {addShower} from './shower.js';
import {addChild} from './child.js';
import {addHall} from './hall.js';
import {addBedroom} from './bedroom.js';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const materialSpecs={
  bathroomStone:{texture:'bathroomStone',tile:1.2,color:'#fff9ee',roughness:.36},
  wall:{texture:'paint',tile:.5,color:'#e6dfd2',roughness:.88},
  wood:{texture:'parquet',tile:1.8,color:'#ffffff',roughness:.62},
  tile:{texture:'stone',tile:1.2,color:'#d4d0c5',roughness:.72},
  white:{texture:'paint',tile:.5,color:'#faf6ed',roughness:.74},
  oak:{texture:'oak',tile:.6,color:'#d1b891',roughness:.55},
  cloth:{texture:'fabric',tile:.30,color:'#e8dcc7',roughness:.96},
  linen:{texture:'fabric',tile:.30,color:'#fff9ec',roughness:.96},
  cabinet:{texture:'paint',tile:.5,color:'#b7afa1',roughness:.65},
  stone:{texture:'stone',tile:1.2,color:'#fff9eb',roughness:.32},
  rug:{texture:'rug',tile:.5,color:'#eddfcb',roughness:1},
  curtain:{texture:'curtain',tile:.35,color:'#d5c5aa',roughness:.96},
  sheer:{texture:'curtain',tile:.35,color:'#fffaf0',roughness:.96},
  throw:{texture:'throw',tile:.4,color:'#d8c4a3',roughness:.98},
};
export function makeMaterialSet(textures){
  const m={};
  for(const [id,s] of Object.entries(materialSpecs)){
    const map=textures[s.texture]||null;
    const material=new THREE.MeshStandardMaterial({name:`${id} · ImageGen ${s.texture}`,color:s.color,roughness:s.roughness,map});
    material.userData={textureId:s.texture,metresPerTile:s.tile,source:'ImageGen',roughness:s.roughness};
    m[id]=material;
  }
  m.bedroomArt=new THREE.MeshStandardMaterial({name:'Пейзаж спальни ImageGen',map:textures.bedroomArt||null,roughness:.95});
  m.sheer.transparent=true;m.sheer.opacity=.27;m.sheer.depthWrite=false;m.sheer.side=THREE.DoubleSide;
  m.curtain.side=THREE.DoubleSide;m.throw.side=THREE.DoubleSide;
  m.dark=new THREE.MeshStandardMaterial({name:'Тёмное стекло техники',color:'#151b1c',roughness:.19,metalness:.22});
  m.metal=new THREE.MeshStandardMaterial({name:'Матовая латунь',color:'#a88845',roughness:.29,metalness:.82});
  m.glass=new THREE.MeshPhysicalMaterial({name:'Прозрачное оконное стекло',color:'#eefaff',roughness:.04,metalness:0,transparent:true,opacity:.16,depthWrite:false});
  m.blue=new THREE.MeshStandardMaterial({name:'Глазурь сантехники',color:'#c3d5d3',roughness:.22});
  return m;
}
export function applyPhysicalUV(geometry,material){
  const tile=material.userData?.metresPerTile;if(!tile)return;
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){
    const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
    let u,v;if(ay>=ax&&ay>=az){u=p.getX(i);v=p.getZ(i);}else if(ax>=az){u=p.getZ(i);v=p.getY(i);}else{u=p.getX(i);v=p.getY(i);}
    uv[i*2]=u/tile;uv[i*2+1]=v/tile;
  }geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
}

export function addInterior({model,walls,furniture,floors,openings,data,m,box,cylinder,prism}){
  const corridorTable=furniture.children.find(g=>g.name==='Бар');if(corridorTable)furniture.remove(corridorTable);
  for(const name of ['Сейф','Хранение в кладовой']){const old=furniture.getObjectByName(name);if(old)old.removeFromParent();}
  const doorBeige=new THREE.MeshStandardMaterial({name:'Бежевая краска дверных рам',color:'#d5c9b5',roughness:.72});
  openings.traverse(o=>{if(o.isMesh&&['Дверная коробка','Рама балконной створки','Балконная коробка'].includes(o.name))o.material=doorBeige;});
  const decor=new THREE.Group();decor.name='Отделка кухни-гостиной';model.add(decor);
  const details=new THREE.Group();details.name='Декор и текстиль';furniture.add(details);
  const ceiling=new THREE.Group();ceiling.name='Потолок кухни-гостиной';model.add(ceiling);ceiling.visible=false;
  const lamps=new THREE.Group();lamps.name='Освещение кухни-гостиной';model.add(lamps);
  const lightSources=[];
  const b=(parent,name,w,h,d,x,y,z,mat=m.white,round=0)=>box(parent,name,w,h,d,x,y,z,mat,round);
  const rounded=(parent,name,w,h,d,x,y,z,mat,r=.04)=>{
    const geo=new RoundedBoxGeometry(w,h,d,3,r);applyPhysicalUV(geo,mat);
    const mesh=new THREE.Mesh(geo,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  const setMaterial=(mesh,material)=>{mesh.material=material;applyPhysicalUV(mesh.geometry,material);};
  function framedPanel(parent,cx,cy,cz,w,h,material=m.white,rotation=0){
    const panel=new THREE.Group();panel.name='Профилированная рамка';panel.position.set(cx,cy,cz);panel.rotation.y=rotation;parent.add(panel);
    for(const y of [-h/2,h/2]){b(panel,'Молдинг',w,.032,.025,0,y,0,material);b(panel,'Кромка молдинга',w+.013,.012,.014,0,y,.016,material);}
    for(const x of [-w/2,w/2]){b(panel,'Молдинг',.032,h,.025,x,0,0,material);b(panel,'Кромка молдинга',.012,h+.013,.014,x,0,.016,material);}
    return panel;
  }
  // Continuous parquet uses real 120 x 600 mm planks, with one global pattern origin.
  // The individual oak grain comes from ImageGen; no baked shadows or large tile joints.
  function clip(poly,a,b){
    const result=[],inside=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=-1e-8;
    for(let i=0;i<poly.length;i++){
      const p=poly[i],q=poly[(i+1)%poly.length],ip=inside(p),iq=inside(q);
      if(ip)result.push(p);if(ip!==iq){const dx=q[0]-p[0],dy=q[1]-p[1],ex=b[0]-a[0],ey=b[1]-a[1];const t=((a[0]-p[0])*ey-(a[1]-p[1])*ex)/(dx*ey-dy*ex);result.push([p[0]+t*dx,p[1]+t*dy]);}
    }return result;
  }
  const parquet=new THREE.Group();parquet.name='Дубовая ёлочка · планки 120 × 600 мм';floors.add(parquet);
  const parquetRooms=data.floors.filter(f=>f.kind==='wood');
  for(const w of data.windows.filter(w=>['Южное окно у двери','Южное окно гостиной'].includes(w.name))){const x0=w.x-w.w/2,x1=w.x+w.w/2,z0=w.z-w.d/2;parquetRooms.push({name:'Паркет до рамы · '+w.name,points:[[x0,z0],[x1,z0],[x1,w.z],[x0,w.z]]});}
  const batches=Array.from({length:7},()=>({p:[],uv:[]}));
  const c=Math.SQRT1_2,world=(u,v)=>[c*(u-v),c*(u+v)];
  const floorTriangles=[];
  for(const room of parquetRooms){
    let points=room.points.slice();if(points.length>2&&points[0][0]===points.at(-1)[0]&&points[0][1]===points.at(-1)[1])points.pop();
    const v=points.map(p=>new THREE.Vector2(...p));
    for(const ix of THREE.ShapeUtils.triangulateShape(v,[])){
      let tri=ix.map(i=>points[i]);const area=(tri[1][0]-tri[0][0])*(tri[2][1]-tri[0][1])-(tri[1][1]-tri[0][1])*(tri[2][0]-tri[0][0]);if(area<0)tri.reverse();floorTriangles.push(tri);
    }
  }
  for(let i=-6;i<24;i++)for(let j=-85;j<85;j++)for(let axis=0;axis<2;axis++){
    const u=(i*5-j+(axis?4:0))*.12,v=(i*5+j+(axis?1:0))*.12,w=axis?.12:.6,d=axis?.6:.12,gap=.0012;
    const corners=[[u+gap,v+gap],[u+w-gap,v+gap],[u+w-gap,v+d-gap],[u+gap,v+d-gap]].map(p=>world(...p));
    const minx=Math.min(...corners.map(p=>p[0])),maxx=Math.max(...corners.map(p=>p[0])),minz=Math.min(...corners.map(p=>p[1])),maxz=Math.max(...corners.map(p=>p[1]));
    if(maxx<0||minx>9.49||maxz<0||minz>6.25)continue;
    const batch=batches[((i*17+j*31+axis*3)%7+7)%7];
    for(const tri of floorTriangles){
      if(maxx<Math.min(...tri.map(p=>p[0]))||minx>Math.max(...tri.map(p=>p[0]))||maxz<Math.min(...tri.map(p=>p[1]))||minz>Math.max(...tri.map(p=>p[1])))continue;
      let clipped=corners;for(let k=0;k<3&&clipped.length;k++)clipped=clip(clipped,tri[k],tri[(k+1)%3]);
      for(let k=1;k<clipped.length-1;k++)for(const p of [clipped[0],clipped[k+1],clipped[k]]){
        batch.p.push(p[0],.009,p[1]);const pu=c*(p[0]+p[1])-u,pv=c*(-p[0]+p[1])-v;
        batch.uv.push((axis?pu:pv)/.6+((j%5+5)%5)*.17,(axis?pv:pu)/.6+((i%3+3)%3)*.2);
      }
    }
  }
  for(let i=0;i<batches.length;i++){
    const a=batches[i],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(a.uv,2));geo.computeVertexNormals();
    const mat=m.oak.clone();mat.color.setRGB(.86+i*.017,.82+i*.017,.75+i*.017);mat.name=`Дубовая планка · оттенок ${i+1}`;
    const mesh=new THREE.Mesh(geo,mat);mesh.name=mat.name;mesh.receiveShadow=true;parquet.add(mesh);
  }
  for(const o of floors.children)if(o.isMesh&&parquetRooms.some(r=>r.name===o.name)){o.material=m.oak;}

  // Adapt the furniture already placed by the measured plan.
  for(const g of furniture.children.slice()){
    const f=g.userData;if(!f.kind)continue;
    const kitchen=f.z<.7&&f.x>4;
    if(kitchen){
      for(const o of g.children){if(!o.isMesh)continue;if(o.name==='Фасад'||['Холодильник','Духовой шкаф / СВЧ'].includes(o.name))setMaterial(o,m.cabinet);if(o.name==='Столешница')setMaterial(o,m.stone);}
      const facades=g.children.filter(o=>o.name==='Фасад');
      for(const o of facades){const size=o.geometry.parameters;framedPanel(g,o.position.x,o.position.y,o.position.z+.023,size.width-.09,size.height-.1,m.cabinet);}
      if(f.kind==='sink'){setMaterial(g.children.find(o=>o.name==='Тумба'),m.cabinet);setMaterial(g.children.find(o=>o.name==='Чаша'),m.white);framedPanel(g,0,.44,f.d/2+.025,f.w-.09,.56,m.cabinet);}
      if(['cabinet','appliance'].includes(f.kind))b(g,'Каменная столешница',f.w,.035,f.d+.025,0,f.h+.018,0,m.stone);
    }
    if(f.kind==='hob'){setMaterial(g.children.find(o=>o.name===f.name),m.cabinet);for(const o of g.children)if(o.name==='Конфорка')setMaterial(o,m.dark);framedPanel(g,0,f.h/2,f.d/2+.025,f.w-.09,f.h-.1,m.cabinet);}
    if(f.kind==='sofa'){
      for(const o of g.children)if(o.isMesh)setMaterial(o,o.name==='Цоколь'?m.oak:m.linen);
      for(const z of [-.57,0,.57]){const cushion=rounded(g,'Декоративная подушка',.18,.43,.46,-.13,.79,z,m.cloth,.075);cushion.rotation.z=-.17;}
      // A draped throw follows the front arm and seat; folds are geometry, pattern is ImageGen.
      const geo=new THREE.PlaneGeometry(.53,1.12,24,40),p=geo.attributes.position;
      for(let i=0;i<p.count;i++){const u=p.getX(i),t=(p.getY(i)+.56)/1.12;const y=t<.5?.16+t*.78:.55-(t-.5)*.02;const x=t<.5?.49+Math.sin(u*45)*.009:.49-(t-.5)*.85;p.setXYZ(i,x,y,u-.64);}
      geo.computeVertexNormals();applyPhysicalUV(geo,m.throw);const blanket=new THREE.Mesh(geo,m.throw);blanket.name='Плед с рисунком ёлочкой';blanket.castShadow=true;g.add(blanket);
    }
    if(['table','roundtable'].includes(f.kind)){
      g.clear();const top=cylinder(g,'Столешница из светлого камня',f.w/2,.05,0,f.h,0,m.stone);top.scale.z=f.d/f.w;applyPhysicalUV(top.geometry,m.stone);
      const radius=f.kind==='table'?.24:.22;const pedestal=cylinder(g,'Рифлёное основание',radius,f.h-.06,0,(f.h-.06)/2,0,m.oak);pedestal.scale.x=f.kind==='table'?1.8:1;
      for(let j=0;j<48;j++){const a=j/48*Math.PI*2;const rib=cylinder(g,'Дубовая рейка основания',.011,f.h-.06,Math.cos(a)*radius*(f.kind==='table'?1.8:1),(f.h-.06)/2,Math.sin(a)*radius,m.oak,8);applyPhysicalUV(rib.geometry,m.oak);}
    }
    if(f.name==='Обеденный стул'){
      for(const o of g.children)if(o.isMesh)setMaterial(o,o.name==='Ножка'?m.oak:m.linen);
      if(f.x<5.5)g.rotation.y=-Math.PI/2;else if(f.x>6.8)g.rotation.y=Math.PI/2;
    }
  }
  // Cornices and skirting follow real wall segments, never across openings.
  function trimSegment(x0,z0,x1,z1){
    const length=Math.hypot(x1-x0,z1-z0),g=new THREE.Group();g.name='Карниз и плинтус';g.position.set((x0+x1)/2,0,(z0+z1)/2);g.rotation.y=-Math.atan2(z1-z0,x1-x0);decor.add(g);
    b(g,'Плинтус',length,.12,.024,0,.065,0,m.white);b(g,'Кромка плинтуса',length,.02,.035,0,.13,0,m.white);
    for(const [y,h,d] of [[2.68,.065,.045],[2.736,.05,.072],[2.783,.04,.10]])b(g,'Карниз',length,h,d,0,y,0,m.white);
  }
  for(const s of [[4.07,0,9.47,0],[9.465,2.875,9.465,5.28],[5.77,3.02,5.77,4.05],[5.49,4.06,5.49,5.28],[6.11,5.27,6.77,5.27],[8.52,5.27,9.48,5.27],[4.08,0,4.08,1.405],[4.08,2.31,4.08,3.0],[9.48,1.31,10.89,1.31]])trimSegment(...s);
  for(const [x,z,w] of [[4.083,.72,1.03],[4.083,2.66,.48]])framedPanel(decor,x,1.47,z,w,1.92,m.white,Math.PI/2);
  // TV panel and storage occupy the east wall; the former fireplace area is clear wall panelling.
  b(decor,'Основа ТВ-панели',.024,2.38,1.75,9.44,1.36,4.12,m.cabinet);
  for(let z=3.29;z<4.97;z+=.026)b(decor,'Вертикальный рельеф ТВ-панели',.022,2.34,.012,9.417,1.36,z,m.white);
  const tv=data.furniture.find(f=>f.name==='ТВ гостиной');if(tv){const g=furniture.children.find(g=>g.name===tv.name);g.position.x=9.36;g.clear();b(g,'Экран ТВ гостиной',.045,.675,1.2,0,1.38,0,m.dark);}
  b(details,'Подвесная тумба под ТВ',.32,.4,1.62,9.22,.38,4.12,m.cabinet);
  b(details,'Каменная крышка ТВ-тумбы',.34,.025,1.66,9.21,.593,4.12,m.stone);
  for(const z of [3.57,4.12,4.67])framedPanel(details,9.047,.38,z,.48,.28,m.cabinet,Math.PI/2);
  const mirrorMaterial=new THREE.MeshStandardMaterial({name:'Зеркало от пола до потолка',color:'#f2f4f3',metalness:1,roughness:.015,side:THREE.DoubleSide});
  const cornerMirrorStart=4.995,cornerMirrorEnd=5.278036,cornerMirrorHeight=2.6475;
  const cornerMirror=new THREE.Mesh(new THREE.PlaneGeometry(cornerMirrorEnd-cornerMirrorStart,cornerMirrorHeight),mirrorMaterial);
  cornerMirror.name='Зеркальная полоса у окна гостиной';cornerMirror.rotation.y=-Math.PI/2;cornerMirror.position.set(9.435,cornerMirrorHeight/2,(cornerMirrorStart+cornerMirrorEnd)/2);cornerMirror.userData={type:'cornerMirror',width:cornerMirrorEnd-cornerMirrorStart,height:cornerMirrorHeight};decor.add(cornerMirror);
  const wallMirror=new THREE.Mesh(new THREE.PlaneGeometry(1.545,2.823),mirrorMaterial);wallMirror.name='Зеркало кухни-гостиной';wallMirror.rotation.y=-Math.PI/2;wallMirror.position.set(9.435,2.823/2,(1.32+2.865)/2);wallMirror.userData={type:'fullHeightMirror',width:1.545,height:2.823,plantUnchanged:true};decor.add(wallMirror);
  // A restrained tall display shelf near the TV uses the available corner above the room edge.
  const niche=new THREE.Group();niche.name='Подсвеченные полки ТВ-зоны';niche.position.set(9.22,0,3.04);details.add(niche);
  for(const z of [-.16,.16])b(niche,'Боковина ниши',.32,2.48,.035,0,1.32,z,m.cabinet);
  for(const y of [.52,1.08,1.64,2.2])b(niche,'Полка ниши',.32,.025,.35,0,y,0,m.stone);
  niche.userData={glassDoor:true,width:.355,depth:.32,internalLighting:'3000K'};
  b(niche,'Задняя панель витрины гостиной',.018,2.48,.32,.151,1.32,0,m.cabinet);
  for(const y of [.08,2.56])b(niche,'Дно и верх витрины гостиной',.32,.025,.355,0,y,0,m.cabinet);
  const nicheGlass=b(niche,'Стеклянная дверь витрины гостиной',.008,2.46,.32,-.169,1.32,0,m.glass);nicheGlass.castShadow=false;
  for(const z of [-.164,.164])b(niche,'Рама двери витрины гостиной',.018,2.48,.012,-.169,1.32,z,m.metal);
  for(const y of [.08,2.56])b(niche,'Рама двери витрины гостиной',.018,.012,.34,-.169,y,0,m.metal);
  b(niche,'Ручка витрины гостиной',.025,.11,.014,-.191,1.08,.13,m.metal);
  const nicheLed=new THREE.MeshStandardMaterial({name:'Подсветка витрины гостиной 3000К',color:'#fff1d5',emissive:'#ffd399',emissiveIntensity:2.5});
  for(const z of [-.136,.136])b(niche,'LED витрины гостиной',.009,2.40,.008,.123,1.32,z,nicheLed);
  // Upper kitchen cabinets and backsplash follow the existing lower cabinet run.
  b(details,'Каменный кухонный фартук',2.63,.65,.027,6.84,1.205,.02,m.stone);
  const upperRunStart=5.007,upperRunEnd=7.967,upperGap=.01,upperCabinetHeight=1.02,upperCabinetCenterY=2.075,upperCabinetTop=upperCabinetCenterY+upperCabinetHeight/2;
  const upperWidth=(upperRunEnd-upperRunStart-upperGap*4)/5,upperDepth=.40;
  for(let i=0;i<5;i++){
    const x=upperRunStart+upperWidth/2+i*(upperWidth+upperGap);
    const cabinet=b(details,'Верхний кухонный шкаф',upperWidth,upperCabinetHeight,upperDepth,x,upperCabinetCenterY,upperDepth/2,m.cabinet);
    cabinet.userData={depthMetres:upperDepth,alignedOverWorktop:true,noTallUnitOverlap:true};
    b(details,'Рамочный фасад верхнего шкафа',upperWidth-.014,.99,.022,x,2.075,upperDepth+.012,m.cabinet);
    framedPanel(details,x,2.075,upperDepth+.036,upperWidth-.10,.88,m.cabinet);b(details,'Латунная ручка шкафа',.065,.012,.028,x+.14,1.67,upperDepth+.053,m.metal);
  }
  const fridge=data.furniture.find(item=>item.kind==='fridge'),fridgeTop=fridge.h,fridgeUpperHeight=upperCabinetTop-fridgeTop,fridgeUpperY=fridgeTop+fridgeUpperHeight/2,fridgeUpperDepth=fridge.d;
  const fridgeUpper=b(details,'Навесной шкаф над холодильником',fridge.w,fridgeUpperHeight,fridgeUpperDepth,fridge.x,fridgeUpperY,fridgeUpperDepth/2,m.cabinet);
  fridgeUpper.userData={depthMetres:fridgeUpperDepth,widthMetres:fridge.w,topMetres:upperCabinetTop,alignedWithUpperCabinets:true,alignedWithFridgeDepth:true};
  b(details,'Рамочный фасад шкафа над холодильником',fridge.w-.014,fridgeUpperHeight-.03,.022,fridge.x,fridgeUpperY,fridgeUpperDepth+.012,m.cabinet);
  framedPanel(details,fridge.x,fridgeUpperY,fridgeUpperDepth+.036,fridge.w-.10,fridgeUpperHeight-.11,m.cabinet);
  b(details,'Латунная ручка шкафа над холодильником',.065,.012,.028,fridge.x+.27,fridgeTop+.10,fridgeUpperDepth+.053,m.metal);
  const emissive=new THREE.MeshStandardMaterial({name:'Тёплая подсветка',color:'#fff0cb',emissive:'#ffe1a3',emissiveIntensity:2});
  b(lamps,'Подсветка под шкафами',upperRunEnd-upperRunStart-.08,.009,.02,(upperRunStart+upperRunEnd)/2,1.548,upperDepth-.02,emissive);
  function point(name,x,y,z,power=8){const l=new THREE.PointLight('#ffe4bd',power,5,2);l.name=name;l.position.set(x,y,z);lamps.add(l);lightSources.push(l);return l;}
  for(const x of [5.30,6.49,7.67])point('Свет фартука',x,1.45,.46,2.2);
  for(const y of [.30,.80,1.36,1.92,2.38])point('Подсветка ниши',9.27,y,3.04,.32);
  // Ceiling follows the kitchen + living floor polygons. It is shown in interior views only.
  for(const f of data.floors.filter(f=>['Кухня-столовая','Гостиная','Прихожая'].includes(f.name)))prism(ceiling,'Потолок · '+f.name,f.points,.045,2.823,m.white);
  for(const [x,z] of [[4.5,.95],[6.15,.95],[8.5,.95],[8.9,2.4],[6.25,3.25],[8.8,4.85]]){
    cylinder(lamps,'Ободок встроенного светильника',.044,.017,x,2.805,z,m.metal);
    cylinder(lamps,'Рассеиватель',.033,.02,x,2.793,z,emissive);point('Потолочный свет',x,2.65,z,3.6);
  }
  const table=data.furniture.find(f=>f.kind==='table');
  cylinder(lamps,'Основание подвеса',.09,.025,table.x,2.79,table.z,m.metal);
  cylinder(lamps,'Подвес светильника',.006,.76,table.x,2.40,table.z,m.metal);
  cylinder(lamps,'Латунный диск светильника',.31,.034,table.x,2.0,table.z,m.metal);
  cylinder(lamps,'Светящийся диск',.286,.012,table.x,1.979,table.z,emissive);point('Подвес над столом',table.x,1.87,table.z,8);
  const livingSconceGlow=new THREE.MeshStandardMaterial({name:'Мягкая подсветка бра гостиной 2700К',color:'#fff0d5',emissive:'#ffd19a',emissiveIntensity:1.8,roughness:.5});
  b(lamps,'Вертикальный профиль бра гостиной',.030,1.10,.030,6.185,1.55,5.235,m.dark);
  b(lamps,'Центральное крепление бра гостиной',.12,.17,.060,6.185,1.55,5.235,m.dark);
  b(lamps,'Тёплая линия бра гостиной сверху',.020,.44,.010,6.185,1.82,5.255,livingSconceGlow);
  b(lamps,'Тёплая линия бра гостиной снизу',.020,.44,.010,6.185,1.28,5.255,livingSconceGlow);
  point('Бра гостиной · верхний свет',6.185,1.88,5.12,.9);
  point('Бра гостиной · нижний свет',6.185,1.22,5.12,.9);
  // Textile: rug, curtains and tulle; doorway itself remains usable and transparent.
  rounded(details,'Светлый шерстяной ковёр',2.38,.018,1.94,7.56,.022,4.17,m.rug,.015);
  function curtain(x,width,z,material,name){
    const geo=new THREE.PlaneGeometry(width,2.62,Math.max(24,Math.round(width*90)),35),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i),t=(v+1.31)/2.62;p.setXYZ(i,u*(1.03-t*.03),v,.047*Math.sin(u*58)+.012*Math.sin(u*116)+(1-t)*.015*Math.cos(u*23));}
    geo.computeVertexNormals();applyPhysicalUV(geo,material);const mesh=new THREE.Mesh(geo,material);mesh.name=name;mesh.position.set(x,1.36,z);mesh.castShadow=material!==m.sheer;mesh.receiveShadow=true;details.add(mesh);return mesh;
  }
  b(decor,'Скрытый карниз штор гостиной',3.32,.11,.14,7.8,2.7,5.16,m.white);
  curtain(6.51,.40,5.13,m.curtain,'Плотная штора слева');curtain(8.77,.44,5.13,m.curtain,'Плотная штора справа');
  curtain(8.10,.80,5.20,m.sheer,'Белый тюль у окна');
  // Small lounge chair fits within the measured living room and faces the sofa.
  const chair=new THREE.Group();chair.name='Кресло у ТВ-зоны';chair.position.set(8.26,0,3.37);chair.rotation.y=-.25;details.add(chair);
  rounded(chair,'Сиденье кресла',.61,.14,.57,0,.45,0,m.linen,.065);
  rounded(chair,'Спинка кресла',.66,.55,.13,0,.71,-.25,m.linen,.06);
  for(const x of [-.3,.3])rounded(chair,'Подлокотник кресла',.10,.24,.55,x,.60,0,m.linen,.04);
  for(const x of [-.24,.24])for(const z of [-.2,.2])cylinder(chair,'Ножка кресла',.013,.36,x,.2,z,m.metal);
  // Reusable low-poly ceramic and foliage, kept out of door clearances.
  function vase(x,y,z,size,parent=details){
    const geo=new THREE.LatheGeometry([new THREE.Vector2(size*.42,0),new THREE.Vector2(size*.56,size*.3),new THREE.Vector2(size*.43,size*.76),new THREE.Vector2(size*.22,size),new THREE.Vector2(size*.21,size*1.1)],24);
    applyPhysicalUV(geo,m.stone);const v=new THREE.Mesh(geo,m.stone);v.name='Керамическая ваза';v.position.set(x,y,z);v.castShadow=true;parent.add(v);return v;
  }
  function plant(x,y,z,size){
    vase(x,y,z,size*.25);const leafMat=new THREE.MeshStandardMaterial({name:'Листва',color:'#697653',roughness:.9,side:THREE.DoubleSide});
    const twigMat=new THREE.MeshStandardMaterial({name:'Ветки',color:'#75664c',roughness:.9});
    for(let j=0;j<5;j++){
      const a=j*2.4,dx=Math.cos(a)*size*.21,dz=Math.sin(a)*size*.21;const stem=cylinder(details,'Ветвь',size*.004,size*.6,x+dx/2,y+size*.5,z+dz/2,twigMat);stem.rotation.z=-dx;stem.rotation.x=dz;
      for(let k=0;k<9;k++){const angle=a+k*2.3,r=size*(.12+.02*(k%3));const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,7,4),leafMat);leaf.name='Лист';leaf.scale.set(size*.09,size*.018,size*.036);leaf.position.set(x+dx+Math.cos(angle)*r,y+size*(.3+k*.062),z+dz+Math.sin(angle)*r);leaf.rotation.set(angle*.3,angle,.6);details.add(leaf);}
    }
  }
  plant(table.x,table.h+.028,table.z,.52);
  const coffee=data.furniture.find(f=>f.kind==='roundtable');vase(coffee.x,coffee.h+.027,coffee.z,.13);
  plant(8.98,.025,2.21,1.35);
  for(const [x,z] of [[5.7,.21],[7.5,.2]])vase(x,.915,z,.14);
  // Frame mouldings on existing internal door leaves.
  for(const frame of openings.children){
    if(!frame.isGroup||frame.userData.type==='balconyDoor')continue;
    for(const hinge of frame.children.filter(c=>c.isGroup)){
      const leaf=hinge.children.find(o=>o.name==='Дверное полотно');if(!leaf)continue;
      setMaterial(leaf,m.white);const w=leaf.geometry.parameters.width;
      framedPanel(hinge,w/2,1.28,.029,w-.16,1.24,m.white);framedPanel(hinge,w/2,.38,.029,w-.16,.39,m.white);
    }
  }
  addBedroom({data,furniture,details,decor,ceiling,lamps,m,b,rounded,framedPanel,curtain,plant,cylinder,prism,point,applyPhysicalUV});
  const tower=furniture.children.find(g=>g.userData.kind==='oven');tower.clear();
  b(tower,'Корпус пенала СВЧ',.60,upperCabinetTop,.60,0,upperCabinetTop/2,0,m.cabinet);
  const upperTowerFacadeTop=upperCabinetTop-.02,upperTowerFacadeBottom=1.76,upperTowerFacadeHeight=upperTowerFacadeTop-upperTowerFacadeBottom;
  for(const [y,h] of [[.59,1.02],[(upperTowerFacadeTop+upperTowerFacadeBottom)/2,upperTowerFacadeHeight]]){b(tower,'Фасад без ручки',.584,h,.02,0,y,.313,m.cabinet);framedPanel(tower,0,y,.335,.49,h-.10,m.cabinet);}
  b(tower,'Встроенная микроволновка 595 × 380',.595,.38,.04,0,1.43,.326,m.dark);
  b(tower,'Стекло СВЧ',.45,.255,.012,-.04,1.405,.353,m.dark);
  b(tower,'Панель управления СВЧ',.065,.27,.014,.245,1.43,.355,m.metal);
  tower.userData.appliance='microwave only; handleless cabinet';tower.userData.heightMetres=upperCabinetTop;tower.userData.topAlignedWithUpperCabinets=true;
  const mirrorStart=8.57677,mirrorEnd=9.48113-.20;
  const kitchenMirror=new THREE.Mesh(new THREE.PlaneGeometry(mirrorEnd-mirrorStart,2.823),new THREE.MeshStandardMaterial({name:'Зеркало справа от кухни',color:'#f2f4f3',metalness:1,roughness:.015,side:THREE.DoubleSide}));
  kitchenMirror.name='Зеркало справа от кухонного пенала';kitchenMirror.position.set((mirrorStart+mirrorEnd)/2,2.823/2,.015);kitchenMirror.userData={type:'fullHeightMirror',width:mirrorEnd-mirrorStart,height:2.823,wallReservedForIntercom:.20};decor.add(kitchenMirror);
  const hob=furniture.children.find(g=>g.userData.kind==='hob');
  for(const o of hob.children.slice())if(o.name==='Профилированная рамка')hob.remove(o);
  b(hob,'Духовка под варочной панелью 595 × 595',.595,.595,.035,0,.455,.322,m.dark);
  b(hob,'Панель управления духовки',.57,.09,.012,0,.708,.347,m.dark);
  b(hob,'Горизонтальная ручка духовки',.43,.023,.036,0,.626,.375,m.metal);
  for(const x of [-.19,.19]){const knob=cylinder(hob,'Регулятор духовки',.018,.018,x,.709,.367,m.metal);knob.rotation.x=Math.PI/2;}
  hob.userData.ovenBelowHob=true;
  addChild({furniture,details,decor,ceiling,lamps,data,m,b,rounded,framedPanel,prism,point,cylinder,curtain});
  const hallMirror=addHall({furniture,decor,ceiling,lamps,data,m,b,rounded,framedPanel,prism,point,cylinder});
  // Bathroom finishes follow the measured footprint; fixtures retain their coordinates.
  const bathroom=data.floors.find(f=>f.name==='Ванная');
  prism(ceiling,'Потолок ванной',bathroom.points,.045,2.823,m.white);
  b(decor,'Камень восточной стены ванной',.018,2.823,2.40,13.005,1.4115,-.61,m.stone);
  b(decor,'Камень за ванной',1.82,2.823,.018,12.01,1.4115,.61,m.stone);
  b(decor,'Камень северной стены ванной',1.96,2.823,.018,12.04,1.4115,-1.815,m.stone);
  const vanity=furniture.getObjectByName('Раковина ванной');
  vanity.traverse(o=>{if(o.isMesh&&o.name==='Тумба')o.material=m.cabinet;});
  b(decor,'Фасад тумбы ванной в проход',.024,.66,.77,12.516,.43,-.629,m.cabinet);
  const bathroomMirror=new THREE.Mesh(new THREE.PlaneGeometry(.77,1.30),new THREE.MeshStandardMaterial({color:'#eff2ef',metalness:1,roughness:.015}));
  bathroomMirror.name='Зеркало над раковиной ванной';bathroomMirror.position.set(12.981,1.70,-.629);bathroomMirror.rotation.y=-Math.PI/2;decor.add(bathroomMirror);
  const bathLed=new THREE.MeshStandardMaterial({name:'Тёплая подсветка ванной',color:'#fff0ca',emissive:'#ffd399',emissiveIntensity:2.5});
  for(const z of [-1.025,-.233])b(decor,'Латунный край зеркала ванной',.025,1.33,.014,12.966,1.70,z,m.metal);
  for(const y of [1.038,2.362])b(decor,'Латунный край зеркала ванной',.025,.014,.80,12.966,y,-.629,m.metal);
  b(lamps,'Подсветка под зеркалом ванной',.022,.012,.72,12.95,1.025,-.629,bathLed);
  point('Подсветка зеркала ванной',12.78,1.15,-.629,1.6);
  b(decor,'Полка над ванной',1.68,.035,.12,12.08,1.10,.535,m.stone);
  b(lamps,'Лента над полкой ванны',1.62,.015,.018,12.08,1.25,.585,bathLed);
  for(const x of [11.55,12.12,12.65])point('Подсветка полки ванны',x,1.24,.45,.65);
  b(decor,'Фартук тумбы ванной',.025,.18,.79,12.977,.93,-.629,m.stone);
  for(const y of [.32,.62])b(decor,'Шов ящика тумбы ванной',.027,.009,.75,12.50,y,-.629,m.dark);
  const faucet=vanity.getObjectByName('Кран');if(faucet)faucet.position.set(.15,.94,0);
  b(vanity,'Излив крана ванной',.15,.025,.025,.08,1.02,0,m.metal);
  b(decor,'Экран ванны из камня',1.70,.55,.025,12.08,.285,-.184,m.stone);
  const bathScreen=b(decor,'Стекло у торца ванны',.012,1.45,.76,11.215,1.325,.223,m.glass);bathScreen.castShadow=false;
  for(const [x,z] of [[11.6,-1.3],[12.45,-.2]]){cylinder(lamps,'Спот ванной',.035,.02,x,2.79,z,m.metal);point('Свет ванной',x,2.55,z,4);}
  // Wall-mounted storage above the washer and toilet; no change to fixture footprint.
  for(const [x,z,w,d] of [[11.346,-1.67,.60,.28],[12.87,-1.429,.26,.44]]){
    b(decor,'Настенный шкаф ванной',w,.88,d,x,2.12,z,m.cabinet);
  }
  for(const y of [1.20,1.52]){
    b(decor,'Открытая полка над стиральной машиной',.60,.025,.25,11.346,y,-1.68,m.cabinet);
    b(lamps,'Подсветка открытой полки ванной',.54,.012,.02,11.346,y-.025,-1.565,bathLed);
  }
  point('Подсветка полок над стиральной машиной',11.346,1.48,-1.40,1);
  for(const z of [-.08,.10]){
    const rail=cylinder(decor,'Стойка полотенцесушителя',.015,1.10,11.115,1.65,z,m.metal);
  }
  for(const y of [1.14,1.32,1.50,1.68,1.86,2.10])b(decor,'Перекладина полотенцесушителя',.028,.022,.21,11.115,y,.01,m.metal);
  b(decor,'Клавиша смыва ванной',.025,.16,.24,12.822,1.02,-1.429,m.metal);
  decor.traverse(o=>{if(o.isMesh&&o.material===m.stone&&/ванн|тумбы ванной/i.test(o.name)){o.material=m.bathroomStone;applyPhysicalUV(o.geometry,m.bathroomStone);}});
  const bathFloor=floors.getObjectByName('Ванная');bathFloor.material=m.bathroomStone;applyPhysicalUV(bathFloor.geometry,m.bathroomStone);
  addShower({furniture,floors,decor,ceiling,lamps,data,m,b,prism,point,cylinder,framedPanel,applyPhysicalUV});
  const wardrobeRoom=new THREE.Group();wardrobeRoom.name='Гардеробная · встроенное хранение';details.add(wardrobeRoom);
  const closetLed=new THREE.MeshStandardMaterial({name:'Подсветка гардеробной 3000К',color:'#fff1d5',emissive:'#ffd399',emissiveIntensity:2.5});
  // Full-depth hanging section on the far wall, shallow shelves along the north wall.
  b(wardrobeRoom,'Задняя панель гардеробной',.025,2.63,1.23,7.75,1.315,-2.535,m.cabinet);
  for(const z of [-3.14,-2.54,-1.92])b(wardrobeRoom,'Боковина секции гардеробной',.55,2.63,.025,8.01,1.315,z,m.cabinet);
  for(const y of [.10,.64,2.22,2.62])b(wardrobeRoom,'Полка гардеробной',.55,.025,1.23,8.01,y,-2.535,m.cabinet);
  for(const z of [-2.84,-2.23]){
    for(const y of [.24,.48]){b(wardrobeRoom,'Ящик гардеробной',.53,.21,.56,8.01,y,z,m.cabinet);b(wardrobeRoom,'Латунная ручка ящика',.025,.02,.20,8.29,y,z,m.metal);}
    b(wardrobeRoom,'Штанга для одежды',.022,.022,.55,8.01,2.05,z,m.metal);
    for(let i=0;i<4;i++){const zz=z-.20+i*.13;b(wardrobeRoom,'Одежда на вешалке',.40,.90,.07,8.02,1.53,zz,i%2?m.linen:m.curtain,.025);b(wardrobeRoom,'Вешалка',.36,.018,.02,8.02,2.015,zz,m.oak);}
    b(lamps,'LED под полкой гардеробной',.018,.015,.53,8.255,2.19,z,closetLed);point('Подсветка одежды',8.35,2.03,z,1.8);
  }
  b(wardrobeRoom,'Северная панель хранения',1.10,2.63,.025,8.89,1.315,-3.16,m.cabinet);
  for(const x of [8.35,8.89,9.43])b(wardrobeRoom,'Боковина полок',.025,2.63,.29,x,1.315,-3.025,m.cabinet);
  for(const y of [.10,.52,.94,1.36,1.78,2.20,2.62])b(wardrobeRoom,'Полки для обуви и сумок',1.10,.025,.29,8.89,y,-3.025,m.cabinet);
  for(const y of [.55,.97,1.39,1.81])for(const x of [8.60,9.15])b(wardrobeRoom,'Коробка для хранения',.36,.22,.22,x,y+.11,-3.015,m.linen,.015);
  for(const x of [8.365,9.415])b(lamps,'Вертикальная подсветка полок',.012,2.45,.012,x,1.34,-2.875,closetLed);
  point('Подсветка полок гардеробной',8.90,1.95,-2.78,2);
  const closetFloor=data.floors.find(f=>f.name==='Кладовая / сейф');prism(ceiling,'Потолок гардеробной',closetFloor.points,.045,2.823,m.white);
  cylinder(lamps,'Плафон гардеробной',.16,.07,8.80,2.75,-2.34,m.linen);point('Свет гардеробной',8.80,2.58,-2.34,5);
  return {decor,details,ceiling,lamps,lightSources,wallMirror,hallMirror};
}









