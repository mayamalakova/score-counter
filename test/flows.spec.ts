// The main flows, played through the UI from start to finish.
import { beforeEach, describe, expect, it } from 'vitest'
import { AppDriver } from './driver'

let app: AppDriver

beforeEach(() => {
    app = new AppDriver()
})

describe('a best of 3 from set-up to the next match', () => {
    it('plays through games, changes of ends and the summary', async () => {
        await app.start({ bestOf: 3 })
        expect(app.info).toBe('Game 1 · best of 3 · to 11')
        expect(app.names).toEqual(['Ana', 'Ben'])
        const [anaColour, benColour] = app.nameColours

        await app.point('left', 11)
        expect(app.gameWonText).toBe('Ana wins game 1 Undo Next game')

        await app.nextGame()
        expect(app.info).toBe('Game 2 · best of 3 · to 11')
        expect(app.names).toEqual(['Ben', 'Ana'])
        expect(app.nameColours).toEqual([benColour, anaColour])
        expect(app.scores).toEqual(['0', '0'])

        await app.point('right', 11)
        expect(app.gameWon).toBe(false)
        expect(app.summaryTitle).toBe('Ana wins 2–0')

        await app.newMatch()
        expect(app.onSetUp).toBe(true)
        // Whoever ended the match on the left starts the next one there.
        expect(app.setUpNames).toEqual(['Ben', 'Ana'])
        expect(app.checkedValue('best-of')).toBe('3')
    })
})

describe('service', () => {
    it('moves the ball every 2 points, then every point from 10-10', async () => {
        await app.start()
        const servers: string[] = []
        for (let i = 0; i < 10; i++) {
            servers.push(app.server)
            await app.point('left')
            servers.push(app.server)
            await app.point('right')
        }
        expect(servers.join(' ')).toBe(Array(5).fill('left left right right').join(' '))

        const atDeuce: string[] = []
        for (let i = 0; i < 4; i++) {
            atDeuce.push(app.server)
            await app.point(i % 2 === 0 ? 'left' : 'right')
        }
        expect(atDeuce).toEqual(['left', 'right', 'left', 'right'])
    })

    it('starts with the player chosen on set-up', async () => {
        await app.start({ rightServesFirst: true })
        expect(app.server).toBe('right')
    })

    it('goes to the receiver of game 1 first in game 2', async () => {
        await app.start()
        await app.winGame('left')
        // The left player served first in game 1; after changing ends the receiver is on the left.
        expect(app.server).toBe('left')
    })
})

describe('the deciding game', () => {
    it('changes ends when the first player reaches 5', async () => {
        await app.start({ bestOf: 1 })
        await app.point('left', 4)
        expect(app.names).toEqual(['Ana', 'Ben'])

        await app.point('left')
        expect(app.names).toEqual(['Ben', 'Ana'])
        expect(app.scores).toEqual(['0', '5'])
    })

    it('changes at 10 in games to 21', async () => {
        await app.start({ bestOf: 1, pointsToWin: 21 })
        await app.point('left', 9)
        expect(app.names).toEqual(['Ana', 'Ben'])
        await app.point('left')
        expect(app.names).toEqual(['Ben', 'Ana'])
    })
})

describe('games to 21', () => {
    it('are not won at 11', async () => {
        await app.start({ pointsToWin: 21 })
        await app.point('left', 11)
        expect(app.gameWon).toBe(false)
        await app.point('left', 10)
        expect(app.gameWonText).toContain('Ana wins game 1')
    })
})

describe('correcting mistakes', () => {
    beforeEach(async () => {
        await app.start()
    })

    it('minus takes back a point', async () => {
        await app.point('left', 2)
        await app.minus('left')
        expect(app.scores).toEqual(['1', '0'])
    })

    it('minus at 0-0 reopens the last game if that player won it', async () => {
        await app.winGame('right')
        // Ben won on the right and is now on the left.
        await app.minus('left')
        expect(app.info).toContain('Game 1')
        expect(app.names).toEqual(['Ana', 'Ben'])
        expect(app.scores).toEqual(['0', '10'])
    })

    it('minus at 0-0 does nothing for the player who lost the last game', async () => {
        await app.winGame('left')
        await app.minus('left')
        expect(app.info).toContain('Game 2')
        expect(app.scores).toEqual(['0', '0'])
    })

    it('minus at 0 does nothing while the other player has points', async () => {
        await app.winGame('left')
        await app.point('right', 3)
        await app.minus('left')
        expect(app.info).toContain('Game 2')
        expect(app.scores).toEqual(['0', '3'])
    })

    it('restart clears the current game only', async () => {
        await app.winGame('left')
        await app.point('left', 4)
        await app.restart()
        expect(app.info).toContain('Game 2')
        expect(app.scores).toEqual(['0', '0'])
    })
})

describe('the edit panel', () => {
    beforeEach(async () => {
        await app.start()
        await app.point('left', 3)
    })

    it('renames players and corrects the server', async () => {
        expect(app.server).toBe('right')
        await app.openEdit()
        await app.editNames('Anna', 'Benny')
        await app.setServingNow('left')
        await app.closeEdit()

        expect(app.editOpen).toBe(false)
        expect(app.names).toEqual(['Anna', 'Benny'])
        expect(app.server).toBe('left')
        await app.point('right')
        expect(app.server).toBe('right')
    })

    it('keeps a server correction after restarting a later game', async () => {
        await app.openEdit()
        await app.setServingNow('left')
        await app.closeEdit()
        // Game 1 was corrected, so the right player served first; the left player
        // (Ana) serves first in game 2, from the right after changing ends.
        await app.winGame('left')
        expect(app.server).toBe('right')
        await app.point('left')
        await app.restart()
        expect(app.server).toBe('right')
    })

    it('shows default names when a name is cleared', async () => {
        await app.openEdit()
        await app.editNames('', 'Ben')
        await app.closeEdit()
        expect(app.names).toEqual(['Player 1', 'Ben'])
    })
})

describe('starting', () => {
    it('opens on set-up with games to 11, best of 5 and the left player serving', () => {
        expect(app.onSetUp).toBe(true)
        expect(app.setUpNames).toEqual(['', ''])
        expect(app.checkedValue('points-to-win')).toBe('11')
        expect(app.checkedValue('best-of')).toBe('5')
        expect(app.checkedValue('first-server')).toBe('false')
    })

    it('plays a game to the end with no names entered', async () => {
        await app.start({ left: '', right: '' })
        await app.point('left', 11)
        expect(app.gameWonText).toContain('Player 1 wins game 1')
    })

    it('ends a best of 1 after one game', async () => {
        await app.start({ bestOf: 1 })
        await app.point('left', 5)
        // Ana changed ends at 5 and is now on the right.
        await app.point('right', 6)
        expect(app.summaryTitle).toBe('Ana wins 1–0')
    })

    it('starts the next match with the left player serving, as set-up shows', async () => {
        await app.start({ rightServesFirst: true, bestOf: 1 })
        await app.point('left', 5)
        await app.point('right', 6)
        await app.newMatch()
        expect(app.checkedValue('first-server')).toBe('false')
        await app.start()
        expect(app.server).toBe('left')
    })
})
