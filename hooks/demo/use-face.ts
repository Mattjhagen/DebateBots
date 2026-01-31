/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState, useContext } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
// import { LiveAPIContext } from '../../contexts/LiveAPIContext'; // Context isn't exported as value, only type/hook

export type FaceResults = {
  /** A value that represents how open the eyes are. */
  eyesScale: number;
  /** A value that represents how open the mouth is. */
  mouthScale: number;
};

function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}

// Constrain value between lower and upper limits
function clamp(x: number, lowerlimit: number, upperlimit: number) {
  if (x < lowerlimit) x = lowerlimit;
  if (x > upperlimit) x = upperlimit;
  return x;
}

// GLSL smoothstep implementation
function smoothstep(edge0: number, edge1: number, x: number) {
  // Scale, bias, and saturate to range [0,1]
  x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  // Apply cubic polynomial smoothing
  return x * x * (3 - 2 * x);
}

type BlinkProps = {
  speed: number;
};

export function useBlink({ speed }: BlinkProps) {
  const [eyeScale, setEyeScale] = useState(1);
  const [frame, setFrame] = useState(0);

  const frameId = useRef(-1);

  useEffect(() => {
    function nextFrame() {
      frameId.current = window.requestAnimationFrame(() => {
        setFrame(frame + 1);
        let s = easeOutQuint((Math.sin(frame * speed) + 1) * 2);
        s = smoothstep(0.1, 0.25, s);
        s = Math.min(1, s);
        setEyeScale(s);
        nextFrame();
      });
    }

    nextFrame();

    return () => {
      window.cancelAnimationFrame(frameId.current);
    };
  }, [speed, eyeScale, frame]);

  return eyeScale;
}

export default function useFace() {
  // We wrap this in try/catch or just check if we are inside a provider
  // Since useLiveAPIContext throws if not in provider, we need to handle that or suppress it.
  // Ideally, components using useFace should be in a provider.
  // For the DebateMode, we are not in the main provider, so useFace might fail if called directly.
  // However, we modified DebateApp to manually handle mouthScale.
  // But useFace also returns eyeScale (blink).
  
  let volume = 0;
  try {
     const ctx = useLiveAPIContext();
     volume = ctx.volume;
  } catch (e) {
      // Ignore error if used outside provider
  }

  const eyeScale = useBlink({ speed: 0.0125 });

  return { eyeScale, mouthScale: volume / 2 };
}