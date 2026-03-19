"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_MS = 60;
const STAGGER_MS = 80;
const TEMPLATE = "0,0000 zł";

function scramble(text: string): string {
  return text.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
}

function partialResolve(final: string, resolvedDigits: number): string {
  let idx = 0;
  return Array.from(final)
    .map((ch) =>
      /\d/.test(ch)
        ? idx++ < resolvedDigits
          ? ch
          : String(Math.floor(Math.random() * 10))
        : ch,
    )
    .join("");
}

export function RollingRate({ value }: { value: string | null }) {
  const [display, setDisplay] = useState(() => scramble(TEMPLATE));
  const arrivedRef = useRef(0);
  const settledRef = useRef(false);

  useEffect(() => {
    if (settledRef.current) {
      if (value) setDisplay(value);
      return;
    }

    if (value && !arrivedRef.current) {
      arrivedRef.current = performance.now();
    }

    const digitCount = (value ?? TEMPLATE).replace(/\D/g, "").length;

    const id = setInterval(() => {
      if (!value) {
        setDisplay(scramble(TEMPLATE));
        return;
      }

      const resolved = Math.min(
        Math.floor((performance.now() - arrivedRef.current) / STAGGER_MS) + 1,
        digitCount,
      );

      if (resolved >= digitCount) {
        settledRef.current = true;
        setDisplay(value);
        clearInterval(id);
        return;
      }

      setDisplay(partialResolve(value, resolved));
    }, SCRAMBLE_MS);

    return () => clearInterval(id);
  }, [value]);

  return <>{display}</>;
}
