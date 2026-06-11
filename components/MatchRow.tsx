"use client"

type Match = {
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

export default function MatchRow({
  m,
}: {
  m: Match;
}) {


  return (
    <div className="bg-white border-b border-gray-200 px-4 pb-1">
      {(m.innings ||
        m.status === "ended" ||
        m.note) && (
        <div className="flex justify-center">
          {m.innings && (
            <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">
              {m.innings}
            </span>
          )}

          {m.status === "ended" &&
            !m.innings && (
              <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">
                ENDED
              </span>
            )}

          {m.status === "upcoming" &&
            m.time && (
              <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">
                {m.time}
              </span>
            )}
        </div>
      )}

      <div className="grid grid-cols-3 items-center text-sm">
        <div>
          <div className="font-semibold">
            {m.team1}
          </div>

          {m.crr1 && (
            <div className="text-[11px] text-gray-900 mt-0.5">
              {m.crr1}
            </div>
          )}
        </div>

        <div className="text-center">
          {m.score1 && (
            <div className="font-semibold">
              {m.score1}

              {m.score2 && (
                <span className="mx-1">:</span>
              )}

              {m.score2}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="font-semibold">
            {m.team2}
          </div>

          {m.crr2 && (
            <div className="text-[11px] text-gray-900 mt-0.5">
              {m.crr2}
            </div>
          )}
        </div>
      </div>

      {m.note && (
        <div className="text-center text-[11px] text-gray-900">
          {m.note}
        </div>
      )}
    </div>
  );
}