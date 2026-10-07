# Architecture

Two diagrams: what the app stores and derives (the data model), and how the screens are
wired together (the UI model). GitHub renders the Mermaid blocks below as diagrams.

Keep them up to date when the data model or the component tree changes.

## Data model

Only the match's settings and its list of events are stored. Everything a screen shows
(scores, winners, ends, who serves, where doubles players stand) is derived from the
events by pure functions, so undo is just removing the last event.

```mermaid
classDiagram
    direction TB

    class SavedState {
        version = 3
        gameStarted: boolean
        match: Match
        names: A and B
        partners: A and B, doubles only
        set-up for next match: format, firstServer, doublesOrder, pointsToWin, bestOf
    }

    class Match {
        settings: MatchSettings
        events: MatchEvent[]
    }

    class MatchSettings {
        format: singles or doubles
        pointsToWin: 11 or 21
        bestOf: 1, 3, 5 or 7
        firstServer: Player
        doublesOrder: Serve or null
    }

    class MatchEvent {
        <<union>>
        point(player)
        nextGame
        serverCorrection(server: Player)
        doublesCorrection(server, receiver)
    }

    class Serve {
        server: DoublesPlayer
        receiver: DoublesPlayer
    }

    class DoublesPlayer {
        team: DoublesTeam
        position: 1 or 2
        id: A1, A2, B1 or B2
        equals(other) boolean
        partner() DoublesPlayer
        firstOpponent() DoublesPlayer
    }

    class Derived {
        <<pure functions>>
        games() score, winner per game
        gamesWon() and matchWinner()
        ends() who is at the left and right
        server() singles: who serves
        currentServe() doubles: who serves to whom
        positions() doubles: who stands where
    }

    SavedState *-- Match : match
    Match *-- MatchSettings : settings
    Match *-- "0..*" MatchEvent : events
    MatchSettings o-- Serve : doublesOrder
    MatchEvent ..> Serve : doublesCorrection
    Serve *-- "2" DoublesPlayer
    Match ..> Derived : derived from the events
```

- **`Player`** is `'A'` or `'B'`: a side at the start of the match (A starts on the left).
  In doubles the same `A`/`B` is the team (`DoublesTeam`), since the team is what scores,
  wins games and changes ends.
- **`DoublesPlayer`** objects are compared with `equals()`, never `===`.
- The rules live in `src/scoring/match.ts`; doubles serve order and positions in
  `src/scoring/doubles.ts`. Saving and loading is `src/storage.ts`.

## UI model

`App.vue` is the only component with state. It turns the match into what each screen
needs and passes it down as props; screens report taps back as events, and `App.vue`
records them as new match events.

```mermaid
flowchart TD
    storage["storage.ts<br/>load on start, autosave on change"]
    app["App.vue<br/>holds the match, names and set-up"]
    engine["Scoring engine<br/>match.ts, doubles.ts"]

    setup["SetUp<br/>before a match"]
    board["Scoreboard<br/>during play"]
    summary["MatchSummary<br/>over the board when the match is won"]
    edit["EditPanel<br/>over the board, from the pencil"]

    half["PlayerHalf ×2<br/>score, minus, names or half-courts"]
    ball["ServerBall<br/>the ball by the net"]
    bar["GameWonBar<br/>undo or next game"]
    full["FullscreenButton<br/>top bar, where the browser allows"]

    storage <--> app
    app --> engine
    app --> setup
    app --> board
    app --> summary
    app --> edit
    board --> half
    board --> ball
    board --> bar
    board --> full
```

- **One screen at a time:** `SetUp` before a match, `Scoreboard` during it.
  `MatchSummary` and `EditPanel` appear on top of the board.
- **Doubles adds no screens.** It's extra data in the same props: each `PlayerHalf` shows
  who stands in which half-court, the ball sits in the server's half-court, and the edit
  panel lists four players.
- **Full screen is the browser's state, not the match's.** `FullscreenButton` asks the
  browser through `src/fullscreen.ts` and follows its events, so it needs nothing from
  `App.vue`. It isn't shown where pages can't go full screen (iPhones).
- **Tests** drive these screens through `test/driver.ts`, the way a player would.
