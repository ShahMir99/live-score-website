import { useEffect, useState, useCallback } from "react";

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
  competition: string;
  format: string;
  scheduledStart: string;
  scorecard?: any;
  eventDetail?: any;
}

export interface Tournament {
  name: string;
  matches: Match[];
}

const BASE_URL = "https://lsc.fn.sportradar.com/common/en/Etc:UTC/cricket";

const getMatchStatus = (status: number): "LIVE" | "UPCOMING" | "ENDED" => {
  if (status === 1) return "LIVE";
  if (status === 0) return "UPCOMING";
  return "ENDED";
};

const extractTeamName = (categories: any[], type: "Team1" | "Team2") =>
  categories.find((c) => c.eventCategoryType === type)?.categoryValue ||
  "Unknown";

const getNumericId = (eventId: string) => eventId.split(":").pop()!;

const calcRR = (runs: number, overs: number) =>
  overs > 0 ? (runs / overs).toFixed(2) : "0.00";

// Compare event's startDate against the selected date (both in UTC)
const isMatchOnDate = (startDate: string, selectedDate: Date): boolean => {
  const matchDate = new Date(startDate);
  return (
    matchDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
    matchDate.getUTCMonth() === selectedDate.getUTCMonth() &&
    matchDate.getUTCDate() === selectedDate.getUTCDate()
  );
};

// Check if selectedDate is today (to decide whether to include LIVE matches)
const isToday = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
};

export const useCricketData = (selectedDate: Date) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCricketData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // ── STEP 1: fetch all events ───────────────────────────
      const eventsRes = await fetch(`${BASE_URL}/get_events/`);
      if (!eventsRes.ok) throw new Error("Failed to fetch events");

      const eventsData = await eventsRes.json();
      const allEvents: any[] = eventsData?.doc?.[0]?.data?.sportEvents || [];

      // ── STEP 2: filter by selected date ───────────────────
      // If selected date is today, also include any LIVE matches
      // (they may have started yesterday and are still running)
      const filteredEvents = allEvents.filter((e) => {
        const matchesDate = isMatchOnDate(e.startDate, selectedDate);
        const isLiveToday = isToday(selectedDate) && e.status === 1;
        return matchesDate || isLiveToday;
      });

      if (filteredEvents.length === 0) {
        setTournaments([]);
        setLoading(false);
        return;
      }

      // ── STEP 3: fetch get_event + get_scorecard for each ──
      const matches = await Promise.all(
        filteredEvents.map(async (event: any) => {
          const numericId = getNumericId(event.eventId);

          const [eventRes, scorecardRes] = await Promise.allSettled([
            fetch(`${BASE_URL}/get_event/${numericId}`),
            fetch(`${BASE_URL}/get_scorecard/${numericId}`),
          ]);

          let eventDetail: any = null;
          if (eventRes.status === "fulfilled" && eventRes.value.ok) {
            const json = await eventRes.value.json();
            eventDetail = json?.doc?.[0]?.data?.sportEvent || null;
          }

          let scorecard: any = null;
          if (scorecardRes.status === "fulfilled" && scorecardRes.value.ok) {
            const json = await scorecardRes.value.json();
            scorecard = json?.doc?.[0]?.data?.score || null;
          }

          const currentStatus = eventDetail?.status ?? event.status;
          const innings = scorecard?.innings || [];
          const firstInnings = innings[0] || null;
          const secondInnings = innings[1] || null;

          return {
            id: event.eventId,
            status: getMatchStatus(currentStatus),
            competition: event.competition || "Unknown",
            format: event.format || "Unknown",
            scheduledStart: event.startDate,
            result:
              scorecard?.matchCommentary ||
              eventDetail?.eventName ||
              "No result yet",
            teamA: {
              name: extractTeamName(event.categories, "Team1"),
              score: firstInnings?.runs ?? 0,
              wickets: firstInnings?.wickets ?? 0,
              overs: firstInnings?.overs ?? 0,
              rr: calcRR(firstInnings?.runs ?? 0, firstInnings?.overs ?? 0),
            },
            teamB: {
              name: extractTeamName(event.categories, "Team2"),
              score: secondInnings?.runs ?? 0,
              wickets: secondInnings?.wickets ?? 0,
              overs: secondInnings?.overs ?? 0,
              rr: calcRR(secondInnings?.runs ?? 0, secondInnings?.overs ?? 0),
            },
            scorecard,
            eventDetail,
          } as Match;
        }),
      );

      // Group by competition, sort LIVE → UPCOMING → ENDED
      const statusOrder = { LIVE: 0, UPCOMING: 1, ENDED: 2 };
      const tournamentMap = new Map<string, Match[]>();

      matches
        .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
        .forEach((match) => {
          const key = match.competition;
          if (!tournamentMap.has(key)) tournamentMap.set(key, []);
          tournamentMap.get(key)!.push(match);
        });

      setTournaments(
        Array.from(tournamentMap.entries()).map(([name, matches]) => ({
          name,
          matches,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCricketData();

    if (!isToday(selectedDate)) return;

    const interval = setInterval(fetchCricketData, 5000);
    return () => clearInterval(interval);
  }, [fetchCricketData, selectedDate]);

  return { tournaments, loading, error };
};
