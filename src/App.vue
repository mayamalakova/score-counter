<template>
    <div>
        <game-progress
                :score-left="scoreLeft" :score-right="scoreRight" :server="server"
                v-on:increase-left="increaseLeft"
                v-on:decrease-left="decreaseLeft"
                v-on:increase-right="increaseRight"
                v-on:decrease-right="decreaseRight"></game-progress>
    </div>
</template>
<script>
    import gameProgress from './game-progress.vue';

    const App = {
        components: {
            'game-progress': gameProgress
        }
    }

    export default App;
</script>