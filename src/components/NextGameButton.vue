<script setup lang="ts">
const emit = defineEmits<{
    click: []
}>()
</script>

<template>
    <div class="cover-all">
        <div class="btn-continue" @click.stop="emit('click')">
            <div>Next</div>
            <div class="icon-arrow-right"></div>
        </div>
    </div>
</template>
