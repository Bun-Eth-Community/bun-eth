import { useState, useEffect } from "react";

type AnimationConfig = {
  showAnimation: boolean;
};

/**
 * Hook to control animation visibility based on user preferences
 * @returns animation configuration
 */
export const useAnimationConfig = (): AnimationConfig => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShowAnimation(!prefersReducedMotion);
  }, []);

  return { showAnimation };
};
