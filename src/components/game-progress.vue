<template>
    <div class="score-container">
        <player-score :val-class="valClass"
            :score="scoreLeft" :server="server" side="left"
            @increase="$emit(Events.INCREASE_LEFT)"
            @decrease="$emit(Events.DECREASE_LEFT)"/>

        <player-score :val-class="valClass"
            :score="scoreRight" :server="server" side="right"
            @increase="$emit(Events.INCREASE_RIGHT)"
            @decrease="$emit(Events.DECREASE_RIGHT)"/>

        <btn-next-game v-if="$parent.gameWinner && !$parent.matchWinner"
            @click="$emit(Events.NEXT_GAME)"/>
    </div>
</template>
<script>

    import Events from '../utils/events';
    import PlayerScore from "./PlayerScore.vue";
    import BtnNextGame from "./BtnNextGame.vue";

    export default {
        components: {BtnNextGame, PlayerScore},
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

</script>
