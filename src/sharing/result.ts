/**
 * Shares a finished match's result as a link that opens the app, so it can be
 * passed on as a QR code. The result is packed into the link itself (after
 * #result=), so no server is involved.
 *
 * The packed form is versioned. A link that can't be read, or whose games
 * couldn't have been played that way, decodes to null.
 */
import {
    isFinishedGame,
    type BestOf,
    type Format,
    type Player,
    type PointsToWin,
    type Score
} from '../scoring/match'

export interface SharedResult {
    format: Format
    pointsToWin: PointsToWin
    bestOf: BestOf
    /** Player A and B's names, or each team's names ("Ana / Eva") in doubles. */
    names: Record<Player, string>
    /** Every game's final score, in order. */
    games: Score[]
}

/** Bump when the packed shape changes; links from other versions are refused. */
const VERSION = 1
const HASH_PREFIX = '#result='
const MAX_NAME_LENGTH = 60

/** The link to the app showing this result. `base` is the app's address, e.g. its origin and path. */
export function resultLink(base: string, result: SharedResult): string {
    return `${base}${HASH_PREFIX}${encodeResult(result)}`
}

/**
 * Reads a result from a URL hash such as "#result=…". Returns undefined when the
 * hash isn't a shared result at all, and null when it is but can't be used.
 */
export function resultFromHash(hash: string): SharedResult | null | undefined {
    if (!hash.startsWith(HASH_PREFIX)) return undefined
    return decodeResult(hash.slice(HASH_PREFIX.length))
}

export function encodeResult(result: SharedResult): string {
    const packed = {
        v: VERSION,
        f: result.format === 'doubles' ? 'd' : 's',
        p: result.pointsToWin,
        b: result.bestOf,
        n: [result.names.A, result.names.B],
        g: result.games.map(game => [game.A, game.B])
    }
    return toBase64Url(JSON.stringify(packed))
}

export function decodeResult(encoded: string): SharedResult | null {
    let data: unknown
    try {
        data = JSON.parse(fromBase64Url(encoded))
    } catch {
        return null
    }
    if (!isRecord(data) || data.v !== VERSION) return null
    const { f, p, b, n, g } = data
    if ((f !== 's' && f !== 'd') || (p !== 11 && p !== 21) || ![1, 3, 5, 7].includes(b as number)) return null
    if (!Array.isArray(n) || n.length !== 2 || !n.every(isName)) return null
    if (!Array.isArray(g) || !g.every(isGamePair)) return null

    const result: SharedResult = {
        format: f === 'd' ? 'doubles' : 'singles',
        pointsToWin: p,
        bestOf: b as BestOf,
        names: { A: n[0], B: n[1] },
        games: g.map(([A, B]) => ({ A, B }))
    }
    return isCompleteMatch(result) ? result : null
}

/** Every game was played to a finish, and the match ended exactly with the last one. */
function isCompleteMatch({ games, pointsToWin, bestOf }: SharedResult): boolean {
    if (games.length === 0 || games.length > bestOf) return false
    const needed = (bestOf + 1) / 2
    const won: Score = { A: 0, B: 0 }
    for (const [index, game] of games.entries()) {
        if (!isFinishedGame(game, pointsToWin)) return false
        won[game.A > game.B ? 'A' : 'B']++
        const matchOver = won.A === needed || won.B === needed
        if (matchOver !== (index === games.length - 1)) return false
    }
    return true
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isName(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_NAME_LENGTH
}

function isGamePair(value: unknown): value is [number, number] {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        value.every(points => Number.isInteger(points) && points >= 0 && points <= 99)
    )
}

/** Base64 that's safe in a URL, for UTF-8 text (names may have accents: Šťastný). */
function toBase64Url(text: string): string {
    const bytes = new TextEncoder().encode(text)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(encoded: string): string {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}
