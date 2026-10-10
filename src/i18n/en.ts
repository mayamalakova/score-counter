/** Every text on screen, in English. The other languages must match its keys and functions. */
export const en = {
    appTitle: 'Table Tennis Score',

    // Set-up
    newMatch: 'New match',
    leftPlayer: 'Left player',
    rightPlayer: 'Right player',
    leftPair: 'Left pair',
    rightPair: 'Right pair',
    pairPlayer: (pair: string, position: 1 | 2) => `${pair}, ${position === 1 ? 'first' : 'second'} player`,
    playerNumber: (number: number) => `Player ${number}`,
    servesFirst: 'Serves first',
    format: 'Format',
    singles: 'Singles',
    doubles: 'Doubles',
    pointsPerGame: 'Points per game',
    bestOf: 'Best of',
    language: 'Language',
    startMatch: 'Start match',

    // Match settings, as shown during play and on a received result
    gameNumber: (number: number) => `Game ${number}`,
    bestOfGames: (bestOf: number) => `best of ${bestOf}`,
    toPoints: (points: number) => `to ${points}`,
    doublesShort: 'doubles',

    // Scoreboard
    restartGame: 'Restart game',
    editPlayers: 'Edit players and server',
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    pointFor: (name: string) => `Point for ${name}`,
    takePointFrom: (name: string) => `Take a point from ${name}`,
    gamesWon: (games: number) => `games ${games}`,
    winsGame: (game: number) => `wins game ${game}`,
    undo: 'Undo',
    nextGame: 'Next game',

    // Edit panel
    players: 'Players',
    playerName: 'Player name',
    playerId: (id: string) => `Player ${id}`,
    serving: 'Serving',
    receiving: 'Receiving',
    servingNow: 'Serving now',
    done: 'Done',
    endMatch: 'End match',
    endMatchQuestion: 'End this match?',
    scoreWillBeLost: 'The score will be lost.',
    cancel: 'Cancel',

    // Result
    winsMatch: (name: string, won: number, lost: number) => `${name} wins ${won}–${lost}`,
    player: 'Player',
    games: 'Games',
    undoLastPoint: 'Undo last point',
    shareResult: 'Share result',
    qrCodeLabel: 'QR code with a link to this result',
    scanHint: "Scan with the phone's camera to open this result in the app.",
    resultReceived: 'Result received',
    backToMyMatch: 'Back to my match',
    unreadableResult: "This result couldn't be read",
    unreadableHint: 'The link may be incomplete. Ask for the QR code again.'
}

export type Messages = typeof en
