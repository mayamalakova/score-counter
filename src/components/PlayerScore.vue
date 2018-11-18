<template>
    <div :class="containerClass" @click="$emit('increase')">
        <div class="score-val">
            <span :class="valClass">{{score}} </span>

            <server-indicator :server="server" :side="side"/>
        </div>
        <div class="btn-minus" @click.stop="$emit('decrease')">-</div>
    </div>
</template>
<script>
    import ServerIndicator from "./ServerIndicator.vue"

    export default {
        name: 'player-score',
        components: {ServerIndicator},
        props: ["score", "server", "side", "valClass"],
        computed: {
            containerClass: function() {return `score-${this.side}`;}
        }
    }
</script>