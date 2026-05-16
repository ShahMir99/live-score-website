import { useEffect, useState } from "react";

export interface Team {
  name: string;
  score: number;
  wickets?: number;
  overs?: number;
  rr?: string;
}

export interface Match {
  id: string;
  status: "LIVE" | "UPCOMING" | "ENDED";
  teamA: Team;
  teamB: Team;
  result: string;
  toss?: string;
  competition: string;
  format: string;
  scheduledStart: string;

  // full raw scorecard response
  scorecard?: any;
}

export interface Tournament {
  name: string;
  matches: Match[];
}

const BASE_URL =
  "https://lsc.fn.sportradar.com/common/en/Etc:UTC/cricket";

const getMatchStatus = (
  status: number
): "LIVE" | "UPCOMING" | "ENDED" => {
  if (status === 0) return "UPCOMING";
  if (status === 3) return "LIVE";
  return "ENDED";
};

const extractTeamName = (
  categories: any[],
  type: "Team1" | "Team2"
) => {
  return (
    categories.find(
      (c) => c.eventCategoryType === type
    )?.categoryValue || "Unknown"
  );
};

const getMatchId = (eventId: string) => {
  return eventId.split(":").pop();
};

export const useCricketData = () => {
  const [tournaments, setTournaments] =
    useState<Tournament[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchCricketData = async () => {
      try {
        setError(null);

        // Get all matches
        const eventsRes = await fetch(
          `${BASE_URL}/get_events/`
        );

        if (!eventsRes.ok) {
          throw new Error(
            "Failed to fetch matches"
          );
        }

        const eventsData =
          await eventsRes.json();

        const sportEvents =
          eventsData?.doc?.[0]?.data
            ?.sportEvents || [];

        // Fetch scorecard for every match
        const matches = await Promise.all(
          sportEvents.map(async (event: any) => {
            const numericId =
              getMatchId(event.eventId);

            let scorecard = null;

            try {
              const scoreRes = await fetch(
                `${BASE_URL}/get_scorecard/${numericId}`
              );

              const scoreJson =
                await scoreRes.json();

              // entire response
              scorecard =
                scoreJson?.doc?.[0]?.data
                  ?.score || null;
            } catch (err) {
              console.error(
                `Scorecard failed for ${numericId}`,
                err
              );
            }

            const innings =
              scorecard?.innings || [];

            const firstInnings =
              innings[0];

            const secondInnings =
              innings[1];

            return {
              id: event.eventId,

              status: getMatchStatus(
                event.status
              ),

              competition:
                event.competition ||
                "Unknown",

              format:
                event.format || "T20",

              scheduledStart:
                event.scheduledStart,

              result:
                scorecard
                  ?.matchCommentary ||
                "No Result",

              toss:
                scorecard?.matchCommentary?.match(
                  /\(Toss:.*?\)/
                )?.[0],

              teamA: {
                name: extractTeamName(
                  event.categories,
                  "Team1"
                ),

                score:
                  firstInnings?.runs ??
                  0,

                wickets:
                  firstInnings?.wickets ??
                  0,

                overs:
                  firstInnings?.overs ??
                  0,

                rr:
                  firstInnings?.overs
                    ? (
                        firstInnings.runs /
                        firstInnings.overs
                      ).toFixed(2)
                    : "0.00",
              },

              teamB: {
                name: extractTeamName(
                  event.categories,
                  "Team2"
                ),

                score:
                  secondInnings?.runs ??
                  0,

                wickets:
                  secondInnings?.wickets ??
                  0,

                overs:
                  secondInnings?.overs ??
                  0,

                rr:
                  secondInnings?.overs
                    ? (
                        secondInnings.runs /
                        secondInnings.overs
                      ).toFixed(2)
                    : "0.00",
              },

              // save ENTIRE response
              scorecard,
            };
          })
        );

        // Group by tournament
        const tournamentMap =
          new Map<string, Match[]>();

        matches.forEach((match) => {
          if (
            !tournamentMap.has(
              match.competition
            )
          ) {
            tournamentMap.set(
              match.competition,
              []
            );
          }

          tournamentMap
            .get(match.competition)!
            .push(match);
        });

        const grouped =
          Array.from(
            tournamentMap.entries()
          ).map(([name, matches]) => ({
            name,
            matches,
          }));

        setTournaments(grouped);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCricketData();

    const interval =
      setInterval(
        fetchCricketData,
        30000
      );

    return () =>
      clearInterval(interval);
  }, []);

  return {
    tournaments,
    loading,
    error,
  };
};