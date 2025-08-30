import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { 
  XMarkIcon, CheckIcon,
  ArrowUturnLeftIcon, ScansioniChLevelIndicatorIcon,
  BoltIcon, BoltSlashIcon
} from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import type { ProcessingMode } from '../services/geminiService';
import { useCameraStream } from './useCameraStream';
// import { useDeviceTilt } from './useDeviceTilt';
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
    const cv = (window as any).cv;
    if(!cv || typeof cv.imread !== 'function' || !corners || corners.length!==4) return resolve(image.src);
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
  const confirm=async()=>{ 
    setBusy(true); 
    try{ 
      const img=imageRef.current; 
      const warped=await perspectiveTransform(img,orderTLTRBRBL(corners)); 
      onConfirm(warped); 
    } catch(e){ 
      console.error(e); 
      alert('Errore ritaglio. Uso immagine originale.'); 
      onConfirm(imageDataUrl);
    }
  };

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
          <ArrowUturnLeftIcon className="w-8 h-8"/><span className="text-xs">Annulla</span>
        </button>
        <button onClick={confirm} disabled={busy} className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center ring-4 ring-black/30 disabled:bg-slate-400 transition-all active:scale-95" aria-label="Conferma ritaglio">
          {busy ? <LoadingSpinner className="w-10 h-10"/> : <CheckIcon className="w-12 h-12 text-white" />}
        </button>
        <div className="w-24 h-20 flex items-center justify-center" />
      </footer>
    </div>
  );
};

/* ========= Hook utils ========= */
function usePrevious<T>(v:T){ const r=useRef<T|undefined>(undefined); useEffect(()=>{ r.current=v; }); return r.current; }

/* ========= CameraView ========= */
interface CameraViewProps { onFinish:(images:string[])=>void; onClose:()=>void; processingMode: ProcessingMode; }

