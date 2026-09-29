/** Two-digit scores get a smaller font so both halves still fit. */
export function scoreClass(scoreLeft: number, scoreRight: number): string {
    const size = scoreLeft > 9 || scoreRight > 9 ? 'small' : 'normal'
    return `score-val-number ${size}`
}
