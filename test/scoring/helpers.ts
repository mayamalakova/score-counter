import {
    addPoint,
    DoublesPlayer,
    nextGame,
    type DoublesPlayerId,
    type Match,
    type Player,
    type Serve
} from '../../src/scoring/match'

/** Scores points in the given order, e.g. play(match, 'AAB') gives A two points, then B one. */
export function play(match: Match, points: string): Match {
    for (const player of points) match = addPoint(match, player as Player)
    return match
}

/** Plays a game to 11-0 (or 21-0) for the player and starts the next one. */
export function winGame(match: Match, player: Player): Match {
    return nextGame(play(match, player.repeat(match.settings.pointsToWin)))
}

/** A doubles player from a short id such as 'A1'. */
export function player(id: DoublesPlayerId): DoublesPlayer {
    return DoublesPlayer.fromId(id)
}

/** Who serves to whom, from short ids: serve('A1', 'B1'). */
export function serve(server: DoublesPlayerId, receiver: DoublesPlayerId): Serve {
    return { server: player(server), receiver: player(receiver) }
}
