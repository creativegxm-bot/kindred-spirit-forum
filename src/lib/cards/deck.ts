export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export type Suit = typeof SUITS[number];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
export type Rank = typeof RANKS[number];

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
};

export const isRed = (s: Suit) => s === "♥" || s === "♦";
export const rankValue = (r: Rank): number => {
  if (r === "A") return 1;
  if (r === "J") return 11;
  if (r === "Q") return 12;
  if (r === "K") return 13;
  return parseInt(r, 10);
};

export const blackjackValue = (r: Rank): number => {
  if (r === "A") return 11;
  if (["J", "Q", "K"].includes(r)) return 10;
  return parseInt(r, 10);
};

export const createDeck = (faceUp = false): Card[] => {
  const deck: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) {
    deck.push({ id: `${r}${s}`, suit: s, rank: r, faceUp });
  }
  return deck;
};

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
