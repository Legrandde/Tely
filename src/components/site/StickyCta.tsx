import { useEffect, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface StickyCtaProps {
  /** Élément sentinelle : le CTA apparaît une fois cet élément passé au-dessus de l'écran. */
  apresRef: RefObject<HTMLElement | null>;
  to: string;
  label: string;
}

/** CTA collant en bas d'écran, mobile uniquement. */
export default function StickyCta({ apresRef, to, label }: StickyCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cible = apresRef.current;
    if (!cible || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entree]) => {
      setVisible(!entree.isIntersecting && entree.boundingClientRect.top < 0);
    });
    obs.observe(cible);
    return () => obs.disconnect();
  }, [apresRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-200 bg-amber-50/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
        >
          <Link
            to={to}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-base font-semibold text-gray-900 shadow-md shadow-amber-500/30 active:bg-amber-400"
          >
            {label}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
