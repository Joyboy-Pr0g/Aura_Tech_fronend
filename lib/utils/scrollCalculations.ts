/** Scroll direction based on velocity */
export type ScrollDirection = 'up' | 'down' | 'idle';

/** Normalized scroll state consumed by the animation loop */
export interface ScrollState {
  scrollY: number;
  velocity: number;
  direction: ScrollDirection;
  /** 0–1 progress through the document */
  progress: number;
}

export interface ScrollTrackerOptions {
  /** Maximum absolute velocity (px/ms) */
  maxVelocity?: number;
  /** Smoothing factor for velocity (0–1, higher = smoother) */
  velocitySmoothing?: number;
}

const DEFAULT_MAX_VELOCITY = 3;
const DEFAULT_SMOOTHING = 0.85;
const IDLE_THRESHOLD = 0.01;

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Linear interpolation.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smooth-step easing for scroll-driven values.
 */
export function easeScroll(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Maps scroll velocity to a bounded animation multiplier.
 */
export function velocityToMultiplier(velocity: number, sensitivity: number): number {
  return clamp(velocity * sensitivity, -2, 2);
}

/**
 * Tracks scroll position and velocity with smoothing for animation use.
 */
export class ScrollTracker {
  private scrollY = 0;
  private smoothedVelocity = 0;
  private lastScrollY = 0;
  private lastTimestamp = 0;
  private readonly maxVelocity: number;
  private readonly velocitySmoothing: number;

  constructor(options: ScrollTrackerOptions = {}) {
    this.maxVelocity = options.maxVelocity ?? DEFAULT_MAX_VELOCITY;
    this.velocitySmoothing = options.velocitySmoothing ?? DEFAULT_SMOOTHING;
  }

  /**
   * Call on each scroll event with the current timestamp.
   */
  update(scrollY: number, timestamp: number): ScrollState {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.lastScrollY = scrollY;
      this.scrollY = scrollY;
      return this.buildState();
    }

    const deltaTime = Math.max(timestamp - this.lastTimestamp, 1);
    const rawVelocity = (scrollY - this.lastScrollY) / deltaTime;
    const clampedVelocity = clamp(rawVelocity, -this.maxVelocity, this.maxVelocity);

    this.smoothedVelocity =
      this.smoothedVelocity * this.velocitySmoothing +
      clampedVelocity * (1 - this.velocitySmoothing);

    this.scrollY = scrollY;
    this.lastScrollY = scrollY;
    this.lastTimestamp = timestamp;

    return this.buildState();
  }

  /**
   * Decay velocity when scroll stops (call from animation frame).
   */
  tick(timestamp: number): ScrollState {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return this.buildState();
    }

    const deltaTime = timestamp - this.lastTimestamp;
    if (deltaTime > 50) {
      this.smoothedVelocity *= 0.92;
      if (Math.abs(this.smoothedVelocity) < IDLE_THRESHOLD) {
        this.smoothedVelocity = 0;
      }
    }

    return this.buildState();
  }

  /** Sync scroll position without computing velocity (e.g. on resize). */
  syncScrollY(scrollY: number): void {
    this.scrollY = scrollY;
    this.lastScrollY = scrollY;
  }

  private buildState(): ScrollState {
    const docHeight = typeof document !== 'undefined'
      ? document.documentElement.scrollHeight - window.innerHeight
      : 1;
    const progress = docHeight > 0 ? clamp(this.scrollY / docHeight, 0, 1) : 0;

    let direction: ScrollDirection = 'idle';
    if (this.smoothedVelocity > IDLE_THRESHOLD) direction = 'down';
    else if (this.smoothedVelocity < -IDLE_THRESHOLD) direction = 'up';

    return {
      scrollY: this.scrollY,
      velocity: this.smoothedVelocity,
      direction,
      progress,
    };
  }
}

/**
 * Returns true when the viewport should use reduced GPU settings.
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Optimal device pixel ratio capped for performance.
 */
export function getOptimalPixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return isMobileViewport() ? 1 : Math.min(window.devicePixelRatio, 2);
}

/**
 * Parses a hex color string to THREE.js RGB components (0–1).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const num = parseInt(full, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}
