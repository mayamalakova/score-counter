<template>
    <div class="container" @keyup.enter="$emit(Events.TOGGLE_EDIT)">
        <actions-bar @toggle-edit="$emit(Events.TOGGLE_EDIT)" @restart="$emit(Events.RESTART)"/>

        <div class="score-container">
            <player-score :val-class="valClass"
                          :score="scoreLeft" :server="server" side="left"/>

            <player-score :val-class="valClass"
                          :score="scoreRight" :server="server" side="right"/>
        </div>

        <score-footer-edit
                :player-left="playerLeft"
                :player-right="playerRight"
                :game-scores="$parent.gameScores"
                @update:playerLeft="$emit(Events.UPDATE_PLAYER_LEFT, $event)"
                @update:playerRight="$emit(Events.UPDATE_PLAYER_RIGHT, $event)"/>
    </div>

</template>
<script>
    import Events from '../../utils/events';
    import actionsBar from '../top-toolbar.vue';
    import ScoreFooterEdit from "./score-footer-edit.vue";
    import PlayerScore from "../PlayerScore.vue";

    export default {
        components: {PlayerScore, actionsBar, ScoreFooterEdit},
        props: ['scoreLeft', 'scoreRight', 'server', 'playerLeft', 'playerRight'],
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
