

var app = new Vue({
    el: '#content',
    data: {
        scoreLeft: 0,
        scoreRight: 0,
        games1: 0,
        games2: 0,
        gameScores: [],
        playerLeft: 'Harimoto T.',
        playerRight: 'Zhang Z.',
        gameWinner: false
    },
    methods: {
        increaseLeft: function () {
            if (this.gameWinner) {
                return;
            }
            this.scoreLeft++;
            if (this.leftWinsGame()) {
                this.gameWinner = this.playerLeft;
                this.gameScores.push({left: this.scoreLeft, right: this.scoreRight});
            }
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
                this.gameWinner = this.playerRight;
                this.gameScores.push({left: this.scoreLeft, right: this.scoreRight});
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
        }

      }
});
