var app = new Vue({ 
    el: '#score-container',
    data: {
        score1: 0,
        score2: 0,
    },
    methods: {
        increaseLeft: function () {
            this.score1++;
        },

        decreaseLeft: function () {
            if (this.score1 > 0) {
                this.score1--;
            }
        },

        increaseRight: function() {
            this.score2++;
        },

        decreaseRight: function() {
            if (this.score2 > 0) {
                this.score2--;
            }
        }
        
      }
});