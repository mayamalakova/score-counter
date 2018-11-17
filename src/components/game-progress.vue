<template>
    <div class="container" @keyup.enter="toggleEdit">
        <actions-bar @toggle-edit="$emit(Events.TOGGLE_EDIT)" @restart="$emit(Events.RESTART)"/>

        <div class="score-container">
            <player-score :val-class="valClass"
                :score="scoreLeft" :server="server" side="left"
                @increase="$emit(Events.INCREASE_LEFT)"
                @decrease="$emit(Events.DECREASE_LEFT)"/>

            <player-score :val-class="valClass"
                :score="scoreRight" :server="server" side="right"
                @increase="$emit(Events.INCREASE_RIGHT)"
                @decrease="$emit(Events.DECREASE_RIGHT)"/>

            <btn-next-game v-if="$parent.gameWinner"
                @click="$emit(Events.NEXT_GAME)"/>
        </div>

        <score-footer
                :player-left="$parent.playerLeft"
                :player-right="$parent.playerRight"
                :game-scores="$parent.gameScores" />
    </div>
</template>
<script>

    import Events from '../utils/events';
    import PlayerScore from "./PlayerScore.vue";
    import BtnNextGame from "./BtnNextGame.vue";
    import actionsBar from './top-toolbar.vue';
    import scoreFooter from './score-footer.vue';

    export default {

        components: {BtnNextGame, PlayerScore, actionsBar, scoreFooter},
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
