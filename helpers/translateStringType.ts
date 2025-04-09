import type { DefaultTReturn } from 'i18next'

export type TranslateStringType = string | DefaultTReturn<{ key: string }>
