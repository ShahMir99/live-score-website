"use client";

type Batter = {
  name: string;
  note: string;
  r: number;
  b: number;
  s4: number;
  s6: number;
  sr: number;
  out: boolean;
};

type Bowler = {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
};

type Extras = {
  byes: number;
  legByes: number;
  noBalls: number;
  wides: number;
};

export function ScorecardTable({
  innings,
  onChangeInnings,
  firstBatters,
  secondBatters,
  firstBowlers,
  secondBowlers,
  firstExtras,
  secondExtras,
  firstFallOfWickets,
  secondFallOfWickets,
  firstSummary,
  secondSummary,
  firstTeamName,
  secondTeamName,
}: {
  innings: "first" | "second";
  onChangeInnings: (i: "first" | "second") => void;

  firstBatters: Batter[];
  secondBatters: Batter[];

  firstBowlers: Bowler[];
  secondBowlers: Bowler[];

  firstExtras: Extras;
  secondExtras: Extras;

  firstFallOfWickets: string;
  secondFallOfWickets: string;

  firstSummary: string;
  secondSummary: string;

  firstTeamName: string;
  secondTeamName: string;
}) {
  const batters =
    innings === "first" ? firstBatters : secondBatters;

  const bowlers =
    innings === "first" ? firstBowlers : secondBowlers;

  const extras =
    innings === "first" ? firstExtras : secondExtras;

  const fallOfWickets =
    innings === "first"
      ? firstFallOfWickets
      : secondFallOfWickets;

  const summary =
    innings === "first"
      ? firstSummary
      : secondSummary;

  const extrasTotal =
    extras.byes +
    extras.legByes +
    extras.noBalls +
    extras.wides;

  return (
    <div>
      {/* Header */}
      <div className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
        Scorecard
      </div>

      {/* Innings Tabs */}
      <div className="mt-2 grid grid-cols-2 border-y text-center text-[11px] font-medium">
        <button
          onClick={() => onChangeInnings("first")}
          className={`py-2 ${
            innings === "first"
              ? "border-b-2 border-[color:var(--cricket-red)] text-[color:var(--cricket-red)]"
              : "text-muted-foreground"
          }`}
        >
          {firstTeamName.toUpperCase()} 1ST INNS
        </button>

        <button
          onClick={() => onChangeInnings("second")}
          className={`py-2 ${
            innings === "second"
              ? "border-b-2 border-[color:var(--cricket-red)] text-[color:var(--cricket-red)]"
              : "text-muted-foreground"
          }`}
        >
          {secondTeamName.toUpperCase()} 1ST INNS
        </button>
      </div>

      {/* Batting Header */}
      <div className="grid grid-cols-[1.6fr_0.5fr_0.5fr_0.5fr_0.5fr_0.7fr] gap-2 border-b px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Batter</span>
        <span className="text-right">R</span>
        <span className="text-right">B</span>
        <span className="text-right">4S</span>
        <span className="text-right">6S</span>
        <span className="text-right">S/R</span>
      </div>

      {/* Batters */}
      <ul className="divide-y">
        {batters.map((b) => (
          <li
            key={b.name}
            className="grid grid-cols-[1.6fr_0.5fr_0.5fr_0.5fr_0.5fr_0.7fr] gap-2 px-3 py-2.5 text-[12px]"
          >
            <div className="min-w-0">
              <div className="truncate font-semibold">
                {b.name}
              </div>

              <div
                className={`truncate text-[10.5px] ${
                  b.out
                    ? "text-muted-foreground"
                    : "font-semibold text-[color:var(--cricket-red)]"
                }`}
              >
                {b.note}
              </div>
            </div>

            <span className="text-right font-semibold tabular-nums">
              {b.r}
            </span>

            <span className="text-right tabular-nums">
              {b.b}
            </span>

            <span className="text-right tabular-nums">
              {b.s4}
            </span>

            <span className="text-right tabular-nums">
              {b.s6}
            </span>

            <span className="text-right tabular-nums">
              {b.sr.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Extras */}
      <div className="border-t px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Extras</span>
          <span className="font-semibold">
            {extrasTotal}
          </span>
        </div>

        <div className="mt-1 text-[10px] text-muted-foreground">
          b: {extras.byes}, lb: {extras.legByes},
          nb: {extras.noBalls}, w: {extras.wides}
        </div>
      </div>

      {/* Total */}
      <div className="border-t px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-red-500">
            Total
          </span>

          <span className="font-semibold">
            {summary}
          </span>
        </div>
      </div>

      {/* Fall Of Wickets */}
      {!!fallOfWickets && (
        <div className="border-t px-3 py-2">
          <div className="font-semibold">
            Fall of wickets
          </div>

          <div className="mt-1 text-[11px] text-muted-foreground">
            {fallOfWickets}
          </div>
        </div>
      )}

      {/* Bowling Header */}
      <div className="mt-2 border-t">
        <div className="grid grid-cols-[1.8fr_.4fr_.4fr_.4fr_.4fr_.7fr] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Bowling</span>
          <span className="text-right">O</span>
          <span className="text-right">M</span>
          <span className="text-right">R</span>
          <span className="text-right">W</span>
          <span className="text-right">ECON</span>
        </div>

        {bowlers.map((b) => (
          <div
            key={b.name}
            className="grid grid-cols-[1.8fr_.4fr_.4fr_.4fr_.4fr_.7fr] gap-2 border-t px-3 py-2 text-[12px]"
          >
            <span className="font-medium">
              {b.name}
            </span>

            <span className="text-right">
              {b.overs}
            </span>

            <span className="text-right">
              {b.maidens}
            </span>

            <span className="text-right">
              {b.runs}
            </span>

            <span className="text-right font-semibold">
              {b.wickets}
            </span>

            <span className="text-right">
              {b.economy.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}