<template>
    <div class="score-footer">

        <input class="player-name-input"
               :value="playerLeft"
               placeholder="Player name"
               @input="$emit('updateLeft', $event.target.value)">

        <div>
            {{this.gamesLeft}} : {{this.gamesRight}}
        </div>

        <input class="player-name-input"
               :value="playerRight"
               placeholder="Player name"
               @input="$emit('updateRight', $event.target.value)">

    </div>

</template>
<script>
    import Events from '../utils/events'

    export default {
        name: 'score-footer-edit',
        components: {
        },
        props: ["playerLeft", "playerRight", "gameScores"],
        data: function () {
            return {
                Events: Events
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
