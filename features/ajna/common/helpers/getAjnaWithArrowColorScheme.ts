import type { ThemeUIStyleObject } from 'theme-ui'

export function getAjnaWithArrowColorScheme(): ThemeUIStyleObject {
  return {
    color: 'interactive100',
    transition: 'color 200ms',
    '&:hover': { color: 'interactive50' },
  }
}
