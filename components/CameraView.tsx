import React, { useRef, useEffect, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { 
  XMarkIcon, CheckIcon, TrashIcon,
  ArrowUturnLeftIcon, RectangleStackIcon, ScansioniChLevelIndicatorIcon,
  BoltIcon, BoltSlashIcon, BoltAutoIcon
} from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import type { ProcessingMode } from '../services/geminiService';
import { useCameraStream } from './useCameraStream';
import { useDeviceTilt } from './useDeviceTilt';
import { useDocumentScanner } from './useDocumentScanner';
import { DynamicMeshOverlay } from './DynamicMeshOverlay';

declare const cv: any;

/* ========= Helpers ========= */

// AudioContext singleton
let __AC: AudioContext | null = null;
const getAC = () => {
  if (__AC) return __AC;
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  __AC = new Ctx();
  return __AC;
};
const beep = (f=1000, ms=80, g=0.6) => {
  try {
    const ac = getAC(); if (!ac) return;
    const o = ac.createOscillator(); const gn = ac.createGain();
    o.connect(gn); gn.connect(ac.destination);
    o.type='sine'; o.frequency.setValueAtTime(f, ac.currentTime);
    gn.gain.setValueAtTime(0, ac.currentTime);
    gn.gain.linearRampToValueAtTime(g, ac.currentTime+0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime+ms/1000);
    o.start(); o.stop(ac.currentTime+ms/1000);
  } catch {}
};
const playShutter = () => beep(880, 60, 0.9);
const playLockOn  = () => beep(1200, 100, 0.5);

const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((res, rej) => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.onerror = rej; fr.readAsDataURL(blob); });

const orderTLTRBRBL = (corners: {x:number; y:number}[]) => {
  if (!corners || corners.length!==4) return corners;
  const bySum=[...corners].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  const tl=bySum[0], br=bySum[3];
  const byDiff=[...corners].sort((a,b)=>(a.y-a.x)-(b.y-b.x));
  const tr=byDiff[0], bl=byDiff[3];
  if (new Set([tl,tr,br,bl]).size<4){
    const ys=[...corners].sort((a,b)=>a.y-b.y);
    const top=ys.slice(0,2).sort((a,b)=>a.x-b.x);
    const bot=ys.slice(2,4).sort((a,b)=>a.x-b.x);
    return [top[0], top[1], bot[1], bot[0]];
  }
  return [tl,tr,br,bl];
};

const perspectiveTransform = (image: HTMLImageElement, corners: {x:number;y:number}[]): Promise<string> => new Promise((resolve,reject)=>{
  try{
    if(!cv || !corners || corners.length!==4) return resolve(image.src);
    const srcMat=cv.imread(image);
    const [tl,tr,br,bl]=orderTLTRBRBL(corners);
    const wTop =Math.hypot(tr.x-tl.x,tr.y-tl.y);
    const wBot =Math.hypot(br.x-bl.x,br.y-bl.y);
    const hLeft=Math.hypot(bl.x-tl.x,bl.y-tl.y);
    const hRight=Math.hypot(br.x-tr.x,br.y-tr.y);
    const destW=Math.max(wTop,wBot), destH=Math.max(hLeft,hRight);
    const srcTri=cv.matFromArray(4,1,cv.CV_32FC2,[tl.x,tl.y,tr.x,tr.y,br.x,br.y,bl.x,bl.y]);
    const dstTri=cv.matFromArray(4,1,cv.CV_32FC2,[0,0,destW,0,destW,destH,0,destH]);
    const M=cv.getPerspectiveTransform(srcTri,dstTri);
    const dsize=new cv.Size(Math.round(destW),Math.round(destH));
    const warped=new cv.Mat();
    cv.warpPerspective(srcMat,warped,M,dsize,cv.INTER_LINEAR,cv.BORDER_CONSTANT,new cv.Scalar());
    const tmp=document.createElement('canvas'); cv.imshow(tmp,warped);
    const url=tmp.toDataURL('image/jpeg',0.95);
    srcMat.delete(); warped.delete(); M.delete(); srcTri.delete(); dstTri.delete();
    resolve(url);
  }catch(e){ console.error('warp fail',e); reject(e); }
});

