import { motion, useInView, Variants } from "framer-motion";
import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import * as THREE from "three"; // ✅ <-- add this

/* -------------------------------------------------------------------------- */
/*                               Lazy 3D Loader                               */
/* -------------------------------------------------------------------------- */
let R3F: typeof import("@react-three/fiber") | null = null;
let Drei: any = null;

const useLazyThree = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [r3f, drei] = await Promise.all([
          import("@react-three/fiber"),
          import("@react-three/drei"),
        ]);
        if (!mounted) return;
        R3F = r3f;
        Drei = drei;
        setReady(true);
      } catch (e) {
        console.warn("3D libraries not available, fallback applied.", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return ready;
};

/* -------------------------------------------------------------------------- */
/*                      3D Dove Visual (Cross → Dove Morph)                   */
/* -------------------------------------------------------------------------- */
const DoveVisual = () => {
  if (!R3F || !Drei)
    return (
      <div className="h-64 md:h-80 bg-gradient-to-b from-amber-100/30 to-red-100/30 dark:from-red-950/5 dark:to-amber-950/5 rounded-t-[4rem]" />
    );

  const { Canvas, useFrame } = R3F;
  const { Points, PointMaterial } = Drei;

  const count = 3500;

  // ✝️ Cross shape
  const crossPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 0.8;
      const y = (Math.random() - 0.5) * 3;
      const z = (Math.random() - 0.5) * 0.3;
      if (Math.abs(x) < 0.12 || Math.abs(y) < 0.12) arr.set([x, y, z], i * 3);
      else arr.set([(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2], i * 3);
    }
    return arr;
  }, []);

  // 🕊️ Dove cloud
  const dovePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * 2 * Math.PI;
      const r = 2.3 + Math.random() * 1.3;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      arr.set([x, y, z], i * 3);
    }
    return arr;
  }, []);

  const morphPositions = useMemo(() => new Float32Array(count * 3), []);
  const progressRef = useRef(0);

  const ParticleMorph = () => {
    const ref = useRef<any>(null);

    useFrame((_, delta: number) => {
      if (!ref.current) return;

      progressRef.current = Math.min(progressRef.current + delta / 3, 1);
      const t = progressRef.current;
      const p = morphPositions;

      for (let i = 0; i < p.length; i += 3) {
        p[i] = crossPositions[i] * (1 - t) + dovePositions[i] * t;
        p[i + 1] = crossPositions[i + 1] * (1 - t) + dovePositions[i + 1] * t;
        p[i + 2] = crossPositions[i + 2] * (1 - t) + dovePositions[i + 2] * t;
      }
      ref.current.geometry.setAttribute("position", new THREE.BufferAttribute(p, 3));

      ref.current.rotation.y += delta * 0.06;
      ref.current.rotation.x += delta * 0.015;
    });

    return (
      <Points ref={ref} positions={morphPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#B8860B"
          size={0.06} // bigger and brighter
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1.2 }}
      className="w-full h-full"
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
        <Suspense fallback={null}>
          <ParticleMorph />
        </Suspense>
      </Canvas>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               Hero Component                               */
/* -------------------------------------------------------------------------- */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const threeReady = useLazyThree();

  const headline = "Building the Kingdom, One Connection at a Time.";
  const headlineWords = headline.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 14 },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-red-50/20 dark:from-slate-950 dark:via-red-950/5 dark:to-amber-950/10"
    >
      {/* Gradient Layers */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,0,0,0.08),transparent_70%)]" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* Golden Halo Glow */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[550px] h-[550px] md:w-[700px] md:h-[700px] rounded-full bg-gradient-radial from-[#D4AF37]/25 via-transparent to-transparent blur-3xl animate-pulse" />
      </div>

      {/* Text */}
      <motion.div
        className="relative z-10 container mx-auto px-6 text-center max-w-5xl py-24 md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
      >
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tight leading-tight text-slate-900 dark:text-slate-50 drop-shadow-md"
          aria-label={headline}
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-10 mx-auto max-w-2xl text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-normal drop-shadow-sm"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Dominion Connect is our digital sanctuary — uniting the WCIN family,
          empowering our spiritual growth, and managing our community with divine
          excellence and purpose.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2 drop-shadow-md"
          >
            Get Connected <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            className="px-8 py-4 rounded-full border border-slate-400/30 hover:border-slate-600/50 text-slate-800 dark:text-slate-200 backdrop-blur-sm transition-all drop-shadow-sm"
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 3D Background Visual (Visible and Elevated) */}
      <div className="absolute inset-x-0 bottom-[-2rem] md:bottom-[-4rem] lg:bottom-[-6rem] h-[500px] md:h-[600px] pointer-events-none">
        {threeReady && <DoveVisual />}
      </div>
    </section>
  );
}