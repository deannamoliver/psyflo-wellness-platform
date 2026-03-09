"use client";

import { useEffect, useRef, useState } from "react";

interface ResponsiveTitleProps {
  firstName: string;
}

export function ResponsiveTitle({ firstName }: ResponsiveTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<string | undefined>(undefined);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!containerRef.current || !textRef.current) return;

      // Only adjust on mobile (screen width < 768px)
      if (window.innerWidth >= 768) {
        // On desktop, use default Tailwind classes
        textRef.current.style.fontSize = "";
        setFontSize(undefined);
        return;
      }

      const container = containerRef.current;
      const text = textRef.current;
      const containerWidth = container.offsetWidth;

      // Start with max size (4.5rem = 72px for text-7xl)
      let currentSize = 72;
      const minSize = 32; // 2rem = 32px minimum

      // Set initial size
      text.style.fontSize = `${currentSize}px`;

      // Check if text overflows and reduce size if needed
      while (text.scrollWidth > containerWidth && currentSize > minSize) {
        currentSize -= 2; // Reduce by 2px at a time
        text.style.fontSize = `${currentSize}px`;
      }

      // Update state with the calculated size
      setFontSize(`${currentSize}px`);
    };

    // Adjust on mount and resize
    adjustFontSize();
    window.addEventListener("resize", adjustFontSize);

    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(adjustFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", adjustFontSize);
      resizeObserver.disconnect();
    };
  }, [firstName]);

  return (
    <div ref={containerRef} className="mb-2 w-full max-w-full">
      <h1
        ref={textRef}
        className="text-center font-bold text-7xl text-gray-900 md:text-6xl 2xl:text-8xl"
        style={fontSize ? { fontSize } : undefined}
      >
        Hey, {firstName}
      </h1>
    </div>
  );
}
