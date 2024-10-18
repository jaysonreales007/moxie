import React, { useEffect, useRef } from 'react';

interface TrailEffectProps {
  x: number;
  y: number;
}

const TrailEffect: React.FC<TrailEffectProps> = ({ x, y }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      life: number;
      opacity: number;
    }[] = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        size: Math.random() * 15 + 5,
        color: `rgba(200, 255, 200, ${Math.random() * 0.3 + 0.2})`,
        speedX: (Math.random() - 0.5) * 2,
        speedY: -Math.random() * 3 - 1,
        life: Math.random() * 20 + 40,
        opacity: 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.size += 0.2;
        particle.life--;
        particle.opacity -= 0.02;

        if (particle.life <= 0 || particle.opacity <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`);
          ctx.fill();
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [x, y]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      width={900}
      height={400}
    />
  );
};

export default TrailEffect;
