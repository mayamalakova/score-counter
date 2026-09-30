import { beforeEach } from 'vitest'

// The app saves its state in localStorage, so every test starts from an empty one.
beforeEach(() => {
    localStorage.clear()
})
