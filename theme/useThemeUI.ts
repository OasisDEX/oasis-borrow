import type { OasisTheme } from 'theme'
import type { ThemeUIContextValue } from 'theme-ui'
import { useThemeUI } from 'theme-ui'

interface ExactContextValue extends Omit<ThemeUIContextValue, 'theme'> {
  theme: OasisTheme
}

export const useTheme = useThemeUI as unknown as () => ExactContextValue
