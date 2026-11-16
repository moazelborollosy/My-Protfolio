import { useEffect, useRef } from 'react';

type NetworkNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  drift: number;
};

const DESKTOP_NODE_COUNT = 72;
const MOBILE_NODE_COUNT = 42;
const CONNECTION_DISTANCE = 150;

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let nodes: NetworkNode[] = [];
    let animationFrame = 0;
    let lastTime = performance.now();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const createNodes = () => {
      const count = width < 768 ? MOBILE_NODE_COUNT : DESKTOP_NODE_COUNT;

      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        radius: index % 9 === 0 ? 2.3 : 1.45 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        drift: 0.45 + Math.random() * 0.7,
      }));
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createNodes();
    };

    const updateNode = (node: NetworkNode, dt: number, elapsed: number) => {
      const waveX = Math.sin(elapsed * 0.00022 * node.drift + node.phase) * 2.8;
      const waveY = Math.cos(elapsed * 0.00018 * node.drift + node.phase) * 2.2;

      node.x += (node.vx + waveX) * dt;
      node.y += (node.vy + waveY) * dt;

      const margin = 30;

      if (node.x < -margin) node.x = width + margin;
      else if (node.x > width + margin) node.x = -margin;

      if (node.y < -margin) node.y = height + margin;
      else if (node.y > height + margin) node.y = -margin;
    };

    const draw = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        updateNode(node, dt, time);
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared > CONNECTION_DISTANCE * CONNECTION_DISTANCE) continue;

          const distance = Math.sqrt(distanceSquared);
          const strength = 1 - distance / CONNECTION_DISTANCE;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(67, 166, 247, ${0.04 + strength * 0.20})`;
          ctx.lineWidth = 0.65 + strength * 0.4;
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        const pulse = 0.72 + Math.sin(time * 0.0011 + node.phase) * 0.18;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(85, 187, 255, ${Math.max(0.28, pulse)})`;
        ctx.shadowColor = 'rgba(59, 167, 255, 0.58)';
        ctx.shadowBlur = node.radius * 3.8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const onResize = () => {
      resizeCanvas();
      if (prefersReducedMotion) draw(performance.now());
    };
    resizeCanvas();
    if (prefersReducedMotion) {
      draw(performance.now());
    } else {
      animationFrame = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="autonomous-network" aria-hidden="true">
      <canvas ref={canvasRef} className="autonomous-network__canvas" />
      <div className="autonomous-network__glow autonomous-network__glow--one" />
      <div className="autonomous-network__glow autonomous-network__glow--two" />
    </div>
  );
}
