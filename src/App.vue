<template>
    <div class="container" @keyup.enter="toggleEdit">

        <edit-button v-if="!matchWinner" :toggle-edit="toggleEdit" :restart="restart"/>
        
        <game-progress v-if="!editMode && !matchWinner"
                :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                @increase-left="increaseLeft"
                @decrease-left="decreaseLeft"
                @increase-right="increaseRight"
                @decrease-right="decreaseRight"
                @new-game="startGame"
        />

        <game-progress-edit v-if="editMode && !matchWinner"
                :score-left="scoreLeft" 
                :score-right="scoreRight"
                />

        <match-summary v-if="matchWinner" :player-left="playerLeft" :player-right="playerRight" :game-scores="gameScores"
            @finish-game="finishMatch"/>

        <score-footer v-if="!matchWinner"
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
    import gameProgressEdit from './components/game-progress-edit.vue';
    import scoreFooter from './components/score-footer.vue';
    import gameSummary from './components/game-summary.vue';
    import matchSummary from './components/match-summary.vue';
    import editButton from './components/top-toolbar.vue';
    import "./assets/score-view.styl";

    export default {
        components: {
            'game-progress': gameProgress,
            'game-progress-edit': gameProgressEdit,
            'score-footer': scoreFooter,
            'game-summary': gameSummary,
            'match-summary': matchSummary,
            'edit-button': editButton
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
            editMode: false,
            newServer: null,
            swapServer: false
        }},

        computed: {
            server: function() {
                let server = this.defaultServer;
                if (this.swapServer) {
                    return server == 'left' ? 'right' : 'left';
                }
                return server;
            },

            defaultServer: function() {
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

            startGame: function() {
                this.swapSides();
                this.resetScore();
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
                if (this.editMode) {
                    let currentServer = this.server;
                    this.newServer = currentServer;
                } else {
                    this.swapServer = this.newServer != this.defaultServer;
                }
            },

            restart: function() {
                this.resetScore();
                this.swapServer = false;
            },

            
        }
    }

</script>