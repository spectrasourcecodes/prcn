// src/components/AnimatedCounter.jsx
import { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

const AnimatedCounter = ({ end, prefix = '', suffix = '', duration = 2 }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <span ref={elementRef}>
      {hasAnimated ? (
        <CountUp end={end} duration={duration} prefix={prefix} suffix={suffix} />
      ) : (
        <span>0</span>
      )}
    </span>
  );
};

export default AnimatedCounter;