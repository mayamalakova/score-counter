import Vue from 'vue';
import App from '../src/App.vue';
import { expect } from 'chai';

describe("The table tennis scoring app", function () {

    describe('Game progress', function () {
        beforeEach(function() {
            this.app = new Vue(App);
        });

        it('should initialize app', function () {
            expect(this.app.gameStarted).to.equal(false);
            expect(this.app.scoreLeft).to.equal(0);
            expect(this.app.scoreRight).to.equal(0);
            expect(this.app.gameScores).to.be.an('array').that.is.empty;
            expect(this.app.playerLeft).to.equal('');
            expect(this.app.playerRight).to.equal('');
            expect(this.app.gameWinner).to.equal(false);
            expect(this.app.matchWinner).to.equal(false);
            expect(this.app.editMode).to.equal(false);
            expect(this.app.newServer).to.equal("left");
            expect(this.app.swapServer).to.equal(false);
        });

        it('should increase score', function () {
            this.app.increaseLeft();
            expect(this.app.scoreLeft).to.equal(1);

        });

        describe('when decreasing', function() {
            it('should decrease score', function () {
                this.app.scoreLeft = 1;
                this.app.decreaseLeft();
                expect(this.app.scoreLeft).to.equal(0);
            });

            describe('when score is 0-0', function() {
                it('should ignore if player did not win last game', function () {
                    this.app.gameScores.push({left: 0, right: 11});
                    this.app.decreaseLeft();

                    expect(this.app.gameScores.length).to.equal(1);
                    expect(this.app.scoreLeft).to.equal(0);
                    expect(this.app.scoreRight).to.equal(0);
                });

                it('should reduce left player games if they won last game', function () {
                    this.app.gameScores.push({left: 11, right: 0});
                    this.app.decreaseLeft();

                    expect(this.app.gameScores).to.be.an('array').that.is.empty;
                    expect(this.app.scoreLeft).to.equal(0);
                    expect(this.app.scoreRight).to.equal(10);
                });

                it('should reduce right player games if they won last game', function () {
                    this.app.gameScores.push({left: 0, right: 11});
                    this.app.decreaseRight();

                    expect(this.app.gameScores).to.be.an('array').that.is.empty;
                    expect(this.app.scoreLeft).to.equal(10);
                    expect(this.app.scoreRight).to.equal(0);
                });
            })
        })

    });
});