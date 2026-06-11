"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatisticsTab } from "@/components/details/StatisticsTab";
import { X, ListOrdered, BarChart3, Users } from "lucide-react";
import { RunsPerOverChart } from "@/components/details/RunsPerOverChart";
import { RunRateChart } from "@/components/details/RunRateChart";
import { OversTimeline } from "@/components/details/OversTimeline";
import { ScorecardTable } from "@/components/details/ScorecardTable";
import { transformScorecard } from "@/lib/transformScorecardData";
import type { Match } from "@/hooks/useCricketdata";

type InningsKey = "first" | "second";

export function MatchDetailModal({
  match,
  onClose,
}: {
  match: Match;
  onClose: () => void;
}) {
  const [innings, setInnings] = useState<InningsKey>("first");
  const [tab, setTab] = useState("scorecard");
  const [bottomTab, setBottomTab] = useState("scorecard");

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const data = transformScorecard(match.scorecard);

  const inningsData =
    innings === "first" ? data.firstInnings : data.secondInnings;
  const hasSecondInnings = data.secondInnings.batters.length > 0;

  // Header scores
  const firstScore = data.firstInnings.summary;
  const secondScore = hasSecondInnings
    ? data.secondInnings.summary
    : "Yet to bat";

  // Current innings badge
  const currentInningsNum = match.scorecard?.currentInningsNumber ?? 1;
  const activeInnings = match.scorecard?.innings?.[currentInningsNum - 1];
  const inningsBadge =
    match.status === "LIVE" && activeInnings
      ? `Simulated match - INN ${currentInningsNum} | ${activeInnings.overs}/${activeInnings.oversAvailable} OV`
      : match.status === "ENDED"
        ? "Match ended"
        : `${match.competition} · ${match.format}`;

  // Active batters and bowler from scorecard
  const activeBatters = (activeInnings?.batsmen || []).filter(
    (b: any) => b.active,
  );
  const activeBowler = (activeInnings?.bowlers || []).find(
    (b: any) => b.isActiveBowler,
  );

  // Innings stats from active innings
  const extras = activeInnings?.extrasSummary;
  const totalExtras = extras
    ? extras.byes +
      extras.legByes +
      extras.noBalls +
      extras.wides +
      extras.penalties
    : 0;
  const totalFours = (activeInnings?.batsmen || []).reduce(
    (s: number, b: any) => s + (b.fours || 0),
    0,
  );
  const totalSixes = (activeInnings?.batsmen || []).reduce(
    (s: number, b: any) => s + (b.sixes || 0),
    0,
  );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center rounded-none bg-black/50 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal panel */}
      <div className="relative flex h-[92dvh] w-full max-w-[650px] rounded-none flex-col overflow-hidden bg-white sm:rounded-2xl">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto">
          {/* Status bar */}
          <div className="flex items-center justify-center gap-2 bg-[color:var(--cricket-muted)] px-3 text-[11px] text-muted-foreground">
            <span className="text-neutral-800 font-[500] bg-gray-200 px-2">
              {inningsBadge}
            </span>
            <button
              onClick={onClose}
              className="absolute right-2 rounded p-1 hover:bg-black/5"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Header */}
          <header className="grid grid-cols-8 items-center gap-2 px-3 pt-1 pb-2">
            <div className="text-left col-span-2">
              <div className="text-[13px] font-semibold leading-tight">
                {match.teamA.name}
              </div>
              <div className="mt-1 text-[11px] text-neutral-800 font-medium">
                {match.teamA.rr !== "0.00" ? `${match.teamA.rr} CRR` : ""}
              </div>
            </div>

            <div className="text-center col-span-4">
              <div className="text-[17px] font-bold tracking-tight">
                {firstScore}
                {hasSecondInnings && (
                  <>
                    <span className="mx-1 text-neutral-800">·</span>
                    {secondScore}
                  </>
                )}
              </div>
              <div className="mt-1 text-[10.5px] leading-tight text-neutral-800">
                {match.result}
              </div>
            </div>

            <div className="text-right col-span-2">
              <div className="text-[13px] font-semibold leading-tight">
                {match.teamB.name}
              </div>
              <div className="mt-1 text-[11px] text-neutral-800 font-medium">
                {match.teamB.rr !== "0.00" ? `${match.teamB.rr} CRR` : ""}
              </div>
            </div>
          </header>

          {/* Chart + innings selector */}
          <section className="px-3">
            <div className="rounded-md border bg-card">
              <div className="grid grid-cols-[120px_1fr_28px] items-stretch">
                <div className="flex flex-col gap-2 border-r p-2">
                  <button
                    onClick={() => setInnings("first")}
                    className={`rounded-md px-2 py-2 text-[10px] font-normal leading-tight transition ${
                      innings === "first"
                        ? "bg-[#ff0000] text-white shadow-sm"
                        : "border bg-white  text-foreground"
                    }`}
                  >
                    {match.teamA.name} INNS
                  </button>
                  <button
                    onClick={() => setInnings("second")}
                    className={`rounded-md px-2 py-2 text-[10px] font-normal leading-tight transition ${
                      innings === "second"
                        ? "bg-[#ff0000] text-white shadow-sm"
                        : "border bg-white text-foreground"
                    }`}
                  >
                    {match.teamB.name} INNS
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tab === "statistics" ? "Runs per over" : "Run rate"}
                  </div>
                  <div className="h-[110px] w-full pt-4">
                    {tab === "statistics" ? (
                      <RunsPerOverChart data={inningsData.runsPerOver} />
                    ) : (
                      <RunRateChart data={inningsData.runRate} />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between border-l py-2">
                  <button
                    className={`rounded p-1 ${tab !== "statistics" ? "text-[color:var(--cricket-red)]" : "text-muted-foreground"}`}
                    onClick={() => setTab("scorecard")}
                    aria-label="Line chart"
                  >
                    <LineIcon />
                  </button>
                  <button
                    className={`rounded p-1 ${tab === "statistics" ? "text-[color:var(--cricket-red)]" : "text-muted-foreground"}`}
                    onClick={() => setTab("statistics")}
                    aria-label="Bar chart"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <Tabs value={bottomTab} onValueChange={setBottomTab} className="mt-2">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
              <TabTrigger
                value="scorecard"
                icon={<ListOrdered className="h-4 w-4" />}
                label="Scorecard"
                active={bottomTab === "scorecard"}
              />
              <TabTrigger
                value="statistics"
                icon={<BarChart3 className="h-4 w-4" />}
                label="Statistics"
                active={bottomTab === "statistics"}
              />
              <TabTrigger
                value="h2h"
                icon={<Users className="h-4 w-4" />}
                label="Head to head"
                active={bottomTab === "h2h"}
              />
            </TabsList>

            <div>
              {/* Recent overs */}
              <OversTimeline overs={data?.allOversTimeline} />

              {/* Active batters panel */}
              {/* <div className="relative overflow-hidden imageBanner text-[color:var(--cricket-pitch-foreground)]">
              <div className="relative grid grid-cols-[1.4fr_1fr_1fr] gap-2 px-3 py-6 text-[11px]">
                <div>
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-[10px] uppercase opacity-80">
                    <span>Batter</span>
                    <span>R</span>
                    <span>B</span>
                    <span>4S</span>
                    <span>6S</span>
                  </div>
                  {activeBatters.length > 0 ? (
                    activeBatters.map((b: any) => (
                      <div
                        key={b.batsmanName}
                        className="mt-1 grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2"
                      >
                        <span className="flex items-center gap-1 truncate font-medium">
                          {b.batsmanName}
                          {b.onStrike && <span className="text-[10px]">✎</span>}
                        </span>
                        <span className="tabular-nums">{b.runs}</span>
                        <span className="tabular-nums">{b.balls}</span>
                        <span className="tabular-nums">{b.fours}</span>
                        <span className="tabular-nums">{b.sixes}</span>
                      </div>
                    ))
                  ) : (
                    <div className="mt-1 text-[10px] opacity-60">
                      No active batters
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase opacity-80">
                    Current bowler
                  </div>
                  <div className="mt-1 font-semibold">
                    {activeBowler?.bowlerName || "—"}
                  </div>
                  {activeBowler && (
                    <div className="mt-0.5 text-[10px] opacity-70">
                      {activeBowler.overs}.{activeBowler.balls} ov ·{" "}
                      {activeBowler.runs}r · {activeBowler.wickets}w
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase opacity-80">
                    Innings stats
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Fours</span>
                    <span className="font-semibold">{totalFours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sixes</span>
                    <span className="font-semibold">{totalSixes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Extras</span>
                    <span className="font-semibold">{totalExtras}</span>
                  </div>
                </div>
              </div>
            </div> */}

              <div className="relative overflow-hidden imageBanner  bg-[color:var(--cricket-header)] py-5">
                {/* Pitch image background */}
                <div
                  className="absolute inset-0 bg-[url('/assets/cricketbg.jpg')] bg-cover bg-center opacity-80"
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="relative grid grid-cols-3 divide-x divide-white/10 px-1 py-3 text-white">
                  {/* ── Col 1: Batters ── */}
                  <div className="px-3">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_24px_24px_24px_24px] gap-x-1 text-[9px] font-semibold uppercase tracking-wider text-white/50">
                      <span>Batter</span>
                      <span className="text-center">R</span>
                      <span className="text-center">B</span>
                      <span className="text-center">4S</span>
                      <span className="text-center">6S</span>
                    </div>

                    {/* Rows */}
                    {activeBatters.length > 0 ? (
                      activeBatters.map((b: any) => (
                        <div
                          key={b.batsmanName}
                          className="mt-2 grid grid-cols-[1fr_24px_24px_24px_24px] items-center gap-x-1"
                        >
                          <span className="flex items-center gap-1 truncate text-[12px] font-semibold">
                            {b.batsmanName}
                            {b.onStrike && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--cricket-red)]" />
                            )}
                          </span>
                          <span className="text-center text-[13px] font-bold tabular-nums">
                            {b.runs}
                          </span>
                          <span className="text-center text-[11px] tabular-nums text-white/70">
                            {b.balls}
                          </span>
                          <span className="text-center text-[11px] tabular-nums text-white/70">
                            {b.fours}
                          </span>
                          <span className="text-center text-[11px] tabular-nums text-white/70">
                            {b.sixes}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="mt-2 text-[10px] text-white/40">
                        No active batters
                      </div>
                    )}
                  </div>

                  {/* ── Col 2: Current Bowler ── */}
                  <div className="flex flex-col justify-center px-4">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                      Current Bowler
                    </div>
                    {activeBowler ? (
                      <>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] font-bold">
                          {activeBowler.bowlerName}
                          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[8px] text-white/60">
                            ◎
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-white/60">
                          {activeBowler.overs}.{activeBowler.balls} ov ·{" "}
                          {activeBowler.runs}r · {activeBowler.wickets}w
                        </div>
                      </>
                    ) : (
                      <div className="mt-1.5 text-[12px] text-white/40">—</div>
                    )}
                  </div>

                  {/* ── Col 3: Innings Stats ── */}
                  <div className="flex flex-col justify-center px-4">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                      Innings Stats
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {[
                        { label: "Fours", value: totalFours },
                        { label: "Sixes", value: totalSixes },
                        { label: "Extras", value: totalExtras },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[11px] text-white/70">
                            {label}
                          </span>
                          <span className="text-[13px] font-bold tabular-nums">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="scorecard" className="mt-0">
              <ScorecardTable
                innings={innings}
                onChangeInnings={setInnings}
                firstBatters={data.firstInnings.batters}
                secondBatters={data.secondInnings.batters}
                firstBowlers={data.firstInnings.bowlers}
                secondBowlers={data.secondInnings.bowlers}
                firstExtras={data.firstInnings.extras}
                secondExtras={data.secondInnings.extras}
                firstFallOfWickets={data.firstInnings.fallOfWickets}
                secondFallOfWickets={data.secondInnings.fallOfWickets}
                firstSummary={data.firstInnings.summary}
                secondSummary={data.secondInnings.summary}
                firstTeamName={data.firstInnings.teamName}
                secondTeamName={data.secondInnings.teamName}
              />
            </TabsContent>
            <TabsContent value="statistics" className="mt-0">
              <StatisticsTab
                innings={innings}
                onChangeInnings={setInnings}
                firstOvers={data.firstInnings.overs}
                secondOvers={data.secondInnings.overs}
                firstSummary={data.firstInnings.summary}
                secondSummary={data.secondInnings.summary}
                firstTeamName={data.firstInnings.teamName || match.teamA.name}
                secondTeamName={data.secondInnings.teamName || match.teamB.name}
              />
            </TabsContent>

            <TabsContent value="h2h" className="mt-0">
              <div className="p-6 text-center text-sm text-muted-foreground">
                Head to head coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function TabTrigger({
  value,
  icon,
  label,
  active,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      className={`relative flex items-center justify-center gap-1.5 rounded-none border-0 bg-transparent py-2.5 text-[12px] font-medium shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
        active ? "text-[color:var(--cricket-red)]" : "text-foreground/80"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-[2px] bg-[color:var(--cricket-red)]" />
      )}
    </TabsTrigger>
  );
}

function LineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 17 8 11 12 14 21 5" />
      <polyline points="14 5 21 5 21 12" />
    </svg>
  );
}
