// export type OverBall =
//   | { kind: "run"; value: number }
//   | { kind: "four" }
//   | { kind: "six" }
//   | { kind: "wicket" }
//   | { kind: "dot" };

export type OverBall =
  | { kind: "wicket"; label?: string }
  | { kind: "four"; label?: string }
  | { kind: "six"; label?: string }
  | { kind: "dot"; label?: string }
  | { kind: "run"; value: number; label?: string };

export const dsgRunRate = [
  0, 6.5, 7.2, 6.8, 7.4, 7.6, 7.2, 7.0, 7.4, 7.8, 7.7, 7.6, 7.5, 7.6, 7.55, 7.5, 7.6, 7.55, 7.55, 7.55,
].map((v, i) => ({ over: i + 1, rate: v }));

export const secRunRate = [
  { over: 1, rate: 6 },
  { over: 2, rate: 8.5 },
  { over: 3, rate: 8 },
  { over: 4, rate: 8 },
  { over: 5, rate: 7.8 },
  { over: 6, rate: 6.67 },
];

export const dsgRunsPerOver = Array.from({ length: 20 }, (_, i) => ({
  over: i + 1,
  runs: [8, 9, 6, 7, 12, 10, 7, 5, 9, 11, 6, 8, 9, 7, 6, 10, 8, 7, 9, 7][i],
  wicket: [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0][i],
}));

export const secRunsPerOver = [
  { over: 1, runs: 6, wicket: 0 },
  { over: 2, runs: 11, wicket: 0 },
  { over: 3, runs: 7, wicket: 0 },
  { over: 4, runs: 8, wicket: 0 },
  { over: 5, runs: 7, wicket: 3 },
  { over: 6, runs: 1, wicket: 1 },
];

export const secOvers: { over: number; summary: string; balls: OverBall[] }[] = [
  { over: 1, summary: "6/0 (6 runs, 0 wkt)", balls: [
    { kind: "run", value: 1 }, { kind: "run", value: 1 }, { kind: "dot" }, { kind: "dot" }, { kind: "four" }, { kind: "dot" },
  ]},
  { over: 2, summary: "17/0 (11 runs, 0 wkt)", balls: [
    { kind: "run", value: 3 }, { kind: "dot" }, { kind: "six" }, { kind: "run", value: 1 }, { kind: "run", value: 1 }, { kind: "dot" },
  ]},
  { over: 3, summary: "24/0 (7 runs, 0 wkt)", balls: [
    { kind: "dot" }, { kind: "dot" }, { kind: "run", value: 1 }, { kind: "run", value: 2 }, { kind: "dot" }, { kind: "four" },
  ]},
  { over: 4, summary: "32/0 (8 runs, 0 wkt)", balls: [
    { kind: "dot" }, { kind: "run", value: 2 }, { kind: "dot" }, { kind: "run", value: 2 }, { kind: "dot" }, { kind: "four" },
  ]},
  { over: 5, summary: "39/3 (7 runs, 3 wkt)", balls: [
    { kind: "wicket" }, { kind: "six" }, { kind: "wicket" }, { kind: "run", value: 1 }, { kind: "dot" }, { kind: "wicket" },
  ]},
  { over: 6, summary: "40/4 (1 runs, 1 wkt)", balls: [
    { kind: "run", value: 1 }, { kind: "wicket" }, { kind: "dot" }, { kind: "dot" }, { kind: "dot" }, { kind: "dot" },
  ]},
];

export const dsgBatters = [
  { name: "Q de Kock", note: "c KT Maphaka b SP Narine", r: 18, b: 12, s4: 2, s6: 1, sr: 150.0, out: true },
  { name: "JM Bairstow", note: "Run Out b SP Narine", r: 14, b: 15, s4: 1, s6: 0, sr: 93.33, out: true },
  { name: "MP Breetzke", note: "c E Bosch b SP Narine", r: 6, b: 2, s4: 0, s6: 1, sr: 300.0, out: true },
  { name: "J Hermann", note: "NOT OUT", r: 2, b: 2, s4: 0, s6: 0, sr: 100.0, out: false },
  { name: "T Stubbs", note: "c SP Narine b E Bosch", r: 0, b: 2, s4: 0, s6: 0, sr: 0.0, out: true },
  { name: "Coles, James - SRL", note: "NOT OUT", r: 0, b: 0, s4: 0, s6: 0, sr: 0.0, out: false },
];

export const secBatters = [
  { name: "K Brathwaite", note: "c MP Breetzke b K Maharaj", r: 12, b: 9, s4: 2, s6: 0, sr: 133.33, out: true },
  { name: "SP Narine", note: "b K Maharaj", r: 14, b: 11, s4: 1, s6: 1, sr: 127.27, out: true },
  { name: "T Bavuma", note: "lbw b K Maharaj", r: 8, b: 7, s4: 1, s6: 0, sr: 114.28, out: true },
  { name: "M Stoinis", note: "c & b E Bosch", r: 4, b: 3, s4: 0, s6: 0, sr: 133.33, out: true },
  { name: "J Hermann", note: "NOT OUT", r: 2, b: 2, s4: 0, s6: 0, sr: 100.0, out: false },
  { name: "Coles, James - SRL", note: "NOT OUT", r: 0, b: 0, s4: 0, s6: 0, sr: 0.0, out: false },
];