Vue.component('game-summary', {
    props: ['gameWinner'],
    template: `
        <div class='game-winner'>{{this.gameWinner}} wins the game!</div>
     `
});