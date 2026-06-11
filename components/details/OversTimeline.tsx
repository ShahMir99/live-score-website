"use client";

import { useRef, useState } from "react";

type Over = {
  label: string;
  balls: string[];
  isBreak?: boolean;
  breakLabel?: string;
};

const BALL_COUNT = 6;

function BallCircle({ value }: { value: string }) {
  const isW = value === "W" || value === "w";
  const isBoundary = value === "4" || value === "6";
  const isEmpty = value === "." || value === "";

  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
        isW
          ? "bg-[color:var(--cricket-red)] text-white"
          : isBoundary
            ? "bg-white text-[color:var(--cricket-header)]"
            : isEmpty
              ? "bg-white/8 text-white/30"
              : "bg-white/15 text-white"
      }`}
    >
      {isEmpty ? "·" : value}
    </span>
  );
}

function InningsBreak({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center border-x border-white/10 bg-black/30 px-3">
      {label.split("\n").map((line, i) => (
        <span
          key={i}
          className="text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-white"
        >
          {line}
        </span>
      ))}
      <span className="mt-1 text-xs text-white">▶</span>
    </div>
  );
}

function OverBlock({ over, first }: { over: Over; first: boolean }) {
  const paddedBalls = [
    ...over.balls,
    ...Array(Math.max(0, BALL_COUNT - over.balls.length)).fill("."),
  ].slice(0, BALL_COUNT);

  return (
    <div
      className={`flex shrink-0 flex-col justify-center px-3 py-1.5 ${
        !first ? "border-l border-white/10" : ""
      }`}
    >
      <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
        {over.label}
      </div>
      <div className="flex gap-1">
        {paddedBalls.map((b, i) => (
          <BallCircle key={i} value={b} />
        ))}
      </div>
    </div>
  );
}

export function OversTimeline({ overs }: { overs: Over[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  if (!overs.length) return null;

  let overIndex = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    setGrabbing(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDrag = () => {
    isDragging.current = false;
    setGrabbing(false);
  };

  return (
    <div className="relative bg-[color:var(--cricket-header)]">
      {/* Left fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-6 bg-gradient-to-r from-[color:var(--cricket-header)] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-6 bg-gradient-to-l from-[color:var(--cricket-header)] to-transparent" />

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="flex h-14 items-stretch overflow-x-scroll select-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: grabbing ? "grabbing" : "grab",
        }}
      >
        {overs.map((over, idx) =>
          over.isBreak ? (
            <InningsBreak key={idx} label={over.breakLabel ?? "BREAK"} />
          ) : (
            <OverBlock key={idx} over={over} first={overIndex++ === 0} />
          ),
        )}
      </div>
    </div>
  );
}
