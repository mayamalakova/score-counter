<template>
    <div class="container" @keyup.enter="toggleEdit">
        <div class="edit-button">
            <div v-on:click="toggleEdit">...</div>
        </div>
        <game-progress
                :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                v-on:increase-left="increaseLeft"
                v-on:decrease-left="decreaseLeft"
                v-on:increase-right="increaseRight"
                v-on:decrease-right="decreaseRight"
                :edit-mode="editMode"></game-progress>

        <score-footer
                    :player-left.sync="playerLeft"
                    :player-right.sync="playerRight" 
                    :game-scores="gameScores"
                    :game-winner="gameWinner"
                    :match-winner="matchWinner"
                    :start-game="startGame"
                    :finish-match="finishMatch"
                    :edit-mode="editMode"
                    ></score-footer>
    </div>
</template>
<script>
    import gameProgress from './components/game-progress.vue';
    import scoreFooter from './components/score-footer.vue';
    import gameSummary from './components/game-summary.vue';
    import matchSummary from './components/match-summary.vue';
    import "./assets/score-view.styl";

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
            editMode: false
        }},

        computed: {
            server: function() {
                let totalPoints = this.scoreLeft + this.scoreRight;
                if (this.scoreLeft < 10 || this.scoreRight < 10) {
                    let serveTurns = ~~(totalPoints /2);
                    return serveTurns % 2 == 0 ? 'left' : 'right';
                }

                let totalSingleServes = this.scoreLeft - 10 + this.scoreRight - 10;
                return totalSingleServes % 2 == 0 ? 'left' :'right';
            }
        },

        methods: {
            increaseLeft: function () {
                if (this.gameWinner) {
                    return;
                }
                this.scoreLeft++;
                if (this.leftWinsGame()) {
                    this.finishGame(this.playerLeft);
                }
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
            },

            toggleEdit: function() {
                this.editMode = !this.editMode;
            }
        }
    }

</script>