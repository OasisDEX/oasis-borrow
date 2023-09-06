import { readFileSync } from 'fs'

import nextConfig from './next-i18next.config'

describe('Locale - proper JSON files', () => {
  const localeList = nextConfig.i18n.locales

  localeList.forEach((locale) => {
    it(`${locale} parsed properly`, () => {
      expect(
        typeof JSON.stringify(
          JSON.parse(readFileSync(`./public/locales/${locale}/common.json`).toString()),
        ),
      ).toBe('string')
    })
  })
})
