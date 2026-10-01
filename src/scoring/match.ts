/**
 * Table tennis scoring engine.
 *
 * A match is its settings plus a log of events. Everything else (score,
 * winners, server, ends) is derived from the log by pure functions, so undo is just
 * dropping events and there is no separate state to get out of sync.
 *
 * Players are A and B, never sides or names: A is the player who starts the
 * match on the left.
 */

export type Player = 'A' | 'B'
export type PointsToWin = 11 | 21
export type BestOf = 1 | 3 | 5 | 7
export type Format = 'singles' | 'doubles'

/** In doubles, pair A is A1 and A2, pair B is B1 and B2. */
export type DoublesPlayer = 'A1' | 'A2' | 'B1' | 'B2'

/** The team (pair) a doubles player belongs to: A1 and A2 are team A. */
export function getDoublesTeam(player: DoublesPlayer): Player {
    return player[0] as Player
}

/** A doubles player's partner, the other player in the same team: A1 and A2 are partners. */
export function getDoublesPartner(player: DoublesPlayer): DoublesPlayer {
    return `${player[0]}${player[1] === '1' ? '2' : '1'}` as DoublesPlayer
}

/** Who serves to whom in doubles. */
export interface Service {
    server: DoublesPlayer
    receiver: DoublesPlayer
}

export interface MatchSettings {
    pointsToWin: PointsToWin
    bestOf: BestOf
    /** The pair (or player) serving first in the match. */
    firstServer: Player
    format: Format
    /** Doubles only: who serves and who receives first in game 1. */
    doublesOrder: Service | null
}

export type MatchEvent =
    | { type: 'point'; player: Player }
    | { type: 'nextGame' }
    /** The server at this moment is actually `server`; the game's first server was recorded wrongly. */
    | { type: 'serverCorrection'; server: Player }
    /** Doubles: this is who actually serves to whom now; rotation continues from here. */
    | { type: 'doublesCorrection'; server: DoublesPlayer; receiver: DoublesPlayer }

export interface Match {
    readonly settings: MatchSettings
    readonly events: readonly MatchEvent[]
}

export type Score = Record<Player, number>

export interface Ends {
    left: Player
    right: Player
}

export interface Game {
    score: Score
    winner: Player | null
    /** Who served the first point, after any corrections. */
    firstServer: Player
}

export const DEFAULT_SETTINGS: MatchSettings = {
    pointsToWin: 11,
    bestOf: 5,
    firstServer: 'A',
    format: 'singles',
    doublesOrder: null
}

export function other(player: Player): Player {
    return player === 'A' ? 'B' : 'A'
}

export function newMatch(settings: Partial<MatchSettings> = {}): Match {
    const merged = { ...DEFAULT_SETTINGS, ...settings }
    // In doubles the first serving pair is the first server's pair.
    if (merged.format === 'doubles' && merged.doublesOrder) {
        merged.firstServer = getDoublesTeam(merged.doublesOrder.server)
    }
    return { settings: merged, events: [] }
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
        } else if (event.type === 'point') {
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

/**
 * Which end each player is at. Players change ends after each game, and in the
 * last possible game of the match when the first player reaches 5 (10 in games
 * to 21).
 */
export function ends(match: Match): Ends {
    const all = games(match)
    const index = all.length - 1
    const { score } = all[index]
    const { bestOf, pointsToWin } = match.settings
    let left: Player = index % 2 === 0 ? 'A' : 'B'
    if (index === bestOf - 1 && Math.max(score.A, score.B) >= decidingSwitchAt(pointsToWin)) {
        left = other(left)
    }
    return { left, right: other(left) }
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
    return serviceChanges(game.score, pointsToWin) % 2 === 0 ? game.firstServer : other(game.firstServer)
}

/** How many times service has changed in a game at this score. */
export function serviceChanges(score: Score, pointsToWin: PointsToWin): number {
    const every = pointsToWin === 21 ? 5 : 2
    const deuce = pointsToWin - 1
    const { A, B } = score
    return A >= deuce && B >= deuce ? (2 * deuce) / every + (A + B - 2 * deuce) : Math.floor((A + B) / every)
}

/** The score at which ends change in the last possible game (and doubles receivers swap). */
export function decidingSwitchAt(pointsToWin: PointsToWin): number {
    return pointsToWin === 21 ? 10 : 5
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

/** Drops the last event, whatever it was. */
export function undo(match: Match): Match {
    if (match.events.length === 0) return match
    return { ...match, events: match.events.slice(0, -1) }
}

/** Clears the current game back to 0-0, including any server corrections made in it. */
export function restart(match: Match): Match {
    return { ...match, events: match.events.slice(0, currentGameStart(match)) }
}

/**
 * Takes back the player's last point in the current game. At 0-0, if the
 * player won the previous game, that game is reopened without its winning
 * point, so a game that was ended by mistake can be corrected.
 */
export function removePoint(match: Match, player: Player): Match {
    const start = currentGameStart(match)
    const inGame = lastPointIndex(match.events, player, start)
    if (inGame >= 0) return withoutEvent(match, inGame)

    const gameHasPoints = match.events.slice(start).some(event => event.type === 'point')
    if (gameHasPoints || start === 0) return match

    const all = games(match)
    if (all[all.length - 2].winner !== player) return match
    const reopened = { ...match, events: match.events.slice(0, start - 1) }
    return withoutEvent(reopened, lastPointIndex(reopened.events, player, 0))
}

/** Index of the first event of the current game. */
function currentGameStart(match: Match): number {
    return match.events.findLastIndex(event => event.type === 'nextGame') + 1
}

function lastPointIndex(events: readonly MatchEvent[], player: Player, from: number): number {
    const index = events.findLastIndex(event => event.type === 'point' && event.player === player)
    return index >= from ? index : -1
}

function withoutEvent(match: Match, index: number): Match {
    return { ...match, events: match.events.filter((_, i) => i !== index) }
}
