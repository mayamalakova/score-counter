import type { Messages } from './en'

/** Czech: a game is a "set", a match a "zápas" (a league fixture is an "utkání"). */
export const cs: Messages = {
    // Set-up
    newMatch: 'Nový zápas',
    leftPlayer: 'Hráč vlevo',
    rightPlayer: 'Hráč vpravo',
    leftPair: 'Dvojice vlevo',
    rightPair: 'Dvojice vpravo',
    pairPlayer: (pair, position) => `${pair}, ${position === 1 ? 'první' : 'druhý'} hráč`,
    playerNumber: number => `Hráč ${number}`,
    servesFirst: 'Podává první',
    format: 'Druh zápasu',
    singles: 'Dvouhra',
    doubles: 'Čtyřhra',
    pointsPerGame: 'Bodů v setu',
    bestOf: 'Nejvýše setů',
    language: 'Jazyk',
    startMatch: 'Začít zápas',

    // Match settings
    gameNumber: number => `Set ${number}`,
    bestOfGames: bestOf => {
        const toWin = (bestOf + 1) / 2
        return `na ${toWin} ${toWin === 1 ? 'vítězný set' : 'vítězné sety'}`
    },
    toPoints: points => `do ${points}`,
    doublesShort: 'čtyřhra',

    // Scoreboard
    restartGame: 'Začít set znovu',
    editPlayers: 'Upravit hráče a podání',
    fullScreen: 'Celá obrazovka',
    exitFullScreen: 'Zrušit celou obrazovku',
    pointFor: name => `Bod pro: ${name}`,
    takePointFrom: name => `Odebrat bod: ${name}`,
    gamesWon: games => `sety ${games}`,
    winsGame: game => `vyhrává ${game}. set`,
    undo: 'Zpět',
    nextGame: 'Další set',

    // Edit panel
    players: 'Hráči',
    playerName: 'Jméno hráče',
    playerId: id => `Hráč ${id}`,
    serving: 'Podává',
    receiving: 'Přijímá',
    servingNow: 'Teď podává',
    done: 'Hotovo',
    endMatch: 'Ukončit zápas',
    endMatchQuestion: 'Ukončit tento zápas?',
    scoreWillBeLost: 'Skóre se ztratí.',
    cancel: 'Zrušit',

    // Result
    winsMatch: (name, won, lost) => `${name} vyhrává ${won}:${lost}`,
    player: 'Hráč',
    games: 'Sety',
    undoLastPoint: 'Vrátit poslední bod',
    shareResult: 'Sdílet výsledek',
    qrCodeLabel: 'QR kód s odkazem na tento výsledek',
    scanHint: 'Naskenujte fotoaparátem telefonu a výsledek se otevře v aplikaci.',
    resultReceived: 'Přijatý výsledek',
    backToMyMatch: 'Zpět k mému zápasu',
    unreadableResult: 'Výsledek nejde přečíst',
    unreadableHint: 'Odkaz je možná neúplný. Požádejte o QR kód znovu.'
}
