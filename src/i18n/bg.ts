import type { Messages } from './en'

/** Bulgarian: a game is a "гейм", a match a "мач". */
export const bg: Messages = {
    // Set-up
    newMatch: 'Нов мач',
    leftPlayer: 'Играч вляво',
    rightPlayer: 'Играч вдясно',
    leftPair: 'Двойка вляво',
    rightPair: 'Двойка вдясно',
    pairPlayer: (pair, position) => `${pair}, ${position === 1 ? 'първи' : 'втори'} играч`,
    playerNumber: number => `Играч ${number}`,
    servesFirst: 'Сервира първи',
    format: 'Вид мач',
    singles: 'Сингъл',
    doubles: 'Двойки',
    pointsPerGame: 'Точки в гейм',
    bestOf: 'Най-много геймове',
    language: 'Език',
    startMatch: 'Започни мача',

    // Match settings
    gameNumber: number => `Гейм ${number}`,
    bestOfGames: bestOf => {
        const toWin = (bestOf + 1) / 2
        return `до ${toWin} ${toWin === 1 ? 'спечелен гейм' : 'спечелени гейма'}`
    },
    toPoints: points => `до ${points}`,
    doublesShort: 'двойки',

    // Scoreboard
    restartGame: 'Започни гейма отначало',
    editPlayers: 'Промени играчите и сервиса',
    fullScreen: 'Цял екран',
    exitFullScreen: 'Изход от цял екран',
    pointFor: name => `Точка за ${name}`,
    takePointFrom: name => `Отнеми точка от ${name}`,
    gamesWon: games => `геймове ${games}`,
    winsGame: game => `печели гейм ${game}`,
    undo: 'Отмени',
    nextGame: 'Следващ гейм',

    // Edit panel
    players: 'Играчи',
    playerName: 'Име на играча',
    playerId: id => `Играч ${id}`,
    serving: 'Сервира',
    receiving: 'Посреща',
    servingNow: 'Сервира сега',
    done: 'Готово',
    endMatch: 'Край на мача',
    endMatchQuestion: 'Да приключи ли мачът?',
    scoreWillBeLost: 'Резултатът ще се изгуби.',
    cancel: 'Отказ',

    // Result
    winsMatch: (name, won, lost) => `${name} печели ${won}:${lost}`,
    player: 'Играч',
    games: 'Геймове',
    undoLastPoint: 'Отмени последната точка',
    shareResult: 'Сподели резултата',
    qrCodeLabel: 'QR код с връзка към този резултат',
    scanHint: 'Сканирайте с камерата на телефона, за да отворите резултата в приложението.',
    resultReceived: 'Получен резултат',
    backToMyMatch: 'Обратно към моя мач',
    unreadableResult: 'Резултатът не може да се прочете',
    unreadableHint: 'Връзката може да е непълна. Поискайте QR кода отново.'
}
