import { addDecorator } from '@storybook/react'

import { ThemeProvider } from 'theme-ui'
import { theme } from '../theme'

addDecorator(storyFn => (
  <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>
))
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

