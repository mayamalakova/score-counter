import { mount } from '@vue/test-utils';
import App from '../src/App.vue';
import { describe, beforeEach, it, expect } from 'vitest';

describe("The table tennis scoring app", function () {

    describe('Game progress', function () {
        let app;

        beforeEach(function() {
            app = mount(App).vm;
        });

        it('should initialize app', function () {
            expect(app.gameStarted).toBe(false);
            expect(app.scoreLeft).toBe(0);
            expect(app.scoreRight).toBe(0);
            expect(app.gameScores).toEqual([]);
            expect(app.playerLeft).toBe('');
            expect(app.playerRight).toBe('');
            expect(app.gameWinner).toBe(false);
            expect(app.matchWinner).toBe(false);
            expect(app.editMode).toBe(false);
            expect(app.newServer).toBe("left");
            expect(app.swapServer).toBe(false);
        });

        it('should increase score', function () {
            app.increaseLeft();
            expect(app.scoreLeft).toBe(1);

        });

        describe('when decreasing', function() {
            it('should decrease score', function () {
                app.scoreLeft = 1;
                app.decreaseLeft();
                expect(app.scoreLeft).toBe(0);
            });

            describe('when score is 0-0', function() {
                it('should ignore if player did not win last game', function () {
                    app.gameScores.push({left: 0, right: 11});
                    app.decreaseLeft();

                    expect(app.gameScores.length).toBe(1);
                    expect(app.scoreLeft).toBe(0);
                    expect(app.scoreRight).toBe(0);
                });

                it('should reduce left player games if they won last game', function () {
                    app.gameScores.push({left: 11, right: 0});
                    app.decreaseLeft();

                    expect(app.gameScores).toEqual([]);
                    expect(app.scoreLeft).toBe(0);
                    expect(app.scoreRight).toBe(10);
                });

                it('should reduce right player games if they won last game', function () {
                    app.gameScores.push({left: 0, right: 11});
                    app.decreaseRight();

                    expect(app.gameScores).toEqual([]);
                    expect(app.scoreLeft).toBe(10);
                    expect(app.scoreRight).toBe(0);
                });
            })
        })

    });
});
