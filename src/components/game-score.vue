<template>
    <div class="game-score">
        ({{gameScore.left}} : {{gameScore.right}})
    </div>
</template>

<script>
export default {
    props: ['gameScore']
}
</script>
