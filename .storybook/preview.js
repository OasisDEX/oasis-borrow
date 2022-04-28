import { addDecorator } from '@storybook/react'
import React, { Suspense } from 'react'
import { ThemeProvider } from 'theme-ui'
import { theme } from '../theme'
import { RouterContext } from 'next/dist/shared/lib/router-context'

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
