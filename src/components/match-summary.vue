<template>
    <div class="cover-all" v-if="$parent.matchWinner">
        <div class="match-summary-box">
            <table class="match-result">
                <tr>
                    <thead class="player-name">{{playerLeft}}</thead>
                    <td v-for="score in gameScores">{{score.left}}</td>
                    <td class="games-result">{{gameScores.filter(s => s.left > s.right).length}}</td>
                </tr>
                <tr>
                    <thead class="player-name">{{playerRight}}</thead>
                    <td v-for="score in gameScores">{{score.right}}</td>
                    <td class="games-result">{{gameScores.filter(s => s.right > s.left).length}}</td>
                </tr>
            </table>
            <div class="btn-continue" @click.stop="$emit(Events.FINISH_GAME)">
                <div>New game</div>
                <div class="icon-arrow-right"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import Events from '../utils/events'
    export default {
        props: ['playerLeft', 'playerRight', 'gameScores'],
        data: function() {
            return {Events: Events};
        }
    }
</script>