/* ========= CropView ========= */
interface CropViewProps {
  imageDataUrl: string;
  initialCorners: { x:number; y:number }[];
  onConfirm: (warpedDataUrl: string) => void;
  onCancel: () => void;
}
const CropView: React.FC<CropViewProps> = ({ imageDataUrl, initialCorners, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef  = useRef<HTMLImageElement>(new Image());
  const [corners,setCorners]=useState(initialCorners);
  const [dragging,setDragging]=useState<number|null>(null);
  const [busy,setBusy]=useState(false);
  const loupeSize=120, zoom=2.5;

  const draw = useCallback(()=>{
    const c=canvasRef.current, img=imageRef.current; if(!c||!img.src) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    const dpr=window.devicePixelRatio||1, r=c.getBoundingClientRect();
    c.width=r.width*dpr; c.height=r.height*dpr; ctx.scale(dpr,dpr);
    const cr=r.width/r.height, ir=img.naturalWidth/img.naturalHeight;
    let dw,dh,ox,oy;
    if(ir>cr){ dw=r.width; dh=dw/ir; ox=0; oy=(r.height-dh)/2; } else { dh=r.height; dw=dh*ir; oy=0; ox=(r.width-dw)/2; }
    ctx.clearRect(0,0,r.width,r.height);
    ctx.drawImage(img,ox,oy,dw,dh);
    const sc=corners.map(p=>({x:(p.x/img.naturalWidth)*dw+ox,y:(p.y/img.naturalHeight)*dh+oy}));
    ctx.strokeStyle='rgba(74,222,128,0.9)'; ctx.lineWidth=3; ctx.beginPath();
    sc.forEach((p,i)=> i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.stroke();
    sc.forEach((p,i)=>{ ctx.fillStyle= dragging===i?'rgba(192,132,252,1)':'rgba(74,222,128,0.9)'; ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fill(); });
    if(dragging!==null){
      const ip=corners[dragging], lx=loupeSize/2+20, ly=loupeSize/2+20;
      ctx.save(); ctx.beginPath(); ctx.arc(lx,ly,loupeSize/2,0,Math.PI*2); ctx.clip();
      ctx.drawImage(img, ip.x-(loupeSize/2)/zoom, ip.y-(loupeSize/2)/zoom, loupeSize/zoom, loupeSize/zoom, lx-loupeSize/2, ly-loupeSize/2, loupeSize, loupeSize);
      ctx.restore();
      ctx.beginPath(); ctx.strokeStyle='rgba(255,0,0,0.8)'; ctx.lineWidth=1;
      ctx.moveTo(lx-loupeSize/2,ly); ctx.lineTo(lx+loupeSize/2,ly);
      ctx.moveTo(lx,ly-loupeSize/2); ctx.lineTo(lx,ly+loupeSize/2); ctx.stroke();
      ctx.beginPath(); ctx.strokeStyle='rgba(192,132,252,1)'; ctx.lineWidth=3; ctx.arc(lx,ly,loupeSize/2,0,Math.PI*2); ctx.stroke();
    }
  },[corners,dragging]);

  useEffect(()=>{
    const img=imageRef.current; img.src=imageDataUrl; img.onload=()=>draw();
    window.addEventListener('resize',draw); return ()=>window.removeEventListener('resize',draw);
  },[imageDataUrl,draw]);
  useEffect(()=>{ draw(); },[draw]);

  const hitIndex=(x:number,y:number)=>{ const c=canvasRef.current, img=imageRef.current; if(!c||!img.src) return null;
    const r=c.getBoundingClientRect(), cr=r.width/r.height, ir=img.naturalWidth/img.naturalHeight; let dw,dh,ox,oy;
    if(ir>cr){ dw=r.width; dh=dw/ir; ox=0; oy=(r.height-dh)/2; } else { dh=r.height; dw=dh*ir; oy=0; ox=(r.width-dw)/2; }
    const sc=corners.map(p=>({x:(p.x/img.naturalWidth)*dw+ox,y:(p.y/img.naturalHeight)*dh+oy}));
    for(let i=0;i<sc.length;i++){ if(Math.hypot(x-sc[i].x,y-sc[i].y)<20) return i; } return null;
  };
  const onDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{ const r=e.currentTarget.getBoundingClientRect(); const i=hitIndex(e.clientX-r.left,e.clientY-r.top); if(i!==null){ setDragging(i); e.currentTarget.setPointerCapture(e.pointerId);} };
  const onMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    if(dragging===null) return; const c=canvasRef.current, img=imageRef.current; if(!c||!img.src) return;
    const r=c.getBoundingClientRect(), cr=r.width/r.height, ir=img.naturalWidth/img.naturalHeight; let dw,dh,ox,oy;
    if(ir>cr){ dw=r.width; dh=dw/ir; ox=0; oy=(r.height-dh)/2; } else { dh=r.height; dw=dh*ir; oy=0; ox=(r.width-dw)/2; }
    const x=e.clientX-r.left, y=e.clientY-r.top;
    const next=[...corners]; next[dragging]={ x:((x-ox)/dw)*img.naturalWidth, y:((y-oy)/dh)*img.naturalHeight }; setCorners(next);
  };
  const onUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{ if(dragging!==null){ setDragging(null); e.currentTarget.releasePointerCapture(e.pointerId);} };
  const confirm=async()=>{ setBusy(true); try{ const img=imageRef.current; const warped=await perspectiveTransform(img,orderTLTRBRBL(corners)); onConfirm(warped); } catch(e){ console.error(e); alert('Errore ritaglio. Uso immagine originale.'); onConfirm(imageDataUrl);} finally{ setBusy(false);} };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white" role="dialog" aria-modal="true">
      <header className="p-3 flex justify-between items-center bg-black/50 flex-shrink-0 backdrop-blur-sm">
        <h2 className="text-lg font-bold">Aggiusta Ritaglio</h2>
      </header>
      <main className="flex-grow relative">
        <canvas ref={canvasRef} className="w-full h-full" style={{touchAction:'none'}} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}/>
      </main>
      <footer className="p-4 flex justify-between items-center bg-black/50 flex-shrink-0 backdrop-blur-sm">
        <button onClick={onCancel} className="w-24 flex flex-col items-center gap-1 text-red-400 font-semibold">
          <ArrowUturnLeftIcon className="w-8 h-8"/><span className="text-xs">Rifai Foto</span>
        </button>
        <button onClick={confirm} disabled={busy} className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center ring-4 ring-black/30 disabled:bg-slate-400 transition-all active:scale-95" aria-label="Conferma ritaglio">
          {busy ? <LoadingSpinner className="w-10 h-10"/> : <CheckIcon className="w-12 h-12 text-white" />}
        </button>
        <div className="w-24 h-20 flex items-center justify-center" />
      </footer>
    </div>
  );
};

