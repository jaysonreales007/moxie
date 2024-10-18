import React, { useEffect, useState } from 'react';

interface BloodSplatterProps {
  x: number;
  y: number;
}

const BloodSplatter: React.FC<BloodSplatterProps> = ({ x, y }) => {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const particleCount = 20 + Math.floor(Math.random() * 10);
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      const size = 2 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const velocity = 1 + Math.random() * 3;
      const distance = 10 + Math.random() * 40;
      const duration = 300 + Math.random() * 200;
      const delay = Math.random() * 100;

      const particleStyle = {
        width: `${size}px`,
        height: `${size}px`,
        left: '50%',
        top: '50%',
        opacity: 1,
        transform: 'translate(-50%, -50%)',
        animation: `blood-particle ${duration}ms ease-out ${delay}ms forwards`,
        '--angle': `${angle}rad`,
        '--distance': `${distance}px`,
        '--velocity': velocity,
      } as React.CSSProperties;

      newParticles.push(
        <div key={i} className="blood-particle" style={particleStyle} />
      );
    }

    setParticles(newParticles);
  }, []);

  return (
    <div
      className="blood-splatter"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '1px',
        height: '1px',
      }}
    >
      {particles}
    </div>
  );
};

export default BloodSplatter;
