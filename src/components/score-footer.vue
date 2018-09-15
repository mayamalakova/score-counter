
<template>
<div class="score-footer">
    <div class="player-name">{{playerLeft}}</div>
   
    <a href="#" v-if="matchWinner" v-on:click="finishMatch" >Finish match</a>

    <a href="#" v-if="gameWinner && !matchWinner" v-on:click="startGame">Next game</a>

    <div v-if="!gameWinner && !matchWinner" class="game-scores">
        <game-score v-for="item of gameScores" :game-score="item" v-bind:key="item"/>
    </div>
    <div class="player-name">{{playerRight}}</div>
</div>

</template>
<script>
import gameScore from "./game-score.vue";

export default {
  components: {
    "game-score": gameScore
  },
  props: ["playerLeft", "playerRight", "gameScores", "gameWinner", "matchWinner", "startGame", "finishMatch"]
};
</script>
