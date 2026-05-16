"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertCircle,
  Loader,
} from "lucide-react";
import { MatchDetailDialog } from "@/components/MatchDetailDialog";
import { type Match, useCricketData } from "@/hooks/useCricketdata";

export default function Home() {
  const [selected, setSelected] = useState<Match | null>(null);
  const [open, setOpen] = useState(false);
  const { tournaments, loading, error } = useCricketData();

  console.log("tournaments", tournaments[0]);

  const handleOpen = (m: Match) => {
    setSelected(m);
    setOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-red-500/20 border-red-500/40 text-red-400";
      case "UPCOMING":
        return "bg-amber-500/20 border-amber-500/40 text-amber-400";
      case "ENDED":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
      default:
        return "bg-slate-500/20 border-slate-500/40 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-emerald-500/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-end gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
                CRICKET
                <br />
                LIVE
              </h1>
            </div>
          </div>
          <div className="ml-auto mb-0.5 text-emerald-400/60 text-sm font-medium tracking-widest">
            MATCH TRACKER
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Date Selector */}
        <div className="mb-12 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 rounded-lg p-4 backdrop-blur-sm">
          <button className="text-emerald-400 hover:text-emerald-300 transition p-2 rounded hover:bg-emerald-500/10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 text-center">
            <Zap
              className="w-5 h-5 text-amber-400 animate-bounce"
              style={{ animationDuration: "2s" }}
            />
            <div>
              <div className="text-sm text-emerald-400/60 uppercase tracking-widest font-medium">
                Current Date
              </div>
              <div className="text-2xl font-bold text-white">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <Zap
              className="w-5 h-5 text-amber-400 animate-bounce"
              style={{ animationDuration: "2s", animationDelay: "0.5s" }}
            />
          </div>
          <button className="text-emerald-400 hover:text-emerald-300 transition p-2 rounded hover:bg-emerald-500/10">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <Loader className="w-16 h-16 text-emerald-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-2">
                Loading Cricket Matches
              </p>
              <p className="text-sm text-slate-400">
                Fetching live data from SportRadar...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">
                Error Loading Matches
              </h3>
              <p className="text-sm text-red-400/80">{error}</p>
              <p className="text-xs text-red-400/60 mt-2">
                Please refresh the page to try again
              </p>
            </div>
          </div>
        )}

        {/* Tournaments List */}
        {/* Tournaments List */}
        {!loading && !error && tournaments.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            {tournaments.map((t) => (
              <div key={t.name} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />

                  <h2 className="text-xl font-bold text-white tracking-wide uppercase text-center">
                    {t.name}
                  </h2>

                  <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/20 to-transparent" />
                </div>

                <div className="grid gap-4">
                  {t.matches.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => handleOpen(m)}
                      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        animation: `slideUp 0.5s ease-out ${idx * 0.08}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <div className="relative cursor-pointer bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-emerald-500/10 group-hover:border-emerald-500/30 backdrop-blur-sm px-6 py-6 transition-all duration-300 rounded-xl">
                        {/* Status */}
                        <div className="flex justify-center mb-4">
                          <span
                            className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-full border ${getStatusColor(
                              m.status,
                            )}`}
                          >
                            {m.status === "LIVE" && "🔴 "}
                            {m.status}
                          </span>
                        </div>

                        {/* Match */}
                        <div className="grid grid-cols-3 gap-4 items-center">
                          {/* Team A */}
                          <div className="text-left">
                            <div className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                              {m.teamA.name}
                            </div>

                            <div className="space-y-1">
                              <div className="text-3xl font-bold text-emerald-400">
                                {m.teamA.score}
                                {m.teamA.wickets !== undefined &&
                                  `/${m.teamA.wickets}`}
                              </div>

                              <div className="text-xs text-slate-400 font-medium">
                                RR: {m.teamA.rr || "0.00"}{" "}
                                {m.teamA.overs !== undefined &&
                                  `| Ov ${m.teamA.overs}`}
                              </div>
                            </div>
                          </div>

                          {/* Center */}
                          <div className="flex flex-col items-center justify-center">
                            <div className="text-slate-500 text-sm mb-3">
                              VS
                            </div>

                            <div className="text-center">
                              <div className="text-xs font-semibold text-amber-400 leading-relaxed">
                                {m.result}
                              </div>

                              {m.toss && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {m.toss}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Team B */}
                          <div className="text-right">
                            <div className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                              {m.teamB.name}
                            </div>

                            <div className="space-y-1">
                              <div className="text-3xl font-bold text-emerald-400">
                                {m.teamB.score}
                                {m.teamB.wickets !== undefined &&
                                  `/${m.teamB.wickets}`}
                              </div>

                              <div className="text-xs text-slate-400 font-medium">
                                RR: {m.teamB.rr || "0.00"}{" "}
                                {m.teamB.overs !== undefined &&
                                  `| Ov ${m.teamB.overs}`}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match title from scorecard */}
                        {m.scorecard?.matchTitle && (
                          <div className="mt-4 text-center text-xs text-slate-500 border-t border-slate-800 pt-3">
                            {m.scorecard.matchTitle}
                          </div>
                        )}

                        {/* Hover line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tournaments.length === 0 && (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Matches Found
            </h3>
            <p className="text-slate-400">
              No cricket matches available at the moment
            </p>
          </div>
        )}
      </main>

      {/* Styles for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>

      <MatchDetailDialog match={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
