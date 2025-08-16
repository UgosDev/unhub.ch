import { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { startUgoExperienceStream } from '../services/geminiService';

type Feedback = Record<string, any> | null;

const BASE_INTERVAL_MS = 1200;     // ritmo nominale
const MIN_INTERVAL_MS  = 800;      // limite inferiore
const MAX_INTERVAL_MS  = 4000;     // limite superiore in backoff
const BACKOFF_FACTOR   = 1.6;      // quanto aumentare il pacing quando rate-limited
const RECOVERY_FACTOR  = 0.9;      // come tornare gradualmente alla normalità
const JPEG_QUALITY     = 0.6;
const DOWNSCALE_WIDTH  = 320;

export function useUgoExperience(
  videoRef: RefObject<HTMLVideoElement>,
  onDeductCoins: (amount: number) => void
) {
  const [isActive, setIsActive]   = useState(false);
  const [feedback, setFeedback]   = useState<Feedback>(null);
  const [error, setError]         = useState<string | null>(null);

  // runtime refs
  const mountedRef           = useRef(true);
  const processingRef        = useRef(false);
  const timerRef             = useRef<number | null>(null);
  const costTimerRef         = useRef<number | null>(null);
  const pacingRef            = useRef<number>(BASE_INTERVAL_MS);
  const hiddenPauseRef       = useRef<boolean>(false);
  const sessionIdRef         = useRef<number>(0); // invalida risposte vecchie

  // canvas off‑DOM (preferisci OffscreenCanvas dove disponibile)
  const canvasRef = useRef<HTMLCanvasElement | OffscreenCanvas | null>(null);

  // helpers
  const clearTimers = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (costTimerRef.current) { clearInterval(costTimerRef.current); costTimerRef.current = null; }
  };

  const ensureCanvas = () => {
    if (canvasRef.current) return canvasRef.current;
    try {
      if ('OffscreenCanvas' in window) {
        canvasRef.current = new (window as any).OffscreenCanvas(2, 2);
      } else {
        canvasRef.current = document.createElement('canvas');
      }
    } catch {
      canvasRef.current = document.createElement('canvas');
    }
    return canvasRef.current!;
  };

  const drawFrameToCanvas = (video: HTMLVideoElement) => {
    const canvas = ensureCanvas();
    // get 2d ctx
    // @ts-ignore
    const ctx: CanvasRenderingContext2D | null = canvas.getContext?.('2d', { willReadFrequently: true }) || (canvas as HTMLCanvasElement).getContext?.('2d');
    if (!ctx) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    const aspect = vh / vw;
    const cw = DOWNSCALE_WIDTH;
    const ch = Math.max(2, Math.round(DOWNSCALE_WIDTH * aspect));

    // @ts-ignore width/height exist on both
    canvas.width = cw;
    // @ts-ignore
    canvas.height = ch;

    ctx.drawImage(video, 0, 0, cw, ch);
    return { canvas, ctx, cw, ch };
  };

  const canvasToBase64 = (canvas: HTMLCanvasElement | OffscreenCanvas): Promise<string | null> => {
    // Prefer toBlob (async, non‑blocking). OffscreenCanvas in molti browser ha convertToBlob.
    const asAny = canvas as any;
    if (typeof asAny.convertToBlob === 'function') {
      return asAny.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY })
        .then((blob: Blob) => new Promise<string>((res) => {
          const fr = new FileReader();
          fr.onloadend = () => res((fr.result as string) ?? null);
          fr.readAsDataURL(blob);
        }))
        .catch(() => null);
    }
    // Fallback: HTMLCanvasElement.toBlob
    return new Promise<string | null>((resolve) => {
      (canvas as HTMLCanvasElement).toBlob?.((blob) => {
        if (!blob) return resolve(null);
        const fr = new FileReader();
        fr.onloadend = () => resolve((fr.result as string) ?? null);
        fr.readAsDataURL(blob);
      }, 'image/jpeg', JPEG_QUALITY);
    });
  };

  const scheduleNext = useCallback((overrideMs?: number) => {
    const delay = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, overrideMs ?? pacingRef.current));
    timerRef.current = window.setTimeout(async () => {
      // Se l’utente ha disattivato o la pagina è nascosta, non inviare frame
      if (!isActive || hiddenPauseRef.current) return scheduleNext();

      await processOneFrame();
      // recupero graduale verso il pacing base se non ci sono stati errori
      pacingRef.current = Math.max(MIN_INTERVAL_MS, Math.min(BASE_INTERVAL_MS, pacingRef.current * RECOVERY_FACTOR));
      scheduleNext();
    }, delay) as unknown as number;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const startBilling = () => {
    if (costTimerRef.current) clearInterval(costTimerRef.current);
    costTimerRef.current = window.setInterval(() => {
      // Billing per secondo “attivo”.
      onDeductCoins(1);
    }, 1000) as unknown as number;
  };

  const stopBilling = () => {
    if (costTimerRef.current) {
      clearInterval(costTimerRef.current);
      costTimerRef.current = null;
    }
  };

  const stopExperience = useCallback(() => {
    setIsActive(false);
    setFeedback(null);
    setError(null);
    processingRef.current = false;
    clearTimers();
    stopBilling();
    // invalida qualunque stream ancora in flight
    sessionIdRef.current++;
  }, []);

  const startExperience = useCallback(() => {
    if (isActive) return;
    setIsActive(true);
    setError(null);
    setFeedback({ userFeedback: 'Avvio Ugo Experience...' });
    pacingRef.current = BASE_INTERVAL_MS;
    hiddenPauseRef.current = document.hidden;

    // kick
    clearTimers();
    startBilling();
    scheduleNext(200); // primo frame rapido
  }, [isActive, scheduleNext]);

  const toggleUgoExperience = useCallback(() => {
    if (isActive) stopExperience();
    else startExperience();
  }, [isActive, startExperience, stopExperience]);

  const processOneFrame = useCallback(async () => {
    if (processingRef.current) return; // backpressure: niente overlap
    processingRef.current = true;

    const localSession = sessionIdRef.current;
    try {
      const video = videoRef.current;
      if (!video) return;

      // Assicurati che il video stia riproducendo e abbia dimensioni valide
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

      const drawn = drawFrameToCanvas(video);
      if (!drawn) return;

      const dataUrl = await canvasToBase64(drawn.canvas);
      if (!dataUrl) return;

      const base64 = dataUrl.split(',')[1];
      if (!base64) return;

      // Avvia lo stream; se nel frattempo è stata stoppata la sessione, ignora
      if (sessionIdRef.current !== localSession) return;

      await startUgoExperienceStream(base64, (chunk) => {
        if (!mountedRef.current || sessionIdRef.current !== localSession) return; // ignora risultati tardivi
        setFeedback(prev => ({ ...(prev || {}), ...chunk }));
      });

      // success → niente da fare; il pacing verrà recuperato dal loop

    } catch (e: any) {
      if (!mountedRef.current) return;
      const msg = (e?.message || '').toLowerCase();
      // Heuristic: quota/rate/429 → backoff, non stop
      if (msg.includes('quota') || msg.includes('rate') || msg.includes('429')) {
        setError('Assistente AI al limite. Rallento un attimo…');
        pacingRef.current = Math.min(MAX_INTERVAL_MS, Math.ceil(pacingRef.current * BACKOFF_FACTOR));
      } else {
        setError("Errore nell'analisi in tempo reale.");
        // opzionale: stop su errori non recuperabili
        // stopExperience();
      }
    } finally {
      processingRef.current = false;
    }
  }, [videoRef]);

  // Visibilità: pausa “soft” quando la pagina è nascosta (non inviamo frame né addebitiamo)
  useEffect(() => {
    const onVis = () => {
      hiddenPauseRef.current = document.hidden;
      if (document.hidden) {
        stopBilling();
      } else if (isActive) {
        startBilling();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isActive]);

  // mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
      stopBilling();
      sessionIdRef.current++; // invalida stream in flight
    };
  }, []);

  return {
    isUgoExperienceActive: isActive,
    ugoFeedback: feedback,
    ugoError: error,
    toggleUgoExperience,
    startUgoExperience: startExperience, // extra API comoda
    stopUgoExperience: stopExperience,   // extra API comoda
  };
}
