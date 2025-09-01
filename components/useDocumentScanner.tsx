import React, { useState, useEffect, useRef, RefObject, useCallback } from 'react';

// --- TIPI ---
export type ScanType = 'A4' | 'receipt' | 'credit-card' | 'business-card' | 'book' | 'unknown';
type Point = { x: number; y: number };
interface WorkerResult {
  corners: Point[] | null;
  quality: number; // 0..1
  feedback: string;
  type: ScanType;
}

interface UseDocumentScannerProps {
  videoRef: RefObject<HTMLVideoElement>;
  processingCanvasRef: RefObject<HTMLCanvasElement>;
  isCvReady: boolean;
}

// --- CODICE DEL WORKER (EMBEDDED) ---
const workerCode = `
// @ts-nocheck
self.importScripts('https://docs.opencv.org/4.x/opencv.js');

let cv = null;
let running = false;
let cooldownUntil = 0;
let isProcessingFrame = false;
let clahe; 

const config = {
    rectangularityThreshold: 0.92,
    minAreaRatio: 0.20,
    cooldownMs: 2000,
};

function orderTLTRBRBL(c) {
    if (!c || c.length !== 4) return c;
    const bySum = [...c].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
    const tl = bySum[0], br = bySum[3];
    const byDiff = [...c].sort((a,b)=>(a.y-a.x)-(b.y-b.x));
    const tr = byDiff[0], bl = byDiff[3];
    if (new Set([tl,tr,br,bl]).size < 4) {
        const ys = [...c].sort((a,b)=>a.y-b.y);
        const top = ys.slice(0,2).sort((a,b)=>a.x-b.x);
        const bot = ys.slice(2,4).sort((a,b)=>a.x-b.x);
        return [top[0], top[1], bot[1], bot[0]];
    }
    return [tl,tr,br,bl];
}

function polyArea(pts) {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(area / 2);
}

const getLineIntersection = (l1, l2) => {
    const [x1, y1, x2, y2] = l1;
    const [x3, y3, x4, y4] = l2;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
};

function findBestQuadFromLines(linesMat, width, height) {
    if (linesMat.rows === 0) return null;

    const horizontals = [];
    const verticals = [];
    const minLength = Math.min(width, height) * 0.2;

    for (let i = 0; i < linesMat.rows; i++) {
        const [x1, y1, x2, y2] = linesMat.data32S.slice(i * 4, i * 4 + 4);
        const length = Math.hypot(x2 - x1, y2 - y1);
        if (length < minLength) continue;
        
        const angle = Math.abs(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
        if (angle < 45 || angle > 135) horizontals.push([x1, y1, x2, y2]);
        else verticals.push([x1, y1, x2, y2]);
    }

    if (horizontals.length < 2 || verticals.length < 2) return null;

    let top = horizontals.reduce((a, b) => (a[1] + a[3] < b[1] + b[3] ? a : b));
    let bottom = horizontals.reduce((a, b) => (a[1] + a[3] > b[1] + b[3] ? a : b));
    let left = verticals.reduce((a, b) => (a[0] + a[2] < b[0] + b[2] ? a : b));
    let right = verticals.reduce((a, b) => (a[0] + a[2] > b[0] + b[2] ? a : b));

    const tl = getLineIntersection(top, left);
    const tr = getLineIntersection(top, right);
    const bl = getLineIntersection(bottom, left);
    const br = getLineIntersection(bottom, right);
    
    if (!tl || !tr || !bl || !br) return null;
    const corners = [{x: tl.x, y: tl.y}, {x: tr.x, y: tr.y}, {x: br.x, y: br.y}, {x: bl.x, y: bl.y}];
    
    for (const corner of corners) {
        if (corner.x < -width * 0.1 || corner.x > width * 1.1 || corner.y < -height * 0.1 || corner.y > height * 1.1) {
            return null;
        }
    }
    return orderTLTRBRBL(corners);
}

function classifyByAspect(pts, frameArea) {
  if (!pts || pts.length !== 4) return 'unknown';

  const [tl, tr, br, bl] = orderTLTRBRBL(pts);
  const wTop = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const wBot = Math.hypot(br.x - bl.x, br.y - bl.y);
  const hLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const hRight = Math.hypot(br.x - tr.x, br.y - tr.y);
  
  const width = Math.max(wTop, wBot);
  const height = Math.max(hLeft, hRight);
  const docArea = polyArea(pts);
  const areaRatio = docArea / frameArea;

  if (width === 0 || height === 0) return 'unknown';

  const ar = Math.max(width, height) / Math.min(width, height);

  // Book: very large area and aspect ratio of two pages.
  if (areaRatio > 0.65 && ar > 1.25 && ar < 1.8) {
      return 'book';
  }

  // Receipt: very long and narrow aspect ratio
  if (ar > 2.5) {
      return 'receipt';
  }

  // Credit Card or Business Card
  if (ar > 1.55 && ar < 1.8) {
      if (areaRatio < 0.4) {
          return 'credit-card';
      }
  }

  // A4 paper
  if (ar > 1.3 && ar < 1.55) {
      return 'A4';
  }

  return 'unknown';
}


function processFrame(imageData) {
    if (!running || !cv || isProcessingFrame) return;
    isProcessingFrame = true;

    const { width: w, height: h } = imageData;
    const inCooldown = performance.now() < cooldownUntil;

    let src = cv.matFromImageData(imageData);
    let gray = new cv.Mat();
    let blur = new cv.Mat();
    let canny = new cv.Mat();
    let dilated = new cv.Mat();
    let lines = new cv.Mat();
    let kernel = null;

    let quality = 0, corners = null, feedback = 'Cerca un documento...', type = 'unknown';

    try {
        // --- Vision Pipeline ---
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
        
        cv.adaptiveThreshold(blur, dilated, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 8);
        
        cv.Canny(dilated, canny, 100, 200, 3);
        kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5,5));
        cv.dilate(canny, canny, kernel, new cv.Point(-1,-1), 1);
      
        cv.HoughLinesP(canny, lines, 1, Math.PI / 180, 50, w * 0.2, 15);
        corners = findBestQuadFromLines(lines, w, h);
        // --- End of Vision Pipeline ---

        if (corners) {
            const area = polyArea(corners);
            const areaRatio = area / (w * h);
            type = classifyByAspect(corners, w * h);

            if (areaRatio > config.minAreaRatio) {
                const rect = cv.minAreaRect(cv.matFromArray(4, 1, cv.CV_32SC2, corners.flatMap(p => [p.x, p.y])));
                const rectangularity = area / (rect.size.width * rect.size.height);
                
                if (rectangularity > config.rectangularityThreshold) {
                    feedback = 'Perfetto, tieni fermo!';
                    const areaScore = Math.min(1, (areaRatio - config.minAreaRatio) / 0.6);
                    quality = 0.5 * areaScore + 0.5;
                } else {
                    feedback = 'Raddrizza la prospettiva';
                    quality = 0.2;
                }
            } else {
                feedback = 'Avvicina il documento';
                quality = 0.1;
            }
        } else {
            feedback = 'Cerca un documento...';
            quality = 0;
        }
        
        if(inCooldown) quality = 0;

        self.postMessage({ type: 'result', payload: { corners, quality, feedback, type } });

    } catch(e) {
        console.error("Error in worker processFrame", e);
    } finally {
        src.delete();
        gray.delete();
        blur.delete();
        canny.delete();
        dilated.delete();
        lines.delete();
        if(kernel) kernel.delete();
        isProcessingFrame = false;
    }
}

self.onmessage = async e => {
    const { type, payload } = e.data;
    switch (type) {
        case 'init':
            if (cv) {
                running = true;
                self.postMessage({ type: 'ready' });
                return;
            }
            self.cv.onRuntimeInitialized = () => {
                cv = self.cv;
                running = true;
                self.postMessage({ type: 'ready' });
            };
            break;
        case 'frame':
            if (running && cv) {
                processFrame(payload.imageData);
            }
            break;
        case 'pause': running = false; break;
        case 'resume': running = true; break;
        case 'cooldown': cooldownUntil = performance.now() + config.cooldownMs; break;
    }
};
`;

