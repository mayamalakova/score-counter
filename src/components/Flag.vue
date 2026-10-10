<script setup lang="ts">
import type { Language } from '../i18n'

// Inline flags: emoji flags don't show on Windows or every phone. English is the UK flag,
// simplified (no offset red diagonals) since it's drawn about 24px wide.
defineProps<{
    language: Language
}>()
</script>

<template>
    <svg v-if="language === 'en'" class="flag" viewBox="0 0 60 30" aria-hidden="true">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0l60 30M60 0 0 30" stroke="#fff" stroke-width="6" />
        <path d="M0 0l60 30M60 0 0 30" stroke="#c8102e" stroke-width="2" />
        <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10" />
        <path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6" />
    </svg>
    <svg v-else-if="language === 'cs'" class="flag" viewBox="0 0 900 600" aria-hidden="true">
        <rect width="900" height="600" fill="#d7141a" />
        <rect width="900" height="300" fill="#fff" />
        <path d="M450 300 0 0v600z" fill="#11457e" />
    </svg>
    <svg v-else class="flag" viewBox="0 0 5 3" aria-hidden="true">
        <rect width="5" height="1" fill="#fff" />
        <rect y="1" width="5" height="1" fill="#00966e" />
        <rect y="2" width="5" height="1" fill="#d62612" />
    </svg>
</template>

<style scoped>
.flag {
    width: 1.5em;
    height: 1em;
    flex: none;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.25);
}
</style>
