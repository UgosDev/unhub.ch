import React, { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

interface DynamicMeshOverlayProps {
  detectedCorners: Point[] | null;                  // in coordinate del processingCanvas
  isLockedOn: boolean;
  videoDisplaySize: { width: number; height: number };      // dimensioni del box video (container)
  processingCanvasSize: { width: number; height: number };  // dimensioni del frame processato (stessa AR del video)
}

/** Mappatura corretta per object-cover: scale unico + offset (crop) */
function mapPointFromProcessingToDisplay(
  p: Point,
  procW: number,
  procH: number,
  dispW: number,
  dispH: number
): Point {
  if (!procW || !procH || !dispW || !dispH) return { x: 0, y: 0 };
  const scale = Math.max(dispW / procW, dispH / procH); // object-cover
  const offsetX = (dispW - procW * scale) / 2;
  const offsetY = (dispH - procH * scale) / 2;
  return { x: p.x * scale + offsetX, y: p.y * scale + offsetY };
}

/** Spring critico: smoothing più stabile del lerp */
function springStep(curr: number, target: number, vel: number, dt: number, omega = 20) {
  // m=1, c=2*sqrt(km) -> crit damping (qui omega ~ sqrt(k))
  const f = -omega * omega * (curr - target) - 2 * omega * vel;
  const newVel = vel + f * dt;
  const newPos = curr + newVel * dt;
  return { pos: newPos, vel: newVel };
}

export const DynamicMeshOverlay: React.FC<DynamicMeshOverlayProps> = ({
  detectedCorners,
  isLockedOn,
  videoDisplaySize,
  processingCanvasSize,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const polyRef = useRef<SVGPolygonElement | null>(null);

  // stato “interno” (no React state): posizioni e velocità dei 4 punti + alpha di visibilità
  const ptsRef = useRef<{ p: Point; v: Point }[] | null>(null);
  const alphaRef = useRef(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const targetRef = useRef<Point[] | null>(null);
  const framesIdleRef = useRef(0);

  // aggiorna target (corner nuovi) quando cambia detectedCorners
  useEffect(() => {
    targetRef.current = detectedCorners;
    if (!detectedCorners) {
      framesIdleRef.current = 0;
    }
  }, [detectedCorners]);

  // main loop: throttle 30fps, spring smoothing, fade in/out, DOM update diretto
  useEffect(() => {
    const svg = svgRef.current;
    const polygon = polyRef.current;
    if (!svg || !polygon) return;

    const run = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dtRaw = (ts - last) / 1000;
      lastTsRef.current = ts;

      // throttle a ~30fps
      const minFrame = 1000 / 30;
      const shouldDraw = ts - (polygon as any)._lastDrawTs >= minFrame || !(polygon as any)._lastDrawTs;
      const dt = Math.min(Math.max(dtRaw, 0), 0.033); // clamp dt per stabilità

      const dispW = videoDisplaySize.width;
      const dispH = videoDisplaySize.height;
      const procW = processingCanvasSize.width;
      const procH = processingCanvasSize.height;

      // compute target in display coords
      const tgt = targetRef.current && procW && procH && dispW && dispH
        ? targetRef.current.map(p => mapPointFromProcessingToDisplay(p, procW, procH, dispW, dispH))
        : null;

      // visibilità (alpha) con fade in/out
      const alpha = alphaRef.current;
      const alphaTarget = tgt && tgt.length === 4 ? 1 : 0;
      const alphaStep = 4 * dt; // ~250ms per full fade
      const newAlpha = alphaTarget > alpha ? Math.min(1, alpha + alphaStep) : Math.max(0, alpha - alphaStep);
      alphaRef.current = newAlpha;

      // inizializza punti se serve
      if (!ptsRef.current && tgt && tgt.length === 4) {
        ptsRef.current = tgt.map(p => ({ p: { ...p }, v: { x: 0, y: 0 } }));
      }

      // aggiorna punti (spring) verso target
      if (ptsRef.current) {
        if (tgt && tgt.length === 4) {
          for (let i = 0; i < 4; i++) {
            const curr = ptsRef.current[i];
            const sx = springStep(curr.p.x, tgt[i].x, curr.v.x, dt);
            const sy = springStep(curr.p.y, tgt[i].y, curr.v.y, dt);
            curr.p.x = sx.pos; curr.v.x = sx.vel;
            curr.p.y = sy.pos; curr.v.y = sy.vel;
          }
          framesIdleRef.current = 0;
        } else {
          // nessun target: rallenta verso il centro e poi spegni
          framesIdleRef.current++;
          const center = { x: dispW / 2, y: dispH / 2 };
          for (let i = 0; i < 4; i++) {
            const curr = ptsRef.current[i];
            const sx = springStep(curr.p.x, center.x, curr.v.x, dt, 10);
            const sy = springStep(curr.p.y, center.y, curr.v.y, dt, 10);
            curr.p.x = sx.pos; curr.v.x = sx.vel;
            curr.p.y = sy.pos; curr.v.y = sy.vel;
          }
          // se alpha è zero e siamo fermi da un po', ferma il loop
          if (newAlpha <= 0 && framesIdleRef.current > 30) {
            ptsRef.current = null;
          }
        }
      }

      // aggiorna DOM (evita re-render React)
      if (shouldDraw && ptsRef.current && alphaRef.current > 0) {
        const stroke = isLockedOn ? 'rgba(74, 222, 128, 0.9)' : 'rgba(192, 132, 252, 0.7)';
        const fill   = isLockedOn ? 'rgba(74, 222, 128, 0.2)' : 'rgba(192, 132, 252, 0.1)';
        const ptsStr = ptsRef.current.map(p => `${p.p.x.toFixed(1)},${p.p.y.toFixed(1)}`).join(' ');
        polygon.setAttribute('points', ptsStr);
        polygon.setAttribute('stroke', stroke);
        polygon.setAttribute('fill', fill);
        polygon.setAttribute('opacity', alphaRef.current.toFixed(3));
        (polygon as any)._lastDrawTs = ts;
      } else if (shouldDraw && (!ptsRef.current || alphaRef.current === 0)) {
        polygon.setAttribute('points', '');
        polygon.setAttribute('opacity', '0');
        (polygon as any)._lastDrawTs = ts;
      }

      // aggiorna viewBox/size se cambiano dimensioni (React le imposta via props; qui assicuriamo coerenza)
      svg.setAttribute('viewBox', `0 0 ${dispW} ${dispH}`);

      // stop loop quando veramente non c’è nulla da animare
      const needMore =
        (targetRef.current && alphaRef.current < 1) ||
        (!targetRef.current && alphaRef.current > 0) ||
        !!ptsRef.current;

      rafRef.current = needMore ? requestAnimationFrame(run) : null;
    };

    rafRef.current = requestAnimationFrame(run);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [videoDisplaySize, processingCanvasSize, isLockedOn]);

  // Render minimale: niente state, solo SVG con refs
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      width={videoDisplaySize.width}
      height={videoDisplaySize.height}
      viewBox={`0 0 ${videoDisplaySize.width} ${videoDisplaySize.height}`}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        ref={polyRef}
        points=""
        strokeWidth="4"
        strokeLinejoin="round"
        style={{ transition: 'filter 0.2s ease-in-out' }}
        filter={isLockedOn ? 'url(#glow)' : 'none'}
      />
    </svg>
  );
};