export const CameraView: React.FC<CameraViewProps> = ({ onFinish, onClose, processingMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isCvReady, setIsCvReady] = useState(false);
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{ dataUrl:string; corners:{x:number;y:number}[] }|null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const captureTimeoutRef = useRef<number|null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const {
    isVideoReady, error: streamError, isTorchOn, torchSupported, applyTorchState,
    requiresUserGesture,
    resumePlayback
  } = useCameraStream(videoRef);

  // const { isLevel, sensorStatus, bubblePosition } = useDeviceTilt();
  const { detectedCorners, feedback, quality, isWorkerReady, pause, resume, triggerCooldown } = useDocumentScanner({
    videoRef, processingCanvasRef, isCvReady
  });
  const isAutoCaptureReady = quality > 0.95;
  const prevIsAutoCaptureReady = usePrevious(isAutoCaptureReady);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [videoDisplaySize,setVideoDisplaySize]=useState({width:0,height:0});
  const [processingSize,setProcessingSize]=useState({width:0,height:0});

  const isInitializing = !isVideoReady || (isWorkerReady === false);

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
    const sync=()=>{ const w=(canvas as HTMLCanvasElement).width || 0; const h=(canvas as HTMLCanvasElement).height || 0; setProcessingSize(p=> (p.width===w && p.height===h)?p:{width:w,height:h}); };
    sync(); const ro=new ResizeObserver(sync); ro.observe(canvas); return ()=>ro.disconnect();
  },[processingCanvasRef, videoRef]);

  const handleCapture = useCallback(async ()=>{
    if(!videoRef.current || !captureCanvasRef.current || isProcessingCapture) return;
    
    setIsProcessingCapture(true);
    playShutter();

    const video=videoRef.current, canvas=captureCanvasRef.current;
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    const ctx=canvas.getContext('2d'); if(!ctx){ setIsProcessingCapture(false); return; }
    ctx.drawImage(video,0,0);

    const blob=await new Promise<Blob|null>(res=>canvas.toBlob(res,'image/jpeg',0.95));
    const imageDataUrl = blob ? await blobToDataURL(blob) : canvas.toDataURL('image/jpeg',0.95);

    const procW=processingCanvasRef.current?.width || video.videoWidth;
    const procH=processingCanvasRef.current?.height || video.videoHeight;
    const sx=video.videoWidth/procW, sy=video.videoHeight/procH;

    const absCorners = detectedCorners ? orderTLTRBRBL(detectedCorners.map(p=>({x:p.x*sx, y:p.y*sy}))) : [
        { x: 0, y: 0 }, { x: video.videoWidth, y: 0 }, { x: video.videoWidth, y: video.videoHeight }, { x: 0, y: video.videoHeight }
    ];

    setImageToCrop({ dataUrl:imageDataUrl, corners: absCorners });

    triggerCooldown?.();
    window.setTimeout(()=> setIsProcessingCapture(false), 300);
  },[isProcessingCapture, detectedCorners, triggerCooldown, processingCanvasRef]);

  
  // Hysteresis for auto-capture
  useEffect(() => {
      const CAPTURE_HYSTERESIS_MS = 300;
      const AUTO_CAPTURE_PAUSE_MS = 2000;
      if (isProcessingCapture) {
          if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
          return;
      }

      if (quality >= 0.95) {
          if (!captureTimeoutRef.current) {
              captureTimeoutRef.current = window.setTimeout(() => {
                  handleCapture();
                   // Pause for 2s after auto-capture to allow user to change document
                  captureTimeoutRef.current = window.setTimeout(() => {
                      captureTimeoutRef.current = null;
                  }, AUTO_CAPTURE_PAUSE_MS);
              }, CAPTURE_HYSTERESIS_MS);
          }
      } else {
          if (captureTimeoutRef.current) {
              clearTimeout(captureTimeoutRef.current);
              captureTimeoutRef.current = null;
          }
      }
      return () => { if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current); };
  }, [quality, isProcessingCapture, handleCapture]);
  
  const handleConfirmCrop = (warpedDataUrl: string) => {
    setCapturedImages(prev => [...prev, warpedDataUrl]);
    setImageToCrop(null); // Closes CropView
    resume?.(); // Resumes scanning worker
  };
  
  const handleDeleteImage = (indexToDelete: number) => {
    setCapturedImages(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleUndoLastCapture = () => {
      setCapturedImages(prev => prev.slice(0, -1));
  };


  /* ==== Modali ==== */
  if (imageToCrop){ pause?.(); return (
    <CropView
      imageDataUrl={imageToCrop.dataUrl}
      initialCorners={imageToCrop.corners}
      onConfirm={handleConfirmCrop}
      onCancel={()=>{ setImageToCrop(null); resume?.(); }}
    />
  );}

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white select-none">
      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div /> {/* Spacer */}
        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={()=>{ const nextState = !flashOn; setFlashOn(nextState); applyTorchState?.(nextState); }}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
              aria-label="Flash"
            >
              {flashOn ? <BoltIcon className="w-6 h-6"/> : <BoltSlashIcon className="w-6 h-6"/>}
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
        <canvas ref={captureCanvasRef} className="hidden"/>

        {isCvReady && videoDisplaySize.width>0 && (
          <DynamicMeshOverlay
            detectedCorners={detectedCorners || null}
            isLockedOn={!!isAutoCaptureReady}
            videoDisplaySize={videoDisplaySize}
            processingCanvasSize={processingSize}
          />
        )}

        {requiresUserGesture && (
          <button
            onClick={resumePlayback}
            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold"
          >
            Tocca per avviare la fotocamera
          </button>
        )}
      </main>
      
      {/* Feedback Overlay */}
      <div className="absolute bottom-28 left-0 right-0 z-20 text-center px-4 pointer-events-none">
          {capturedImages.length === 0 && feedback && (
              <p className="inline-block bg-black/50 text-white font-semibold px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
                  {feedback}
              </p>
          )}
      </div>

      {/* Thumbnail Gallery */}
       {capturedImages.length > 0 && (
            <div className="absolute bottom-28 left-0 right-0 z-20 flex justify-center">
                <div className="p-2 bg-black/50 rounded-full backdrop-blur-sm shadow-lg">
                    <div className="flex gap-2 max-w-[80vw] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {capturedImages.map((imgSrc, index) => (
                            <div key={index} className="relative flex-shrink-0">
                                <img src={imgSrc} alt={`Pagina ${index + 1}`} className="w-14 h-20 object-cover rounded-md border-2 border-white/50" />
                                <span className="absolute bottom-1 left-1 text-xs font-bold text-white bg-black/50 px-1 rounded">{index + 1}</span>
                                <button onClick={() => handleDeleteImage(index)} className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full shadow-md">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 p-6 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent">
          {capturedImages.length > 0 ? (
            <div className="w-full flex justify-between items-end">
                <button onClick={handleUndoLastCapture} className="w-24 flex flex-col items-center gap-1 text-yellow-400 font-semibold">
                    <ArrowUturnLeftIcon className="w-8 h-8" />
                    <span className="text-xs">Annulla Ultima</span>
                </button>
                 <div className="flex flex-col items-center gap-2">
                    <button onClick={handleCapture} disabled={isProcessingCapture} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ring-4 ring-black/30 disabled:opacity-50 ${isAutoCaptureReady ? 'bg-green-500':'bg-white'}`} aria-label="Scatta foto">
                        <div className={`w-[68px] h-[68px] rounded-full border-4 ${isAutoCaptureReady ? 'border-green-800/50':'border-black'}`}/>
                    </button>
                </div>
                <button onClick={() => onFinish(capturedImages)} className="w-24 flex flex-col items-center gap-1 text-green-400 font-semibold">
                    <CheckIcon className="w-8 h-8"/>
                    <span className="text-xs">Fine ({capturedImages.length})</span>
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleCapture}
                disabled={isProcessingCapture}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ring-4 ring-black/30 disabled:opacity-50 ${isAutoCaptureReady ? 'bg-green-500':'bg-white'}`}
                aria-label="Scatta foto"
              >
                <div className={`w-[68px] h-[68px] rounded-full border-4 ${isAutoCaptureReady ? 'border-green-800/50':'border-black'}`}/>
              </button>
            </div>
        )}
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
