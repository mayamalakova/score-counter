<template>
    <div class="container" @keyup.enter="toggleEdit">

        <edit-button v-if="!matchWinner&&gameStarted" @toggle-edit="toggleEdit" @restart="restart"/>

        <game-progress v-if="!editMode && !matchWinner && gameStarted"
                       :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                       @increase-left="increaseLeft"
                       @decrease-left="decreaseLeft"
                       @increase-right="increaseRight"
                       @decrease-right="decreaseRight"
                       @next-game="nextGame"
        />

        <game-progress-edit v-if="editMode && !matchWinner && gameStarted"
                            :score-left="scoreLeft"
                            :score-right="scoreRight"
        />

        <match-summary v-if="matchWinner && gameStarted" :player-left="playerLeft" :player-right="playerRight"
                       :game-scores="gameScores"
                       @next-match="nextMatch"/>

        <score-footer v-if="!matchWinner && gameStarted"
                      :player-left.sync="playerLeft"
                      :player-right.sync="playerRight"
                      :game-scores="gameScores"
                      :edit-mode="editMode"
        ></score-footer>

        <game-set-up v-if="!gameStarted"
                     :player-left.sync="playerLeft"
                     :player-right.sync="playerRight"
                     :swap-server.sync="swapServer"
                     @start-match="startMatch"/>

    </div>
</template>
<script>
    import gameProgress from './components/game-progress.vue';
    import gameProgressEdit from './components/game-progress-edit.vue';
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
                this.gameScores = [];
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
                }
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