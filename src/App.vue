<template>

    <game-set-up v-if="!gameStarted"
                 :player-left.sync="playerLeft"
                 :player-right.sync="playerRight"
                 :swap-server.sync="swapServer"
                 @start-match="startMatch"/>

    <match-summary v-else-if="matchWinner"
                   :player-left="playerLeft" :player-right="playerRight" :game-scores="gameScores"
                   @next-match="nextMatch"/>

    <game-progress v-else-if="!editMode"
                   :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                   @increase-left="increaseLeft"
                   @decrease-left="decreaseLeft"
                   @increase-right="increaseRight"
                   @decrease-right="decreaseRight"
                   @toggle-edit="toggleEdit" @restart="restart"
                   @next-game="nextGame"/>

    <game-progress-edit v-else
                        :score-left="scoreLeft" :score-right="scoreRight"
                        :player-left.sync="playerLeft"
                        :player-right.sync="playerRight"
                        :newServer.sync="newServer"
                        @toggle-edit="toggleEdit" @restart="restart"/>
</template>
<script>
    import gameProgress from './components/game-progress.vue';
    import gameProgressEdit from './components/edit/game-progress-edit.vue';
    import scoreFooter from './components/score-footer.vue';
    import matchSummary from './components/match-summary.vue';
    import editButton from './components/top-toolbar.vue';
    import gameSetUp from './components/game-set-up.vue';
    import "./assets/score-view.styl";

    export default {
        components: {
            'game-progress': gameProgress,
            'game-progress-edit': gameProgressEdit,
            'score-footer': scoreFooter,
            'match-summary': matchSummary,
            'edit-button': editButton,
            'game-set-up': gameSetUp
        },

        data: () => {
            return {
                gameStarted: false,
                scoreLeft: 0,
                scoreRight: 0,
                gameScores: [],
                playerLeft: '',
                playerRight: '',
                gameWinner: false,
                matchWinner: false,
                editMode: false,
                newServer: "left",
                swapServer: false
            }
        },

        computed: {
            server: function () {
                let server = this.defaultServer;
                if (this.swapServer) {
                    return server === 'left' ? 'right' : 'left';
                }
                return server;
            },

            defaultServer: function () {
                let totalPoints = this.scoreLeft + this.scoreRight;
                if (this.scoreLeft < 10 || this.scoreRight < 10) {
                    let serveTurns = ~~(totalPoints / 2);
                    return serveTurns % 2 === 0 ? 'left' : 'right';
                }

                let totalSingleServes = this.scoreLeft - 10 + this.scoreRight - 10;
                return totalSingleServes % 2 === 0 ? 'left' : 'right';
            }
        },

        methods: {
            nextMatch: function () {
                this._resetScore();
                this.gameScores = [];
                this.gameWinner = false;
                this.matchWinner = false;
                this.gameStarted = false;
            },

            startMatch: function () {
                this.gameStarted = true;
            },

            nextGame: function () {
                this._swapSides();
                this._resetScore();
                this.gameWinner = false;
            },

            increaseLeft: function () {
                if (this.gameWinner) {
                    return;
                }
                this.scoreLeft++;
                if (this._leftWinsGame()) {
                    this._finishGame(this.playerLeft);
                }
            },

            decreaseLeft: function () {
                if (this.scoreLeft > 0) {
                    this.scoreLeft--;
                } else if (this._leftWonLastGame()) {
                    let gameScore = this.gameScores.pop();
                    this.scoreLeft = gameScore.right;
                    this.scoreRight = gameScore.left - 1;
                    this._swapSides();
                }
            },

            increaseRight: function () {
                if (this.gameWinner) {
                    return;
                }
                this.scoreRight++;
                if (this._rightWinsGame()) {
                    this._finishGame(this.playerRight);
                }
            },

            decreaseRight: function () {
                if (this.scoreRight > 0) {
                    this.scoreRight--;
                } else if (this._rightWonLastGame()){
                    let gameScore = this.gameScores.pop();
                    this.scoreLeft = gameScore.right - 1;
                    this.scoreRight = gameScore.left;
                    this._swapSides();
                }
            },

            _leftWonLastGame: function() {
                let gamesCount = this.gameScores.length;
                return gamesCount > 0 && this.gameScores[gamesCount -1].left > this.gameScores[gamesCount - 1].right;
            },

            _rightWonLastGame: function() {
                let gamesCount = this.gameScores.length;
                return gamesCount > 0 && this.gameScores[gamesCount -1].left < this.gameScores[gamesCount - 1].right;
            },

            toggleEdit: function () {
                this.editMode = !this.editMode;
                if (this.editMode) {
                    this.newServer = this.server;
                } else {
                    this.swapServer = this.newServer !== this.defaultServer;
                }
            },

            restart: function () {
                this._resetScore();
                this.swapServer = false;
            },

            _leftWinsGame: function () {
                return this.scoreLeft >= 11 && this.scoreLeft - this.scoreRight > 1;
            },

            _rightWinsGame: function () {
                return this.scoreRight >= 11 && this.scoreRight - this.scoreLeft > 1
            },

            _winsMatch: function () {
                let gamesLeft = this.gameScores.filter(g => g.left > g.right).length;
                return gamesLeft === 3 || this.gameScores.length - gamesLeft === 3;

            },

            _swapSides: function () {
                this.gameScores = this.gameScores.map(s => ({left: s.right, right: s.left}));
                [this.playerLeft, this.playerRight] = [this.playerRight, this.playerLeft];
            },

            _resetScore: function () {
                this.scoreLeft = 0;
                this.scoreRight = 0;
            },

            _finishGame: function (winner) {
                this.gameWinner = winner;
                this.gameScores.push({left: this.scoreLeft, right: this.scoreRight});

                if (this._winsMatch()) {
                    this.matchWinner = winner;
                }
            }
        }
    }

</script>