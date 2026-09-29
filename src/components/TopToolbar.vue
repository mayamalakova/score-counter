<script setup lang="ts">
const emit = defineEmits<{
    restart: []
    'toggle-edit': []
}>()
</script>

<template>
    <div class="top-toolbar">
        <div class="icon-rotate-ccw" @click="emit('restart')"></div>
        <div class="icon-menu1" @click="emit('toggle-edit')"></div>
    </div>
</template>
