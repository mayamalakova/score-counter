/**
 * Saves the app's state in localStorage so a reload, a locked phone or a closed
 * tab doesn't lose the match. Anything unreadable is ignored, and the app
 * starts fresh instead.
 */
import type {
    BestOf,
    DoublesPlayer,
    Format,
    Match,
    MatchEvent,
    Player,
    PointsToWin,
    Service
} from './scoring/match'

export interface SavedState {
    gameStarted: boolean
    match: Match
    /** Each side's player in singles, or first player in doubles. */
    names: Record<Player, string>
    /** Each side's second player in doubles. */
    partners: Record<Player, string>
    /** Set-up choices for the next match. */
    format: Format
    firstServer: Player
    doublesOrder: Service
    pointsToWin: PointsToWin
    bestOf: BestOf
}

export const DEFAULT_DOUBLES_ORDER: Service = { server: 'A1', receiver: 'B1' }

const KEY = 'score-counter'
/**
 * Bump when the saved shape changes. Saves from the previous version are upgraded
 * in parse(); anything older or unknown is ignored.
 */
const VERSION = 2

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
    if (isRecord(data) && data.version === 1) data = upgradeFromVersion1(data)
    if (!isRecord(data) || data.version !== VERSION) return null
    const { gameStarted, match, names, partners, format, firstServer, doublesOrder, pointsToWin, bestOf } =
        data
    if (
        typeof gameStarted !== 'boolean' ||
        !isMatch(match) ||
        !isNames(names) ||
        !isNames(partners) ||
        !isFormat(format) ||
        !isPlayer(firstServer) ||
        !isService(doublesOrder) ||
        !isPointsToWin(pointsToWin) ||
        !isBestOf(bestOf)
    ) {
        return null
    }
    return { gameStarted, match, names, partners, format, firstServer, doublesOrder, pointsToWin, bestOf }
}

/** Version 1 was singles only: add the doubles fields with their defaults. */
function upgradeFromVersion1(data: Record<string, unknown>): Record<string, unknown> {
    const { match } = data
    if (!isRecord(match) || !isRecord(match.settings)) return data
    return {
        ...data,
        version: 2,
        partners: { A: '', B: '' },
        format: 'singles',
        doublesOrder: DEFAULT_DOUBLES_ORDER,
        match: { ...match, settings: { ...match.settings, format: 'singles', doublesOrder: null } }
    }
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

function isFormat(value: unknown): value is Format {
    return value === 'singles' || value === 'doubles'
}

function isDoublesPlayer(value: unknown): value is DoublesPlayer {
    return value === 'A1' || value === 'A2' || value === 'B1' || value === 'B2'
}

/** A server and receiver from opposite pairs. */
function isService(value: unknown): value is Service {
    return (
        isRecord(value) &&
        isDoublesPlayer(value.server) &&
        isDoublesPlayer(value.receiver) &&
        value.server[0] !== value.receiver[0]
    )
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
        case 'doublesCorrection':
            return isService(value)
        default:
            return false
    }
}

function isMatch(value: unknown): value is Match {
    if (!isRecord(value) || !isRecord(value.settings) || !Array.isArray(value.events)) return false
    const { pointsToWin, bestOf, firstServer, format, doublesOrder } = value.settings
    const orderFits = format === 'doubles' ? isService(doublesOrder) : doublesOrder === null
    return (
        isPointsToWin(pointsToWin) &&
        isBestOf(bestOf) &&
        isPlayer(firstServer) &&
        isFormat(format) &&
        orderFits &&
        value.events.every(isEvent)
    )
}
