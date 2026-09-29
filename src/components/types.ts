export type Side = 'left' | 'right'

/** A finished game's score, oriented to the players' current ends. */
export interface SideScore {
    left: number
    right: number
}
