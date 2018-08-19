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
            if (this.score1 >= 11 && this.score1 - this.score2 > 1) {
                this.games1++;
                this.gameScores.push({left: this.score1, right: this.score2});
                this.score1 = 0;
                this.score2 = 0;
            }
        },

        decreaseLeft: function () {
            if (this.score1 > 0) {
                this.score1--;
            }
        },

        increaseRight: function() {
            this.score2++;
            if (this.score2 >= 11 && this.score2 - this.score1 > 1) {
                this.games2++;
                this.gameScores.push({left: this.score1, right: this.score2});
                this.score1 = 0;
                this.score2 = 0;
            }
        },

        decreaseRight: function() {
            if (this.score2 > 0) {
                this.score2--;
            }
        }
        
      }
});