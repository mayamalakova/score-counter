import Vue from 'vue';
import App from '../src/App.vue';
import { expect } from 'chai';

describe("The table tennis scoring app", function () {

    describe('Game progress', function () {
        it('should initialize app', function () {
            const vm = new Vue(App).$mount();
            expect(vm.gameStarted).to.equal(false);
            expect(vm.scoreLeft).to.equal(0);
            expect(vm.scoreRight).to.equal(0);
            expect(vm.gameScores).to.be.an('array').that.is.empty;
            expect(vm.playerLeft).to.equal('');
            expect(vm.playerRight).to.equal('');
            expect(vm.gameWinner).to.equal(false);
            expect(vm.matchWinner).to.equal(false);
            expect(vm.editMode).to.equal(false);
            expect(vm.newServer).to.equal("left");
            expect(vm.swapServer).to.equal(false);
        });
    });
});