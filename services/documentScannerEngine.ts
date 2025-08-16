// @ts-nocheck
// Questo file è volutamente non type-checked per la natura dinamica di OpenCV.js

declare global { interface Window { cv: any } }

import { startUgoExperienceStream } from './geminiService'; // Fallback AI streaming

// --- Tipi fondamentali (compat) ---
export type Point = { x: number; y: number };
export type ScanType = 'A4' | 'receipt' | 'credit-card' | 'business-card' | 'book' | 'unknown';
export interface ScanResult {
  corners: Point[] | null;
  brightness: number;               // 0..255 (media luminanza)
  type: ScanType;
  feedback: string | null;
  // opzionali (non breaking)
  procTimeMs?: number;
  ts?: number;
  areaRatio?: number;               // area doc / area frame [0..1]
  confidence?: number;              // 0..1 grezzo
}

// --- Configurazioni ---
const SCALE_MAX = 720;                   // lato max per processing
const MIN_DOC_AREA_ENTER = 0.20;         // area minima per considerare “documento” (enter)
const MIN_DOC_AREA_EXIT  = 0.16;         // isteresi per uscita
const LOW_LIGHT_THRESH = 60;             // mean gray < 60 => low light
const FALLBACK_FAIL_MS = 1800;           // tempo minimo prima di considerare fallback AI (~1.8s)
const FALLBACK_COOLDOWN_MS = 4000;       // backoff tra fallback AI
const PROC_FPS_TARGET = 30;              // target processing Hz
const USE_RETR_LIST = true;              // meglio di EXTERNAL per non perdere contorni utili

// --- Buffer storico semplice ---
class HistoryBuffer {
  private size: number;
  private buffer: Point[][] = [];
  constructor(size: number) { this.size = size }
  push(poly: Point[]) {
    this.buffer.push(poly);
    if (this.buffer.length > this.size) this.buffer.shift();
  }
  latest(): Point[] | null {
    return this.buffer.length ? this.buffer[this.buffer.length - 1] : null;
  }
  clear() { this.buffer = [] }
}

// Ordina TL,TR,BR,BL per stabilità
function orderTLTRBRBL(c: Point[]): Point[] {
  if (!c || c.length !== 4) return c;
  const bySum = [...c].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  const tl = bySum[0];
  const br = bySum[3];
  const byDiff = [...c].sort((a,b)=>(a.y-a.x)-(b.y-b.x));
  const tr = byDiff[0];
  const bl = byDiff[3];
  // fallback robusto se degenerato
  if (new Set([tl,tr,br,bl]).size < 4) {
    const ys = [...c].sort((a,b)=>a.y-b.y);
    const top = ys.slice(0,2).sort((a,b)=>a.x-b.x);
    const bot = ys.slice(2,4).sort((a,b)=>a.x-b.x);
    return [top[0], top[1], bot[1], bot[0]]; // TL,TR,BR,BL
  }
  return [tl,tr,br,bl];
}

// Stima soglie Canny adattive da luminanza (metodo sigma)
function cannyThresholds(meanGray: number, sigma = 0.33) {
  const low = Math.max(0, (1 - sigma) * meanGray);
  const high = Math.min(255, (1 + sigma) * meanGray);
  return { low, high };
}

// Stima rozza di class/type via aspect ratio
function classifyByAspect(pts: Point[]): ScanType {
  if (!pts || pts.length !== 4) return 'unknown';
  const [tl,tr,br,bl] = orderTLTRBRBL(pts);
  const wTop  = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const wBot  = Math.hypot(br.x - bl.x, br.y - bl.y);
  const hLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const hRight= Math.hypot(br.x - tr.x, br.y - tr.y);
  const ar = Math.max(wTop, wBot) / Math.max(hLeft, hRight);
  if (ar > 1.35 && ar < 1.48) return 'A4';
  if (ar > 1.50 && ar < 1.66) return 'credit-card';
  return 'unknown';
}

// Area poligono (shoelace)
function polyArea(pts: Point[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area / 2);
}

// --- Engine principale ---
export class DocumentScannerEngine {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private onResult: (res: ScanResult) => void;

  private running = false;
  private rafId: number | null = null;
  private lastProcTs = 0;
  private history = new HistoryBuffer(6);

  // Mats riutilizzabili
  private mats: any = {};
  private kernel: any | null = null;
  private clahe: any | null = null;

