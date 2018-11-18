<template>
    <div class="score-footer">

        <div class="player-name left">{{playerLeft}}</div>

        <div>
            {{this.gamesLeft}} : {{this.gamesRight}}
        </div>

        <div class="player-name right">{{playerRight}}</div>
    </div>

</template>
<script>
    import gameScore from "./game-score.vue";

    export default {
        name: 'score-footer',
        components: {
            "game-score": gameScore
        },
        props: ["playerLeft", "playerRight", "gameScores"],
        data: function () {
            return {
            }
        },

        computed: {
            gamesLeft: function () {
                return this.gameScores.filter(x => x.left > x.right).length;
            },

            gamesRight: function () {
                return this.gameScores.filter(x => x.right > x.left).length;
            },
        }
    };
</script>
