<template>
    <div class="cover-all" v-if="$parent.matchWinner">
        <div>
            <table class="match-result">
                <tr>
                    <thead>{{playerLeft}}</thead>
                    <td v-for="score in gameScores">{{score.left}}</td>
                    <td>{{gameScores.filter(s => s.left > s.right).length}}</td>
                </tr>
                <tr>
                    <thead>{{playerRight}}</thead>
                    <td v-for="score in gameScores">{{score.right}}</td>
                    <td>{{gameScores.filter(s => s.right > s.left).length}}</td>
                </tr>
            </table>
            <div class="btn-continue" @click.stop="$emit('finish-game')">
                <div>New game</div>
                <div class="icon-arrow-right"></div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['playerLeft', 'playerRight', 'gameScores']
    }
</script>
