import { addPoint, nextGame, type Match, type Player } from '../../src/scoring/match'

/** Scores points in the given order, e.g. play(match, 'AAB') gives A two points, then B one. */
export function play(match: Match, points: string): Match {
    for (const player of points) match = addPoint(match, player as Player)
    return match
}

/** Plays a game to 11-0 (or 21-0) for the player and starts the next one. */
export function winGame(match: Match, player: Player): Match {
    return nextGame(play(match, player.repeat(match.settings.pointsToWin)))
}
