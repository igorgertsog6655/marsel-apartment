import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',build:{outDir:'site',emptyOutDir:false,cssCodeSplit:false,lib:{entry:fileURLToPath(new URL('./src/main-interior.js',import.meta.url)),formats:['iife'],name:'MeasuredApartment',fileName:()=> 'model.js'},rollupOptions:{output:{assetFileNames:a=>a.name?.endsWith('.css')?'model.css':'assets/[name][extname]'}}}});
