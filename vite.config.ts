import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        setupFiles: ['test/setup.ts'],
        include: ['test/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            // The entry file only mounts the app.
            exclude: ['src/main.ts'],
            reporter: ['text-summary', 'html'],
            // Coverage is near 100%; fail if it slips well below that.
            thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 }
        }
    }
})
