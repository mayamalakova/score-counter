<template>
    <div class="cover-all" >
        <div class="btn-continue" @click.stop="$emit('click')">
            <div>Next</div>
            <div class="icon-arrow-right"></div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'btn-next-game',
        props: {
        }
    }
</script>