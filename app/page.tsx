"use client";

import MatchRow from "@/components/MatchRow";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { useCricketData, Match as ApiMatch } from "@/hooks/useCricketdata";
import { MatchDetailModal } from "@/components/MatchDetailModal";

type MatchRowProps = {
  team1: string;
  team2: string;
  status: "live" | "ended" | "upcoming" | "innings";
  time?: string;
  innings?: string;
  score1?: string;
  score2?: string;
  crr1?: string;
  crr2?: string;
  note?: string;
};

const toMatchRow = (m: ApiMatch): MatchRowProps => {
  const hasFirstInnings = m.teamA.score > 0 || m.teamA.wickets !== undefined;
  const hasSecondInnings = m.teamB.score > 0;

  const formatScore = (runs: number, wickets?: number, overs?: number) => {
    if (!runs && !wickets) return undefined;
    const w = wickets !== undefined ? `/${wickets}` : "";
    const o = overs ? ` (${overs})` : "";
    return `${runs}${w}${o}`;
  };

  const getInningsBadge = (): string | undefined => {
    if (m.status !== "LIVE") return undefined;
    const inningsData = m.scorecard?.innings;
    if (!inningsData?.length) return undefined;
    const current = inningsData[m.scorecard.currentInningsNumber - 1];
    if (!current) return undefined;
    return `INN ${m.scorecard.currentInningsNumber} | ${current.overs}/${current.oversAvailable} OV`;
  };

  const getTime = (): string | undefined => {
    if (m.status !== "UPCOMING") return undefined;
    return new Date(m.scheduledStart).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const status: MatchRowProps["status"] =
    m.status === "LIVE"
      ? getInningsBadge()
        ? "innings"
        : "live"
      : m.status === "UPCOMING"
        ? "upcoming"
        : "ended";

  return {
    team1: m.teamA.name,
    team2: m.teamB.name,
    status,
    time: getTime(),
    innings: getInningsBadge(),
    score1: hasFirstInnings
      ? formatScore(m.teamA.score, m.teamA.wickets, m.teamA.overs)
      : undefined,
    score2: hasSecondInnings
      ? formatScore(m.teamB.score, m.teamB.wickets, m.teamB.overs)
      : undefined,
    crr1:
      m.status === "LIVE" && m.teamA.rr !== "0.00"
        ? `${m.teamA.rr} CRR`
        : undefined,
    crr2:
      m.status === "LIVE" && m.teamB.rr !== "0.00"
        ? `${m.teamB.rr} CRR`
        : undefined,
    note: m.result !== "No result yet" ? m.result : undefined,
  };
};

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { tournaments, loading, error } = useCricketData(selectedDate);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setUTCDate(d.getUTCDate() + days);
    setSelectedDate(new Date(d));
  };

  const selectedMatch =
    tournaments
      .flatMap((t) => t.matches)
      .find((m) => m.id === selectedMatchId) || null;

  const formattedDate = selectedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <h1 className="text-2xl px-6 py-4">CRICKET LIVE MATCH TRACKER</h1>
      </header>

      <main className="max-w-3xl mx-auto py-6 px-4">
        {/* Date filter bar */}
        <div className="bg-[#ff0000] text-white flex items-center justify-center gap-4 py-3 rounded-t">
          <button onClick={() => changeDate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </button>

          <label className="flex items-center gap-2 cursor-pointer">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
            <input
              type="date"
              className="hidden"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) =>
                // Parse as UTC midnight to avoid timezone shifting the date
                setSelectedDate(new Date(e.target.value + "T00:00:00Z"))
              }
            />
          </label>

          <button onClick={() => changeDate(1)}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-white border-b border-gray-200 px-4 py-8 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tournaments.length === 0 && (
          <div className="bg-white border-b border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            No matches scheduled for this date.
          </div>
        )}

        {/* Match list grouped by tournament */}
        {!error &&
          tournaments.map((t) => (
            <div key={t.name}>
              <div className="bg-[#ff0000] text-white text-sm font-semibold px-4 py-2 border-t border-red-700">
                {t.name}
              </div>

              {t.matches.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left"
                  onClick={() => setSelectedMatchId(m.id)}
                >
                  <MatchRow m={toMatchRow(m)} />
                </button>
              ))}
            </div>
          ))}
      </main>

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </div>
  );
}
