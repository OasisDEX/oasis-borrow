import { Theme, useThemeUI } from 'theme-ui'

import { OasisTheme } from './index'

interface ExactContextValue extends Omit<Theme, 'theme'> {
  theme: OasisTheme
}

export const useTheme = (useThemeUI as unknown) as () => ExactContextValue
