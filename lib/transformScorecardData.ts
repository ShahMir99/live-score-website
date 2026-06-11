// ── Ball Display Helper ───────────────────────────────────────────────────
const parseBallDisplay = (raw: string): string => {
  const s = raw.trim().toLowerCase();
  if (!s) return ".";
  if (s === "w") return "W";
  // wide with runs e.g. "1w", "2w"
  if (s.endsWith("w") && s !== "w") return "W";
  if (s === "4" || s === "4l" || s === "4b") return "4";
  if (s === "6") return "6";
  if (s === "0") return "0";
  // leg bye / bye with number e.g. "1l", "4b"
  if (/[a-z]/.test(s)) {
    const n = parseInt(s.replace(/\D/g, ""), 10);
    return isNaN(n) || n === 0 ? "." : String(n);
  }
  return raw.trim();
};

// ── Ball Kind Helper (for OverBall typed usage) ───────────────────────────
export type OverBall =
  | { kind: "wicket" }
  | { kind: "four" }
  | { kind: "six" }
  | { kind: "dot" }
  | { kind: "run"; value: number };

const parseBallKind = (raw: string): OverBall => {
  const s = raw.trim().toLowerCase();
  if (!s || s === "0") return { kind: "dot" };
  if (s === "w") return { kind: "wicket" };
  if (s.endsWith("w") && s !== "w") return { kind: "wicket" };
  if (s === "4" || s === "4l" || s === "4b") return { kind: "four" };
  if (s === "6") return { kind: "six" };
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return isNaN(n) || n === 0 ? { kind: "dot" } : { kind: "run", value: n };
};

// ── Batters ───────────────────────────────────────────────────────────────
export const transformBatters = (innings: any) => {
  if (!innings) return [];
  return (innings.batsmen || [])
    .filter((b: any) => !b.toCome)
    .map((b: any) => {
      const balls = b.balls || 0;
      return {
        name: b.batsmanName,
        note:
          b.description === "not out"
            ? "NOT OUT"
            : b.description
              ? `${b.description}${b.fielderName ? ` ${b.fielderName}` : ""} b ${b.bowlerName || ""}`
              : "Yet to bat",
        r: b.runs,
        b: balls,
        s4: b.fours,
        s6: b.sixes,
        sr: balls > 0 ? parseFloat(((b.runs / balls) * 100).toFixed(2)) : 0,
        out: b.description !== "not out" && !!b.description,
        active: b.active ?? false,
        onStrike: b.onStrike ?? false,
      };
    });
};

// ── Bowlers ───────────────────────────────────────────────────────────────
export const transformBowlers = (innings: any) => {
  if (!innings) return [];

  return (innings.bowlers || [])
    .filter(
      (b: any) => b.overs > 0 || b.balls > 0 || b.runs > 0 || b.wickets > 0,
    )
    .map((b: any) => ({
      name: b.bowlerName,
      overs: b.balls > 0 ? `${b.overs}.${b.balls}` : String(b.overs),
      maidens: b.maidens || 0,
      runs: b.runs || 0,
      wickets: b.wickets || 0,
      wides: b.wides || 0,
      noBalls: b.noBalls || 0,
      economy: b.overs > 0 ? Number((b.runs / b.overs).toFixed(2)) : 0,
      isActive: b.isActiveBowler ?? false,
    }));
};

// ── Runs Per Over ─────────────────────────────────────────────────────────
export const transformRunsPerOver = (scorecard: any, inningsNumber: number) => {
  const field = inningsNumber === 1 ? "firstInnings" : "secondInnings";
  return (scorecard?.wormAndManhattan || []).map((o: any) => {
    const parts = (o[field] || "0,0,0,0").split(",").map(Number);
    return {
      over: o.overNumber,
      runs: parts[0] || 0,
      wicket: parts[1] || 0,
    };
  });
};

// ── Run Rate ──────────────────────────────────────────────────────────────
export const transformRunRate = (scorecard: any, inningsNumber: number) => {
  const field = inningsNumber === 1 ? "firstInnings" : "secondInnings";
  let cumulativeRuns = 0;
  return (scorecard?.wormAndManhattan || []).map((o: any) => {
    const parts = (o[field] || "0,0,0,0").split(",").map(Number);
    cumulativeRuns += parts[0] || 0;
    return {
      over: o.overNumber,
      rate:
        o.overNumber > 0
          ? Number((cumulativeRuns / o.overNumber).toFixed(2))
          : 0,
      wicket: parts[1] || 0,
    };
  });
};

