import "./r7-media.js";
import { bootPage } from "./effects.js";

bootPage();

/**
 * R7: load React Bits Crosshair only on fine pointers with motion OK.
 * Avoids ~270KB React+GSAP on mobile / reduced-motion.
 */
async function maybeCrosshair() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 720px)").matches;
  const saveData =
    (navigator.connection && navigator.connection.saveData) ||
    window.matchMedia("(prefers-reduced-data: reduce)").matches;
  if (reduce || coarse || narrow || saveData) return;

  const mount = document.getElementById("crosshair-root");
  if (!mount) return;

  const [{ createRoot }, { default: Crosshair }] = await Promise.all([
    import("react-dom/client"),
    import("./Crosshair.jsx"),
  ]);
  createRoot(mount).render(<Crosshair color="#4a9fd4" />);
}

maybeCrosshair();
