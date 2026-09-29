import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import { describe, beforeEach, it, expect } from 'vitest';

describe("The table tennis scoring app", function () {

    describe('Game progress', function () {
        let app;

        beforeEach(function() {
            app = mount(App).vm;
        });

        function score(times, action) {
            for (let i = 0; i < times; i++) {
                action();
            }
        }

        it('should initialize app', function () {
            expect(app.gameStarted).toBe(false);
            expect(app.scoreLeft).toBe(0);
            expect(app.scoreRight).toBe(0);
            expect(app.gameScores).toEqual([]);
            expect(app.playerLeft).toBe('');
            expect(app.playerRight).toBe('');
            expect(app.gameWinner).toBeFalsy();
            expect(app.matchWinner).toBeFalsy();
            expect(app.editMode).toBe(false);
            expect(app.newServer).toBe("left");
            expect(app.server).toBe("left");
        });

        it('should increase score', function () {
            app.increaseLeft();
            expect(app.scoreLeft).toBe(1);

        });

        describe('when decreasing', function() {
            it('should decrease score', function () {
                app.increaseLeft();
                app.decreaseLeft();
                expect(app.scoreLeft).toBe(0);
            });

            describe('when score is 0-0', function() {
                // After a game the players change ends, so the player who
                // won on the left is on the right in the next game.

                it('should ignore if player did not win last game', function () {
                    score(11, app.increaseLeft);
                    app.nextGame();
                    app.decreaseLeft();

                    expect(app.gameScores.length).toBe(1);
                    expect(app.scoreLeft).toBe(0);
                    expect(app.scoreRight).toBe(0);
                });

                it('should reduce left player games if they won last game', function () {
                    score(11, app.increaseRight);
                    app.nextGame();
                    app.decreaseLeft();

                    expect(app.gameScores).toEqual([]);
                    expect(app.scoreLeft).toBe(0);
                    expect(app.scoreRight).toBe(10);
                });

                it('should reduce right player games if they won last game', function () {
                    score(11, app.increaseLeft);
                    app.nextGame();
                    app.decreaseRight();

                    expect(app.gameScores).toEqual([]);
                    expect(app.scoreLeft).toBe(10);
                    expect(app.scoreRight).toBe(0);
                });
            })
        })

    });

    describe('Fixed legacy bugs', function () {
        let app;

        beforeEach(function() {
            app = mount(App).vm;
        });

        function winGame(action) {
            for (let i = 0; i < 11; i++) {
                action();
            }
        }

        it('should finish a game when the player names are empty', function () {
            app.startMatch();
            winGame(app.increaseLeft);

            expect(app.gameWinner).toBeTruthy();
            expect(app.gameScores).toEqual([{left: 11, right: 0}]);
        });

        it('should start a new match with the left player serving, as set-up shows', function () {
            app.swapServer = true;
            app.startMatch();
            expect(app.server).toBe('right');

            winGame(app.increaseLeft);
            app.nextGame();
            winGame(app.increaseRight);
            app.nextGame();
            winGame(app.increaseLeft);
            expect(app.matchWinner).toBeTruthy();

            app.nextMatch();
            app.startMatch();
            expect(app.server).toBe('left');
        });

        it('should not flip the server when a later game is restarted', function () {
            app.startMatch();
            // Correct game 1: the right player is actually serving first.
            app.toggleEdit();
            app.newServer = 'right';
            app.toggleEdit();

            winGame(app.increaseLeft);
            app.nextGame();
            // The corrected first server receives first in game 2. After the change
            // of ends the player who received is on the right.
            expect(app.server).toBe('right');

            app.increaseLeft();
            app.restart();
            expect(app.server).toBe('right');
        });

        it('should change ends in the deciding game when a player reaches 5', function () {
            app.playerLeft = 'Ana';
            app.playerRight = 'Ben';
            app.startMatch();
            // The players change ends each game, so winning on the left alternates the winner: 2-2.
            for (let game = 0; game < 4; game++) {
                winGame(app.increaseLeft);
                app.nextGame();
            }
            score5(app.increaseLeft);

            expect(app.playerLeft).toBe('Ben');
            expect(app.playerRight).toBe('Ana');
            expect(app.scoreRight).toBe(5);
        });

        function score5(action) {
            for (let i = 0; i < 5; i++) {
                action();
            }
        }
    });
});