// ── Overs (typed OverBall[]) ──────────────────────────────────────────────
export const transformOvers = (
  scorecard: any,
  inningsNumber: number,
): { over: number; summary: string; balls: OverBall[] }[] => {
  const field = inningsNumber === 1 ? "firstInnings" : "secondInnings";

  // Build cumulative worm lookup
  const worm: Record<number, { cumRuns: number; cumWickets: number }> = {};
  (scorecard?.wormAndManhattan || []).forEach((o: any) => {
    const parts = (o[field] || "0,0,0,0").split(",").map(Number);
    worm[o.overNumber] = {
      cumRuns: parts[2] || 0,
      cumWickets: parts[3] || 0,
    };
  });

  return (scorecard?.ballByBallSummaries || []).map((o: any) => {
    const rawBalls = (o[field] || "").split(",").filter(Boolean);
    const balls = rawBalls.map(parseBallKind);

    const overRuns = rawBalls.reduce((sum: number, ball: string) => {
      const n = parseInt(ball.replace(/\D/g, ""), 10);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    const overWickets = rawBalls.filter(
      (b: string) =>
        b.toLowerCase() === "w" ||
        (b.toLowerCase().endsWith("w") && b.toLowerCase() !== "w"),
    ).length;

    const cumulative = worm[o.overNumber];
    const summary = cumulative
      ? `${cumulative.cumRuns}/${cumulative.cumWickets} (${overRuns} runs, ${overWickets} wkt)`
      : `${overRuns} runs`;

    return { over: o.overNumber, summary, balls };
  });
};

// ── Recent Overs (OversTimeline format) ───────────────────────────────────
// Returns all overs from ballByBallSummaries.
// Pass inningsNumber for a single innings, or omit for both with a break divider.
export type TimelineOver = {
  label: string;
  balls: string[];
  isBreak?: boolean;
  breakLabel?: string;
};

const buildTimelineOvers = (
  scorecard: any,
  field: "firstInnings" | "secondInnings",
): TimelineOver[] =>
  (scorecard?.ballByBallSummaries || []).map((o: any) => ({
    label: `OVER ${o.overNumber}`,
    balls: (o[field] || "").split(",").filter(Boolean).map(parseBallDisplay),
  }));

export const transformRecentOvers = (
  scorecard: any,
  inningsNumber?: number,
): TimelineOver[] => {
  if (inningsNumber === 1) {
    return buildTimelineOvers(scorecard, "firstInnings");
  }
  if (inningsNumber === 2) {
    return buildTimelineOvers(scorecard, "secondInnings");
  }
  // Both innings with innings-break divider
  return [
    ...buildTimelineOvers(scorecard, "firstInnings"),
    { label: "", balls: [], isBreak: true, breakLabel: "INNS\nBREAK" },
    ...buildTimelineOvers(scorecard, "secondInnings"),
  ];
};

// ── Main Transform ────────────────────────────────────────────────────────
export const transformScorecard = (scorecard: any) => {
  const innings = scorecard?.innings || [];

  const first = innings[0] || null;
  const second = innings[1] || null;

  return {
    firstInnings: {
      batters: transformBatters(first),

      // Bowlers who bowled in first innings
      bowlers: transformBowlers(first),

      runsPerOver: transformRunsPerOver(scorecard, 1),
      runRate: transformRunRate(scorecard, 1),
      overs: transformOvers(scorecard, 1),
      recentOvers: transformRecentOvers(scorecard, 1),

      summary: first
        ? `${first.runs}/${first.wickets} (${first.overs} ov)`
        : "",

      teamName: first?.teamName || "",

      extras: first?.extrasSummary || {
        byes: 0,
        legByes: 0,
        noBalls: 0,
        wides: 0,
        penalties: 0,
      },

      fallOfWickets: first?.fallOfwickets || "",

      totalRuns: first?.runs || 0,
      totalWickets: first?.wickets || 0,
      totalOvers: first?.overs || 0,
    },

    secondInnings: {
      batters: transformBatters(second),

      // Bowlers who bowled in second innings
      bowlers: transformBowlers(second),

      runsPerOver: transformRunsPerOver(scorecard, 2),
      runRate: transformRunRate(scorecard, 2),
      overs: transformOvers(scorecard, 2),
      recentOvers: transformRecentOvers(scorecard, 2),

      summary: second
        ? `${second.runs}/${second.wickets} (${second.overs} ov)`
        : "",

      teamName: second?.teamName || "",

      extras: second?.extrasSummary || {
        byes: 0,
        legByes: 0,
        noBalls: 0,
        wides: 0,
        penalties: 0,
      },

      fallOfWickets: second?.fallOfwickets || "",

      target: second?.target || 0,

      totalRuns: second?.runs || 0,
      totalWickets: second?.wickets || 0,
      totalOvers: second?.overs || 0,
    },

    allOversTimeline: transformRecentOvers(scorecard),

    commentary: scorecard?.matchCommentary || "",
  };
};
