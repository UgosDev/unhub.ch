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
let mats = {};
let kernel;
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

function findBestQuadFromLines(linesMat, width, height) {
    if (linesMat.rows === 0) return null;
    const getLineIntersection = (l1, l2) => {
        const [[x1, y1], [x2, y2]] = l1;
        const [[x3, y3], [x4, y4]] = l2;
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) return null;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
    };
    const horizontals = [], verticals = [];
    const minLength = Math.min(width, height) * 0.2;
    for (let i = 0; i < linesMat.rows; i++) {
        const [x1, y1, x2, y2] = linesMat.data32S.slice(i * 4, i * 4 + 4);
        if (Math.hypot(x2 - x1, y2 - y1) < minLength) continue;
        const angle = Math.abs(Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
        if (angle < 45 || angle > 135) horizontals.push([[x1, y1], [x2, y2]]);
        else verticals.push([[x1, y1], [x2, y2]]);
    }
    if (horizontals.length < 2 || verticals.length < 2) return null;
    let top = horizontals.reduce((a, b) => (a[0][1] + a[1][1] < b[0][1] + b[1][1] ? a : b));
    let bottom = horizontals.reduce((a, b) => (a[0][1] + a[1][1] > b[0][1] + b[1][1] ? a : b));
    let left = verticals.reduce((a, b) => (a[0][0] + a[1][0] < b[0][0] + b[1][0] ? a : b));
    let right = verticals.reduce((a, b) => (a[0][0] + a[1][0] > b[0][0] + b[1][0] ? a : b));
    const tl = getLineIntersection(top, left), tr = getLineIntersection(top, right);
    const bl = getLineIntersection(bottom, left), br = getLineIntersection(bottom, right);
    if (!tl || !tr || !bl || !br) return null;
    const corners = [tl, tr, br, bl];
    for (const p of corners) if (p.x < -width * 0.2 || p.x > width * 1.2 || p.y < -height * 0.2 || p.y > height * 1.2) return null;
    return orderTLTRBRBL(corners);
}

async function processFrame(imageData) {
    if (!running || !cv) return;
    const { width: w, height: h } = imageData;
    const inCooldown = performance.now() < cooldownUntil;
    
    mats.src = cv.matFromImageData(imageData);
    mats.gray = mats.gray || new cv.Mat();
    mats.claheApplied = mats.claheApplied || new cv.Mat(); // Per output CLAHE
    mats.canny = mats.canny || new cv.Mat();
    mats.lines = mats.lines || new cv.Mat();
    kernel = kernel || cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
    clahe = clahe || cv.createCLAHE(2.0, new cv.Size(8, 8)); // Istanzia CLAHE

    let quality = 0, corners = null, feedback = 'Cerca un documento...';

    cv.cvtColor(mats.src, mats.gray, cv.COLOR_RGBA2GRAY);
    clahe.apply(mats.gray, mats.claheApplied); // Applica CLAHE
    
    let mean = new cv.Mat(), stdDev = new cv.Mat();
    cv.meanStdDev(mats.gray, mean, stdDev);
    const meanGray = mean.data64F[0];
    
    // Hough Line Transform pipeline
    const sigma = 0.33;
    const lowerThreshold = Math.max(0, (1.0 - sigma) * meanGray);
    const upperThreshold = Math.min(255, (1.0 + sigma) * meanGray);

    cv.Canny(mats.claheApplied, mats.canny, lowerThreshold, upperThreshold, 3);
    cv.dilate(mats.canny, mats.canny, kernel, new cv.Point(-1,-1), 1);
    cv.HoughLinesP(mats.canny, mats.lines, 1, Math.PI / 180, 50, w * 0.2, 15);
    corners = findBestQuadFromLines(mats.lines, w, h);

    if (corners) {
        firstFailTs = null; // Reset failure timer
        const area = polyArea(corners);
        const areaRatio = area / (w * h);

        if (areaRatio > config.minAreaRatio) {
            const rect = cv.minAreaRect(cv.matFromArray(4, 1, cv.CV_32SC2, corners.flatMap(p => [p.x, p.y])));
            const rectangularity = area / (rect.size.width * rect.size.height);
            const rectOk = rectangularity > config.rectangularityThreshold;

            if (rectOk) {
                feedback = 'Perfetto, tieni fermo!';
                const areaScore = Math.min(1, (areaRatio - config.minAreaRatio) / 0.6);
                quality = 0.5 * areaScore + 0.5; // Base quality for being rectangular
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
    
    mats.src.delete(); mean.delete(); stdDev.delete();
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
            if (running && cv && !isProcessingFrame) {
                isProcessingFrame = true;
                await processFrame(payload.imageData);
                isProcessingFrame = false;
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