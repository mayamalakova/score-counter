<script setup lang="ts">
import { useFullscreen } from '../fullscreen'
import Icon from './Icon.vue'

const { supported, active, toggle } = useFullscreen()
</script>

<template>
    <button
        v-if="supported"
        class="fullscreen"
        type="button"
        :aria-label="active ? 'Exit full screen' : 'Full screen'"
        @click="toggle"
    >
        <Icon :name="active ? 'exitFullscreen' : 'fullscreen'" />
    </button>
</template>
