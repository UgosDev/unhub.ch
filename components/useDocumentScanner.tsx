import { useState, useEffect, useRef, RefObject, useCallback } from 'react';
import { DocumentScannerEngine, type ScanResult, type Point } from '../services/documentScannerEngine';

interface UseDocumentScannerProps {
  videoRef: RefObject<HTMLVideoElement>;
  processingCanvasRef: RefObject<HTMLCanvasElement>;
  isCvReady: boolean;
  // opzionali
  targetStableMs?: number;        // tempo richiesto per lock, es. 400ms
  baseThresholdK?: number;        // frazione della diagonale, es. 0.003
  hysteresisRatio?: number;       // es. 1.5 (uscire è più facile di entrare)
  maxUiHz?: number;               // throttling UI, es. 30
  cooldownMs?: number;            // blocco post-lock, es. 900ms
}

export function useDocumentScanner({
  videoRef,
  processingCanvasRef,
  isCvReady,
  targetStableMs = 400,
  baseThresholdK = 0.003,
  hysteresisRatio = 1.5,
  maxUiHz = 30,
  cooldownMs = 900,
}: UseDocumentScannerProps) {
  const [scanResult, setScanResult] = useState<ScanResult>({ corners: null, brightness: 128, type: 'unknown', feedback: 'Avvio...' });
  const [isStable, setIsStable] = useState(false);
  const [quality, setQuality] = useState(0); // 0..1: utile per UI e auto-torch

  const scannerEngineRef = useRef<DocumentScannerEngine | null>(null);
  const prevCornersRef = useRef<Point[] | null>(null);
  const emaCornersRef = useRef<Point[] | null>(null);

  const stableStartTsRef = useRef<number | null>(null);
  const lastUiUpdateRef = useRef<number>(0);
  const cooldownUntilRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);

  const getDiag = () => {
    const c = processingCanvasRef.current;
    if (!c) return 1000;
    return Math.hypot(c.width || 0, c.height || 0) || 1000;
  };

  const distSum = (a: Point[], b: Point[]) => {
    let sum = 0;
    for (let i = 0; i < 4; i++) sum += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y);
    return sum;
  };

  const emaCorners = (corners: Point[], alpha = 0.5): Point[] => {
    const prev = emaCornersRef.current;
    if (!prev) return corners;
    return corners.map((p, i) => ({
      x: prev[i].x + alpha * (p.x - prev[i].x),
      y: prev[i].y + alpha * (p.y - prev[i].y),
    }));
  };

  const computeQuality = (corners: Point[] | null, brightness: number): number => {
    if (!corners) return 0;
    // area relativa del quadrilatero vs canvas
    const c = processingCanvasRef.current;
    if (!c) return 0;
    const polyArea = (pts: Point[]) => {
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
      }
      return Math.abs(area / 2);
    };
    const areaRel = Math.min(1, polyArea(corners) / (c.width * c.height));
    // brightness normalizzato ~ [0..1]
    const b = Math.max(0, Math.min(1, brightness / 255));
    // semplice combinazione (tarabile)
    return Math.max(0, Math.min(1, 0.7 * areaRel + 0.3 * b));
  };

  const handleScanResult = useCallback((result: ScanResult) => {
    if (pausedRef.current) return;

    const now = performance.now();
    const inCooldown = now < cooldownUntilRef.current;

    // 1) Aggiorna corner con EMA per ridurre jitter
    const rawCorners = result.corners;
    const smoothed = rawCorners && rawCorners.length === 4 ? emaCorners(rawCorners, 0.5) : null;
    if (smoothed) emaCornersRef.current = smoothed;

    // 2) Logica stabilità con soglie relative + isteresi + time-based
    const diag = getDiag();
    const enterPx = baseThresholdK * diag;           // es. ~3‰ della diagonale
    const exitPx  = enterPx * hysteresisRatio;       // uscire dal lock è più “facile”

    let nextStable = isStable;

    if (!smoothed) {
      prevCornersRef.current = null;
      stableStartTsRef.current = null;
      nextStable = false;
    } else {
      if (prevCornersRef.current) {
        const dsum = distSum(smoothed, prevCornersRef.current); // somma sui 4 angoli
        const avg = dsum / 4;

        if (!isStable) {
          if (avg <= enterPx && !inCooldown) {
            if (stableStartTsRef.current == null) stableStartTsRef.current = now;
            const elapsed = now - (stableStartTsRef.current || now);
            if (elapsed >= targetStableMs) {
              nextStable = true;
            }
          } else {
            stableStartTsRef.current = null;
          }
        } else {
          // già stabile: isteresi più larga per evitare flicker
          if (avg > exitPx) {
            nextStable = false;
            stableStartTsRef.current = null;
          }
        }
      }
      prevCornersRef.current = smoothed;
    }

    // 3) Throttle aggiornamenti visibili (UI)
    const uiInterval = 1000 / maxUiHz;
    const canUpdateUI = now - lastUiUpdateRef.current >= uiInterval;

    if (canUpdateUI) {
      setScanResult(prev => (
        prev === result ? prev : result // evita re-render se referenza identica
      ));
      setQuality(computeQuality(smoothed, result.brightness));
      if (nextStable !== isStable) setIsStable(nextStable);
      lastUiUpdateRef.current = now;
    } else {
      // aggiorna solo roba “critica” senza forzare render
      if (nextStable && !isStable) setIsStable(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseThresholdK, hysteresisRatio, isStable, maxUiHz, targetStableMs]);

  // start/stop engine
  useEffect(() => {
    if (!isCvReady || !videoRef.current || !processingCanvasRef.current || scannerEngineRef.current) return;

    const engine = new DocumentScannerEngine(
      videoRef.current,
      processingCanvasRef.current,
      handleScanResult
    );
    scannerEngineRef.current = engine;
    engine.start();

    const onVisibility = () => {
      if (document.hidden) pausedRef.current = true;
      else pausedRef.current = false;
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      engine.stop();
      scannerEngineRef.current = null;
    };
  }, [isCvReady, videoRef, processingCanvasRef, handleScanResult]);

  // API esterna: pause/resume/cooldown (da usare su Crop/Gallery/scatto)
  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => { pausedRef.current = false; }, []);
  const triggerCooldown = useCallback(() => {
    cooldownUntilRef.current = performance.now() + cooldownMs;
    // uscita immediata dal lock per evitare doppio scatto
    setIsStable(false);
    stableStartTsRef.current = null;
  }, [cooldownMs]);

  return {
    detectedCorners: scanResult.corners,
    isDocumentDetected: !!scanResult.corners,
    sceneBrightness: scanResult.brightness,
    detectedType: scanResult.type,
    feedback: scanResult.feedback,
    isStable,
    quality,            // 0..1
    pause,
    resume,
    triggerCooldown,    // chiamalo subito dopo uno scatto riuscito
  };
}