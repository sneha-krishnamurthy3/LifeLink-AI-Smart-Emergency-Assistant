import { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter – counts from 0 → end over `duration` ms.
 *
 * Uses a simple requestAnimationFrame loop that starts 120 ms after mount
 * (enough time for the element to appear on screen) rather than an
 * IntersectionObserver, which is unreliable when the element is already
 * visible at page-load time.
 */
const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    // Small delay so the element is definitely painted before we start
    const startDelay = setTimeout(() => {
      const startTime = performance.now();

      const step = (now) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic: fast start, smooth deceleration
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = eased * end;

        setCount(value);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          setCount(end); // snap to exact final value
        }
      };

      frameRef.current = requestAnimationFrame(step);
    }, 120);

    return () => {
      clearTimeout(startDelay);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration]); // re-run only if target/duration changes

  const displayValue =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.round(count).toLocaleString('en-IN');

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default AnimatedCounter;
