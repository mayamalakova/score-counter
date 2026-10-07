import { beforeEach } from 'vitest'

// The app saves its state in localStorage and reads shared results from the
// address, so every test starts from an empty store at a plain address.
beforeEach(() => {
    localStorage.clear()
    history.replaceState(null, '', '/')
})
