import React, { useEffect, useState } from 'react';

interface SparkleEffectProps {
  x: number;
  y: number;
}

const SparkleEffect: React.FC<SparkleEffectProps> = ({ x, y }) => {
  const [sparkles, setSparkles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const sparkleCount = 20 + Math.floor(Math.random() * 10);
    const newSparkles = [];

    for (let i = 0; i < sparkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 60;
      const duration = 300 + Math.random() * 200;
      const delay = Math.random() * 100;
      const size = 2 + Math.random() * 4;

      const sparkleStyle = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#9333ea',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        animation: `sparkle ${duration}ms ease-out ${delay}ms forwards`,
        '--angle': `${angle}rad`,
        '--distance': `${distance}px`,
      } as React.CSSProperties;

      newSparkles.push(<div key={i} style={sparkleStyle} />);
    }

    setSparkles(newSparkles);
  }, []);

  return (
    <div
      className="sparkle-effect"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '1px',
        height: '1px',
        pointerEvents: 'none',
      }}
    >
      {sparkles}
    </div>
  );
};

export default SparkleEffect;
