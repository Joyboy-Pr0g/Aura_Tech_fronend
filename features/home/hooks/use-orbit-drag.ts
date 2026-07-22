'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { lerp } from '@/lib/utils/scrollCalculations';

const DRAG_SENSITIVITY = 0.38;

export function useOrbitDrag(count: number) {
  const angleStep = count > 0 ? 360 / count : 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const ringRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const targetRef = useRef(0);
  const velocityRef = useRef(0);
  const dragStartX = useRef(0);
  const dragStartRot = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const rafRef = useRef(0);

  const snapToIndex = useCallback(
    (index: number) => {
      if (count <= 0) return;
      const i = ((index % count) + count) % count;
      setActiveIndex(i);
      targetRef.current = -i * angleStep;
    },
    [count, angleStep],
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      snapToIndex(activeIndex + dir);
    },
    [activeIndex, snapToIndex],
  );

  useEffect(() => {
    targetRef.current = -activeIndex * angleStep;
  }, [activeIndex, angleStep]);

  useEffect(() => {
    const loop = () => {
      if (!isDragging) {
        if (Math.abs(velocityRef.current) > 0.08) {
          rotationRef.current += velocityRef.current;
          velocityRef.current *= 0.94;
          const nearest = Math.round(-rotationRef.current / angleStep);
          if (Math.abs(velocityRef.current) < 0.15) {
            snapToIndex(nearest);
            velocityRef.current = 0;
          }
        } else {
          velocityRef.current = 0;
          rotationRef.current = lerp(rotationRef.current, targetRef.current, 0.11);
        }
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [angleStep, isDragging, snapToIndex]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (count <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      velocityRef.current = 0;
      dragStartX.current = e.clientX;
      dragStartRot.current = rotationRef.current;
      lastX.current = e.clientX;
      lastTime.current = performance.now();
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [count],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX.current;
      rotationRef.current = dragStartRot.current + dx * DRAG_SENSITIVITY;
      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        velocityRef.current = ((e.clientX - lastX.current) / dt) * DRAG_SENSITIVITY * 14;
      }
      lastX.current = e.clientX;
      lastTime.current = now;
    },
    [isDragging],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      const nearest = Math.round(-rotationRef.current / angleStep);
      snapToIndex(nearest);
    },
    [angleStep, isDragging, snapToIndex],
  );

  return {
    ringRef,
    activeIndex,
    snapToIndex,
    go,
    angleStep,
    isDragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
