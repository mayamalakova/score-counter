Vue.component('match-summary', {
    props: ['matchWinner'],
    template: `
        <div class='game-winner'>{{this.matchWinner}} wins the match!</div>
     `
});