
Vue.component('score-footer', {
  props: ['playerLeft', 'playerRight', 'gameScores'],
  template: `<div class="score-footer">
                 <div class="player-name">{{playerLeft}}</div>
                 <div class="game-scores">
                     <div class="game-score" v-for="item of gameScores">({{item.left}} : {{item.right}})</div>
                 </div>
                 <div class="player-name">{{playerRight}}</div>
             </div>`
});