/**
 * Saves the app's state in localStorage so a reload, a locked phone or a closed
 * tab doesn't lose the match. Anything unreadable is ignored, and the app
 * starts fresh instead.
 */
import {
    DoublesPlayer,
    isBestOf,
    isPointsToWin,
    type BestOf,
    type DoublesPosition,
    type DoublesTeam,
    type Format,
    type Match,
    type MatchEvent,
    type Player,
    type PointsToWin,
    type Serve
} from './scoring/match'

export interface SavedState {
    gameStarted: boolean
    match: Match
    /** Each side's player in singles, or first player in doubles. */
    names: Record<Player, string>
    /** Each team's second player in doubles. */
    partners: Record<DoublesTeam, string>
    /** Set-up choices for the next match. */
    format: Format
    firstServer: Player
    doublesOrder: Serve
    pointsToWin: PointsToWin
    bestOf: BestOf
}

export const DEFAULT_DOUBLES_ORDER: Serve = {
    server: new DoublesPlayer('A', 1),
    receiver: new DoublesPlayer('B', 1)
}

const KEY = 'score-counter'
/**
 * Bump when the saved shape changes, and add an upgrade from the previous
 * version in parse(). Anything unknown is ignored.
 */
const VERSION = 3

export function serialize(state: SavedState): string {
    // A DoublesPlayer serializes as { team, position }.
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
    if (isRecord(data) && data.version === 2) data = upgradeFromVersion2(data)
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
        !isServe(doublesOrder) ||
        !isPointsToWin(pointsToWin) ||
        !isBestOf(bestOf)
    ) {
        return null
    }
    return {
        gameStarted,
        match: reviveMatch(match),
        names,
        partners,
        format,
        firstServer,
        doublesOrder: reviveServe(doublesOrder),
        pointsToWin,
        bestOf
    }
}

/** Version 1 was singles only: add the doubles fields with their defaults (in version 2's form). */
function upgradeFromVersion1(data: Record<string, unknown>): Record<string, unknown> {
    const { match } = data
    if (!isRecord(match) || !isRecord(match.settings)) return data
    return {
        ...data,
        version: 2,
        partners: { A: '', B: '' },
        format: 'singles',
        doublesOrder: { server: 'A1', receiver: 'B1' },
        match: { ...match, settings: { ...match.settings, format: 'singles', doublesOrder: null } }
    }
}

/** Version 2 stored doubles players as ids such as 'A1'; version 3 stores { team, position }. */
function upgradeFromVersion2(data: Record<string, unknown>): Record<string, unknown> {
    const { match } = data
    if (!isRecord(match) || !isRecord(match.settings) || !Array.isArray(match.events)) return data
    const events = match.events.map(event =>
        isRecord(event) && event.type === 'doublesCorrection' ? { ...event, ...playersFromIds(event) } : event
    )
    const order = match.settings.doublesOrder
    return {
        ...data,
        version: 3,
        doublesOrder: isRecord(data.doublesOrder) ? playersFromIds(data.doublesOrder) : data.doublesOrder,
        match: {
            ...match,
            events,
            settings: { ...match.settings, doublesOrder: isRecord(order) ? playersFromIds(order) : order }
        }
    }
}

/** { server: 'A1', receiver: 'B1' } to the { team, position } form. Anything else is left to fail validation. */
function playersFromIds(serve: Record<string, unknown>): Record<string, unknown> {
    const fromId = (id: unknown) =>
        typeof id === 'string' && /^[AB][12]$/.test(id) ? { team: id[0], position: Number(id[1]) } : id
    return { server: fromId(serve.server), receiver: fromId(serve.receiver) }
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

/** A doubles player as stored: plain data, before it becomes a DoublesPlayer again. */
interface StoredPlayer {
    team: DoublesTeam
    position: DoublesPosition
}

interface StoredServe {
    server: StoredPlayer
    receiver: StoredPlayer
}

type StoredEvent =
    Exclude<MatchEvent, { type: 'doublesCorrection' }> | ({ type: 'doublesCorrection' } & StoredServe)

interface StoredMatch {
    settings: Omit<Match['settings'], 'doublesOrder'> & { doublesOrder: StoredServe | null }
    events: StoredEvent[]
}

function revivePlayer({ team, position }: StoredPlayer): DoublesPlayer {
    return new DoublesPlayer(team, position)
}

function reviveServe({ server, receiver }: StoredServe): Serve {
    return { server: revivePlayer(server), receiver: revivePlayer(receiver) }
}

function reviveMatch({ settings, events }: StoredMatch): Match {
    return {
        settings: { ...settings, doublesOrder: settings.doublesOrder && reviveServe(settings.doublesOrder) },
        events: events.map(event =>
            event.type === 'doublesCorrection' ? { type: 'doublesCorrection', ...reviveServe(event) } : event
        )
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlayer(value: unknown): value is Player {
    return value === 'A' || value === 'B'
}

function isFormat(value: unknown): value is Format {
    return value === 'singles' || value === 'doubles'
}

function isDoublesPlayer(value: unknown): value is StoredPlayer {
    return isRecord(value) && isPlayer(value.team) && (value.position === 1 || value.position === 2)
}

/** A server and receiver from opposite teams. */
function isServe(value: unknown): value is StoredServe {
    return (
        isRecord(value) &&
        isDoublesPlayer(value.server) &&
        isDoublesPlayer(value.receiver) &&
        value.server.team !== value.receiver.team
    )
}

function isNames(value: unknown): value is Record<Player, string> {
    return isRecord(value) && typeof value.A === 'string' && typeof value.B === 'string'
}

function isEvent(value: unknown): value is StoredEvent {
    if (!isRecord(value)) return false
    switch (value.type) {
        case 'point':
            return isPlayer(value.player)
        case 'nextGame':
            return true
        case 'serverCorrection':
            return isPlayer(value.server)
        case 'doublesCorrection':
            return isServe(value)
        default:
            return false
    }
}

function isMatch(value: unknown): value is StoredMatch {
    if (!isRecord(value) || !isRecord(value.settings) || !Array.isArray(value.events)) return false
    const { pointsToWin, bestOf, firstServer, format, doublesOrder } = value.settings
    const orderFits = format === 'doubles' ? isServe(doublesOrder) : doublesOrder === null
    return (
        isPointsToWin(pointsToWin) &&
        isBestOf(bestOf) &&
        isPlayer(firstServer) &&
        isFormat(format) &&
        orderFits &&
        value.events.every(isEvent)
    )
}
