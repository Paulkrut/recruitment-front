import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { MoveDirection, OutMode, type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const HeroParticles = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(() => ({
    background: { color: { value: "#E5F3FB" } },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
    particles: {
      color: { value: ["#1976d2", "#43a047", "#00bcd4"] },
      links: { enable: true, color: "#1976d2", distance: 150, opacity: 0.3, width: 1 },
      collisions: { enable: false },
      move: {
        direction: MoveDirection.none,
        enable: true,
        outModes: { default: OutMode.bounce },
        random: true,
        speed: 2,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 120 },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 2, max: 5 } },
    },
    detectRetina: true,
  }), []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  );
};

export default HeroParticles;
