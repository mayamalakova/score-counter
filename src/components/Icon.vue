<script setup lang="ts">
// A handful of stroke icons, inline so they need no icon font.
const paths = {
    restart: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
    edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
    next: ['M5 12h14', 'm12 5 7 7-7 7'],
    minus: ['M5 12h14'],
    undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
    fullscreen: [
        'M8 3H5a2 2 0 0 0-2 2v3',
        'M21 8V5a2 2 0 0 0-2-2h-3',
        'M3 16v3a2 2 0 0 0 2 2h3',
        'M16 21h3a2 2 0 0 0 2-2v-3'
    ],
    exitFullscreen: [
        'M8 3v3a2 2 0 0 1-2 2H3',
        'M21 8h-3a2 2 0 0 1-2-2V3',
        'M3 16h3a2 2 0 0 1 2 2v3',
        'M16 21v-3a2 2 0 0 1 2-2h3'
    ],
    qr: [
        'M3 3h7v7H3z',
        'M14 3h7v7h-7z',
        'M3 14h7v7H3z',
        'M14 14h3v3h-3z',
        'M21 14v.01',
        'M14 21h7',
        'M21 17v4'
    ]
} as const

defineProps<{
    name: keyof typeof paths
}>()
</script>

<template>
    <svg
        class="icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <path v-for="d in paths[name]" :key="d" :d="d" />
    </svg>
</template>

<style scoped>
.icon {
    width: 1.25em;
    height: 1.25em;
    flex: none;
}
</style>
