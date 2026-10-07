/**
 * Shares a finished match's result as a link that opens the app, so it can be
 * passed on as a QR code. The result is packed into the link itself (after
 * #result=), so no server is involved.
 *
 * The packed form is versioned. A link that can't be read, or whose games
 * couldn't have been played that way, decodes to null.
 */
import {
    gamesToWinMatch,
    gamesWonFrom,
    isBestOf,
    isFinishedGame,
    isPointsToWin,
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
/** Room for two full names in doubles ("Kateřina Nováková / Alžběta Dvořáková"). */
const MAX_NAME_LENGTH = 80

/** The link to the app showing this result. `base` is the app's address, e.g. its origin and path. */
export function resultLink(base: string, result: SharedResult): string {
    return `${base}${HASH_PREFIX}${encodeResult(result)}`
}

/** What the app's address holds: no shared result, one that can't be used, or a result. */
export type ReceivedLink =
    { status: 'none' } | { status: 'unreadable' } | { status: 'ok'; result: SharedResult }

/** Reads a result from a URL hash such as "#result=…". */
export function resultFromHash(hash: string): ReceivedLink {
    if (!hash.startsWith(HASH_PREFIX)) return { status: 'none' }
    const result = decodeResult(hash.slice(HASH_PREFIX.length))
    return result ? { status: 'ok', result } : { status: 'unreadable' }
}

export function encodeResult(result: SharedResult): string {
    const packed = {
        v: VERSION,
        f: result.format === 'doubles' ? 'd' : 's',
        p: result.pointsToWin,
        b: result.bestOf,
        n: [shorten(result.names.A), shorten(result.names.B)],
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
    if ((f !== 's' && f !== 'd') || !isPointsToWin(p) || !isBestOf(b)) return null
    if (!Array.isArray(n) || n.length !== 2 || !n.every(isName)) return null
    if (!Array.isArray(g) || !g.every(isGamePair)) return null

    const result: SharedResult = {
        format: f === 'd' ? 'doubles' : 'singles',
        pointsToWin: p,
        bestOf: b,
        names: { A: n[0], B: n[1] },
        games: g.map(([A, B]) => ({ A, B }))
    }
    return isCompleteMatch(result) ? result : null
}

/** Every game was played to a finish, and the match ended exactly with the last one. */
function isCompleteMatch({ games, pointsToWin, bestOf }: SharedResult): boolean {
    if (games.length === 0 || !games.every(game => isFinishedGame(game, pointsToWin))) return false
    const needed = gamesToWinMatch(bestOf)
    const reached = (won: Score) => Math.max(won.A, won.B) >= needed
    return reached(gamesWonFrom(games)) && !reached(gamesWonFrom(games.slice(0, -1)))
}

/** Names aren't limited when typed, so cut long ones rather than share a link that's refused. */
function shorten(name: string): string {
    return Array.from(name.trim()).slice(0, MAX_NAME_LENGTH).join('')
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isName(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0 && Array.from(value).length <= MAX_NAME_LENGTH
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
