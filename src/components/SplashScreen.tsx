import React, { useEffect } from "react";
import { motion } from "motion/react";
import ChurchLogo from "./ChurchLogo";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // Automatically transition to login after 3.2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      id="splash-screen-bg"
      className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Decorative ambient elements mirroring Igreja Viva brand layout */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center p-8 z-10"
      >
        <ChurchLogo size={120} showText={false} />

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-4xl font-extrabold text-slate-900 tracking-tight mt-6"
        >
          Igreja <span className="text-[#2E7D32]">Viva</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-emerald-700/90 font-medium tracking-wide text-sm mt-2"
        >
          TECNOLOGIA A SERVIÇO DO REINO
        </motion.p>

        {/* Brand values grid list row from the uploaded design brief */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-12 text-slate-600 max-w-md text-xs font-semibold uppercase tracking-wider"
        >
          <span className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-100/60 flex items-center gap-1.5 shadow-xs">
            🌱 Vida & Crescimento
          </span>
          <span className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-100/60 flex items-center gap-1.5 shadow-xs">
            👥 Comunhão & Célula
          </span>
          <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-100/60 flex items-center gap-1.5 shadow-xs">
            ✝️ Fé & Propósito
          </span>
        </motion.div>

        {/* Minimalist interactive skip option */}
        <motion.button
          onClick={onComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-14 px-6 py-2 rounded-lg bg-slate-100 text-slate-500 font-medium hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-xs border border-slate-200/50"
        >
          Entrar no Sistema
          <span className="text-lg">→</span>
        </motion.button>
      </motion.div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.1, ease: "linear" }}
          className="h-full bg-emerald-600"
        />
      </div>
    </div>
  );
}
