
<template>
<div class="score-footer">

    <input v-if="editMode" 
      :value="playerLeft" 
      class="player-name-input"
      placeholder="Player name" 
      @input="$emit('update:playerLeft', $event.target.value)">

    <div v-if="!editMode" class="player-name">{{playerLeft}}</div>
   
    <a href="#" v-if="matchWinner" @click="finishMatch" >Finish match</a>

    <a href="#" v-if="gameWinner && !matchWinner" @click="startGame">Next game</a>

    <div v-if="!gameWinner && !matchWinner" class="game-scores">
        <game-score v-for="item of gameScores" :game-score="item" v-bind:key="item"/>
    </div>

    <input v-if="editMode" 
      :value="playerRight" 
      class="player-name-input"
      placeholder="Player name"
      @input="$emit('update:playerRight', $event.target.value)">

    <div v-if="!editMode" class="player-name">{{playerRight}}</div>
</div>

</template>
<script>
import gameScore from "./game-score.vue";

export default {
  components: {
    "game-score": gameScore
  },
  props: ["playerLeft", "playerRight", "gameScores", "gameWinner", "matchWinner", "startGame", "finishMatch", "editMode"]
};
</script>
