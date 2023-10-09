import type { NavigationMenuPanelIcon } from 'components/navigation/Navigation.types'

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
