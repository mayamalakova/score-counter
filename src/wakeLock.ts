import { onUnmounted, watch, type Ref } from 'vue'

/**
 * Keeps the screen on while `wanted` is true, where the browser supports it (the
 * Screen Wake Lock API). Browsers drop the lock whenever the page is hidden (another
 * app, the phone locked), and some drop it on battery saver, so it's asked for again
 * whenever it's released while still wanted and the page is visible.
 * Without the API the phone just dims as usual.
 */
export function useWakeLock(wanted: Ref<boolean>) {
    let lock: WakeLockSentinel | null = null
    let requesting = false

    async function acquire() {
        if ((lock && !lock.released) || requesting) return
        if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return
        requesting = true
        try {
            lock = await navigator.wakeLock.request('screen')
            lock.addEventListener('release', sync)
            // Play may have ended while the browser was answering.
            if (!wanted.value) await release()
        } catch (error) {
            // Refused (e.g. battery saver): the phone dims as usual. Logged for debugging on the phone.
            console.log('Keeping the screen on was refused', error)
        } finally {
            requesting = false
        }
    }

    async function release() {
        const held = lock
        lock = null
        try {
            if (held && !held.released) await held.release()
        } catch (error) {
            console.log('Letting the screen dim failed', error)
        }
    }

    function sync() {
        if (wanted.value) void acquire()
        else void release()
    }

    watch(wanted, sync, { immediate: true })
    document.addEventListener('visibilitychange', sync)
    onUnmounted(() => {
        document.removeEventListener('visibilitychange', sync)
        void release()
    })
}
