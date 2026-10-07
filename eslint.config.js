// ESLint catches likely bugs; Prettier owns formatting, so style rules are switched off.
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist', 'coverage', 'node_modules'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: { parser: tseslint.parser }
        }
    },
    {
        languageOptions: {
            globals: {
                localStorage: 'readonly',
                document: 'readonly',
                window: 'readonly',
                location: 'readonly',
                history: 'readonly'
            }
        },
        rules: {
            // Component files are named after what they show (Scoreboard, Icon), not two words.
            'vue/multi-word-component-names': 'off',
            // Layout rule that eslint-config-prettier doesn't cover and that fights Prettier.
            'vue/first-attribute-linebreak': 'off'
        }
    },
    prettier
)
