<template>
    <div class="score-container">
        <div class="score-left" @click="$emit(Events.INCREASE_LEFT)">
            <div class="score-val">
                <span :class="valClass">{{scoreLeft}} </span>

                <span class="serve-indicator">{{server === 'left' ? "'" : ""}}</span>
            </div>
            <div class="btn-minus" @click.stop="$emit(Events.DECREASE_LEFT)">-</div>
        </div>
        <div class="score-right" @click="$emit(Events.INCREASE_RIGHT)">
            <div class="score-val">
                <span :class="valClass">{{scoreRight}} </span>

                <span class="serve-indicator">{{server === 'right' ? "'" : ""}}</span>
            </div>
            <div class="btn-minus" @click.stop="$emit(Events.DECREASE_RIGHT)">-</div>
        </div>
        <div class="cover-all" v-if="$parent.gameWinner && !$parent.matchWinner">
            <div class="btn-continue" @click.stop="$emit(Events.NEW_GAME)">
                <div>Next</div>
                <div class="icon-arrow-right"></div>
            </div>
        </div>
    </div>
</template>
<script>

    import Events from '../utils/events';
    export default {
        props: ['scoreLeft', 'scoreRight', 'server'],
        data: function () {
            return {
                Events: Events
            };
        },
        computed: {
            valClass: function () {
                let valueSize = (this.scoreLeft > 9 || this.scoreRight > 9) ? "small" : "normal";
                return "score-val-number " + valueSize;
            }
        }
    };

    export {Events};

</script>
