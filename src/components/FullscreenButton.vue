<script setup lang="ts">
import { useFullscreen } from '../fullscreen'
import Icon from './Icon.vue'
import { useMessages } from '../i18n'

const { supported, active, toggle } = useFullscreen()
const t = useMessages()
</script>

<template>
    <button
        v-if="supported"
        type="button"
        :aria-label="active ? t.exitFullScreen : t.fullScreen"
        @click="toggle"
    >
        <Icon :name="active ? 'exitFullscreen' : 'fullscreen'" />
    </button>
</template>
