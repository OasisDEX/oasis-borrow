import type { Theme } from 'theme-ui'
import { useThemeUI } from 'theme-ui'

import type { OasisTheme } from './index'

interface ExactContextValue extends Omit<Theme, 'theme'> {
  theme: OasisTheme
}

export const useTheme = useThemeUI as unknown as () => ExactContextValue
