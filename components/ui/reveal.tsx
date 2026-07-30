"use client";

import { useEffect } from "react";

/**
 * Mounts once and animates any element carrying `data-reveal` into view.
 * Uses attribute observation (not wrapper elements) so it composes with grids
 * and flex layouts without adding DOM. Honors prefers-reduced-motion via CSS.
 */
export function RevealScript() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const observe = (el: Element) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    };

    document.querySelectorAll("[data-reveal]").forEach(observe);

    // Catch sections mounted later (e.g. switching exam tabs)
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]")) observe(node);
          node.querySelectorAll?.("[data-reveal]").forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
