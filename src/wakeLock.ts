import { computed, onUnmounted, ref, watch, type Ref } from 'vue'

/** No tap for this long and the phone may dim and sleep as usual, e.g. a match left running. */
export const IDLE_AFTER_MS = 5 * 60 * 1000

/** A lock taken back sooner than this isn't asked for again until the next tap. */
const QUICK_RELEASE_MS = 10 * 1000

/**
 * Keeps the screen on while `wanted` is true, where the browser supports it (the
 * Screen Wake Lock API), unless nobody has touched the screen for IDLE_AFTER_MS: then
 * the phone dims and sleeps on its own timer, and the next tap (or coming back to the
 * page) keeps it on again. Browsers drop the lock whenever the page is hidden (another
 * app, the phone locked), and some drop it on battery saver, so it's asked for again
 * whenever it's released while still wanted and the page is visible.
 * Without the API the phone just dims as usual.
 */
export function useWakeLock(wanted: Ref<boolean>) {
    let lock: WakeLockSentinel | null = null
    let requesting = false
    let acquiredAt = 0

    const idle = ref(false)
    let idleTimer: ReturnType<typeof setTimeout> | undefined
    const keepOn = computed(() => wanted.value && !idle.value)

    function onActivity() {
        idle.value = false
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => (idle.value = true), IDLE_AFTER_MS)
        sync()
    }

    // Asked for again when the browser lets go (e.g. battery saver), unless it took the lock
    // back straight away: some do that every time, and asking at once would loop. The next
    // tap asks again instead.
    function onReleased() {
        if (Date.now() - acquiredAt < QUICK_RELEASE_MS) return
        sync()
    }

    async function acquire() {
        if ((lock && !lock.released) || requesting) return
        if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return
        requesting = true
        try {
            lock = await navigator.wakeLock.request('screen')
            acquiredAt = Date.now()
            lock.addEventListener('release', onReleased)
            // Play may have ended, or gone idle, while the browser was answering.
            if (!keepOn.value) await release()
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
        if (keepOn.value) void acquire()
        else void release()
    }

    // Coming back to the page (e.g. after unlocking the phone) counts as activity too.
    function onVisibilityChange() {
        if (document.visibilityState === 'visible') onActivity()
        else sync()
    }

    onActivity()
    watch(keepOn, sync, { immediate: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('pointerdown', onActivity)
    document.addEventListener('keydown', onActivity)
    onUnmounted(() => {
        clearTimeout(idleTimer)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        document.removeEventListener('pointerdown', onActivity)
        document.removeEventListener('keydown', onActivity)
        void release()
    })
}
