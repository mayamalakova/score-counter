Vue.component('game-summary', {
    props: ['gameWinner', 'playerLeft', 'playerRight', 'gameScores'],
    template: `
    <div class='score-summary' >
        <div class='game-winner'>{{this.gameWinner}} wins the game!</div>
        <score-footer  :player-left='playerLeft' :player-right='playerRight' :game-scores='gameScores'></score-footer>
        <button v-on:click="$emit('next-game')" class="button-next">Next game</button>
     </div>
     `
});