import React, { useMemo } from 'react';
import styles from './HomeScreen.module.css';

const NUM_FIREFLIES = 24;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

const Fireflies = () => {
  const fireflyData = useMemo(() => (
    Array.from({ length: NUM_FIREFLIES }).map(() => ({
      left: random(2, 96),
      top: random(2, 92),
      size: random(3, 8),
      duration: random(18, 32),
      delay: random(0, 12),
    }))
  ), []);

  return (
    <>
      {fireflyData.map((f, i) => (
        <span
          key={i}
          className={styles.firefly}
          style={{
            left: `${f.left}vw`,
            top: `${f.top}vh`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default Fireflies; 