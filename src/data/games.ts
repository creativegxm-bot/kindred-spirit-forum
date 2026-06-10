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
  // Playable
  { slug: "solitaire",   name: "Klondike Solitaire", category: "Solitaire",    icon: "🂡", desc: "The classic solitaire. Move cards from tableau to foundations.", status: "playable", players: "1" },
  { slug: "crazy-eights",name: "Crazy Eights",       category: "Shedding",     icon: "🎱", desc: "Match suit or rank. 8s are wild. Empty your hand first.",        status: "playable", players: "1 vs CPU" },
  { slug: "war",         name: "War",                category: "Matching",     icon: "⚔️", desc: "Flip cards. Higher card wins. Ties trigger war.",                  status: "playable", players: "1 vs CPU" },
  { slug: "go-fish",     name: "Go Fish",            category: "Matching",     icon: "🐟", desc: "Ask opponents for ranks. Make sets of four.",                      status: "playable", players: "1 vs CPU" },
  { slug: "blackjack",   name: "Blackjack",          category: "Casino",       icon: "♠️", desc: "Beat the dealer without busting over 21.",                         status: "playable", players: "1 vs Dealer" },

  // Soon
  { slug: "spider",          name: "Spider Solitaire",  category: "Solitaire",   icon: "🕷️", desc: "Build sequences of the same suit from K to A.",   status: "soon", players: "1" },
  { slug: "freecell",        name: "FreeCell",          category: "Solitaire",   icon: "♣️", desc: "All cards visible. Use 4 free cells wisely.",     status: "soon", players: "1" },
  { slug: "pyramid",         name: "Pyramid",           category: "Solitaire",   icon: "🔺", desc: "Pair cards that sum to 13 to clear the pyramid.", status: "soon", players: "1" },
  { slug: "tripeaks",        name: "TriPeaks",          category: "Solitaire",   icon: "⛰️", desc: "Clear three peaks of cards one rank at a time.",  status: "soon", players: "1" },
  { slug: "yukon",           name: "Yukon",             category: "Solitaire",   icon: "🏔️", desc: "Klondike variant — move any face-up sequence.",   status: "soon", players: "1" },
  { slug: "hearts",          name: "Hearts",            category: "Trick-Taking",icon: "♥️", desc: "Avoid hearts and the Queen of Spades.",            status: "soon", players: "1 vs 3 CPU" },
  { slug: "spades",          name: "Spades",            category: "Trick-Taking",icon: "♠️", desc: "Bid your tricks. Spades are always trump.",        status: "soon", players: "4 partners" },
  { slug: "euchre",          name: "Euchre",            category: "Trick-Taking",icon: "🃏", desc: "Trump-based trick-taking with bowers.",            status: "soon", players: "4 partners" },
  { slug: "five-hundred",    name: "500",               category: "Trick-Taking",icon: "5️⃣", desc: "Australian bidding and trick-taking classic.",     status: "soon", players: "4 partners" },
  { slug: "pinochle",        name: "Pinochle",          category: "Trick-Taking",icon: "🎴", desc: "Melds plus tricks with a 48-card deck.",           status: "soon", players: "4 partners" },
  { slug: "bridge",          name: "Bridge",            category: "Trick-Taking",icon: "🌉", desc: "The king of card games. Bid then take tricks.",   status: "soon", players: "4 partners" },
  { slug: "whist",           name: "Whist",             category: "Trick-Taking",icon: "🎩", desc: "Trick-taking ancestor of bridge.",                  status: "soon", players: "4 partners" },
  { slug: "gin-rummy",       name: "Gin Rummy",         category: "Matching",    icon: "🍸", desc: "Build melds, knock with low deadwood.",            status: "soon", players: "1 vs CPU" },
  { slug: "rummy",           name: "Rummy",             category: "Matching",    icon: "🎯", desc: "Form sets and runs to go out.",                     status: "soon", players: "1 vs CPU" },
  { slug: "old-maid",        name: "Old Maid",          category: "Matching",    icon: "👵", desc: "Don't be left with the Old Maid.",                  status: "soon", players: "3-4" },
  { slug: "slapjack",        name: "Slapjack",          category: "Matching",    icon: "✋", desc: "Slap the jack to win the pile.",                    status: "soon", players: "2-4" },
  { slug: "snap",            name: "Snap",              category: "Matching",    icon: "👏", desc: "Call snap on matching cards.",                      status: "soon", players: "2-4" },
  { slug: "poker",           name: "5-Card Draw Poker", category: "Casino",      icon: "🃏", desc: "Classic draw poker.",                                status: "soon", players: "1 vs CPU" },
  { slug: "texas-holdem",    name: "Texas Hold'em",     category: "Casino",      icon: "♦️", desc: "The world's most popular poker variant.",          status: "soon", players: "1 vs CPU" },
  { slug: "mahjong",         name: "Mahjong",           category: "Board",       icon: "🀄", desc: "Match pairs of free tiles to clear the board.",   status: "soon", players: "1" },
  { slug: "backgammon",      name: "Backgammon",        category: "Board",       icon: "🎲", desc: "Race your checkers home.",                          status: "soon", players: "1 vs CPU" },
  { slug: "checkers",        name: "Checkers",          category: "Board",       icon: "⚫", desc: "Jump and capture to king your pieces.",            status: "soon", players: "1 vs CPU" },
  { slug: "chess",           name: "Chess",             category: "Board",       icon: "♟️", desc: "The royal game.",                                   status: "soon", players: "1 vs CPU" },
  { slug: "reversi",         name: "Reversi",           category: "Board",       icon: "⚪", desc: "Flank and flip your opponent's pieces.",          status: "soon", players: "1 vs CPU" },
  { slug: "dominoes",        name: "Dominoes",          category: "Board",       icon: "🁫", desc: "Match ends and play out your hand.",                status: "soon", players: "1 vs CPU" },
];

export const findGame = (slug: string) => GAMES.find(g => g.slug === slug);
