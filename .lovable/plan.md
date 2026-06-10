
# Rebuild as Card Games Site

Honest scoping note up front: cardgames.io has 30+ games, each one is a substantial engine (rules, AI opponents, animations). Building all 30 as fully-playable + online multiplayer in one shot is not realistic in a single iteration — it would be ~weeks of focused work. I'll structure this in phases so you get a working site fast and we grow it.

## Phase 1 — Wipe & Foundation (this turn)

- Delete current pages, components, hooks, data, edge functions, and DB tables related to forum/news/chat/AI detector/tools.
- Keep only: auth scaffolding, Tailwind/shadcn UI, Supabase client.
- New landing page `/` listing all 32 cardgames.io titles as cards (icons + names + "Play").
- New routes `/games/:slug` per game.
- New design system: green felt table background, classic card aesthetic.
- Shared card engine: deck, shuffle, deal, drag-and-drop, animations (`src/lib/cards/`).
- Shared `<GameLayout>` with header, back-to-lobby, new-game, score.

## Phase 2 — Playable Single-Player Games (this turn, top 5)

Fully playable vs computer where applicable:
1. Klondike Solitaire
2. Spider Solitaire
3. FreeCell
4. Hearts (3 AI opponents)
5. Crazy Eights (vs AI)

Remaining 27 games get listed on the lobby with a "Coming soon" badge and a placeholder page (rules + waitlist). This is honest — better than 30 broken games.

## Phase 3 — Roadmap (future turns, ask me)

- Implement the other 27 games one batch at a time (Spades, Gin Rummy, Go Fish, Euchre, War, Pinochle, 500, Bridge, Whist, Blackjack, etc.).
- Online multiplayer via Supabase Realtime: rooms table, game_state JSONB, presence, turn enforcement server-side. I'd start with Hearts + Spades multiplayer since they're the most-played multi-player games on the site.
- Accounts, stats, leaderboards, daily challenges.

## Games list (cardgames.io)

Solitaire, Spider, FreeCell, Pyramid, TriPeaks, Yukon, Klondike, Hearts, Spades, Euchre, 500, Pinochle, Bridge, Whist, Gin Rummy, Rummy, Crazy Eights, Go Fish, Old Maid, War, Slapjack, Snap, Blackjack, Poker, Texas Hold'em, Solitaire Stories, Mahjong, Backgammon, Checkers, Chess, Reversi, Dominoes.

## Technical

- Stack: existing React 18 + Vite + Tailwind + shadcn. No new frameworks.
- Card engine: pure TS, framer-motion for animations (already installed? — will check; if not, `bun add framer-motion`).
- Routing: `react-router-dom` BrowserRouter with `/games/:slug`.
- DB after Phase 1: drop unrelated tables. Keep `profiles`, `user_roles`. Add `game_stats` (user_id, game_slug, wins, losses, best_time).
- Multiplayer (Phase 3): `game_rooms`, `game_room_members`, `game_moves` tables + Realtime channel + edge function `game-action` to validate moves server-side.
- Removing 50+ existing pages and ~30 tables is a large destructive op — I'll do it via a single migration that DROPs unused tables and one batch of file deletes.

## Confirm before I start

Phase 1 + Phase 2 (5 playable games, 27 placeholders) is what I can ship now. Want me to proceed?
