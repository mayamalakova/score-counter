Vue.component('game-progress', {
    props: ['scoreLeft', 'scoreRight'],
    template: `
    <div class="score-container" >
         <div class="score-left" v-on:click="$emit('increase-left')">
             <div class="score-val">
                 {{scoreLeft}}
             </div>
             <div class="btn-minus" v-on:click.stop="$emit('decrease-left')">-</div>
         </div>
         <div class="score-right" v-on:click="$emit('increase-right')">
             <div class="score-val">
                 {{scoreRight}}
             </div>
             <div class="btn-minus" v-on:click.stop="$emit('decrease-right')">-</div>
         </div>
     </div>
     `
});
