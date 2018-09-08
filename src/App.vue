<template>
    <div>
        <div v-if="(gameWinner && !matchWinner)" class='score-summary' >
            <game-summary :game-winner='gameWinner' ></game-summary>
            <button v-on:click="startGame" class="button-next">Next game</button>
        </div>

        <div v-if="matchWinner" class='score-summary' >
            <match-summary :match-winner="matchWinner" ></match-summary>
            <button v-on:click="finishMatch" class="button-next">Finish match</button>
        </div>
        <game-progress
                :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                v-on:increase-left="increaseLeft"
                v-on:decrease-left="decreaseLeft"
                v-on:increase-right="increaseRight"
                v-on:decrease-right="decreaseRight"></game-progress>

        <score-footer
                    :player-left="playerLeft" :player-right="playerRight" :game-scores="gameScores"></score-footer>
    </div>
</template>
<script>
    import gameProgress from './components/game-progress.vue';
    import scoreFooter from './components/score-footer.vue';
    import gameSummary from './components/game-summary.vue';
    import matchSummary from './components/match-summary.vue';

    export default {
        components: {
            'game-progress': gameProgress,
            'score-footer': scoreFooter,
            'game-summary': gameSummary,
            'match-summary': matchSummary
        },

        data: () => { return {
            scoreLeft: 0,
            scoreRight: 0,
            games1: 0,
            games2: 0,
            gameScores: [],
            playerLeft: 'Harimoto T.',
            playerRight: 'Zhang Z.',
            gameWinner: false,
            matchWinner: false,
            server: 'left'
        }},

        methods: {
            increaseLeft: function () {
                if (this.gameWinner) {
                    return;
                }
                this.scoreLeft++;
                if (this.leftWinsGame()) {
                    this.finishGame(this.playerLeft);
                }

                this.updateServe();
            },

            updateServe: function() {
                if (this.shouldSwapServe()) {
                    this.server = this.server === 'left' ? 'right' : 'left';
                }
            },

            shouldSwapServe: function() {
                if (this.scoreLeft >= 10 && this.scoreRight >= 10) {
                    return true;
                }

                return (this.scoreLeft + this.scoreRight) % 2 == 0;
            },

            finishGame: function(winner) {
                this.gameWinner = winner;
                this.gameScores.push({left: this.scoreLeft, right: this.scoreRight});
                

                if (this.winsMatch()) {
                    this.matchWinner = winner;
                }
            },

            finishMatch: function() {
                this.gameScores = [];
                this.matchWinner = false;
                this.startGame();
            },

            winsMatch: function() {
                let gamesLeft = this.gameScores.filter(g => g.left > g.right).length;
                if (gamesLeft == 3 || this.gameScores.length - gamesLeft == 3) {
                    return true;
                }
                return false;
            },

            decreaseLeft: function () {
                if (this.scoreLeft > 0) {
                    this.scoreLeft--;
                }
            },

            increaseRight: function() {
                if (this.gameWinner) {
                    return;
                }
                this.scoreRight++;
                if (this.rightWinsGame()) {
                    this.finishGame(this.playerRight);
                }

                this.updateServe();
            },

            decreaseRight: function() {
                if (this.scoreRight > 0) {
                    this.scoreRight--;
                }
            },

            resetScore: function() {
                this.scoreLeft = 0;
                this.scoreRight = 0;
            },

            resetServer: function() {
                this.server = 'left';
            },

            startGame: function() {
                this.swapSides();
                this.resetScore();
                this.resetServer();
                this.gameWinner = false;
            },

            swapSides: function() {
                this.gameScores = this.gameScores.map(s => ({left: s.right, right: s.left}));
                [this.playerLeft, this.playerRight] = [this.playerRight, this.playerLeft];
            },

            leftWinsGame: function() {
                return this.scoreLeft >= 11 && this.scoreLeft - this.scoreRight > 1;
            },

            rightWinsGame: function() {
                return this.scoreRight >= 11 && this.scoreRight - this.scoreLeft > 1
            }
        }
    }

</script>