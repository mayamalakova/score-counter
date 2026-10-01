/**
 * Doubles service order, derived from the same event log as singles.
 *
 * Scores, winners and ends work exactly as in singles (per pair, A and B). What
 * doubles adds is who serves to whom, which depends on the order chosen for
 * game 1, the rotation within a game, corrections, and the receiving swap in the
 * last possible game.
 */
import {
    decidingSwitchAt,
    serviceChanges,
    type DoublesPlayer,
    type Match,
    type Player,
    type Score,
    type Service
} from './match'

export function pairOf(player: DoublesPlayer): Player {
    return player[0] as Player
}

export function partner(player: DoublesPlayer): DoublesPlayer {
    return `${player[0]}${player[1] === '1' ? '2' : '1'}` as DoublesPlayer
}

/** At a change of service the receiver serves, to the previous server's partner. */
function rotate({ server, receiver }: Service): Service {
    return { server: receiver, receiver: partner(server) }
}

function rotateBack({ server, receiver }: Service): Service {
    return { server: partner(receiver), receiver: server }
}

/** Who serves the next point to whom. */
export function service(match: Match): Service {
    const { pointsToWin, bestOf, doublesOrder } = match.settings
    if (!doublesOrder) throw new Error('Not a doubles match')

    let gameIndex = 0
    let first = doublesOrder
    let current = first
    let turns = 0
    let swapped = false
    const score: Score = { A: 0, B: 0 }

    for (const event of match.events) {
        if (event.type === 'nextGame') {
            // The first receiver serves first, to the player who served to them.
            first = { server: first.receiver, receiver: first.server }
            current = first
            gameIndex++
            turns = 0
            swapped = false
            score.A = 0
            score.B = 0
        } else if (event.type === 'doublesCorrection') {
            current = { server: event.server, receiver: event.receiver }
            // Work back to the order this game must have started with, so the next game follows from it.
            first = current
            for (let i = 0; i < turns; i++) first = rotateBack(first)
        } else if (event.type === 'point') {
            score[event.player]++
            const changes = serviceChanges(score, pointsToWin)
            while (turns < changes) {
                current = rotate(current)
                turns++
            }
            // In the last possible game the receiving pair swaps its order when a pair first reaches 5 (10).
            const lastGame = gameIndex === bestOf - 1
            if (lastGame && !swapped && Math.max(score.A, score.B) >= decidingSwitchAt(pointsToWin)) {
                current = { server: current.server, receiver: partner(current.receiver) }
                swapped = true
            }
        }
    }
    return current
}

/** Where each pair stands now: who is in their right half-court and who in their left. */
export function positions(match: Match): Record<Player, { right: DoublesPlayer; left: DoublesPlayer }> {
    const { server, receiver } = service(match)
    const inRight = (pair: Player) => (pairOf(server) === pair ? server : receiver)
    const a = inRight('A')
    const b = inRight('B')
    return {
        A: { right: a, left: partner(a) },
        B: { right: b, left: partner(b) }
    }
}

/** Records who actually serves to whom now, if the derived order says otherwise. */
export function correctService(match: Match, corrected: Service): Match {
    const now = service(match)
    if (now.server === corrected.server && now.receiver === corrected.receiver) return match
    return {
        ...match,
        events: [...match.events, { type: 'doublesCorrection', ...corrected }]
    }
}
