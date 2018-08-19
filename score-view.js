var app = new Vue({ 
    el: '#content',
    data: {
        score1: 0,
        score2: 0,
        games1: 0,
        games2: 0,
        gameScores: []
    },
    methods: {
        increaseLeft: function () {
            this.score1++;
            if (this.leftWinsGame()) {
                this.games1++;
                this.finishGame();
            }
        },

        decreaseLeft: function () {
            if (this.score1 > 0) {
                this.score1--;
            }
        },

        increaseRight: function() {
            this.score2++;
            if (this.rightWinsGame()) {
                this.games2++;
                this.finishGame();
            }
        },

        decreaseRight: function() {
            if (this.score2 > 0) {
                this.score2--;
            }
        },

        resetScore: function() {
            this.score1 = 0;
            this.score2 = 0;
        },

        finishGame: function() {
            this.gameScores.push({left: this.score1, right: this.score2});
            this.resetScore();
        },

        leftWinsGame: function() {
            return this.score1 >= 11 && this.score1 - this.score2 > 1;
        },

        rightWinsGame: function() {
            return this.score2 >= 11 && this.score2 - this.score1 > 1
        }
        
      }
});