
<template>
<div class="score-footer">

    <input v-if="editMode" 
      :value="playerLeft" 
      class="player-name-input"
      placeholder="Player name" 
      @input="$emit('update:playerLeft', $event.target.value)">

    <div v-if="!editMode" class="player-name left">{{playerLeft}}</div>
   
    <!--<a href="#" v-if="matchWinner" @click="finishMatch" >Finish match</a>-->

    <!--<a v-if="gameWinner && !matchWinner" @click="startGame">-->
        <!--<span class="icon-chevron-right"> </span>-->
    <!--</a>-->

    <div v-if="!matchWinner" class="game-scores">
        {{this.gamesLeft}} : {{this.gamesRight}}
    </div>
    <div v-if="matchWinner" class="game-scores">
        <game-score v-for="item of gameScores" :game-score="item" v-bind:key="item"/>
    </div>

    <input v-if="editMode" 
      :value="playerRight" 
      class="player-name-input"
      placeholder="Player name"
      @input="$emit('update:playerRight', $event.target.value)">

    <div v-if="!editMode" class="player-name right">{{playerRight}}</div>
</div>

</template>
<script>
import gameScore from "./game-score.vue";

export default {
  components: {
    "game-score": gameScore
  },
  props: ["playerLeft", "playerRight", "gameScores", "gameWinner", "matchWinner", "startGame", "finishMatch", "editMode"],

  computed: {
      gamesLeft: function() {
          return this.gameScores.filter(x => x.left > x.right).length;
      },

      gamesRight: function() {
          return this.gameScores.filter(x => x.right > x.left).length;
      },
  }
};
</script>
