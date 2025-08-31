import { useState, useEffect, useCallback, RefObject } from 'react';

export function useCameraStream(videoRef: RefObject<HTMLVideoElement>) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // Nuovo: autoplay iOS fallback
  const [requiresUserGesture, setRequiresUserGesture] = useState(false);

  useEffect(() => {
    let mounted = true;
    let lastErrorCaught: any = null;
    let cleanupLoadedHandler: (() => void) | null = null;

    const mapGetUserMediaError = (err: any) => {
      const name = err?.name || '';
      if (name === 'NotAllowedError') return 'Permesso fotocamera negato. Abilitalo nelle impostazioni.';
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Nessuna fotocamera disponibile sul dispositivo.';
      if (name === 'OverconstrainedError') return 'Risoluzione non supportata dal dispositivo.';
      if (name === 'NotReadableError') return 'Fotocamera occupata da un’altra app.';
      return 'Impossibile accedere alla fotocamera.';
    };

    const startCamera = async () => {
      const videoConstraintsToTry: MediaStreamConstraints[] = [
        { video: { facingMode: { exact: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
        { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
        { video: { width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
        { video: true, audio: false },
      ];

      let mediaStream: MediaStream | null = null;

      for (const constraints of videoConstraintsToTry) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          if (mediaStream) break;
        } catch (err) {
          lastErrorCaught = err;
          // continua a provare con vincoli più permissivi
        }
      }

      if (!mounted) return;

      if (!mediaStream) {
        setError(mapGetUserMediaError(lastErrorCaught));
        return;
      }

      // Torch support?
      try {
        const vt = mediaStream.getVideoTracks()[0];
        const caps = vt?.getCapabilities?.() as any;
        setTorchSupported(Boolean(caps && 'torch' in caps && caps.torch));
      } catch {
        setTorchSupported(false);
      }

      setStream(mediaStream);

      if (videoRef.current) {
        const video = videoRef.current;
        // forza anche le proprietà (Safari/iOS a volte ignora gli attributi)
        video.muted = true;
        (video as any).playsInline = true;

        video.srcObject = mediaStream;

        const onLoadedData = () => setIsVideoReady(true);
        video.addEventListener('loadeddata', onLoadedData);
        cleanupLoadedHandler = () => video.removeEventListener('loadeddata', onLoadedData);

        try {
          await video.play();
          setRequiresUserGesture(false);
        } catch {
          // Autoplay bloccato: servirà un gesto utente
          setRequiresUserGesture(true);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      try {
        cleanupLoadedHandler?.();
      } catch {}
      try {
        stream?.getTracks().forEach(t => t.stop());
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef]);

  const applyTorchState = useCallback(async (newState: boolean) => {
    if (!stream || !torchSupported) return;
    const videoTrack = stream.getVideoTracks()[0];
    try {
      // torch via advanced constraints (non standard in TS)
      await (videoTrack as any).applyConstraints({ advanced: [{ torch: newState }] });
      setIsTorchOn(newState);
    } catch (err) {
      console.error('Failed to apply torch constraints:', err);
    }
  }, [stream, torchSupported]);

  // Nuovo: chiama questa su “Tocca per avviare”
  const resumePlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setRequiresUserGesture(false);
    } catch {
      // resta true se fallisce
    }
  }, [videoRef]);

  return {
    stream,
    error,
    isVideoReady,
    isTorchOn,
    torchSupported,
    applyTorchState,
    requiresUserGesture, // nuovo
    resumePlayback,      // nuovo
  };
}
