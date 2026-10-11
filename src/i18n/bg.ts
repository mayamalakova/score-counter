import type { Messages } from './en'

/** Bulgarian: a game is a "гейм", a match a "мач". */
export const bg: Messages = {
    appTitle: 'Резултат за тенис на маса',

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
    // Only the match length, "от 5": under "Гейм 2" in the games box it reads as "game 2 of 5".
    bestOfGames: bestOf => `от ${bestOf}`,
    toPoints: points => `до ${points}`,
    doublesShort: 'двойки',

    // Scoreboard
    matchMenu: 'Меню на мача',
    restartGame: 'Започни гейма отначало',
    fullScreen: 'Цял екран',
    exitFullScreen: 'Изход от цял екран',
    pointFor: name => `Точка за ${name}`,
    takePointFrom: name => `Отнеми точка от ${name}`,
    serves: name => `${name} сервира`,
    gamesWonBy: (name, games) => `${name}: ${games} ${games === 1 ? 'спечелен гейм' : 'спечелени гейма'}`,
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
    restartGameQuestion: game => `Да започне ли гейм ${game} отначало?`,
    restartGameHint: 'Резултатът в този гейм се връща на 0:0. Предишните геймове остават.',
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
