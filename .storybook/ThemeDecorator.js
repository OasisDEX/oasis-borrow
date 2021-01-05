import React from 'react'
import { ThemeProvider } from 'theme-ui'
import { theme } from '../theme'
import { merge } from 'lodash'

const ThemeDecorator = (storyFn) => <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>

export default ThemeDecorator
