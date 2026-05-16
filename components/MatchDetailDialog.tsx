"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";
import { BarChart3, ClipboardList, Users } from "lucide-react";
import type { Match } from "@/hooks/useCricketdata";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Batsman {
  batsmanName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  description: string;
  active: boolean;
  onStrike: boolean;
  didNotBat: boolean;
  bowlerName: string;
  fielderName: string;
  playerId: string;
}

interface Bowler {
  bowlerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  wides: number;
  noBalls: number;
  dotBalls: number;
  isActiveBowler: boolean;
  playerId: string;
}

interface ExtrasSummary {
  byes: number;
  noBalls: number;
  legByes: number;
  wides: number;
  penalties: number;
}

interface Innings {
  teamName: string;
  conclusion: string;
  summary: string;
  runs: number;
  wickets: number;
  overs: number;
  target: number;
  fallOfwickets: string;
  extrasSummary: ExtrasSummary;
  batsmen: Batsman[];
  bowlers: Bowler[];
  inningsNumber: number;
}


type Props = {
  match: Match | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strikeRate(runs: number, balls: number): string {
  if (!balls) return "-";
  return ((runs / balls) * 100).toFixed(2);
}

function economy(runs: number, overs: number): string {
  if (!overs) return "-";
  return (runs / overs).toFixed(2);
}

function parseBalls(raw: string): string[] {
  return raw ? raw.split(",").filter(Boolean) : [];
}

function ballColor(b: string): string {
  const lower = b.toLowerCase();
  if (lower === "w" || lower.endsWith("w")) return "bg-red-500 text-white";
  if (b === "6") return "bg-emerald-500 text-white";
  if (b === "4") return "bg-blue-500 text-white";
  if (b === "0") return "bg-gray-200 text-gray-500";
  return "bg-gray-100 text-gray-800";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MatchDetailDialog({ match, open, onOpenChange }: Props) {
  const [innings, setInnings] = useState<0 | 1>(1);
  const [scorecardTab, setScorecardTab] = useState<"batting" | "bowling">("batting");

  // ── All hooks must be before any return ───────────────────────────────────

  const inningsData: Innings | undefined = match?.scorecard?.innings?.[innings];

  const batsmen = useMemo(
    () => inningsData?.batsmen?.filter((b) => !b.didNotBat) ?? [],
    [inningsData]
  );

  const bowlers = useMemo(
    () => inningsData?.bowlers?.filter((b) => b.overs > 0) ?? [],
    [inningsData]
  );

  const extras = inningsData?.extrasSummary;
  const totalExtras =
    (extras?.byes ?? 0) +
    (extras?.legByes ?? 0) +
    (extras?.wides ?? 0) +
    (extras?.noBalls ?? 0) +
    (extras?.penalties ?? 0);

  const teamAName = match?.teamA?.name ?? "Team A";
  const teamBName = match?.teamB?.name ?? "Team B";

  // Worm (cumulative runs per over, both innings)
  const wormChartData = useMemo(() => {
    return (match?.scorecard?.wormAndManhattan ?? []).map((entry : any) => {
      const partsA = entry.firstInnings.split(",").map(Number);
      const partsB = entry.secondInnings.split(",").map(Number);
      return {
        over: entry.overNumber,
        [teamAName]: isNaN(partsA[2]) ? 0 : partsA[2],
        [teamBName]: isNaN(partsB[2]) ? 0 : partsB[2],
      };
    });
  }, [match, teamAName, teamBName]);

  // Manhattan (runs scored each over)
  const manhattanData = useMemo(() => {
    return (match?.scorecard?.wormAndManhattan ?? []).map((entry: any) => {
      const runsA = Number(entry.firstInnings.split(",")[0]);
      const runsB = Number(entry.secondInnings.split(",")[0]);
      return {
        over: entry.overNumber,
        [teamAName]: isNaN(runsA) ? 0 : runsA,
        [teamBName]: isNaN(runsB) ? 0 : runsB,
      };
    });
  }, [match, teamAName, teamBName]);

  // Ball by ball for selected innings
  const ballByBall = useMemo(() => {
    const key = innings === 0 ? "firstInnings" : "secondInnings";
    return (match?.scorecard?.ballByBallSummaries ?? [])
      .filter((e: any) => !!(e as any)[key])
      .map((e: any) => ({
        over: e.overNumber,
        balls: parseBalls((e as any)[key] as string),
      }));
  }, [match, innings]);

  const recentOvers = match?.scorecard?.recentOvers ?? [];

  // ── Guard after all hooks ──────────────────────────────────────────────────
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Match details</DialogTitle>

      <DialogContent className="min-w-5xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* ── HEADER ── */}
        <div className="bg-black text-white px-4 py-3">
          <div className="text-[10px] opacity-60 text-center tracking-wider uppercase">
            {match.competition} • {match.format} • {match.status}
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="flex-1">
              <div className="font-bold text-sm">{teamAName}</div>
              <div className="text-xl font-extrabold">
                {match.teamA.score}/{match.teamA.wickets}
              </div>
              <div className="text-xs opacity-60">
                {match.teamA.overs} ov &nbsp;•&nbsp; RR {match.teamA.rr}
              </div>
            </div>

            <div className="text-center px-4 opacity-50 font-bold text-sm">VS</div>

            <div className="flex-1 text-right">
              <div className="font-bold text-sm">{teamBName}</div>
              <div className="text-xl font-extrabold">
                {match.teamB.score}/{match.teamB.wickets}
              </div>
              <div className="text-xs opacity-60">
                {match.teamB.overs} ov &nbsp;•&nbsp; RR {match.teamB.rr}
              </div>
            </div>
          </div>

          {match.result && (
            <div className="mt-2 text-center text-xs bg-white/10 rounded py-1 px-3">
              {match.result}
            </div>
          )}
        </div>

        {/* ── INNINGS SELECTOR ── */}
        <div className="flex border-b bg-white">
          {[0, 1].map((idx) => {
            const label = idx === 0
              ? `${teamAName} (1st Innings)`
              : `${teamBName} (2nd Innings)`;
            return (
              <button
                key={idx}
                onClick={() => setInnings(idx as 0 | 1)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  innings === idx
                    ? "border-b-2 border-black text-black"
                    : "text-gray-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── INNINGS SUMMARY BAR ── */}
        {inningsData && (
          <div className="flex justify-between items-center bg-gray-50 px-4 py-2 border-b text-xs gap-2">
            <span className="font-bold text-base">{inningsData.summary}</span>
            <span className="text-gray-500">{inningsData.overs} overs</span>
            {inningsData.target > 0 && (
              <span className="text-gray-500">Target: {inningsData.target + 1}</span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                inningsData.conclusion === "In Progress"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {inningsData.conclusion}
            </span>
          </div>
        )}

        {/* ── WORM CHART ── */}
        <div className="p-3 border-b">
          <div className="text-xs font-bold mb-2 tracking-wider">
            WORM — CUMULATIVE RUNS
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wormChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="over" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} width={28} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, padding: "4px 8px" }}
                  labelFormatter={(l) => `Over ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey={teamAName}
                  stroke="#3b82f6"
                  fill="rgba(59,130,246,0.12)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey={teamBName}
                  stroke="#ef4444"
                  fill="rgba(239,68,68,0.12)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── MANHATTAN CHART ── */}
        <div className="p-3 border-b">
          <div className="text-xs font-bold mb-2 tracking-wider">
            MANHATTAN — RUNS PER OVER
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={manhattanData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="over" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} width={24} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  labelFormatter={(l) => `Over ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey={teamAName} fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey={teamBName} fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── RECENT OVERS ── */}
        {recentOvers.length > 0 && (
          <div className="p-3 border-b">
            <div className="text-xs font-bold mb-2 tracking-wider">RECENT OVERS</div>
            <div className="flex flex-col gap-2">
              {recentOvers.map((o: any) => (
                <div key={o.overNumber} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-16 shrink-0">
                    Over {o.overNumber}
                    {o.isCurrentOver ? " ★" : ""}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {o.balls
                      .filter((b: any) => b !== "")
                      .map((b: any, i: number) => (
                        <span
                          key={i}
                          className={`w-6 h-6 text-[10px] flex items-center justify-center rounded-full font-bold ${ballColor(b)}`}
                        >
                          {b}
                        </span>
                      ))}
                  </div>
                  <span className="ml-auto text-xs font-semibold text-gray-600 shrink-0">
                    {o.runs} runs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BALL BY BALL ── */}
        <div className="p-3 border-b">
          <div className="text-xs font-bold mb-2 tracking-wider">BALL BY BALL</div>
          {ballByBall.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {ballByBall.map((o: any) => (
                <div key={o.over}>
                  <div className="text-[10px] text-gray-400 mb-1 font-medium">
                    Over {o.over}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {o.balls.map((b: any, i: number) => (
                      <span
                        key={i}
                        className={`w-6 h-6 text-[10px] flex items-center justify-center rounded-full font-bold ${ballColor(b)}`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No ball data available</div>
          )}
        </div>

        {/* ── SCORECARD ── */}
        <div className="p-3">
          <div className="text-xs font-bold mb-3 tracking-wider">SCORECARD</div>

          {/* Batting / Bowling toggle */}
          <div className="flex gap-2 mb-3">
            {(["batting", "bowling"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setScorecardTab(tab)}
                className={`px-3 py-1 text-xs rounded-full font-semibold capitalize transition-colors ${
                  scorecardTab === tab
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── BATTING TABLE ── */}
          {scorecardTab === "batting" && (
            <>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b text-gray-500">
                    <th className="pb-1 font-medium">BATTER</th>
                    <th className="text-center font-medium">R</th>
                    <th className="text-center font-medium">B</th>
                    <th className="text-center font-medium">4s</th>
                    <th className="text-center font-medium">6s</th>
                    <th className="text-right font-medium">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {batsmen.length > 0 ? (
                    batsmen.map((b, i) => (
                      <tr
                        key={i}
                        className={`border-b ${b.active ? "bg-green-50" : ""}`}
                      >
                        <td className="py-2 pr-1">
                          <div className="font-semibold flex items-center gap-1">
                            {b.batsmanName}
                            {b.onStrike && (
                              <span className="text-[8px] bg-green-500 text-white px-1 rounded-full">
                                *
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {b.description === "not out"
                              ? "not out"
                              : `${b.description}${b.fielderName ? ` c ${b.fielderName}` : ""} b ${b.bowlerName}`}
                          </div>
                        </td>
                        <td className="text-center font-bold">{b.runs}</td>
                        <td className="text-center text-gray-500">{b.balls}</td>
                        <td className="text-center text-blue-600">{b.fours}</td>
                        <td className="text-center text-emerald-600">{b.sixes}</td>
                        <td className="text-right">{strikeRate(b.runs, b.balls)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-3 text-gray-400 text-center">
                        No batting data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Extras + Total */}
              {extras && (
                <div className="mt-2 text-xs text-gray-600 border-t pt-2 flex justify-between flex-wrap gap-1">
                  <span>
                    Extras: {totalExtras}{" "}
                    <span className="text-gray-400">
                      (b {extras.byes}, lb {extras.legByes}, w {extras.wides}, nb {extras.noBalls})
                    </span>
                  </span>
                  <span className="font-bold">
                    Total: {inningsData?.runs}/{inningsData?.wickets}{" "}
                    ({inningsData?.overs} ov)
                  </span>
                </div>
              )}

              {/* Fall of Wickets */}
              {inningsData?.fallOfwickets && (
                <div className="mt-2 text-[10px] text-gray-500 border-t pt-2 leading-relaxed">
                  <span className="font-bold text-gray-700">FOW: </span>
                  {inningsData.fallOfwickets}
                </div>
              )}
            </>
          )}

          {/* ── BOWLING TABLE ── */}
          {scorecardTab === "bowling" && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-1 font-medium">BOWLER</th>
                  <th className="text-center font-medium">O</th>
                  <th className="text-center font-medium">M</th>
                  <th className="text-center font-medium">R</th>
                  <th className="text-center font-medium">W</th>
                  <th className="text-right font-medium">ECON</th>
                </tr>
              </thead>
              <tbody>
                {bowlers.length > 0 ? (
                  bowlers.map((b, i) => (
                    <tr
                      key={i}
                      className={`border-b ${b.isActiveBowler ? "bg-yellow-50" : ""}`}
                    >
                      <td className="py-2">
                        <div className="font-semibold flex items-center gap-1">
                          {b.bowlerName}
                          {b.isActiveBowler && (
                            <span className="text-[8px] bg-yellow-400 text-black px-1 rounded-full">
                              bowling
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {b.dotBalls} dot{b.dotBalls !== 1 ? "s" : ""}{" "}
                          • {b.wides} wd • {b.noBalls} nb
                        </div>
                      </td>
                      <td className="text-center">{b.overs}</td>
                      <td className="text-center">{b.maidens}</td>
                      <td className="text-center">{b.runs}</td>
                      <td className="text-center font-bold text-red-600">{b.wickets}</td>
                      <td className="text-right">{economy(b.runs, b.overs)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-3 text-gray-400 text-center">
                      No bowling data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── BOTTOM TABS ── */}
        <Tabs defaultValue="summary" className="w-full border-t">
          <TabsList className="w-full justify-around rounded-none">
            <TabsTrigger value="summary" className="gap-1">
              <ClipboardList className="w-4 h-4" /> Summary
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1">
              <BarChart3 className="w-4 h-4" /> Stats
            </TabsTrigger>
            <TabsTrigger value="h2h" className="gap-1">
              <Users className="w-4 h-4" /> H2H
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="p-4 text-xs space-y-1">
            <div className="flex justify-between font-semibold text-gray-700">
              <span>{teamAName}</span>
              <span>
                {match.scorecard.innings[0]?.summary} ({match.scorecard.innings[0]?.overs} ov)
              </span>
            </div>
            <div className="flex justify-between font-semibold text-gray-700">
              <span>{teamBName}</span>
              <span>
                {match.scorecard.innings[1]?.summary} ({match.scorecard.innings[1]?.overs} ov)
              </span>
            </div>
            <div className="pt-1 text-gray-500 italic">{match.result}</div>
          </TabsContent>

          <TabsContent value="stats" className="p-4 text-xs space-y-1">
            {[0, 1].map((idx) => {
              const inn = match.scorecard.innings[idx];
              if (!inn) return null;
              const fours = inn.batsmen.reduce((s: any, b: any) => s + b.fours, 0);
              const sixes = inn.batsmen.reduce((s: any, b: any) => s + b.sixes, 0);
              return (
                <div key={idx} className="mb-2">
                  <div className="font-bold text-gray-700 mb-1">{inn.teamName}</div>
                  <div className="flex justify-between text-gray-600">
                    <span>Fours</span><span>{fours}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Sixes</span><span>{sixes}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Extras</span>
                    <span>
                      {(inn.extrasSummary.byes ?? 0) +
                        (inn.extrasSummary.legByes ?? 0) +
                        (inn.extrasSummary.wides ?? 0) +
                        (inn.extrasSummary.noBalls ?? 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="h2h" className="p-4 text-xs text-gray-500">
            Head-to-head data not available in API.
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}