/**
 * The app's languages. App.vue holds the chosen language and provides its texts;
 * components read them with useMessages(). The choice is remembered on the phone,
 * apart from the saved match, and the app starts in English.
 */
import { computed, inject, provide, type InjectionKey, type Ref } from 'vue'
import { bg } from './bg'
import { cs } from './cs'
import { en, type Messages } from './en'

export type { Messages } from './en'

export const LANGUAGES = ['en', 'cs', 'bg'] as const
export type Language = (typeof LANGUAGES)[number]

/** Each language's name in itself, for the language menu. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', cs: 'Čeština', bg: 'Български' }

const messages: Record<Language, Messages> = { en, cs, bg }
const STORAGE_KEY = 'score-counter-language'
const MESSAGES: InjectionKey<Ref<Messages>> = Symbol('messages')

export function isLanguage(value: unknown): value is Language {
    return LANGUAGES.some(language => language === value)
}

/** The language chosen on this phone, or English. */
export function loadLanguage(): Language {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return isLanguage(saved) ? saved : 'en'
    } catch {
        return 'en'
    }
}

export function saveLanguage(language: Language) {
    try {
        localStorage.setItem(STORAGE_KEY, language)
    } catch {
        // Storage blocked (private mode): the choice lasts until the page is closed.
    }
}

/** Makes the texts of `language` available to every component below. */
export function provideMessages(language: Ref<Language>): Ref<Messages> {
    const current = computed(() => messages[language.value])
    provide(MESSAGES, current)
    return current
}

/** The texts in the current language; English for a component mounted on its own. */
export function useMessages(): Ref<Messages> {
    return inject(MESSAGES, () => computed(() => en), true)
}
