/**
 * Table tennis scoring engine.
 *
 * A match is its settings plus a log of events. Everything else (score,
 * winners, server) is derived from the log by pure functions, so undo is just
 * dropping events and there is no separate state to get out of sync.
 *
 * Players are A and B, never sides or names: A is the player who starts the
 * match on the left.
 */

export type Player = 'A' | 'B'
export type PointsToWin = 11 | 21
export type BestOf = 1 | 3 | 5 | 7

export interface MatchSettings {
    pointsToWin: PointsToWin
    bestOf: BestOf
    firstServer: Player
}

export type MatchEvent =
    | { type: 'point'; player: Player }
    | { type: 'nextGame' }
    /** The server at this moment is actually `server`; the game's first server was recorded wrongly. */
    | { type: 'serverCorrection'; server: Player }

export interface Match {
    readonly settings: MatchSettings
    readonly events: readonly MatchEvent[]
}

export type Score = Record<Player, number>

export interface Game {
    score: Score
    winner: Player | null
    /** Who served the first point, after any corrections. */
    firstServer: Player
}

export const DEFAULT_SETTINGS: MatchSettings = { pointsToWin: 11, bestOf: 5, firstServer: 'A' }

export function other(player: Player): Player {
    return player === 'A' ? 'B' : 'A'
}

export function newMatch(settings: Partial<MatchSettings> = {}): Match {
    return { settings: { ...DEFAULT_SETTINGS, ...settings }, events: [] }
}

/** Every game so far; the last one is the game in progress (or just won). */
export function games(match: Match): Game[] {
    const result: Game[] = [newGame(match.settings.firstServer)]
    for (const event of match.events) {
        const game = result[result.length - 1]
        if (event.type === 'nextGame') {
            // The player who served first in a game receives first in the next.
            result.push(newGame(other(game.firstServer)))
        } else if (event.type === 'serverCorrection') {
            // Corrections carry forward: the next game follows the corrected first server.
            if (serverIn(game, match.settings.pointsToWin) !== event.server) {
                game.firstServer = other(game.firstServer)
            }
        } else {
            game.score[event.player]++
            game.winner = gameWinner(game.score, match.settings.pointsToWin)
        }
    }
    return result
}

export function currentGame(match: Match): Game {
    const all = games(match)
    return all[all.length - 1]
}

export function gamesWon(match: Match): Score {
    const won: Score = { A: 0, B: 0 }
    for (const game of games(match)) {
        if (game.winner) won[game.winner]++
    }
    return won
}

export function matchWinner(match: Match): Player | null {
    const needed = (match.settings.bestOf + 1) / 2
    const won = gamesWon(match)
    if (won.A >= needed) return 'A'
    if (won.B >= needed) return 'B'
    return null
}

/** Who serves the next point of the current game. */
export function server(match: Match): Player {
    return serverIn(currentGame(match), match.settings.pointsToWin)
}

/** Records that `player` is actually serving now, if the derived server says otherwise. */
export function correctServer(match: Match, player: Player): Match {
    if (server(match) === player) return match
    return append(match, { type: 'serverCorrection', server: player })
}

/** Adds a point, unless the current game is already won. */
export function addPoint(match: Match, player: Player): Match {
    if (currentGame(match).winner) return match
    return append(match, { type: 'point', player })
}

/** Starts the next game, once the current one is won and the match isn't. */
export function nextGame(match: Match): Match {
    if (!currentGame(match).winner || matchWinner(match)) return match
    return append(match, { type: 'nextGame' })
}

function newGame(firstServer: Player): Game {
    return { score: { A: 0, B: 0 }, winner: null, firstServer }
}

/**
 * Service changes every 2 points (every 5 in games to 21), and every point once
 * both players reach 10-10 (20-20).
 */
function serverIn(game: Game, pointsToWin: PointsToWin): Player {
    const every = pointsToWin === 21 ? 5 : 2
    const deuce = pointsToWin - 1
    const { A, B } = game.score
    const changes = A >= deuce && B >= deuce
        ? (2 * deuce) / every + (A + B - 2 * deuce)
        : Math.floor((A + B) / every)
    return changes % 2 === 0 ? game.firstServer : other(game.firstServer)
}

function gameWinner(score: Score, pointsToWin: PointsToWin): Player | null {
    for (const player of ['A', 'B'] as const) {
        if (score[player] >= pointsToWin && score[player] - score[other(player)] >= 2) return player
    }
    return null
}

function append(match: Match, event: MatchEvent): Match {
    return { ...match, events: [...match.events, event] }
}
