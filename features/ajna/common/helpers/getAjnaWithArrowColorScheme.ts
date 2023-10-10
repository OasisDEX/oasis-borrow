import type { SxStyleProp } from 'theme-ui'

export function getAjnaWithArrowColorScheme(): SxStyleProp {
  return {
    color: 'interactive100',
    transition: 'color 200ms',
    '&:hover': { color: 'interactive50' },
  }
}
