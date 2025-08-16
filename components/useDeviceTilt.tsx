import { useState, useEffect } from 'react';

type SensorStatus = 'initializing' | 'granted' | 'denied' | 'unavailable';

export function useDeviceTilt() {
    const [isLevel, setIsLevel] = useState(false);
    const [sensorStatus, setSensorStatus] = useState<SensorStatus>('initializing');
    const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
            if (event.beta !== null && event.gamma !== null) {
                const isDeviceLevel = Math.abs(event.beta) < 8 && Math.abs(event.gamma) < 8;
                setIsLevel(isDeviceLevel);

                const tiltX = -event.gamma;
                const tiltY = -event.beta;
                
                const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));
                const range = 60; // Max movement radius in pixels

                setBubblePosition({
                    x: clamp(tiltX, -range, range),
                    y: clamp(tiltY, -range, range)
                });
            }
        };

        const requestPermission = async () => {
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                    if (permissionState === 'granted') {
                        setSensorStatus('granted');
                        window.addEventListener('deviceorientation', handleDeviceOrientation);
                    } else {
                        setSensorStatus('denied');
                    }
                } catch (e) {
                     setSensorStatus('denied');
                }
            } else if ('DeviceOrientationEvent' in window) {
                setSensorStatus('granted');
                window.addEventListener('deviceorientation', handleDeviceOrientation);
            } else {
                setSensorStatus('unavailable');
            }
        };

        requestPermission();

        return () => {
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
        };
    }, []);

    return { isLevel, sensorStatus, bubblePosition };
}
