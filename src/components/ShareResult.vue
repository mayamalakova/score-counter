<script setup lang="ts">
import { computed } from 'vue'
import { renderSVG } from 'uqr'
import { useMessages } from '../i18n'

const props = defineProps<{
    /** The link that opens the app on this result. */
    link: string
}>()

const emit = defineEmits<{
    close: []
}>()

const t = useMessages()

// uqr builds the SVG from our own link only, so rendering it as HTML is safe.
const qrCode = computed(() => renderSVG(props.link, { ecc: 'M', border: 2 }))
</script>

<template>
    <div class="backdrop">
        <section class="card" aria-labelledby="share-title">
            <h2 id="share-title">{{ t.shareResult }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="qr" role="img" :aria-label="t.qrCodeLabel" v-html="qrCode"></div>
            <p>{{ t.scanHint }}</p>
            <button class="button primary close" type="button" @click="emit('close')">{{ t.done }}</button>
        </section>
    </div>
</template>

<style scoped>
.backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgb(10 30 60 / 0.6);
    z-index: 20;
}

.card {
    max-width: 100%;
    max-height: 100%;
    overflow-y: auto;
    padding: 16px 20px 20px;
    border-radius: 14px;
    background: #fff;
    color: var(--ink);
    text-align: center;
}

h2 {
    margin: 0 0 8px;
    font-family: var(--font-score);
    font-weight: 900;
    font-size: 2rem;
}

/* Big and on white: cameras read dark-on-light codes most reliably. */
.qr {
    width: min(70vmin, 320px);
    margin: 0 auto;
    background: #fff;
}

.qr :deep(svg) {
    display: block;
    width: 100%;
    height: auto;
}

p {
    margin: 8px 0 16px;
    font-size: 0.95rem;
}

.close {
    width: 100%;
    justify-content: center;
}

/* A phone held sideways is too short for code, text and button stacked: put the code beside them. */
@media (orientation: landscape) and (max-height: 500px) {
    .card {
        display: grid;
        grid-template-columns: auto 200px;
        grid-template-rows: auto 1fr auto;
        gap: 8px 20px;
        align-items: start;
        text-align: left;
    }

    .qr {
        grid-row: 1 / span 3;
        width: min(320px, calc(100vh - 72px));
    }

    p {
        margin: 0;
    }
}
</style>
