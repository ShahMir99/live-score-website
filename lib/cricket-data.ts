export type Match = {
  id: string;
  status: "ENDED" | "LIVE" | "UPCOMING";
  teamA: { name: string; score: string; rr: string; ov?: string };
  teamB: { name: string; score: string; rr: string; ov?: string };
  result: string;
  toss?: string;
};

export type Tournament = {
  name: string;
  matches: Match[];
};

export const tournaments: Tournament[] = [
  {
    name: "Caribbean Premier League SRL",
    matches: [
      {
        id: "m1",
        status: "ENDED",
        teamA: { name: "Guyana Amazon Warriors SRL", score: "173/7", rr: "8.65 RR" },
        teamB: { name: "St Lucia Kings SRL", score: "170/7", rr: "8.50 RR" },
        result: "Guyana Amazon Warriors SRL have won by 3 runs",
        toss: "SLK",
      },
      {
        id: "m2",
        status: "ENDED",
        teamA: { name: "Trinbago Knight Riders SRL", score: "166/7", rr: "8.30 RR" },
        teamB: { name: "Antigua And Barbuda Falcons SRL", score: "163/4", rr: "8.15 RR" },
        result: "Trinbago Knight Riders SRL have won by 3 runs",
        toss: "TKR",
      },
      {
        id: "m3",
        status: "ENDED",
        teamA: { name: "St Kitts And Nevis Patriots SRL", score: "144/5", rr: "7.85 RR", ov: "18.2 OV" },
        teamB: { name: "Barbados Royals SRL", score: "143/7", rr: "7.15 RR" },
        result: "St Kitts And Nevis Patriots SRL have won by 5 wickets",
        toss: "SKANP",
      },
    ],
  },
  {
    name: "East African Safari T20 Challenge",
    matches: [
      {
        id: "m4",
        status: "ENDED",
        teamA: { name: "MT Meru", score: "122/6", rr: "8.13 RR", ov: "15 OV" },
        teamB: { name: "MT Karisimbi", score: "121/6", rr: "6.05 RR" },
        result: "MT Meru have won by 4 wickets",
      },
      {
        id: "m5",
        status: "ENDED",
        teamA: { name: "MT Satima", score: "107/9", rr: "5.35 RR" },
        teamB: { name: "MT Elgon", score: "110/2", rr: "9.30 RR", ov: "11.5 OV" },
        result: "MT Elgon have won by 8 wickets",
      },
    ],
  },
  {
    name: "T20 International SRL",
    matches: [
      {
        id: "m6",
        status: "ENDED",
        teamA: { name: "England SRL", score: "163/6", rr: "8.15 RR" },
        teamB: { name: "India SRL", score: "168/7", rr: "8.47 RR", ov: "19.5 OV" },
        result: "India SRL have won by 3 wickets",
        toss: "Ind",
      },
      {
        id: "m7",
        status: "ENDED",
        teamA: { name: "South Africa SRL", score: "141/9", rr: "7.05 RR" },
        teamB: { name: "Australia SRL", score: "206/3", rr: "10.30 RR" },
        result: "Australia SRL have won by 65 runs",
        toss: "SA",
      },
    ],
  },
];

// Rich detail used in popup (shared mock for all matches; real product would key per match)
export const runRateData = Array.from({ length: 20 }, (_, i) => {
  const over = i + 1;
  const base = 7 + Math.sin(i / 2) * 1.5 + (i > 14 ? 1 : 0);
  return {
    over,
    rr: Number(base.toFixed(2)),
    wicket: [5, 9, 11, 13, 15, 17, 20].includes(over),
  };
});

export const batters = [
  { name: "RG Sharma", out: "Bowled b CJ Jordan", r: 9, b: 13, s4: 2, s6: 0, sr: 69.23 },
  { name: "V Kohli", out: "Bowled b AU Rashid", r: 48, b: 28, s4: 7, s6: 2, sr: 171.43 },
  { name: "RR Pant", out: "c MM Ali b SM Curran", r: 22, b: 17, s4: 1, s6: 1, sr: 129.41 },
  { name: "SA Yadav", out: "Bowled b SM Curran", r: 6, b: 5, s4: 1, s6: 0, sr: 120.0 },
  { name: "S Dube", out: "c CJ Jordan b SM Curran", r: 3, b: 5, s4: 0, s6: 0, sr: 60.0 },
  { name: "RA Jadeja", out: "not out", r: 30, b: 26, s4: 1, s6: 1, sr: 115.38 },
  { name: "Kuldeep Yadav", out: "not out", r: 6, b: 1, s4: 1, s6: 0, sr: 600.0 },
];

export const overTimeline = [
  { over: 17, balls: ["1", "·", "·", "1", "·", "1"] },
  { over: 18, balls: ["4", "6", "·", "2", "·", "1"] },
  { over: 19, balls: ["1", "1", "1", "1", "1", "1"] },
  { over: 20, balls: ["6", "6", "4", "W", "·", "6"] },
];