  // Stato fallback AI
  private firstFailTs: number | null = null;
  private lastFallbackTs = -Infinity;

  constructor(
    videoEl: HTMLVideoElement,
    canvasEl: HTMLCanvasElement | OffscreenCanvas,
    onResult: (r: ScanResult) => void
  ) {
    this.video = videoEl;
    // NIENTE transferControlToOffscreen qui: lo useremo quando porteremo in Worker
    this.canvas = canvasEl;
    this.onResult = onResult;
  }

  /** Avvia loop */
  public start() {
    if (this.running) return;
    this.running = true;
    this.history.clear();
    this.firstFailTs = null;
    this.loop();
  }

  /** Ferma loop e libera risorse */
  public stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    // cleanup OpenCV
    try {
      const { src, gray, blur, canny, dilated, hier } = this.mats;
      [src, gray, blur, canny, dilated, hier].forEach(m => m && m.delete && m.delete());
    } catch {}
    this.mats = {};
    try { this.kernel?.delete?.(); } catch {}
    this.kernel = null;
    try { this.clahe?.delete?.(); } catch {}
    this.clahe = null;
  }

  // rAF con frame budget
  private loop = (ts: number = performance.now()) => {
    if (!this.running) return;
    const budgetMs = 1000 / PROC_FPS_TARGET;
    if (ts - this.lastProcTs >= budgetMs) {
      this.processFrame();
      this.lastProcTs = ts;
    }
    this.rafId = requestAnimationFrame(this.loop);
  }

  private ensureMats(cv: any, w: number, h: number) {
    const reinit = (m: any, type = cv.CV_8UC1) => {
      if (!m || m.cols !== w || m.rows !== h) return new cv.Mat(h, w, type);
      return m;
    };
    this.mats.src     = reinit(this.mats.src, cv.CV_8UC4);
    this.mats.gray    = reinit(this.mats.gray);
    this.mats.blur    = reinit(this.mats.blur);
    this.mats.canny   = reinit(this.mats.canny);
    this.mats.dilated = reinit(this.mats.dilated);
    this.mats.hier    = reinit(this.mats.hier, cv.CV_32SC1);

    if (!this.kernel) {
      this.kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5,5));
    }
    if (!this.clahe && cv.createCLAHE) {
      this.clahe = cv.createCLAHE(2.0, new cv.Size(8,8)); // clipLimit, tileGrid
    }
  }

  /** Un frame di elaborazione */
  private async processFrame() {
    const cv = window.cv;
    if (!cv || this.video.paused || this.video.ended || this.video.videoWidth === 0) return;

    const t0 = performance.now();

    // Downscale dinamico
    const vw = this.video.videoWidth, vh = this.video.videoHeight;
    const scale = Math.min(1, SCALE_MAX / Math.max(vw, vh));
    const cw = Math.max(2, Math.round(vw * scale));
    const ch = Math.max(2, Math.round(vh * scale));

    const ctx =
      (this.canvas as any).getContext?.('2d', { willReadFrequently: true }) ||
      (this.canvas as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;
    (this.canvas as any).width = cw;
    (this.canvas as any).height = ch;
    ctx.drawImage(this.video, 0, 0, cw, ch);

    this.ensureMats(cv, cw, ch);
    const { src, gray, blur, canny, dilated, hier } = this.mats;
    
    let bestPts: Point[] | null = null;
    let maxArea = 0;

    try {
      const imgData = ctx.getImageData(0, 0, cw, ch);
      src.data.set(imgData.data);
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const meanB = cv.mean(gray)[0] | 0;

      // === ROBUST CONTOUR-FINDING PIPELINE ===
      cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
      
      const { low, high } = cannyThresholds(meanB);
      cv.Canny(blur, canny, low, high, 3);
      
      cv.dilate(canny, dilated, this.kernel, new cv.Point(-1, -1), 1);

      const contours = new cv.MatVector();
      cv.findContours(dilated, contours, hier, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      for (let i = 0; i < contours.size(); ++i) {
          const cnt = contours.get(i);
          const area = cv.contourArea(cnt, false);
          
          if (area > maxArea) {
              const peri = cv.arcLength(cnt, true);
              const approx = new cv.Mat();
              cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
              
              if (approx.rows === 4 && cv.isContourConvex(approx)) {
                  maxArea = area;
                  bestPts = this.matToPts(approx);
              }
              approx.delete();
          }
          cnt.delete();
      }
      contours.delete();
      // === END PIPELINE ===
      
      // Valutazione risultato
      const ts = performance.now();
      const frameArea = cw * ch;
      const areaRatio = maxArea / frameArea;
      const procTimeMs = ts - t0;

      if (bestPts && areaRatio >= MIN_DOC_AREA_ENTER) {
        this.firstFailTs = null;
        const orderedPts = orderTLTRBRBL(bestPts);
        this.history.push(orderedPts);

        const type = classifyByAspect(orderedPts);
        const confidence = Math.max(0, Math.min(1, (areaRatio - MIN_DOC_AREA_ENTER) / (0.6 - MIN_DOC_AREA_ENTER)));

        this.onResult({
          corners: orderedPts,
          brightness: meanB,
          type,
          feedback: 'Mantieni la posizione',
          procTimeMs, ts, areaRatio, confidence,
        });
      } else {
        if (!this.firstFailTs) this.firstFailTs = performance.now();
        const latest = this.history.latest();
        
        if (latest && areaRatio > MIN_DOC_AREA_EXIT) {
           this.onResult({
            corners: latest,
            brightness: meanB,
            type: 'unknown',
            feedback: 'Avvicina il telefono',
            procTimeMs, ts, areaRatio: polyArea(latest) / frameArea,
            confidence: Math.max(0, Math.min(1, areaRatio / 0.5)),
          });
        } else {
            if (latest) this.history.clear(); // Pulisce se il documento è perso/troppo piccolo
            this.onResult({
                corners: null,
                brightness: meanB,
                type: 'unknown',
                feedback: 'Cerca un documento...',
                procTimeMs, ts, areaRatio, confidence: 0,
            });
        }
      }
    } catch (e) {
      console.error('[Scanner] processFrame error', e);
      this.onResult({ corners: null, brightness: 128, type: 'unknown', feedback: 'Errore di elaborazione' });
    }
  }

  /** Converti Mat (4x1 CV_32SC2) in array di punti */
  private matToPts(mat: any): Point[] {
    const pts: Point[] = [];
    const len = mat.rows;
    for (let i = 0; i < len; i++) {
      pts.push({ x: mat.data32S[i * 2], y: mat.data32S[i * 2 + 1] });
    }
    return pts;
  }

  /** Fallback AI con backoff e timeout interno */
  private async invokeAIFallback(ctx: CanvasRenderingContext2D): Promise<{ corners: Point[] | null, feedback: string | null }> {
    try {
      const blob = 'convertToBlob' in ctx.canvas
        ? await (ctx.canvas as any).convertToBlob({ type: 'image/jpeg', quality: 0.7 })
        : await new Promise<Blob|null>(r => (ctx.canvas as HTMLCanvasElement).toBlob(r, 'image/jpeg', 0.7));

      if (!blob) {
        console.warn('[Scanner] AI fallback: no blob');
        return { corners: null, feedback: 'Errore fotocamera' };
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      const base64 = dataUrl.split(',')[1];

      return await new Promise(res => {
        let resolved = false;
        const to = setTimeout(() => {
          if (!resolved) { resolved = true; res({ corners: null, feedback: 'AI lenta' }); }
        }, 2500);

        let finalJson: any = null;
        startUgoExperienceStream(base64, (chunk) => {
          finalJson = { ...finalJson, ...chunk };
        }).then(() => {
          if (resolved) return;
          resolved = true;
          clearTimeout(to);
          if (finalJson && finalJson.documentCorners?.length === 4) {
            const w = (ctx.canvas as any).width;
            const h = (ctx.canvas as any).height;
            const corners = finalJson.documentCorners.map((p: any) => ({
              x: p.x * w,
              y: p.y * h,
            }));
            res({ corners, feedback: finalJson.userFeedback ?? 'Rilevato (AI)' });
          } else {
            res({ corners: null, feedback: finalJson?.userFeedback ?? 'Nessun documento (AI)' });
          }
        }).catch(err => {
          console.warn('[Scanner] AI stream error', err);
          if (!resolved) { resolved = true; clearTimeout(to); res({ corners: null, feedback: 'Errore AI' }); }
        });
      });
    } catch (e) {
      console.error('[Scanner] AI fallback prep error', e);
      return { corners: null, feedback: 'Errore di preparazione' };
    }
  }
}
