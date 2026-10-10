<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { LANGUAGE_NAMES, LANGUAGES, useMessages, type Language } from '../i18n'
import Flag from './Flag.vue'

const language = defineModel<Language>({ required: true })
const t = useMessages()

const open = ref(false)
const root = ref<HTMLElement>()
const toggleButton = ref<HTMLButtonElement>()

function choose(option: Language) {
    language.value = option
    close()
}

function close(returnFocus = true) {
    open.value = false
    if (returnFocus) toggleButton.value?.focus()
}

// A tap anywhere else closes the menu, without taking the focus back to the button.
function onPointerDown(event: PointerEvent) {
    if (!root.value?.contains(event.target as Node)) close(false)
}

// Up and Down (and Home, End) move between the languages, as in any menu.
function onMenuKey(event: KeyboardEvent) {
    const items = Array.from(root.value?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])
    const current = items.indexOf(document.activeElement as HTMLElement)
    const last = items.length - 1
    const moves: Partial<Record<string, number>> = {
        ArrowDown: current < last ? current + 1 : 0,
        ArrowUp: current > 0 ? current - 1 : last,
        Home: 0,
        End: last
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    items[next].focus()
}

watch(open, async isOpen => {
    if (isOpen) {
        document.addEventListener('pointerdown', onPointerDown)
        await nextTick()
        root.value?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus()
    } else {
        document.removeEventListener('pointerdown', onPointerDown)
    }
})
onUnmounted(() => document.removeEventListener('pointerdown', onPointerDown))
</script>

<template>
    <div ref="root" class="language-picker" @keydown.escape="open && close()">
        <button
            ref="toggleButton"
            class="toggle"
            type="button"
            :aria-label="`${t.language}: ${LANGUAGE_NAMES[language]}`"
            aria-haspopup="menu"
            :aria-expanded="open"
            @click="open = !open"
        >
            <Flag :language="language" />
            <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
            </svg>
        </button>
        <div v-if="open" class="menu" role="menu" :aria-label="t.language" @keydown="onMenuKey">
            <button
                v-for="option in LANGUAGES"
                :key="option"
                type="button"
                role="menuitemradio"
                :aria-checked="option === language"
                :lang="option"
                @click="choose(option)"
            >
                <Flag :language="option" />
                {{ LANGUAGE_NAMES[option] }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.language-picker {
    position: relative;
    flex: none;
}

.toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 8px 8px 10px;
    /* Light on the blue set-up screen, dark on the white edit panel. */
    border: 2px solid color-mix(in srgb, currentColor 65%, transparent);
    border-radius: var(--radius);
    background: none;
    font-size: 1.1rem;
}

.chevron {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 10;
    min-width: 170px;
    padding: 6px;
    border-radius: 10px;
    background: #fff;
    color: var(--ink);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.3);
}

.menu button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 0;
    border-radius: 6px;
    background: none;
    font-size: 1rem;
    text-align: left;
}

.menu button[aria-checked='true'] {
    font-weight: 700;
    background: rgb(0 0 0 / 0.07);
}

.menu button:focus-visible {
    outline: 3px solid var(--ball);
    outline-offset: -3px;
}
</style>
