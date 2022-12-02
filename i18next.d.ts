import 'next-i18next'

import type { I18n as Originali18n } from 'i18next'

import engLocales from './public/locales/en/common.json'

type AcceptAnyString<T> = T | (string & Record<never, never>);

type PathsToProps<T, V> = T extends V ? "" : {
  [K in Extract<keyof T, string>]: Dot<K, PathsToProps<T[K], V>>
}[Extract<keyof T, string>];

type Dot<T extends string, U extends string> =
"" extends U ? T : `${T}.${U}`

type LanguageDotNotationKeys = AcceptAnyString<PathsToProps<typeof engLocales, string>>

declare module 'next-i18next' {
  function useTranslation(): {
    t: (key: LanguageDotNotationKeys, translationData?: Record<string, string>) => string
    i18n: Originali18n
  }
}
