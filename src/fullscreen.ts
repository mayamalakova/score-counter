import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Fullscreen for the whole page, where the browser allows it. Android browsers and
 * iPads do; iPhones don't (only videos go fullscreen there), so `supported` is false
 * and the app shows no button. The browser can also leave fullscreen by itself (back
 * gesture, Esc), so `active` follows its events rather than our own taps.
 */
export function useFullscreen() {
    const supported = document.fullscreenEnabled === true
    const active = ref(document.fullscreenElement != null)

    function update() {
        active.value = document.fullscreenElement != null
    }

    async function toggle() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen()
            else await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        } catch {
            // Refused (e.g. not from a tap): nothing changes, and the button stays as it was.
        }
    }

    onMounted(() => document.addEventListener('fullscreenchange', update))
    onUnmounted(() => document.removeEventListener('fullscreenchange', update))

    return { supported, active, toggle }
}