export function useDocumentScanner({
  videoRef,
  processingCanvasRef,
  isCvReady,
}: UseDocumentScannerProps): {
  detectedCorners: Point[] | null;
  feedback: string;
  quality: number;
  detectedType: ScanType;
  isWorkerReady: boolean;
  pause: () => void;
  resume: () => void;
  triggerCooldown: () => void;
} {
  const [result, setResult] = useState<WorkerResult>({ corners: null, quality: 0, feedback: 'Avvio...', type: 'unknown' });
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const rafRef = useRef<number | null>(null);
  const isSupported = typeof window !== 'undefined' && 'Worker' in window;

  useEffect(() => {
    if (!isCvReady) {
        return;
    }
    if (!isSupported) {
      setResult(prev => ({ ...prev, feedback: 'Scansione automatica non supportata' }));
      setIsWorkerReady(true); // Signal that we are "done" initializing, even if unsupported.
      return;
    }

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;
    
    worker.postMessage({ type: 'init' });

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'ready') setIsWorkerReady(true);
      if (type === 'result') setResult(payload);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [isCvReady, isSupported]);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = processingCanvasRef.current;
    const worker = workerRef.current;
    if (!video || !canvas || !worker || video.paused || video.ended || video.videoWidth === 0) return;
    
    const SCALE_MAX = 480;
    const scale = Math.min(1, SCALE_MAX / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * scale);
    const h = Math.round(video.videoHeight * scale);
    
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    worker.postMessage({ type: 'frame', payload: { imageData } }, [imageData.data.buffer]);
  }, [videoRef, processingCanvasRef]);

  useEffect(() => {
    const loop = () => {
      processFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    if (isWorkerReady) rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isWorkerReady, processFrame]);

  const pause = useCallback(() => workerRef.current?.postMessage({ type: 'pause' }), []);
  const resume = useCallback(() => workerRef.current?.postMessage({ type: 'resume' }), []);
  const triggerCooldown = useCallback(() => workerRef.current?.postMessage({ type: 'cooldown' }), []);

  return {
    detectedCorners: result.corners,
    feedback: result.feedback,
    quality: result.quality,
    detectedType: result.type,
    isWorkerReady: isWorkerReady,
    pause,
    resume,
    triggerCooldown,
  };
}