import * as THREE from 'three';
import urls from './texture-urls.json';
import livingArtUrl from './living-art-feng-shui.png';
export async function loadTextures(){
  const loader=new THREE.TextureLoader(),textures={};
  await Promise.all(Object.entries({...urls,livingArt:livingArtUrl}).map(async([id,url])=>{
    const t=await loader.loadAsync(url);t.name='ImageGen · '+id;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;t.anisotropy=8;textures[id]=t;
  }));return textures;
}
