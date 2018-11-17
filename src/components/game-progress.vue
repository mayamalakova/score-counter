<template>
    <div class="score-container">
        <div class="score-left" @click="$emit(Events.INCREASE_LEFT)">
            <div class="score-val">
                <span :class="valClass">{{scoreLeft}} </span>

                <server-indicator :server="server" side="left"/>
            </div>
            <div class="btn-minus" @click.stop="$emit(Events.DECREASE_LEFT)">-</div>
        </div>
        <div class="score-right" @click="$emit(Events.INCREASE_RIGHT)">
            <div class="score-val">
                <span :class="valClass">{{scoreRight}} </span>

                <server-indicator :server="server" side="right"/>
            </div>
            <div class="btn-minus" @click.stop="$emit(Events.DECREASE_RIGHT)">-</div>
        </div>
        <div class="cover-all" v-if="$parent.gameWinner && !$parent.matchWinner">
            <div class="btn-continue" @click.stop="$emit(Events.NEXT_GAME)">
                <div>Next</div>
                <div class="icon-arrow-right"></div>
            </div>
        </div>
    </div>
</template>
<script>

    import Events from '../utils/events';
    import ServerIndicator from "./ServerIndicator.vue";

    export default {
        components: {ServerIndicator},
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
