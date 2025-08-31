import React, { useState, useEffect, useRef, RefObject, useCallback } from 'react';

// --- TIPI ---
type Point = { x: number; y: number };
interface WorkerResult {
  corners: Point[] | null;
  quality: number; // 0..1
  feedback: string;
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
let firstFailTs = null;

const config = {
    sharpnessThreshold: 150,
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

function processFrame(imageData) {
    if (!running || !cv || isProcessingFrame) return;
    isProcessingFrame = true;

    const { width: w, height: h } = imageData;
    const inCooldown = performance.now() < cooldownUntil;

    let src = cv.matFromImageData(imageData);
    let gray = new cv.Mat();
    let claheApplied = new cv.Mat();
    let blur = new cv.Mat();
    let canny = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    
    clahe = clahe || cv.createCLAHE(2.0, new cv.Size(8, 8));

    let quality = 0, corners = null, feedback = 'Cerca un documento...';

    try {
        // --- Vision Pipeline ---
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        clahe.apply(gray, claheApplied);
        cv.GaussianBlur(claheApplied, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
        cv.Canny(blur, canny, 75, 200);
        cv.findContours(canny, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let maxArea = 0;
        let bestContour = null;

        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt, false);
            if (area > (w * h * config.minAreaRatio)) {
                let peri = cv.arcLength(cnt, true);
                let approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

                if (approx.rows === 4) {
                    if (area > maxArea) {
                        if (bestContour) bestContour.delete();
                        maxArea = area;
                        bestContour = approx.clone();
                    }
                }
                approx.delete();
            }
        }
        
        if (bestContour) {
            let points = [];
            for (let i = 0; i < bestContour.rows; i++) {
                points.push({ x: bestContour.data32S[i*2], y: bestContour.data32S[i*2+1] });
            }
            corners = orderTLTRBRBL(points);
            bestContour.delete();
        } else {
            corners = null;
        }
        // --- End of Vision Pipeline ---

        if (corners) {
            firstFailTs = null;
            const area = polyArea(corners);
            const areaRatio = area / (w * h);

            if (areaRatio > config.minAreaRatio) {
                const rect = cv.minAreaRect(cv.matFromArray(4, 1, cv.CV_32SC2, corners.flatMap(p => [p.x, p.y])));
                const rectangularity = area / (rect.size.width * rect.size.height);
                const rectOk = rectangularity > config.rectangularityThreshold;

                if (rectOk) {
                    feedback = 'Perfetto, tieni fermo!';
                    const areaScore = Math.min(1, (areaRatio - config.minAreaRatio) / 0.6);
                    quality = 0.5 * areaScore + 0.5;
                } else {
                    feedback = 'Raddrizza la prospettiva';
                }
            } else {
                feedback = 'Avvicina il documento';
            }
        } else {
            feedback = 'Cerca un documento...';
        }
        
        if(inCooldown) quality = 0;

        self.postMessage({ type: 'result', payload: { corners, quality, feedback } });

    } catch(e) {
        console.error("Error in worker processFrame", e);
    } finally {
        src.delete();
        gray.delete();
        claheApplied.delete();
        blur.delete();
        canny.delete();
        contours.delete();
        hierarchy.delete();
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
  isWorkerReady: boolean;
  pause: () => void;
  resume: () => void;
  triggerCooldown: () => void;
} {
  const [result, setResult] = useState<WorkerResult>({ corners: null, quality: 0, feedback: 'Avvio...' });
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
    isWorkerReady: isWorkerReady,
    pause,
    resume,
    triggerCooldown,
  };
}