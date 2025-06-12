import { useState, useMemo } from 'react';

/**
 * Custom hook for managing 3D perspective effect with logarithmic scaling
 * Provides a slider value (0-100) that maps to perspective values (100-800px)
 * using logarithmic scaling for finer control at lower perspective values
 */
export const usePerspectiveEffect = (initialSliderValue: number = 50) => {
  // Perspective slider state (0-100 range for UI)
  const [sliderValue, setSliderValue] = useState<number>(initialSliderValue);
  
  // Convert slider value (0-100) to perspective value (100-800) using logarithmic scale
  // This gives finer control at the lower end (around 100) where visual changes are more dramatic
  const perspectiveValue = useMemo(() => {
    // Map 0-100 to 100-800 using logarithmic scale
    const minPerspective = 100;
    const maxPerspective = 800;
    const logMin = Math.log(minPerspective);
    const logMax = Math.log(maxPerspective);
    const scale = (logMax - logMin) / 100;
    
    return Math.round(Math.exp(logMin + scale * sliderValue));
  }, [sliderValue]);
  
  // Handle perspective slider change
  const handlePerspectiveChange = (event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number);
  };

  return {
    sliderValue,
    perspectiveValue,
    handlePerspectiveChange
  };
};

export default usePerspectiveEffect;
