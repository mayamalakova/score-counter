<script setup lang="ts">
import type { Side } from './types'

defineProps<{
    server: Side
    side: Side
}>()
</script>

<template>
    <span class="serve-indicator">{{ server === side ? "'" : "" }}</span>
</template>
