"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { OverBall } from "@/components/details/data";

type InningsOvers = {
  over: number;
  summary: string;
  balls: OverBall[];
}[];

export function StatisticsTab({
  onChangeInnings,
  firstOvers,
  secondOvers,
  firstSummary,
  secondSummary,
  firstTeamName,
  secondTeamName,
}: {
  innings: "first" | "second";
  onChangeInnings: (i: "first" | "second") => void;
  firstOvers: InningsOvers;
  secondOvers: InningsOvers;
  firstSummary: string;
  secondSummary: string;
  firstTeamName: string;
  secondTeamName: string;
}) {
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(true);

  return (
    <div>
      <div className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
        Statistics
      </div>

      <div className="mt-2 border-y">
        {/* First Innings */}
        <button
          onClick={() => {
            setFirstOpen((o) => !o);
            onChangeInnings("first");
          }}
          className="flex w-full items-center justify-between border-b px-3 py-2 text-left text-[12px] font-semibold"
        >
          <span>{firstTeamName} 1st INNS</span>

          <div className="flex items-center gap-2">
            <span className="font-bold">{firstSummary}</span>

            {firstOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {firstOpen && (
          <OversTable overs={firstOvers} />
        )}

        {/* Second Innings */}
        <button
          onClick={() => {
            setSecondOpen((o) => !o);
            onChangeInnings("second");
          }}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-semibold"
        >
          <span>{secondTeamName} 1st INNS</span>

          <div className="flex items-center gap-2">
            <span className="font-bold">{secondSummary}</span>

            {secondOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {secondOpen && (
          <OversTable overs={secondOvers} />
        )}
      </div>
    </div>
  );
}

function OversTable({ overs }: { overs: InningsOvers }) {
  return (
    <ul>
      {[...overs].reverse().map((o) => (
        <li
          key={o.over}
          className="grid grid-cols-[40px_200px_1fr] border-t"
        >
          {/* Over Number */}
          <div className="flex items-start justify-center py-3 text-[13px] font-medium text-muted-foreground">
            {o.over}
          </div>

          {/* Summary */}
          <div className="border-l px-3 py-3">
            <div className="text-[13px] font-semibold">
              {o.summary}
            </div>
          </div>

          {/* Balls */}
          <div className="border-l px-3 py-3">
            <div className="flex flex-wrap gap-1">
              {o.balls.map((ball, idx) => (
                <Ball key={idx} ball={ball} />
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Ball({ ball }: { ball: OverBall }) {
  if (ball.kind === "dot") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">
        •
      </span>
    );
  }

  if (ball.kind === "wicket") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
        W
      </span>
    );
  }

  if (ball.kind === "four") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[9px] font-bold text-white">
        4
      </span>
    );
  }

  if (ball.kind === "six") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 text-[9px] font-bold text-white">
        6
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-700">
        {ball.value}
      </span>

      {"label" in ball && ball.label && (
        <span className="mt-0.5 text-[8px] text-gray-500">
          {ball.label}
        </span>
      )}
    </div>
  );
}