/**
 * Doubles serve order, derived from the same event log as singles.
 *
 * Scores, winners and ends work exactly as in singles (per team, A and B). What
 * doubles adds is who serves to whom, which depends on the order chosen for
 * game 1, the rotation within a game, corrections, and the receiving swap in the
 * last possible game.
 */
import {
    decidingSwitchAt,
    serveChanges,
    type DoublesPlayer,
    type DoublesTeam,
    type Match,
    type Score,
    type Serve
} from './match'

/** At a change of service the receiver serves, to the previous server's partner. */
function rotate({ server, receiver }: Serve): Serve {
    return { server: receiver, receiver: server.partner() }
}

function rotateBack({ server, receiver }: Serve): Serve {
    return { server: receiver.partner(), receiver: server }
}

/** Who serves the next point to whom. */
export function currentServe(match: Match): Serve {
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
            const changes = serveChanges(score, pointsToWin)
            while (turns < changes) {
                current = rotate(current)
                turns++
            }
            // In the last possible game the receiving team swaps its order when a team first reaches 5 (10).
            const lastGame = gameIndex === bestOf - 1
            if (lastGame && !swapped && Math.max(score.A, score.B) >= decidingSwitchAt(pointsToWin)) {
                current = { server: current.server, receiver: current.receiver.partner() }
                swapped = true
            }
        }
    }
    return current
}

/** Where each team stands now: who is in their right half-court and who in their left. */
export function positions(match: Match): Record<DoublesTeam, { right: DoublesPlayer; left: DoublesPlayer }> {
    const { server, receiver } = currentServe(match)
    const inRight = (team: DoublesTeam) => (server.team === team ? server : receiver)
    const a = inRight('A')
    const b = inRight('B')
    return {
        A: { right: a, left: a.partner() },
        B: { right: b, left: b.partner() }
    }
}

/**
 * Picks a new server, keeping the receiver unless they're in the server's own
 * team, in which case the other team's first player receives instead.
 */
export function withServer(order: Serve, server: DoublesPlayer): Serve {
    if (order.receiver.team !== server.team) return { server, receiver: order.receiver }
    return { server, receiver: server.firstOpponent() }
}

/** Records who actually serves to whom now, if the derived order says otherwise. */
export function correctServe(match: Match, corrected: Serve): Match {
    const now = currentServe(match)
    if (now.server.equals(corrected.server) && now.receiver.equals(corrected.receiver)) return match
    return {
        ...match,
        events: [...match.events, { type: 'doublesCorrection', ...corrected }]
    }
}
