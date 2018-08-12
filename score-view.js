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

        increaseRight: function() {
            this.score2++;
        }
        
      }
});