/**
 * Crosshair — adapted from React Bits (DavidHDev/react-bits)
 * https://reactbits.dev/animations/crosshair
 * Overlay only — system cursor stays. Color = armory --weld cyan.
 */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const lerp = (a, b, n) => (1 - n) * a + n * b;
const getMousePos = (e, container) => {
  if (container) {
    const bounds = container.getBoundingClientRect();
    return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
  }
  return { x: e.clientX, y: e.clientY };
};

export default function Crosshair({ color = "#4a9fd4", containerRef = null }) {
  const lineHorizontalRef = useRef(null);
  const lineVerticalRef = useRef(null);
  const filterXRef = useRef(null);
  const filterYRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let mouse = { x: 0, y: 0 };
    let raf = 0;
    let running = true;

    const handleMouseMove = (ev) => {
      mouse = getMousePos(ev, containerRef?.current);
      if (containerRef?.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        const outside =
          ev.clientX < bounds.left ||
          ev.clientX > bounds.right ||
          ev.clientY < bounds.top ||
          ev.clientY > bounds.bottom;
        gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
          opacity: outside ? 0 : 1,
          duration: 0.2,
        });
      }
    };

    const target = containerRef?.current || window;
    target.addEventListener("mousemove", handleMouseMove);

    const renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.15 },
      ty: { previous: 0, current: 0, amt: 0.15 },
    };
    gsap.set([lineHorizontalRef.current, lineVerticalRef.current], { opacity: 0 });

    const onFirstMove = () => {
      renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
      renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;
      gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
        duration: 0.9,
        ease: "power3.out",
        opacity: 1,
      });
      const render = () => {
        if (!running) return;
        renderedStyles.tx.current = mouse.x;
        renderedStyles.ty.current = mouse.y;
        for (const key of Object.keys(renderedStyles)) {
          renderedStyles[key].previous = lerp(
            renderedStyles[key].previous,
            renderedStyles[key].current,
            renderedStyles[key].amt,
          );
        }
        if (lineHorizontalRef.current && lineVerticalRef.current) {
          gsap.set(lineVerticalRef.current, { x: renderedStyles.tx.previous });
          gsap.set(lineHorizontalRef.current, { y: renderedStyles.ty.previous });
        }
        raf = requestAnimationFrame(render);
      };
      raf = requestAnimationFrame(render);
      target.removeEventListener("mousemove", onFirstMove);
    };
    target.addEventListener("mousemove", onFirstMove);

    const primitiveValues = { turbulence: 0 };
    const tl = gsap
      .timeline({
        paused: true,
        onStart: () => {
          if (lineHorizontalRef.current && lineVerticalRef.current) {
            lineHorizontalRef.current.style.filter = "url(#armory-filter-noise-x)";
            lineVerticalRef.current.style.filter = "url(#armory-filter-noise-y)";
          }
        },
        onUpdate: () => {
          if (filterXRef.current && filterYRef.current) {
            filterXRef.current.setAttribute("baseFrequency", String(primitiveValues.turbulence));
            filterYRef.current.setAttribute("baseFrequency", String(primitiveValues.turbulence));
          }
        },
        onComplete: () => {
          if (lineHorizontalRef.current && lineVerticalRef.current) {
            lineHorizontalRef.current.style.filter = lineVerticalRef.current.style.filter = "none";
          }
        },
      })
      .to(primitiveValues, {
        duration: 0.5,
        ease: "power1",
        startAt: { turbulence: 1 },
        turbulence: 0,
      });

    const enter = () => tl.restart();
    const leave = () => tl.progress(1).kill();
    const root = containerRef?.current || document;
    const links = root.querySelectorAll("a, button, .copy-block, .floor-list li");
    links.forEach((link) => {
      link.addEventListener("mouseenter", enter);
      link.addEventListener("mouseleave", leave);
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mousemove", onFirstMove);
      links.forEach((link) => {
        link.removeEventListener("mouseenter", enter);
        link.removeEventListener("mouseleave", leave);
      });
    };
  }, [containerRef]);

  return (
    <div
      className="rb-crosshair"
      aria-hidden="true"
      style={{
        position: containerRef ? "absolute" : "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
      }}
    >
      <svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
        <defs>
          <filter id="armory-filter-noise-x">
            <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterXRef} />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
          <filter id="armory-filter-noise-y">
            <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterYRef} />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>
      <div
        ref={lineHorizontalRef}
        className="rb-crosshair-h"
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          background: color,
          pointerEvents: "none",
          transform: "translateY(50%)",
          opacity: 0,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      <div
        ref={lineVerticalRef}
        className="rb-crosshair-v"
        style={{
          position: "absolute",
          height: "100%",
          width: "1px",
          background: color,
          pointerEvents: "none",
          transform: "translateX(50%)",
          opacity: 0,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    </div>
  );
}
