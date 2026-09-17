import * as THREE from 'three';

export function addBedroom({data,furniture,details,decor,ceiling,lamps,m,b,rounded,framedPanel,curtain,plant,cylinder,prism,point,applyPhysicalUV}){
  const consoleTable=furniture.children.find(g=>g.name==='Консоль');if(consoleTable)furniture.remove(consoleTable);
  const exercise=furniture.children.find(g=>g.name==='Тренажёр');if(exercise)furniture.remove(exercise);
  const bed=furniture.children.find(g=>g.name==='Кровать 1600 × 2100');
  bed.clear();
  rounded(bed,'Мягкое основание кровати',1.60,.29,2.10,0,.235,0,m.cloth,.045);
  rounded(bed,'Матрас с покрывалом',1.59,.21,2.08,0,.47,0,m.linen,.055);
  rounded(bed,'Мягкое изголовье',1.70,1.18,.12,0,.68,-.97,m.cloth,.035);
  for(const x of [-.40,.40]){
    const p=rounded(bed,'Большая подушка',.70,.42,.17,x,.80,-.79,m.linen,.06);p.rotation.x=-.16;
    const q=rounded(bed,'Подушка taupe',.51,.31,.14,x,.74,-.65,m.cloth,.04);q.rotation.x=-.16;
  }
  rounded(bed,'Сложенное покрывало',1.61,.035,.46,0,.59,.51,m.throw,.01);
  // Bedside units keep their measured footprints, faces towards the room.
  for(const name of ['Левая тумба','Правая тумба']){
    const g=furniture.children.find(g=>g.name===name),f=g.userData;g.clear();
    b(g,'Корпус тумбы',f.w,.48,f.d,0,.29,0,m.cabinet);
    b(g,'Каменная крышка',f.w+.02,.025,f.d+.02,0,.543,0,m.stone);
    for(const y of [.18,.40]){framedPanel(g,0,y,f.d/2+.012,f.w-.045,.18,m.cabinet);b(g,'Ручка ящика',.085,.012,.025,0,y+.045,f.d/2+.033,m.metal);}
    cylinder(lamps,'Основание прикроватной лампы',.075,.022,f.x,.57,f.z,m.metal);
    cylinder(lamps,'Стойка лампы',.009,.23,f.x,.69,f.z,m.metal);
    const shade=cylinder(lamps,'Льняной абажур',.12,.18,f.x,.88,f.z,m.linen);applyPhysicalUV(shade.geometry,m.linen);
    point('Прикроватный свет',f.x,.80,f.z,1.0);
  }
  const wardrobe=furniture.children.find(g=>g.name==='Шкаф спальни');
  wardrobe.clear();wardrobe.rotation.y=-Math.PI/2;wardrobe.userData.frontDirection='west, into bedroom';
  const leafWidth=.455,w=leafWidth*3,d=.60;wardrobe.position.z+=leafWidth/2;wardrobe.userData={...wardrobe.userData,doorCount:3,leafWidth,totalWidth:w};
  b(wardrobe,'Корпус шкафа спальни',w,2.66,d,0,1.33,0,m.cabinet);
  for(const x of [-leafWidth,0,leafWidth]){
    b(wardrobe,'Фасад в спальню',leafWidth-.012,2.58,.024,x,1.33,d/2+.018,m.cabinet);
    framedPanel(wardrobe,x,1.67,d/2+.04,leafWidth-.095,1.74,m.cabinet);
    framedPanel(wardrobe,x,.38,d/2+.04,leafWidth-.095,.51,m.cabinet);
    b(wardrobe,'Латунная ручка',.022,.10,.034,x+(x<0?.15:-.15),.96,d/2+.065,m.metal);
  }
  b(wardrobe,'Карниз шкафа',w+.035,.09,d+.04,0,2.70,0,m.white);
  const shelf=furniture.children.find(g=>g.name==='Полки спальни');shelf.clear();shelf.rotation.y=-Math.PI/2;shelf.position.z+=leafWidth;
  // The closed glass front shares the wardrobe door plane in world space.
  const frontX=wardrobe.position.x-(d/2+.018);
  const shelfDepth=.60,frontZ=shelf.position.x-frontX;
  const backZ=frontZ-shelfDepth;
  shelf.userData={...shelf.userData,glassDoor:true,frontPlaneX:frontX,depth:shelfDepth,internalLighting:'3000K'};
  for(const x of [-.225,.225])b(shelf,'Боковина витрины спальни',.022,2.66,shelfDepth,x,1.33,(frontZ+backZ)/2,m.cabinet);
  b(shelf,'Задняя панель витрины',.45,2.66,.02,0,1.33,backZ+.01,m.cabinet);
  for(const y of [.06,.61,1.16,1.71,2.27,2.65])b(shelf,'Полка в спальню',.43,.025,shelfDepth-.04,0,y,(frontZ+backZ)/2,m.stone);
  const door=b(shelf,'Стеклянная дверь витрины спальни',.426,2.58,.008,0,1.33,frontZ,m.glass);door.castShadow=false;
  for(const x of [-.219,.219])b(shelf,'Рама стеклянной двери',.012,2.58,.018,x,1.33,frontZ,m.metal);
  for(const y of [.04,2.62])b(shelf,'Рама стеклянной двери',.45,.012,.018,0,y,frontZ,m.metal);
  b(shelf,'Ручка стеклянной двери',.015,.11,.025,-.18,1.02,frontZ+.02,m.metal);
  b(shelf,'Карниз витрины',.48,.09,shelfDepth+.04,0,2.70,(frontZ+backZ)/2,m.white);
  const shelfLed=new THREE.MeshStandardMaterial({name:'Подсветка витрины спальни 3000К',color:'#fff1d5',emissive:'#ffd399',emissiveIntensity:2.5});
  for(const x of [-.202,.202])b(shelf,'LED витрины спальни',.008,2.53,.009,x,1.33,backZ+.045,shelfLed);
  for(const y of [.38,.91,1.46,2.01,2.46])point('Подсветка витрины спальни',shelf.position.x-(backZ+.12),y,shelf.position.z,.32);
  // Profiles sit on the actual headboard wall, without covering the room door.
  for(const [x,width] of [[.83,.90],[2.32,1.82],[3.66,.70]])framedPanel(decor,x,1.46,3.144,width,2.22,m.white);
  b(decor,'Карниз над изголовьем',4.0,.09,.09,2.04,2.72,3.175,m.white);
  b(decor,'Плинтус спальни',4.0,.115,.027,2.04,.06,3.145,m.white);
  rounded(details,'Ковёр спальни',2.75,.016,2.70,2.32,.021,4.54,m.rug,.008);
  rounded(details,'Банкетка у кровати',1.18,.15,.36,2.32,.42,5.65,m.cloth,.045);
  for(const x of [1.82,2.82])for(const z of [5.53,5.77])b(details,'Ножка банкетки',.025,.33,.025,x,.19,z,m.metal);
  const tv=furniture.children.find(g=>g.name==='ТВ спальни');tv.clear();
  b(tv,'Экран ТВ спальни',1.0,.5625,.04,0,1.35,0,m.dark);
  b(decor,'Карниз штор спальни',2.23,.09,.13,3.72,2.70,6.12,m.white);
  curtain(2.80,.26,6.09,m.curtain,'Штора спальни слева');curtain(4.69,.28,6.09,m.curtain,'Штора спальни справа');
  curtain(3.85,1.64,6.14,m.sheer,'Тюль спальни до пола');
  // Gathered panels keep both inward-opening balcony doors accessible.
  b(decor,'Карниз южной двери балкона',1.50,.09,.13,1.194,2.70,6.08,m.white);
  for(const x of [.57,1.82]){
    curtain(x,.24,6.06,m.curtain,'Штора у южной двери балкона');
    curtain(x+(x<1.194?.10:-.10),.16,6.10,m.sheer,'Собранный тюль южной двери балкона');
  }
  b(decor,'Карниз западной двери балкона',.13,.09,1.42,.13,2.70,5.97,m.white);
  for(const z of [5.36,6.57]){
    const drape=curtain(.15,.24,z,m.curtain,'Штора у западной двери балкона');drape.rotation.y=Math.PI/2;
    const sheer=curtain(.11,.16,z+(z<5.97?.10:-.10),m.sheer,'Собранный тюль западной двери балкона');sheer.rotation.y=Math.PI/2;
  }
  const room=data.floors.find(f=>f.name==='Спальня');prism(ceiling,'Потолок · Спальня',room.points,.045,2.823,m.white);
  cylinder(lamps,'Крепление люстры спальни',.07,.025,2.32,2.79,4.45,m.metal);
  cylinder(lamps,'Подвес люстры спальни',.006,.30,2.32,2.63,4.45,m.metal);
  const shade=cylinder(lamps,'Тканевый плафон спальни',.28,.24,2.32,2.36,4.45,m.linen);applyPhysicalUV(shade.geometry,m.linen);
  point('Люстра спальни',2.32,2.16,4.45,4);
  for(const [x,z] of [[.65,3.70],[3.90,3.70],[.70,5.65],[4.55,5.65]]){cylinder(lamps,'Спот спальни',.035,.02,x,2.79,z,m.metal);point('Спот спальни',x,2.68,z,1.8);}
  plant(4.43,.025,5.82,.90);
  const exerciseMirror=new THREE.Mesh(new THREE.PlaneGeometry(6.238093-(4.617062+leafWidth),2.823),new THREE.MeshStandardMaterial({name:'Зеркало за тренажёром',color:'#f2f4f3',metalness:1,roughness:.015,side:THREE.DoubleSide}));
  exerciseMirror.name='Зеркало спальни за тренажёром';exerciseMirror.rotation.y=-Math.PI/2;exerciseMirror.position.set(5.451069,2.823/2,(6.238093+4.617062+leafWidth)/2);exerciseMirror.userData={type:'fullHeightMirror',width:6.238093-(4.617062+leafWidth),height:2.823,exerciseAndPlantUnchanged:true};decor.add(exerciseMirror);
  const paintingMat=new THREE.MeshStandardMaterial({name:'Пейзаж ImageGen',map:m.bedroomArt?.map||m.stone.map,roughness:.95});
  b(decor,'Рама картины спальни',1.04,.70,.035,2.32,1.91,3.17,m.metal);
  b(decor,'Пейзаж над кроватью',1.0,.66,.012,2.32,1.91,3.194,paintingMat);
}



