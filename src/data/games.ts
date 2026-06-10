export type GameDef = {
  slug: string;
  name: string;
  category: "Solitaire" | "Trick-Taking" | "Shedding" | "Matching" | "Casino" | "Board";
  icon: string;
  desc: string;
  status: "playable" | "soon";
  players: string;
};

export const GAMES: GameDef[] = [
  { slug: "solitaire",    name: "Klondike Solitaire", category: "Solitaire",    icon: "🂡", desc: "The classic solitaire. Move cards from tableau to foundations.", status: "playable", players: "1" },
  { slug: "spider",       name: "Spider Solitaire",   category: "Solitaire",    icon: "🕷️", desc: "Build sequences of the same suit from K to A.",                   status: "playable", players: "1" },
  { slug: "freecell",     name: "FreeCell",           category: "Solitaire",    icon: "♣️", desc: "All cards visible. Use 4 free cells wisely.",                     status: "playable", players: "1" },
  { slug: "pyramid",      name: "Pyramid",            category: "Solitaire",    icon: "🔺", desc: "Pair cards that sum to 13 to clear the pyramid.",                 status: "playable", players: "1" },
  { slug: "tripeaks",     name: "TriPeaks",           category: "Solitaire",    icon: "⛰️", desc: "Clear three peaks of cards one rank at a time.",                  status: "playable", players: "1" },
  { slug: "yukon",        name: "Yukon",              category: "Solitaire",    icon: "🏔️", desc: "Klondike variant — move any face-up sequence.",                  status: "playable", players: "1" },

  { slug: "hearts",       name: "Hearts",             category: "Trick-Taking", icon: "♥️", desc: "Avoid hearts and the Queen of Spades.",                           status: "playable", players: "1 vs 3 CPU" },
  { slug: "spades",       name: "Spades",             category: "Trick-Taking", icon: "♠️", desc: "Bid your tricks. Spades are always trump.",                       status: "playable", players: "4 partners" },
  { slug: "euchre",       name: "Euchre",             category: "Trick-Taking", icon: "🃏", desc: "Trump-based trick-taking.",                                       status: "playable", players: "4 partners" },
  { slug: "five-hundred", name: "500",                category: "Trick-Taking", icon: "5️⃣", desc: "Australian trick-taking classic.",                                status: "playable", players: "4 partners" },
  { slug: "pinochle",     name: "Pinochle",           category: "Trick-Taking", icon: "🎴", desc: "Tricks with random trump (lite).",                                status: "playable", players: "4 partners" },
  { slug: "bridge",       name: "Bridge",             category: "Trick-Taking", icon: "🌉", desc: "The king of card games (lite version).",                          status: "playable", players: "4 partners" },
  { slug: "whist",        name: "Whist",              category: "Trick-Taking", icon: "🎩", desc: "Trick-taking ancestor of bridge.",                                status: "playable", players: "4 partners" },

  { slug: "crazy-eights", name: "Crazy Eights",       category: "Shedding",     icon: "🎱", desc: "Match suit or rank. 8s are wild. Empty your hand first.",       status: "playable", players: "1 vs CPU" },

  { slug: "war",          name: "War",                category: "Matching",     icon: "⚔️", desc: "Flip cards. Higher card wins. Ties trigger war.",                  status: "playable", players: "1 vs CPU" },
  { slug: "go-fish",      name: "Go Fish",            category: "Matching",     icon: "🐟", desc: "Ask opponents for ranks. Make sets of four.",                     status: "playable", players: "1 vs CPU" },
  { slug: "gin-rummy",    name: "Gin Rummy",          category: "Matching",     icon: "🍸", desc: "Build melds, knock with low deadwood.",                           status: "playable", players: "1 vs CPU" },
  { slug: "rummy",        name: "Rummy",              category: "Matching",     icon: "🎯", desc: "Form sets and runs to go out.",                                   status: "playable", players: "1 vs CPU" },
  { slug: "old-maid",     name: "Old Maid",           category: "Matching",     icon: "👵", desc: "Don't be left with the Old Maid.",                                status: "playable", players: "3" },
  { slug: "slapjack",     name: "Slapjack",           category: "Matching",     icon: "✋", desc: "Slap the jack to win the pile.",                                  status: "playable", players: "1 vs CPU" },
  { slug: "snap",         name: "Snap",               category: "Matching",     icon: "👏", desc: "Call snap on matching cards.",                                    status: "playable", players: "1 vs CPU" },

  { slug: "blackjack",    name: "Blackjack",          category: "Casino",       icon: "♠️", desc: "Beat the dealer without busting over 21.",                        status: "playable", players: "1 vs Dealer" },
  { slug: "poker",        name: "5-Card Draw Poker",  category: "Casino",       icon: "🃏", desc: "Classic draw poker vs the CPU.",                                  status: "playable", players: "1 vs CPU" },
  { slug: "texas-holdem", name: "Texas Hold'em",      category: "Casino",       icon: "♦️", desc: "The world's most popular poker variant.",                         status: "playable", players: "1 vs CPU" },

  { slug: "mahjong",      name: "Mahjong",            category: "Board",        icon: "🀄", desc: "Match pairs of free tiles to clear the board.",                   status: "playable", players: "1" },
  { slug: "backgammon",   name: "Backgammon",         category: "Board",        icon: "🎲", desc: "Race your checkers home (lite).",                                 status: "playable", players: "1 vs CPU" },
  { slug: "checkers",     name: "Checkers",           category: "Board",        icon: "⚫", desc: "Jump and capture to king your pieces.",                          status: "playable", players: "1 vs CPU" },
  { slug: "chess",        name: "Chess",              category: "Board",        icon: "♟️", desc: "The royal game (basic moves).",                                   status: "playable", players: "1 vs CPU" },
  { slug: "reversi",      name: "Reversi",            category: "Board",        icon: "⚪", desc: "Flank and flip your opponent's pieces.",                         status: "playable", players: "1 vs CPU" },
  { slug: "dominoes",     name: "Dominoes",           category: "Board",        icon: "🁫", desc: "Match ends and play out your hand.",                              status: "playable", players: "1 vs CPU" },
];

export const findGame = (slug: string) => GAMES.find(g => g.slug === slug);
