import { addDecorator } from '@storybook/react'
import React, { Suspense } from 'react'
import { ThemeProvider } from 'theme-ui'
import { theme } from '../theme'
import { I18nextProvider } from 'next-i18next'
import i18n from './i18n'
import { RouterContext } from 'next/dist/next-server/lib/router-context'

addDecorator((storyFn) => <I18nextProvider i18n={i18n}>{storyFn()}</I18nextProvider>)
addDecorator((storyFn) => <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>)
addDecorator((story, context) => <Suspense fallback="Loading...">{story(context)}</Suspense>)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    showPanel: false,
    panelPosition: 'right',
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
}
