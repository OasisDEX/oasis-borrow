import { OasisTheme } from 'theme/index'
import { Theme, useThemeUI } from 'theme-ui'

interface ExactContextValue extends Omit<Theme, 'theme'> {
  theme: OasisTheme
}

export const useTheme = useThemeUI as unknown as () => ExactContextValue
