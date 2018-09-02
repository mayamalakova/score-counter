Vue.component('game-progress', {
    props: ['scoreLeft', 'scoreRight','server'],
    template: `
    <div class="score-container" >
         <div class="score-left" v-on:click="$emit('increase-left')">
             <div class="score-val">
                <span class="score-val-number">{{scoreLeft}} </span>
                 <span class="serve-indicator">{{server === 'left' ? "'" : ""}}</span>
             </div>
             <div class="btn-minus" v-on:click.stop="$emit('decrease-left')">-</div>
         </div>
         <div class="score-right" v-on:click="$emit('increase-right')">
             <div class="score-val">
                 <span class="score-val-number">{{scoreRight}} </span>
                 <span class="serve-indicator">{{server === 'right' ? "'" : ""}}</span>
             </div>
             <div class="btn-minus" v-on:click.stop="$emit('decrease-right')">-</div>
         </div>
     </div>
     `
});
