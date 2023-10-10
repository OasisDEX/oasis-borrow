import type { NavigationMenuPanelIcon } from 'components/navigation/NavigationMenuPanel'

export const getNavIconConfig = ({
  tokens,
  position,
}: {
  tokens: string[]
  position: 'global' | 'title'
}): NavigationMenuPanelIcon => ({
  tokens,
  position,
})
