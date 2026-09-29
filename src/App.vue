<template>

    <game-set-up v-if="!gameStarted"
                 v-model:player-left="playerLeft"
                 v-model:player-right="playerRight"
                 v-model:swap-server="swapServer"
                 v-model:points-to-win="pointsToWin"
                 v-model:best-of="bestOf"
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
                        v-model:player-left="playerLeft"
                        v-model:player-right="playerRight"
                        v-model:newServer="newServer"
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
    import * as scoring from './scoring/match';

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
                match: scoring.newMatch(),
                // Names are kept per player (A starts on the left), so they follow the
                // players when ends change.
                names: {A: '', B: ''},
                firstServer: 'A',
                pointsToWin: 11,
                bestOf: 5,
                editMode: false,
                newServer: "left"
            }
        },

        computed: {
            ends: function () {
                return scoring.ends(this.match);
            },

            currentGame: function () {
                return scoring.currentGame(this.match);
            },

            scoreLeft: function () {
                return this.currentGame.score[this.ends.left];
            },

            scoreRight: function () {
                return this.currentGame.score[this.ends.right];
            },

            server: function () {
                return scoring.server(this.match) === this.ends.left ? 'left' : 'right';
            },

            // Finished games (including one just won), oriented to the current ends.
            gameScores: function () {
                return scoring.games(this.match)
                    .filter(game => game.winner)
                    .map(game => ({left: game.score[this.ends.left], right: game.score[this.ends.right]}));
            },

            gameWinner: function () {
                return this.currentGame.winner;
            },

            matchWinner: function () {
                return scoring.matchWinner(this.match);
            },

            playerLeft: {
                get: function () {
                    return this.names[this.ends.left];
                },
                set: function (name) {
                    this.names[this.ends.left] = name;
                }
            },

            playerRight: {
                get: function () {
                    return this.names[this.ends.right];
                },
                set: function (name) {
                    this.names[this.ends.right] = name;
                }
            },

            // The set-up screen picks the server by side; A is on the left at the start.
            swapServer: {
                get: function () {
                    return this.firstServer === 'B';
                },
                set: function (swap) {
                    this.firstServer = swap ? 'B' : 'A';
                }
            }
        },

        methods: {
            nextMatch: function () {
                // Whoever ended the match on the left starts the next one there.
                this.names = {A: this.playerLeft, B: this.playerRight};
                this.firstServer = 'A';
                this.match = scoring.newMatch();
                this.gameStarted = false;
            },

            startMatch: function () {
                this.match = scoring.newMatch({
                    firstServer: this.firstServer,
                    pointsToWin: this.pointsToWin,
                    bestOf: this.bestOf
                });
                this.gameStarted = true;
            },

            nextGame: function () {
                this.match = scoring.nextGame(this.match);
            },

            increaseLeft: function () {
                this.match = scoring.addPoint(this.match, this.ends.left);
            },

            decreaseLeft: function () {
                this.match = scoring.removePoint(this.match, this.ends.left);
            },

            increaseRight: function () {
                this.match = scoring.addPoint(this.match, this.ends.right);
            },

            decreaseRight: function () {
                this.match = scoring.removePoint(this.match, this.ends.right);
            },

            toggleEdit: function () {
                this.editMode = !this.editMode;
                if (this.editMode) {
                    this.newServer = this.server;
                } else {
                    const player = this.newServer === 'left' ? this.ends.left : this.ends.right;
                    this.match = scoring.correctServer(this.match, player);
                }
            },

            restart: function () {
                this.match = scoring.restart(this.match);
            }
        }
    }

</script>