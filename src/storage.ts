/**
 * Saves the app's state in localStorage so a reload, a locked phone or a closed
 * tab doesn't lose the match. Anything unreadable is ignored, and the app
 * starts fresh instead.
 */
import type { BestOf, Match, MatchEvent, Player, PointsToWin } from './scoring/match'

export interface SavedState {
    gameStarted: boolean
    match: Match
    names: Record<Player, string>
    firstServer: Player
    pointsToWin: PointsToWin
    bestOf: BestOf
}

const KEY = 'score-counter'
/** Bump when the saved shape changes; older saves are then ignored. */
const VERSION = 1

export function serialize(state: SavedState): string {
    return JSON.stringify({ version: VERSION, ...state })
}

export function parse(json: string | null): SavedState | null {
    if (json === null) return null
    let data: unknown
    try {
        data = JSON.parse(json)
    } catch {
        return null
    }
    if (!isRecord(data) || data.version !== VERSION) return null
    const { gameStarted, match, names, firstServer, pointsToWin, bestOf } = data
    if (
        typeof gameStarted !== 'boolean' ||
        !isMatch(match) ||
        !isNames(names) ||
        !isPlayer(firstServer) ||
        !isPointsToWin(pointsToWin) ||
        !isBestOf(bestOf)
    ) {
        return null
    }
    return { gameStarted, match, names, firstServer, pointsToWin, bestOf }
}

/** The saved state, or null if there is none, it can't be read, or storage is unavailable. */
export function load(storage: Pick<Storage, 'getItem'> = localStorage): SavedState | null {
    try {
        return parse(storage.getItem(KEY))
    } catch {
        return null
    }
}

/** Saves the state; if storage is full or blocked, the app carries on without it. */
export function save(state: SavedState, storage: Pick<Storage, 'setItem'> = localStorage): void {
    try {
        storage.setItem(KEY, serialize(state))
    } catch {
        // Nothing to do: the match just won't survive a reload.
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlayer(value: unknown): value is Player {
    return value === 'A' || value === 'B'
}

function isPointsToWin(value: unknown): value is PointsToWin {
    return value === 11 || value === 21
}

function isBestOf(value: unknown): value is BestOf {
    return value === 1 || value === 3 || value === 5 || value === 7
}

function isNames(value: unknown): value is Record<Player, string> {
    return isRecord(value) && typeof value.A === 'string' && typeof value.B === 'string'
}

function isEvent(value: unknown): value is MatchEvent {
    if (!isRecord(value)) return false
    switch (value.type) {
        case 'point':
            return isPlayer(value.player)
        case 'nextGame':
            return true
        case 'serverCorrection':
            return isPlayer(value.server)
        default:
            return false
    }
}

function isMatch(value: unknown): value is Match {
    if (!isRecord(value) || !isRecord(value.settings) || !Array.isArray(value.events)) return false
    const { pointsToWin, bestOf, firstServer } = value.settings
    return (
        isPointsToWin(pointsToWin) && isBestOf(bestOf) && isPlayer(firstServer) && value.events.every(isEvent)
    )
}
