import type { Player } from '../scoring/match'

export type Side = 'left' | 'right'

/** Each player's colour, which follows the player (or team), not the side. */
export const playerColors: Record<Player, string> = { A: 'var(--player-a)', B: 'var(--player-b)' }

/** A finished game's score, oriented to the players' current ends. */
export interface SideScore {
    left: number
    right: number
}

/** What a half of the table shows about the player currently at that end. */
export interface PlayerView {
    name: string
    color: string
    score: number
    games: number
    /** Doubles: who stands in this team's right and left half-courts. */
    courts?: { right: string; left: string }
}
