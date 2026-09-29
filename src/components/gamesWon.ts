import type { SideScore } from './types'

export function gamesWon(gameScores: SideScore[]): SideScore {
    return {
        left: gameScores.filter(game => game.left > game.right).length,
        right: gameScores.filter(game => game.right > game.left).length
    }
}
