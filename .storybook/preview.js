import { addDecorator } from '@storybook/react'
import React, { Suspense } from 'react'
import { ThemeProvider } from 'theme-ui'
import { theme } from '../theme'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import { setConfig } from 'next/config'
import { publicRuntimeConfig } from '../runtime.config.js'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18.js'

setConfig({ publicRuntimeConfig })

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
