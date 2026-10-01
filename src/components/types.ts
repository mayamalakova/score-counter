export type Side = 'left' | 'right'

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
    /** Doubles: who stands in this pair's right and left half-courts. */
    courts?: { right: string; left: string }
}
