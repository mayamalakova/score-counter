Vue.component('game-score', {
    props: ['gameScore'],
    template:
    `<div class="game-score">
        ({{gameScore.left}} : {{gameScore.right}})
    </div>`
});

Vue.component('score-footer', {
  props: ['playerLeft', 'playerRight', 'gameScores'],
  template: `<div class="score-footer">
                 <div class="player-name">{{playerLeft}}</div>
                 <div class="game-scores">
                     <game-score v-for="item of gameScores" :game-score="item" />
                 </div>
                 <div class="player-name">{{playerRight}}</div>
             </div>`
});