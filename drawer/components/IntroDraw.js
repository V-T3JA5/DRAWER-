'use client';

// Minimal, cool placeholder for the real hand-drawn "Drawer" signature
// trace described in the spec — that needs your actual logo path data
// to look like a genuine signature rather than a fabricated one. This
// draws an abstract flourish via stroke-dashoffset (a real line-trace
// technique, just not literal letterforms) once on load, then fades out
// and stays gone. Swap the <path> d attribute for a real traced
// signature path later; nothing else about the mechanism needs to
// change.

import { useEffect, useState } from 'react';

export default function IntroDraw() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="intro-draw-wrap" aria-hidden="true">
      <svg viewBox="0 0 200 32" width="160" height="26">
        <path className="intro-draw-line" d="M4 18 C 36 2, 64 34, 100 16 S 164 2, 196 18" />
      </svg>
    </div>
  );
}