/* ========= GalleryView ========= */
interface GalleryViewProps { images:string[]; onClose:()=>void; onFinish:()=>void; onDelete:(i:number)=>void; }
const GalleryView: React.FC<GalleryViewProps> = ({ images, onClose, onFinish, onDelete }) => (
  <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-white" role="dialog" aria-modal="true">
    <header className="p-4 flex justify-between items-center bg-slate-800/80 backdrop-blur-sm flex-shrink-0">
      <h2 className="text-lg font-bold">Scansioni ({images.length})</h2>
      <div className="flex gap-2">
        <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded-lg">Indietro</button>
        <button onClick={onFinish} className="px-4 py-2 bg-purple-600 rounded-lg font-bold">Fine</button>
      </div>
    </header>
    <main className="flex-grow overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-[3/4] group">
          <img src={img} alt={`Scansione ${i+1}`} className="w-full h-full object-cover rounded-lg"/>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <button onClick={()=>onDelete(i)} className="p-3 bg-red-600 rounded-full"><TrashIcon className="w-6 h-6 text-white"/></button>
          </div>
        </div>
      ))}
    </main>
  </div>
);

/* ========= Hook utils ========= */
function usePrevious<T>(v:T){ const r=useRef<T|undefined>(undefined); useEffect(()=>{ r.current=v; }); return r.current; }

/* ========= CameraView ========= */
interface CameraViewProps { onFinish:(images:string[])=>void; onClose:()=>void; processingMode: ProcessingMode; }

