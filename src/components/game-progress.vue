<template>
    <div class="score-container" >
        <div class="score-left" v-on:click="$emit('increase-left')">
            <div class="score-val">
                <span :class="valClass">{{scoreLeft}} </span>

                <span class="serve-indicator">{{server === 'left' ? "'" : ""}}</span>
            </div>
            <div class="btn-minus" v-on:click.stop="$emit('decrease-left')">-</div>
        </div>
        <div class="score-right" v-on:click="$emit('increase-right')">
            <div class="score-val">
                <span :class="valClass">{{scoreRight}} </span>
                
                <span class="serve-indicator">{{server === 'right' ? "'" : ""}}</span>
            </div>
            <div class="btn-minus" v-on:click.stop="$emit('decrease-right')">-</div>
        </div>
    </div>
</template>
<script>
export default {
    props: ['scoreLeft', 'scoreRight','server'],
    computed: {
        valClass: function() {
            let valueSize = (this.scoreLeft > 9 || this.scoreRight > 9) ? "small" : "normal";
            return "score-val-number " + valueSize;
        }
  }
};

</script>
