import { InitOptions } from 'i18next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import ReactSelect, { Props as SelectProps } from 'react-select'

import { reactSelectCustomComponents } from './reactSelectCustomComponents'

type I18LanguageOptions = InitOptions & { locales: string[] }

interface LanguageSelectOption {
  value: string
  label: string
}

export function LanguageSelect(props: SelectProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const LANGUAGE_OPTIONS: LanguageSelectOption[] = (i18n.options as I18LanguageOptions).locales.map(
    (locale) => ({
      value: locale,
      label: t(`lang-dropdown.${locale}`),
    }),
  )

  const languageSelectComponents = useMemo(
    () => reactSelectCustomComponents<LanguageSelectOption>(),
    [],
  )

  return (
    <ReactSelect
      options={LANGUAGE_OPTIONS.filter(({ value }) => value !== i18n.language)}
      isSearchable={false}
      value={LANGUAGE_OPTIONS.find(({ value }) => value === i18n.language)}
      // @ts-ignore
      onChange={async ({ value }) => router.push(router.asPath, router.asPath, { locale: value })}
      components={languageSelectComponents}
      {...props}
    />
  )
}