export const CameraView: React.FC<CameraViewProps> = ({ onFinish, onClose, processingMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isCvReady, setIsCvReady] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{ dataUrl:string; corners:{x:number;y:number}[] }|null>(null);

  const [multiShotEnabled, setMultiShotEnabled] = useState(true);
  const [captureMode, setCaptureMode] = useState<'auto'|'manual'>('auto');
  const [flashMode, setFlashMode] = useState<'auto'|'on'|'off'>('auto');

  const [captureProgress, setCaptureProgress] = useState(0);
  const rafRef = useRef<number|null>(null);
  const startTsRef = useRef<number|null>(null);

  const {
    isVideoReady, error: streamError, isTorchOn, torchSupported, applyTorchState,
    requiresUserGesture,            // <-- nuovo
    resumePlayback                  // <-- nuovo
  } = useCameraStream(videoRef);

  const { isLevel, sensorStatus, bubblePosition } = useDeviceTilt();
  const { detectedCorners, isDocumentDetected, feedback, isStable, pause, resume, triggerCooldown, quality } = useDocumentScanner({
    videoRef, processingCanvasRef, isCvReady,
  } as any);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [videoDisplaySize,setVideoDisplaySize]=useState({width:0,height:0});
  const [processingSize,setProcessingSize]=useState({width:0,height:0});

  // UI non bloccata da CV: inizializza solo sul video
  const isInitializing = !isVideoReady;
  const isAutoCaptureReady = isDocumentDetected && isStable;
  const prevIsAutoCaptureReady = usePrevious(isAutoCaptureReady);

  useEffect(()=>{ if(isAutoCaptureReady && !prevIsAutoCaptureReady){ playLockOn(); navigator.vibrate?.(50);} },[isAutoCaptureReady, prevIsAutoCaptureReady]);

  useEffect(()=>{
    const onCvReady=()=>{ setIsCvReady(true); window.removeEventListener('opencv-ready', onCvReady); };
    if(typeof cv!=='undefined' && cv.Mat){ setIsCvReady(true); return; }
    window.addEventListener('opencv-ready', onCvReady);
    return ()=> window.removeEventListener('opencv-ready', onCvReady);
  },[]);

  useLayoutEffect(()=>{
    const node=viewportRef.current; if(!node) return;
    const ro=new ResizeObserver((ents)=>{ for(const e of ents){ const cr=e.contentRect; setVideoDisplaySize(p=>{ const w=Math.round(cr.width), h=Math.round(cr.height); return (p.width===w && p.height===h)?p:{width:w,height:h}; }); }});
    ro.observe(node); return ()=>ro.disconnect();
  },[]);

  useEffect(()=>{
    const canvas=processingCanvasRef.current; if(!canvas) return;
    const sync=()=>{ const w=(canvas as HTMLCanvasElement).width || (videoRef.current?.videoWidth ?? 0); const h=(canvas as HTMLCanvasElement).height || (videoRef.current?.videoHeight ?? 0); setProcessingSize(p=> (p.width===w && p.height===h)?p:{width:w,height:h}); };
    sync(); const ro=new ResizeObserver(sync); ro.observe(canvas); return ()=>ro.disconnect();
  },[processingCanvasRef, videoRef]);

  // rAF progress 1s
  useEffect(()=>{
    const DURATION=1000;
    const cancel=()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current=null; startTsRef.current=null; setCaptureProgress(0); };
    if(captureMode==='auto' && isAutoCaptureReady && !isProcessingCapture){
      const tick=(ts:number)=>{ if(startTsRef.current==null) startTsRef.current=ts;
        const p=Math.min(1,(ts-startTsRef.current)/DURATION); setCaptureProgress(p);
        if(p>=1){ setCaptureProgress(0); startTsRef.current=null; handleCapture(); return; }
        rafRef.current=requestAnimationFrame(tick);
      };
      rafRef.current=requestAnimationFrame(tick);
      return cancel;
    } else { cancel(); }
  },[captureMode,isAutoCaptureReady,isProcessingCapture]);

  useEffect(()=>{
    const onVis=()=>{ try{ __AC?.suspend?.(); }catch{} document.hidden? pause?.(): resume?.(); };
    document.addEventListener('visibilitychange', onVis);
    return ()=> document.removeEventListener('visibilitychange', onVis);
  },[pause, resume]);

  useEffect(()=>{
    if(!torchSupported || flashMode!=='auto') return;
    if(typeof quality==='number' && quality<0.25) applyTorchState?.(true);
    else if(typeof quality==='number' && quality>0.35) applyTorchState?.(false);
  },[quality, torchSupported, flashMode, applyTorchState]);

  const handleCapture = useCallback(async ()=>{
    if(!videoRef.current || !canvasRef.current || !detectedCorners) return;
    setIsProcessingCapture(true); playShutter();

    const video=videoRef.current, canvas=canvasRef.current;
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    const ctx=canvas.getContext('2d'); if(!ctx){ setIsProcessingCapture(false); return; }
    ctx.drawImage(video,0,0);

    const blob=await new Promise<Blob|null>(res=>canvas.toBlob(res,'image/jpeg',0.95));
    const imageDataUrl = blob ? await blobToDataURL(blob) : canvas.toDataURL('image/jpeg',0.95);

    const procW=processingCanvasRef.current?.width || video.videoWidth;
    const procH=processingCanvasRef.current?.height || video.videoHeight;
    const sx=video.videoWidth/procW, sy=video.videoHeight/procH;

    const absCorners=orderTLTRBRBL(detectedCorners.map(p=>({x:p.x*sx, y:p.y*sy})));
    setImageToCrop({ dataUrl:imageDataUrl, corners: absCorners });

    triggerCooldown?.();
    if(!multiShotEnabled){ onFinish([imageDataUrl]); }
    window.setTimeout(()=> setIsProcessingCapture(false), 600);
  },[detectedCorners, multiShotEnabled, onFinish, triggerCooldown]);

  const userFeedback = useMemo(()=>{
    if(isAutoCaptureReady) return 'Stai fermo...';
    if(isDocumentDetected) return 'Tieni fermo per scattare...';
    return feedback || 'Cerca un documento...';
  },[isDocumentDetected,isAutoCaptureReady,feedback]);

  /* ==== Modali ==== */
  if (isGalleryOpen){ pause?.(); return (
    <GalleryView
      images={capturedImages}
      onClose={()=>{ setIsGalleryOpen(false); resume?.(); }}
      onFinish={()=> onFinish(capturedImages)}
      onDelete={(i)=> setCapturedImages(prev=> prev.filter((_,idx)=> idx!==i))}
    />
  );}

  if (imageToCrop){ pause?.(); return (
    <CropView
      imageDataUrl={imageToCrop.dataUrl}
      initialCorners={imageToCrop.corners}
      onConfirm={(warped)=>{ setCapturedImages(p=>[...p,warped]); setImageToCrop(null); resume?.(); if(!multiShotEnabled) onFinish([warped]); }}
      onCancel={()=>{ setImageToCrop(null); resume?.(); }}
    />
  );}

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white select-none">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <ScansioniChLevelIndicatorIcon 
            className="w-8 h-8 transition-all duration-300"
            topBottomClassName={isLevel ? 'text-green-400' : 'text-white/30'}
            middleClassName={isLevel ? 'text-green-200' : 'text-white/80'}
          />
          <div className="hidden sm:flex relative w-24 h-5 border-2 border-white/30 rounded-full overflow-hidden" title={`Stato sensori: ${sensorStatus}`}>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full transition-transform duration-100" style={{ transform:`translate(-50%, -50%) translate(${bubblePosition.x}px, ${bubblePosition.y}px)` }}/>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={()=>{ const next: 'auto'|'on'|'off' = flashMode==='off'?'on':flashMode==='on'?'auto':'off'; setFlashMode(next); if(next!=='auto') applyTorchState?.(next==='on'); }}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
              aria-label="Flash"
            >
              {flashMode === 'on' ? <BoltIcon className="w-6 h-6"/> : flashMode === 'auto' ? <BoltAutoIcon className="w-6 h-6"/> : <BoltSlashIcon className="w-6 h-6"/>}
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-full bg-black/30 backdrop-blur-sm" aria-label="Chiudi fotocamera">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>
      </header>

      {/* Viewport */}
      <main ref={viewportRef} className="relative flex-grow flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform:'scale(1.02)' }}
        />
        <canvas ref={processingCanvasRef} className="hidden"/>
        <canvas ref={canvasRef} className="hidden"/>

        {/* Badge CV in caricamento (non blocca la preview) */}
        {!isCvReady && isVideoReady && (
          <div className="absolute top-4 right-4 px-3 py-1 text-xs bg-black/60 text-white rounded">
            Carico modulo CV…
          </div>
        )}

        {isCvReady && videoDisplaySize.width>0 && (
          <DynamicMeshOverlay
            detectedCorners={detectedCorners || null}
            isLockedOn={!!isAutoCaptureReady}
            videoDisplaySize={videoDisplaySize}
            processingCanvasSize={processingSize}
          />
        )}

        {/* Overlay “tap to start” per autoplay bloccato */}
        {requiresUserGesture && (
          <button
            onClick={resumePlayback}
            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold"
          >
            Tocca per avviare la fotocamera
          </button>
        )}

        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-full font-bold text-sm border border-white/30 backdrop-blur-sm" aria-live="polite">
          {userFeedback}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 p-6 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent">
        <div className="w-24 flex flex-col items-center gap-2">
          <button onClick={()=> setMultiShotEnabled(!multiShotEnabled)} className="p-3 bg-black/40 rounded-full backdrop-blur-sm">
            {multiShotEnabled ? <RectangleStackIcon className="w-6 h-6"/> : <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">1</div>}
          </button>
          <span className="text-xs font-semibold">{multiShotEnabled ? 'Multi-pagina' : 'Pagina singola'}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          {captureMode==='auto' && captureProgress>0 && <CircularProgressIndicator progress={captureProgress} />}
          <button
            onClick={handleCapture}
            disabled={isProcessingCapture || (captureMode==='auto' && !isAutoCaptureReady)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ring-4 ring-black/30 disabled:opacity-50 ${isAutoCaptureReady ? 'bg-green-500':'bg-white'}`}
            aria-label="Scatta foto"
          >
            <div className={`w-[68px] h-[68px] rounded-full border-4 ${isAutoCaptureReady ? 'border-green-800/50':'border-black'}`}/>
          </button>
          <div className="flex items-center gap-3 bg-black/40 p-1 rounded-full backdrop-blur-sm">
            <button onClick={()=>setCaptureMode('manual')} className={`px-4 py-1.5 text-xs font-bold rounded-full ${captureMode==='manual'?'bg-white text-black':'text-white'}`}>Manuale</button>
            <button onClick={()=>setCaptureMode('auto')} className={`px-4 py-1.5 text-xs font-bold rounded-full ${captureMode==='auto'?'bg-white text-black':'text-white'}`}>Auto</button>
          </div>
        </div>

        <button onClick={()=> capturedImages.length>0? setIsGalleryOpen(true):null} disabled={capturedImages.length===0} className="w-24 flex flex-col items-center gap-2 disabled:opacity-50">
          <div className="relative">
            {capturedImages.length>0 ? (
              <img src={capturedImages[capturedImages.length-1]} className="w-14 h-14 object-cover rounded-lg border-2 border-white" alt="Ultima scansione"/>
            ) : <div className="w-14 h-14 bg-black/40 rounded-lg border-2 border-white/50"/>}
            {capturedImages.length>0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold border-2 border-black">
                {capturedImages.length}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold">Galleria</span>
        </button>
      </footer>

      {(isInitializing || streamError) && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
          {streamError ? (
            <div className="text-center p-4">
              <XMarkIcon className="w-12 h-12 text-red-500 mx-auto"/>
              <p className="mt-2 font-bold">Errore Fotocamera</p>
              <p className="text-sm text-slate-300">{streamError}</p>
            </div>
          ) : (
            <>
              <LoadingSpinner />
              <p className="mt-4 font-semibold">Avvio Ugo Vision...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ========= Progress ========= */
const CircularProgressIndicator: React.FC<{ progress:number }> = ({ progress }) => {
  const radius=54, circumference=2*Math.PI*radius, offset=circumference-(progress*circumference);
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle className="text-black/30" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60"/>
        <circle className="text-green-400 transition-all duration-100" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60"/>
      </svg>
      <div className="relative px-4 py-2 bg-black/60 rounded-full font-bold text-white text-sm border border-white/30 backdrop-blur-sm">Stai fermo...</div>
    </div>
  );
};
