import { useEffect, useRef } from 'react';
import Hammer from 'hammerjs';

export const useSwipeGestures = (onSwipe, options = {}) => {
  const elementRef = useRef(null);
  const hammerRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const defaultOptions = {
      touchAction: 'pan-y',
      recognizers: [
        [Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }],
        [Hammer.Pan, { direction: Hammer.DIRECTION_ALL }],
        [Hammer.Tap, { taps: 1 }],
        [Hammer.Press, { time: 500 }]
      ]
    };

    const hammerOptions = { ...defaultOptions, ...options };
    hammerRef.current = new Hammer(elementRef.current, hammerOptions);

    // Configure swipe recognizer
    hammerRef.current.get('swipe').set({ 
      direction: Hammer.DIRECTION_ALL,
      threshold: 10,
      velocity: 0.3
    });

    // Configure pan recognizer
    hammerRef.current.get('pan').set({ 
      direction: Hammer.DIRECTION_ALL,
      threshold: 10
    });

    // Add event listeners
    hammerRef.current.on('swipeleft', () => onSwipe('left'));
    hammerRef.current.on('swiperight', () => onSwipe('right'));
    hammerRef.current.on('swipeup', () => onSwipe('up'));
    hammerRef.current.on('swipedown', () => onSwipe('down'));

    // Clean up
    return () => {
      if (hammerRef.current) {
        hammerRef.current.destroy();
      }
    };
  }, [onSwipe, options]);

  return elementRef;
};

export const useTapGestures = (onTap, onDoubleTap, onLongPress) => {
  const elementRef = useRef(null);
  const hammerRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    hammerRef.current = new Hammer(elementRef.current, {
      touchAction: 'manipulation'
    });

    // Enable double tap
    hammerRef.current.get('tap').set({ taps: 2 });

    // Add event listeners
    if (onTap) hammerRef.current.on('tap', onTap);
    if (onDoubleTap) hammerRef.current.on('doubletap', onDoubleTap);
    if (onLongPress) hammerRef.current.on('press', onLongPress);

    return () => {
      if (hammerRef.current) {
        hammerRef.current.destroy();
      }
    };
  }, [onTap, onDoubleTap, onLongPress]);

  return elementRef;
};

export const usePinchGestures = (onPinch, onRotate) => {
  const elementRef = useRef(null);
  const hammerRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    hammerRef.current = new Hammer(elementRef.current, {
      touchAction: 'none'
    });

    // Enable pinch and rotate
    hammerRef.current.get('pinch').set({ enable: true });
    hammerRef.current.get('rotate').set({ enable: true });

    // Add event listeners
    if (onPinch) {
      hammerRef.current.on('pinchstart pinchmove pinchend', onPinch);
    }
    if (onRotate) {
      hammerRef.current.on('rotatestart rotatemove rotateend', onRotate);
    }

    return () => {
      if (hammerRef.current) {
        hammerRef.current.destroy();
      }
    };
  }, [onPinch, onRotate]);

  return elementRef;
};

export const useCustomGestures = (config) => {
  const elementRef = useRef(null);
  const hammerRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current || !config) return;

    hammerRef.current = new Hammer(elementRef.current, config.options || {});

    // Configure recognizers
    if (config.recognizers) {
      config.recognizers.forEach(([recognizer, options]) => {
        hammerRef.current.get(recognizer).set(options);
      });
    }

    // Add event listeners
    if (config.events) {
      Object.entries(config.events).forEach(([event, handler]) => {
        hammerRef.current.on(event, handler);
      });
    }

    return () => {
      if (hammerRef.current) {
        hammerRef.current.destroy();
      }
    };
  }, [config]);

  return elementRef;
};

export default {
  useSwipeGestures,
  useTapGestures,
  usePinchGestures,
  useCustomGestures
};
